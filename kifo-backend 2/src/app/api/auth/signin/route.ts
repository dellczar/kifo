import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { z } from "zod"

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = SignInSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  return NextResponse.json({ user: data.user })
}
