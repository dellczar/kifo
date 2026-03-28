import { redirect } from "next/navigation"

export default async function RootPage({ searchParams }: { searchParams: Promise<{ code?: string; error?: string }> }) {
  const params = await searchParams
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}&redirect=/signed_in.html`)
  }
  if (params.error) {
    redirect(`/signin?error=${encodeURIComponent(params.error)}`)
  }
  redirect("/index.html")
}
