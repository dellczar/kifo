import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET /api/memorials/[slug] — fetch single memorial with all data
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("memorials")
    .select(`
      *,
      owner:profiles!owner_id(full_name, avatar_url),
      tributes(*, author:profiles!author_id(full_name, avatar_url)),
      candles(*, lit_by:profiles!lit_by_id(full_name, avatar_url)),
      photos(*),
      events(*, rsvps(*))
    `)
    .eq("slug", params.slug)
    .single()

  if (error) return NextResponse.json({ error: "Memorial not found" }, { status: 404 })

  // Privacy check
  if (data.privacy === "private" && data.owner_id !== user?.id) {
    return NextResponse.json({ error: "This memorial is private" }, { status: 403 })
  }

  // Increment visitor count (async, no await)
  supabase.from("memorials").update({ visitor_count: (data.visitor_count || 0) + 1 }).eq("id", data.id)

  return NextResponse.json({ memorial: data })
}

// PATCH /api/memorials/[slug] — update memorial
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabase
    .from("memorials")
    .update(body)
    .eq("slug", params.slug)
    .eq("owner_id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ memorial: data })
}

// DELETE /api/memorials/[slug]
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase.from("memorials").delete().eq("slug", params.slug).eq("owner_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
