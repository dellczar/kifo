import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { z } from "zod"

const CreateMemorialSchema = z.object({
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  relationship: z.string().optional(),
  date_of_birth: z.string().optional(),
  date_of_passing: z.string().optional(),
  birthplace: z.string().optional(),
  place_of_passing: z.string().optional(),
  biography: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  theme: z.string().optional(),
  privacy: z.enum(["public", "private", "password"]).default("public"),
})

// GET /api/memorials — list user's memorials
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("memorials")
    .select("*, tributes(count), candles(count), photos(count)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ memorials: data })
}

// POST /api/memorials — create memorial
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = CreateMemorialSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("memorials").select("id").eq("slug", parsed.data.slug).single()
  if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 409 })

  // Check plan limits (free = 1 memorial)
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single()
  if (profile?.plan === "free") {
    const { count } = await supabase.from("memorials").select("id", { count: "exact" }).eq("owner_id", user.id)
    if ((count || 0) >= 1) {
      return NextResponse.json({ error: "Free plan limited to 1 memorial. Upgrade to Premium." }, { status: 403 })
    }
  }

  const { data, error } = await supabase
    .from("memorials")
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-set reminder for birthday/anniversary
  if (parsed.data.date_of_birth) {
    await supabase.from("reminders").insert({ memorial_id: data.id, user_id: user.id, reminder_type: "birthday", reminder_date: parsed.data.date_of_birth })
  }
  if (parsed.data.date_of_passing) {
    await supabase.from("reminders").insert({ memorial_id: data.id, user_id: user.id, reminder_type: "anniversary", reminder_date: parsed.data.date_of_passing })
  }

  return NextResponse.json({ memorial: data }, { status: 201 })
}
