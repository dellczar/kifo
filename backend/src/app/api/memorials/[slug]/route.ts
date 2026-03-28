import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

type Params = Promise<{ slug: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("memorials")
    .select("*, tributes(*), candles(*), photos(*), events(*)")
    .eq("slug", slug)
    .single()
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const d = data as any
  if (d.privacy === "private" && d.owner_id !== user?.id)
    return NextResponse.json({ error: "Private" }, { status: 403 })
  return NextResponse.json({ memorial: d })
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { error } = await supabase
    .from("memorials")
    .update(body as never)
    .eq("slug", slug)
    .eq("owner_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { error } = await supabase
    .from("memorials")
    .delete()
    .eq("slug", slug)
    .eq("owner_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
