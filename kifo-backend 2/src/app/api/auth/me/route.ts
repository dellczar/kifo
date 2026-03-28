import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const profile = profileData as any

  const { count: tributeCount } = await supabase.from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("tool", "tribute")
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  return NextResponse.json({
    user: { ...user, ...profile },
    ai_usage: { tribute_writer_this_month: tributeCount || 0 }
  })
}
