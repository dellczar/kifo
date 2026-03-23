import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Kifo — Honor Every Life", template: "%s — Kifo" },
  description: "A dignified, beautiful place for the memories that matter most.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
