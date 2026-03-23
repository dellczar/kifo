import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import Anthropic from "@anthropic-ai/sdk"
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name, relationship, memory, tone } = await req.json()
  const client = new Anthropic()
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514", max_tokens: 500,
    messages: [{ role: "user", content: `Write a heartfelt tribute for ${name}. Relationship: ${relationship}. Memory: ${memory}. Tone: ${tone || "warm and loving"}. Keep it 2-3 paragraphs.` }]
  })
  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return NextResponse.json({ tribute: text })
}
