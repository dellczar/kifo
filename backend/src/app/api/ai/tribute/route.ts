import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profileData } = await supabase.from("profiles").select("plan").eq("id", user.id).single()
  const plan = (profileData as any)?.plan || "free"
  if (plan === "free") return NextResponse.json({ error: "AI Tribute Writer requires Premium plan." }, { status: 403 })

  const { name, relationship, memory, tone, memorial_id } = await req.json()

  const client = new Anthropic()
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{ role: "user", content: `Write a heartfelt tribute for ${name}. Relationship: ${relationship}. Memory: ${memory}. Tone: ${tone || "warm and loving"}. Keep it 2-3 paragraphs.` }]
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""

  await supabase.from("ai_usage").insert({
    user_id: user.id,
    memorial_id: memorial_id || null,
    tool: "tribute",
    tokens_used: message.usage.input_tokens + message.usage.output_tokens,
  } as any)

  return NextResponse.json({ tribute: text })
}
