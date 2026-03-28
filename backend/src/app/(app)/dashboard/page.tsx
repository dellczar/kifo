import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/signin")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const { data: memorials } = await supabase.from("memorials")
    .select("id, slug, first_name, last_name, visitor_count, plan, tributes(count), candles(count), photos(count)")
    .eq("owner_id", user.id).order("created_at", { ascending: false })

  const p = profile as any
  const rawName = p?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || ""
  const name = rawName.split(" ")[0] || user.email?.split("@")[0] || "there"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const totalVisitors = (memorials || []).reduce((a: number, m: any) => a + (m.visitor_count || 0), 0)
  const totalTributes = (memorials || []).reduce((a: number, m: any) => a + (m.tributes?.[0]?.count || 0), 0)
  const totalCandles = (memorials || []).reduce((a: number, m: any) => a + (m.candles?.[0]?.count || 0), 0)

  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"2rem 1.5rem",fontFamily:"system-ui,sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem",flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <h1 style={{fontSize:"1.75rem",fontWeight:700,color:"#2A1F16",fontFamily:"Georgia,serif"}}>{greeting}, {name} 🌿</h1>
          <p style={{fontSize:"0.82rem",color:"#9E8C7A",marginTop:"0.25rem"}}>{user.email}</p>
        </div>
        <Link href="/wizard" style={{background:"#C4714F",color:"white",padding:"0.6rem 1.25rem",borderRadius:30,textDecoration:"none",fontWeight:700,fontSize:"0.88rem"}}>+ New memorial</Link>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"2.5rem"}}>
        {[{label:"Memorials",value:memorials?.length||0},{label:"Total visitors",value:totalVisitors.toLocaleString()},{label:"Tributes",value:totalTributes},{label:"Candles lit",value:totalCandles}].map(s => (
          <div key={s.label} style={{background:"#F8F4EE",borderRadius:16,padding:"1.25rem",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff"}}>
            <div style={{fontSize:"2rem",fontWeight:600,fontFamily:"Georgia,serif",color:"#2A1F16"}}>{s.value}</div>
            <div style={{fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#9E8C7A",marginTop:"0.25rem"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <h2 style={{fontSize:"1.1rem",fontWeight:600,color:"#2A1F16",marginBottom:"1rem"}}>Your memorials</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"1rem",marginBottom:"2rem"}}>
        {(memorials||[]).map((m: any) => (
          <Link key={m.id} href={`/memorial/${m.slug}`} style={{background:"#F8F4EE",borderRadius:20,overflow:"hidden",textDecoration:"none",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff",display:"block"}}>
            <div style={{height:100,background:"linear-gradient(135deg,#8A9E7E,#4E6245)"}}/>
            <div style={{padding:"1rem"}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:"1rem",fontWeight:600,color:"#2A1F16",marginBottom:"0.5rem"}}>{m.first_name} {m.last_name}</div>
              <div style={{display:"flex",gap:"0.75rem",fontSize:"0.78rem",color:"#9E8C7A"}}>
                <span>👁 {m.visitor_count||0}</span>
                <span>💬 {m.tributes?.[0]?.count||0}</span>
                <span>📷 {m.photos?.[0]?.count||0}</span>
              </div>
            </div>
          </Link>
        ))}
        <Link href="/wizard" style={{background:"#F8F4EE",borderRadius:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",textDecoration:"none",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff",minHeight:180}}>
          <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🌿</div>
          <div style={{fontSize:"0.88rem",fontWeight:600,color:"#9E8C7A"}}>Create new memorial</div>
        </Link>
      </div>
      {p?.plan === "free" && (
        <div style={{background:"linear-gradient(135deg,#2A1F16,#4A3828)",color:"white",borderRadius:20,padding:"1.5rem 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
          <div>
            <div style={{fontWeight:700,marginBottom:"0.25rem"}}>Free plan</div>
            <div style={{fontSize:"0.85rem",opacity:0.8}}>Upgrade for unlimited photos, music, and AI tools</div>
          </div>
          <Link href="/pricing" style={{background:"#C4714F",color:"white",padding:"0.65rem 1.5rem",borderRadius:30,textDecoration:"none",fontWeight:700,fontSize:"0.88rem"}}>Upgrade to Premium</Link>
        </div>
      )}
    </div>
  )
}
