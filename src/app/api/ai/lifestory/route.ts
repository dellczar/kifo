import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import Anthropic from "@anthropic-ai/sdk"
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name, birthYear, deathYear, details } = await req.json()
  const client = new Anthropic()
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514", max_tokens: 1000,
    messages: [{ role: "user", content: `Write a beautiful life story biography for ${name} (${birthYear}-${deathYear}). Details: ${details}. Write in a warm, celebratory tone. 3-4 paragraphs.` }]
  })
  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return NextResponse.json({ story: text })
}
