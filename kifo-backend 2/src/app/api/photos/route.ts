import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// POST /api/photos — get signed upload URL from Supabase Storage
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { memorial_id, filename, content_type } = await req.json()
  if (!memorial_id || !filename) return NextResponse.json({ error: "memorial_id and filename required" }, { status: 400 })

  // Verify user owns this memorial
  const { data: memorial } = await supabase.from("memorials").select("id, owner_id, plan").eq("id", memorial_id).single()
  if (!memorial || memorial.owner_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Check photo limit for free plan
  if (memorial.plan === "free") {
    const { count } = await supabase.from("photos").select("id", { count: "exact" }).eq("memorial_id", memorial_id)
    if ((count || 0) >= 10) return NextResponse.json({ error: "Free plan limited to 10 photos. Upgrade to Premium." }, { status: 403 })
  }

  // Generate signed upload URL
  const path = `memorial-photos/${memorial_id}/${Date.now()}-${filename}`
  const { data, error } = await supabase.storage
    .from("memorial-photos")
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publicUrl = supabase.storage.from("memorial-photos").getPublicUrl(path).data.publicUrl

  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl })
}

// After upload: save photo record
export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { memorial_id, url, caption, taken_at } = await req.json()

  const { data, error } = await supabase
    .from("photos")
    .insert({ memorial_id, url, caption, taken_at, uploaded_by: user.id })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photo: data }, { status: 201 })
}
