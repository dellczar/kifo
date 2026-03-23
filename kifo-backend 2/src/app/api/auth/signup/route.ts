import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { sendWelcomeEmail } from "@/lib/resend"
import { z } from "zod"

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = SignUpSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Send welcome email (non-blocking)
  sendWelcomeEmail(parsed.data.email, parsed.data.full_name).catch(console.error)

  return NextResponse.json({ user: data.user }, { status: 201 })
}
