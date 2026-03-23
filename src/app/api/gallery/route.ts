import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 12
  let query = supabase.from("memorials").select("id, slug, first_name, last_name, date_of_birth, date_of_passing, birthplace, profile_photo_url, visitor_count", { count: "exact" }).eq("privacy", "public").order("created_at", { ascending: false }).range((page-1)*limit, page*limit-1)
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ memorials: data, total: count, page, pages: Math.ceil((count||0)/limit) })
}
