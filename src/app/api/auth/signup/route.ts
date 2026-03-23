import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { z } from "zod"
const Schema = z.object({ email: z.string().email(), password: z.string().min(8), full_name: z.string().min(1) })
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password,
    options: { data: { full_name: parsed.data.full_name }, emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` } })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ user: data.user }, { status: 201 })
}
