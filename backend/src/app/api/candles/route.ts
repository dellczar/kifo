import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(req.url)
  const memorial_id = searchParams.get("memorial_id")
  if (!memorial_id) return NextResponse.json({ error: "memorial_id required" }, { status: 400 })
  const { data, error } = await supabase.from("candles").select("*").eq("memorial_id", memorial_id).order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ candles: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const body = await req.json()
  const { data, error } = await supabase.from("candles").insert(body as any).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ candle: data }, { status: 201 })
}
