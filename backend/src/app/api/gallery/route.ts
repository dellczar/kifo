import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 12
  const offset = (page - 1) * limit

  let dbQuery = supabase
    .from("memorials")
    .select("id, slug, first_name, last_name, date_of_birth, date_of_passing, birthplace, profile_photo_url, theme, visitor_count, tributes(count), candles(count)", { count: "exact" })
    .eq("privacy", "public")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (query) {
    dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,birthplace.ilike.%${query}%`)
  }

  const { data, count, error } = await dbQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    memorials: data,
    total: count,
    page,
    pages: Math.ceil((count || 0) / limit),
  })
}
