import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date()
  const mmdd = `2000-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*, memorial:memorials(first_name, last_name, slug), user:profiles(email, full_name)")
    .eq("reminder_date", mmdd)
    .eq("is_active", true)

  let sent = 0
  for (const r of (reminders || [])) {
    const rem = r as any
    const mem = rem.memorial
    const user = rem.user
    if (!user?.email || !mem) continue
    console.log(`Reminder: ${user.email} — ${mem.first_name} ${mem.last_name}`)
    sent++
  }

  return NextResponse.json({ sent })
}
