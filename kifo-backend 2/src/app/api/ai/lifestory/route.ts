import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { anthropic, buildLifeStoryPrompt, AI_LIMITS } from "@/lib/anthropic"
import { z } from "zod"

const Schema = z.object({
  name: z.string(),
  born: z.string().optional(),
  died: z.string().optional(),
  birthplace: z.string().optional(),
  occupation: z.string().optional(),
  style: z.string().default("warm"),
  chapter: z.string(),
  bullets: z.string().optional(),
  memorial_id: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single()
  const plan = (profile?.plan || "free") as keyof typeof AI_LIMITS
  if (AI_LIMITS[plan].life_story === 0) {
    return NextResponse.json({ error: "AI Life Story Generator requires Lifetime plan." }, { status: 403 })
  }

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const prompt = buildLifeStoryPrompt(parsed.data)

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 900,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""

  await supabase.from("ai_usage").insert({
    user_id: user.id,
    memorial_id: parsed.data.memorial_id || null,
    tool: "life_story",
    tokens_used: message.usage.input_tokens + message.usage.output_tokens,
  })

  return NextResponse.json({ text })
}
