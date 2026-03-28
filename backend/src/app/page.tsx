import { redirect } from "next/navigation"

export default function RootPage({ searchParams }: { searchParams: { code?: string; error?: string } }) {
  // Supabase OAuth lands here when /auth/callback isn't in the allowed redirect list.
  // Forward the code so the callback route can exchange it for a session.
  if (searchParams.code) {
    redirect(`/auth/callback?code=${searchParams.code}&redirect=/signed_in.html`)
  }
  if (searchParams.error) {
    redirect(`/signin?error=${searchParams.error}`)
  }
  redirect("/index.html")
}
