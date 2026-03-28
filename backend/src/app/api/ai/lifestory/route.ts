import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profileData } = await supabase.from("profiles").select("plan").eq("id", user.id).single()
  const profile = profileData as any
  const plan = profile?.plan || "free"

  if (plan === "free") {
    return NextResponse.json({ error: "AI Life Story requires a Premium or Lifetime plan." }, { status: 403 })
  }

  const body = await req.json()
  const { name, birthYear, deathYear, details, memorial_id } = body

  const client = new Anthropic()
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: `Write a beautiful life story biography for ${name} (${birthYear}-${deathYear}). Details: ${details}. Write in a warm, celebratory tone. 3-4 paragraphs.` }]
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""

  await supabase.from("ai_usage").insert({
    user_id: user.id,
    memorial_id: memorial_id || null,
    tool: "life_story",
    tokens_used: message.usage.input_tokens + message.usage.output_tokens,
  } as any)

  return NextResponse.json({ story: text })
}
