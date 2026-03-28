import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { sendTributeNotification } from "@/lib/resend"
import { z } from "zod"

const CreateTributeSchema = z.object({
  memorial_id: z.string().uuid(),
  author_name: z.string().min(1).max(100),
  author_relationship: z.string().optional(),
  content: z.string().min(1).max(5000),
  tribute_type: z.enum(["tribute", "story", "candle"]).default("tribute"),
  is_ai_assisted: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json()
  const parsed = CreateTributeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Check memorial exists and is public (or user is owner)
  const { data: memorial } = await supabase.from("memorials").select("id, owner_id, privacy, slug, first_name, last_name, owner:profiles!owner_id(email, full_name)").eq("id", parsed.data.memorial_id).single()
  if (!memorial) return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
  if (memorial.privacy === "private" && memorial.owner_id !== user?.id) {
    return NextResponse.json({ error: "Cannot post to private memorial" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("tributes")
    .insert({ ...parsed.data, author_id: user?.id || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify memorial owner (async)
  const owner = memorial.owner as any
  if (owner?.email && memorial.owner_id !== user?.id) {
    sendTributeNotification({
      email: owner.email,
      ownerName: owner.full_name || "there",
      memorialName: `${memorial.first_name} ${memorial.last_name}`,
      memorialSlug: memorial.slug,
      authorName: parsed.data.author_name,
    }).catch(console.error)
  }

  return NextResponse.json({ tribute: data }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(req.url)
  const memorialId = searchParams.get("memorial_id")
  if (!memorialId) return NextResponse.json({ error: "memorial_id required" }, { status: 400 })

  const { data, error } = await supabase
    .from("tributes")
    .select("*, author:profiles!author_id(full_name, avatar_url)")
    .eq("memorial_id", memorialId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tributes: data })
}
