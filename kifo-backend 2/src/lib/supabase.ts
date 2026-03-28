import { createServerClient, createBrowserClient } from '@supabase/ssr'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: object }[]) {
          try { cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: object }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
export function createAdminClient(): SupabaseClient {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
