import { redirect } from "next/navigation"

// Root redirects to the static homepage on GitHub Pages (or serve inline)
export default function RootPage() {
  // In production, the homepage is served as static HTML
  // This handles the /app root for Next.js
  redirect("/dashboard")
}
