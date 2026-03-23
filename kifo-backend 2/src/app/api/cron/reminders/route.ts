import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { sendAnniversaryReminder } from "@/lib/resend"

// Called daily by Vercel Cron — vercel.json: {"crons": [{"path": "/api/cron/reminders", "schedule": "0 9 * * *"}]}
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date()
  const mmdd = `2000-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const { data: reminders } = await supabase
    .from("reminders")
    .select(`
      *,
      memorial:memorials(first_name, last_name, slug),
      user:profiles(email, full_name)
    `)
    .eq("reminder_date", mmdd)
    .eq("is_active", true)

  if (!reminders?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const r of reminders) {
    const mem = r.memorial as any
    const user = r.user as any
    if (!user?.email || !mem) continue

    await sendAnniversaryReminder({
      email: user.email,
      name: user.full_name || "there",
      memorialName: `${mem.first_name} ${mem.last_name}`,
      memorialSlug: mem.slug,
      reminderType: r.reminder_type as "birthday" | "anniversary",
    }).catch(console.error)

    await supabase.from("reminders").update({ last_sent_at: new Date().toISOString() }).eq("id", r.id)
    sent++
  }

  return NextResponse.json({ sent })
}
