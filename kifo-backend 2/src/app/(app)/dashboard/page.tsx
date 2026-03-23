import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/signin")

  const [{ data: profile }, { data: memorials }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("memorials").select(`
      id, slug, first_name, last_name, date_of_passing, profile_photo_url, plan, visitor_count, privacy, created_at,
      tributes(count),
      candles(count),
      photos(count)
    `).eq("owner_id", user.id).order("created_at", { ascending: false }),
  ])

  const name = profile?.full_name?.split(" ")[0] || "there"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const totalVisitors = memorials?.reduce((a, m) => a + (m.visitor_count || 0), 0) || 0
  const totalTributes = memorials?.reduce((a: number, m: any) => a + (m.tributes?.[0]?.count || 0), 0) || 0
  const totalCandles = memorials?.reduce((a: number, m: any) => a + (m.candles?.[0]?.count || 0), 0) || 0

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.greeting}>{greeting}, {name} 🌿</h1>
        <Link href="/wizard" style={styles.newBtn}>+ New memorial</Link>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label: "Memorials", value: memorials?.length || 0 },
          { label: "Total visitors", value: totalVisitors.toLocaleString() },
          { label: "Tributes", value: totalTributes },
          { label: "Candles lit", value: totalCandles },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Memorials grid */}
      <h2 style={styles.sectionTitle}>Your memorials</h2>
      <div style={styles.grid}>
        {memorials?.map((m: any) => (
          <Link key={m.id} href={`/memorial/${m.slug}`} style={styles.memCard}>
            <div style={{...styles.memCover, background: "linear-gradient(135deg,#8A9E7E,#4E6245)"}}>
              <div style={styles.planBadge}>{m.plan}</div>
            </div>
            <div style={styles.memBody}>
              <div style={styles.memName}>{m.first_name} {m.last_name}</div>
              <div style={styles.memStats}>
                <span>👁 {m.visitor_count || 0}</span>
                <span>💬 {m.tributes?.[0]?.count || 0}</span>
                <span>📷 {m.photos?.[0]?.count || 0}</span>
              </div>
            </div>
          </Link>
        ))}
        <Link href="/wizard" style={styles.newCard}>
          <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🌿</div>
          <div style={{fontSize:"0.88rem",fontWeight:600,color:"#9E8C7A"}}>Create new memorial</div>
        </Link>
      </div>

      {/* Upgrade prompt for free users */}
      {profile?.plan === "free" && (
        <div style={styles.upgradeBanner}>
          <div>
            <div style={{fontWeight:700,marginBottom:"0.25rem"}}>Free plan</div>
            <div style={{fontSize:"0.85rem",opacity:0.8}}>Upgrade for unlimited photos, music, and AI tools</div>
          </div>
          <Link href="/pricing" style={styles.upgradeBtn}>Upgrade to Premium</Link>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem", fontFamily:"system-ui,sans-serif" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" },
  greeting: { fontSize:"1.75rem", fontWeight:700, color:"#2A1F16", fontFamily:"Georgia,serif" },
  newBtn: { background:"#C4714F", color:"white", padding:"0.6rem 1.25rem", borderRadius:30, textDecoration:"none", fontWeight:700, fontSize:"0.88rem" },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2.5rem" },
  statCard: { background:"#F8F4EE", borderRadius:16, padding:"1.25rem", boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff" },
  statValue: { fontSize:"2rem", fontWeight:600, fontFamily:"Georgia,serif", color:"#2A1F16" },
  statLabel: { fontSize:"0.72rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#9E8C7A", marginTop:"0.25rem" },
  sectionTitle: { fontSize:"1.1rem", fontWeight:600, color:"#2A1F16", marginBottom:"1rem", letterSpacing:"0.02em" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"1rem", marginBottom:"2rem" },
  memCard: { background:"#F8F4EE", borderRadius:20, overflow:"hidden", textDecoration:"none", boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff", transition:"transform 0.2s", display:"block" },
  memCover: { height:100, position:"relative" },
  planBadge: { position:"absolute", top:10, right:10, background:"rgba(255,255,255,0.2)", color:"white", fontSize:"0.6rem", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0.2rem 0.5rem", borderRadius:8, fontWeight:700 },
  memBody: { padding:"1rem" },
  memName: { fontFamily:"Georgia,serif", fontSize:"1rem", fontWeight:600, color:"#2A1F16", marginBottom:"0.5rem" },
  memStats: { display:"flex", gap:"0.75rem", fontSize:"0.78rem", color:"#9E8C7A" },
  newCard: { background:"#F8F4EE", borderRadius:20, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", textDecoration:"none", boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff", minHeight:180, transition:"transform 0.2s" },
  upgradeBanner: { background:"linear-gradient(135deg,#2A1F16,#4A3828)", color:"white", borderRadius:20, padding:"1.5rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap" },
  upgradeBtn: { background:"#C4714F", color:"white", padding:"0.65rem 1.5rem", borderRadius:30, textDecoration:"none", fontWeight:700, fontSize:"0.88rem", whiteSpace:"nowrap" },
}
