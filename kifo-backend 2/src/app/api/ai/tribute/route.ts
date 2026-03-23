import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { anthropic, buildTributePrompt, AI_LIMITS } from "@/lib/anthropic"
import { z } from "zod"

const Schema = z.object({
  name: z.string(),
  born: z.string().optional(),
  died: z.string().optional(),
  tone: z.string().default("warm"),
  length: z.string().default("medium"),
  memories: z.string().optional(),
  details: z.array(z.string()).optional(),
  memorial_id: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check plan and usage limits
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single()
  const plan = (profile?.plan || "free") as keyof typeof AI_LIMITS
  const limit = AI_LIMITS[plan].tribute_writer

  if (limit === 0) return NextResponse.json({ error: "AI Tribute Writer requires Premium plan." }, { status: 403 })

  if (limit !== Infinity) {
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
    const { count } = await supabase.from("ai_usage").select("id", { count: "exact" }).eq("user_id", user.id).eq("tool", "tribute_writer").gte("created_at", startOfMonth.toISOString())
    if ((count || 0) >= limit) return NextResponse.json({ error: `Monthly limit of ${limit} AI tributes reached.` }, { status: 429 })
  }

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const prompt = buildTributePrompt(parsed.data)

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""

  // Track usage
  await supabase.from("ai_usage").insert({
    user_id: user.id,
    memorial_id: parsed.data.memorial_id || null,
    tool: "tribute_writer",
    tokens_used: message.usage.input_tokens + message.usage.output_tokens,
  })

  return NextResponse.json({ text })
}
