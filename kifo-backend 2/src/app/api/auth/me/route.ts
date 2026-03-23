import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // AI usage this month
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
  const { count: tributeCount } = await supabase.from("ai_usage")
    .select("id", { count: "exact" })
    .eq("user_id", user.id).eq("tool", "tribute_writer")
    .gte("created_at", startOfMonth.toISOString())

  return NextResponse.json({
    user: { ...user, ...profile },
    ai_usage: { tribute_writer_this_month: tributeCount || 0 }
  })
}
