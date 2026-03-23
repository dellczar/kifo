import { createServerSupabaseClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("memorials").select("first_name, last_name, biography").eq("slug", params.slug).single()
  if (!data) return { title: "Memorial not found" }
  return {
    title: `${data.first_name} ${data.last_name} — Kifo Memorial`,
    description: data.biography?.slice(0, 160) || `A memorial for ${data.first_name} ${data.last_name}`,
  }
}

export default async function MemorialPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()

  const { data: memorial, error } = await supabase
    .from("memorials")
    .select(`
      *,
      tributes(id, author_name, author_relationship, content, heart_count, created_at, is_ai_assisted),
      candles(id, lit_by_name, message, created_at),
      photos(id, url, caption, taken_at),
      events(id, title, description, event_date, location, is_virtual)
    `)
    .eq("slug", params.slug)
    .single()

  if (error || !memorial) notFound()

  // Increment visitor count
  await supabase.from("memorials").update({ visitor_count: (memorial.visitor_count || 0) + 1 }).eq("id", memorial.id)

  const fullName = `${memorial.first_name} ${memorial.middle_name || ""} ${memorial.last_name}`.trim()
  const birthYear = memorial.date_of_birth ? new Date(memorial.date_of_birth).getFullYear() : null
  const deathYear = memorial.date_of_passing ? new Date(memorial.date_of_passing).getFullYear() : null
  const years = birthYear && deathYear ? `${birthYear} — ${deathYear}` : birthYear ? `Born ${birthYear}` : ""

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#F0EBE3",minHeight:"100vh"}}>
      {/* Cover */}
      <div style={{height:320,background:"linear-gradient(135deg,#8A9E7E,#4E6245,#2C2420)",position:"relative",display:"flex",alignItems:"flex-end",padding:"2rem 3rem"}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"2.5rem",fontWeight:500,color:"white",marginBottom:"0.35rem"}}>{fullName}</h1>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:"1rem"}}>{years}{memorial.birthplace ? ` · ${memorial.birthplace}` : ""}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:900,margin:"2rem auto",padding:"0 1.5rem"}}>

        {/* Biography */}
        {memorial.biography && (
          <div style={{background:"#F8F4EE",borderRadius:20,padding:"2rem",marginBottom:"1.5rem",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff"}}>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.3rem",color:"#2A1F16",marginBottom:"1rem"}}>About {memorial.first_name}</h2>
            <p style={{lineHeight:1.8,color:"#4A3828",fontSize:"0.95rem"}}>{memorial.biography}</p>
          </div>
        )}

        {/* Tributes */}
        <div style={{background:"#F8F4EE",borderRadius:20,padding:"2rem",marginBottom:"1.5rem",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.3rem",color:"#2A1F16",marginBottom:"1.5rem"}}>
            Tributes ({memorial.tributes?.length || 0})
          </h2>
          {memorial.tributes?.map((t: any) => (
            <div key={t.id} style={{borderBottom:"1px solid rgba(0,0,0,0.06)",paddingBottom:"1.25rem",marginBottom:"1.25rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}>
                <span style={{fontWeight:700,color:"#2A1F16",fontSize:"0.92rem"}}>{t.author_name}</span>
                <span style={{fontSize:"0.78rem",color:"#C8BFB0"}}>{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
              {t.author_relationship && <div style={{fontSize:"0.75rem",color:"#C4714F",marginBottom:"0.5rem"}}>{t.author_relationship}</div>}
              <p style={{lineHeight:1.7,color:"#4A3828",fontSize:"0.9rem"}}>{t.content}</p>
              {t.is_ai_assisted && <div style={{fontSize:"0.68rem",color:"#9E8C7A",marginTop:"0.4rem"}}>✦ Written with AI</div>}
            </div>
          ))}
          {(!memorial.tributes || memorial.tributes.length === 0) && (
            <p style={{color:"#9E8C7A",fontSize:"0.9rem",fontStyle:"italic"}}>Be the first to leave a tribute.</p>
          )}
        </div>

        {/* Candles */}
        {memorial.candles && memorial.candles.length > 0 && (
          <div style={{background:"#F8F4EE",borderRadius:20,padding:"2rem",marginBottom:"1.5rem",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #ffffff"}}>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.3rem",color:"#2A1F16",marginBottom:"1.25rem"}}>
              🕯 {memorial.candles.length} candles lit
            </h2>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.75rem"}}>
              {memorial.candles.map((c: any) => (
                <div key={c.id} style={{background:"#F0EBE3",borderRadius:12,padding:"0.6rem 0.9rem",fontSize:"0.82rem",color:"#4A3828",boxShadow:"2px 2px 6px #ccc7be,-2px -2px 5px #ffffff"}}>
                  🕯 {c.lit_by_name}{c.message ? ` · "${c.message}"` : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
