import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
type Params = Promise<{ slug: string }>
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from("memorials").select("*, tributes(*), candles(*), photos(*), events(*)").eq("slug", slug).single()
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (data.privacy === "private" && data.owner_id !== user?.id) return NextResponse.json({ error: "Private" }, { status: 403 })
  supabase.from("memorials").update({ visitor_count: (data.visitor_count||0)+1 }).eq("id", data.id)
  return NextResponse.json({ memorial: data })
}
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase.from("memorials").update(body).eq("slug", slug).eq("owner_id", user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ memorial: data })
}
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { error } = await supabase.from("memorials").delete().eq("slug", slug).eq("owner_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
