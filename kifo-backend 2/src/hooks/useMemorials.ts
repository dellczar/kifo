"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { Database } from "@/types/database"

type Memorial = Database["public"]["Tables"]["memorials"]["Row"]

export function useMemorials() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (error) setError(error.message)
      else setMemorials(data || [])
      setLoading(false)
    }

    load()
  }, [])

  return { memorials, loading, error }
}

export function useMemorial(slug: string) {
  const [memorial, setMemorial] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    const supabase = createClient()

    async function load() {
      const { data, error } = await supabase
        .from("memorials")
        .select(`
          *,
          tributes(*),
          candles(*),
          photos(*),
          events(*)
        `)
        .eq("slug", slug)
        .single()

      if (error) setError("Memorial not found")
      else setMemorial(data)
      setLoading(false)
    }

    load()
  }, [slug])

  return { memorial, loading, error }
}
