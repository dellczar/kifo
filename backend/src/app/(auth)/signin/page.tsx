"use client"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import Link from "next/link"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?redirect=${redirect}` },
    })
  }

  return (
    <div style={styles.card}>
      <div style={styles.logo}>Ki<span style={styles.logoAccent}>f</span>o</div>
      <h1 style={styles.title}>Welcome back</h1>
      <p style={styles.sub}>Sign in to manage your memorials</p>

      <button onClick={handleGoogle} style={styles.googleBtn}>
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
        Continue with Google
      </button>

      <div style={styles.divider}><span>or</span></div>

      <form onSubmit={handleSubmit}>
        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={styles.input} placeholder="you@example.com" required
          />
        </div>

        <div style={styles.field}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <label style={styles.label}>Password</label>
            <Link href="/forgot-password" style={styles.link}>Forgot password?</Link>
          </div>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={styles.input} placeholder="••••••••" required
          />
        </div>

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={styles.footer}>
        No account? <Link href="/signup" style={styles.link}>Create one free →</Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div style={styles.page}>
      <Suspense fallback={<div style={styles.card} />}>
        <SignInForm />
      </Suspense>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F0EBE3", padding:"2rem 1rem", fontFamily:"system-ui,sans-serif" },
  card: { background:"#F8F4EE", borderRadius:24, padding:"2.5rem 2rem", width:"100%", maxWidth:420, boxShadow:"8px 8px 20px #ccc7be,-8px -8px 20px #ffffff" },
  logo: { fontFamily:"Georgia,serif", fontSize:"2rem", fontWeight:600, color:"#2A1F16", textAlign:"center", marginBottom:"1.5rem" },
  logoAccent: { color:"#C4714F" },
  title: { fontSize:"1.5rem", fontWeight:600, color:"#2A1F16", textAlign:"center", marginBottom:"0.35rem" },
  sub: { fontSize:"0.88rem", color:"#9E8C7A", textAlign:"center", marginBottom:"1.75rem" },
  googleBtn: { width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.75rem", padding:"0.75rem", background:"#F0EBE3", border:"none", borderRadius:12, cursor:"pointer", fontSize:"0.9rem", fontWeight:500, color:"#2A1F16", boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff", marginBottom:"1.25rem" },
  divider: { textAlign:"center", color:"#C8BFB0", fontSize:"0.8rem", marginBottom:"1.25rem", position:"relative" },
  field: { marginBottom:"1rem" },
  label: { display:"block", fontSize:"0.8rem", fontWeight:600, color:"#6B5540", marginBottom:"0.35rem", letterSpacing:"0.04em" },
  input: { width:"100%", padding:"0.7rem 0.9rem", background:"#EDE8E0", border:"1.5px solid transparent", borderRadius:10, fontSize:"0.92rem", color:"#2A1F16", outline:"none", boxSizing:"border-box" },
  errorBox: { background:"#FDECEA", border:"1px solid #F5A9A9", borderRadius:8, padding:"0.65rem 0.85rem", fontSize:"0.83rem", color:"#C0392B", marginBottom:"1rem" },
  submitBtn: { width:"100%", padding:"0.85rem", background:"#C4714F", color:"white", border:"none", borderRadius:30, fontSize:"0.9rem", fontWeight:700, cursor:"pointer", marginTop:"0.5rem", boxShadow:"4px 4px 10px rgba(196,113,79,0.3)" },
  link: { fontSize:"0.82rem", color:"#C4714F", textDecoration:"none", fontWeight:600 },
  footer: { textAlign:"center", marginTop:"1.5rem", fontSize:"0.85rem", color:"#9E8C7A" },
}
