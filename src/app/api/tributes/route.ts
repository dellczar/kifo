import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const body = await req.json()
  const { data, error } = await supabase.from("tributes").insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tribute: data }, { status: 201 })
}
