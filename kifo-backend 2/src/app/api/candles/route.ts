import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { z } from "zod"

const LightCandleSchema = z.object({
  memorial_id: z.string().uuid(),
  lit_by_name: z.string().min(1).max(100),
  message: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json()
  const parsed = LightCandleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from("candles")
    .insert({ ...parsed.data, lit_by_id: user?.id || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ candle: data }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(req.url)
  const memorialId = searchParams.get("memorial_id")
  if (!memorialId) return NextResponse.json({ error: "memorial_id required" }, { status: 400 })

  const { data, error } = await supabase
    .from("candles")
    .select("*, lit_by:profiles!lit_by_id(full_name, avatar_url)")
    .eq("memorial_id", memorialId)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ candles: data })
}
