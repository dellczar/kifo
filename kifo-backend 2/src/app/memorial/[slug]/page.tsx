import { createServerSupabaseClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("memorials").select("first_name, last_name").eq("slug", slug).single()
  if (!data) return { title: "Memorial not found" }
  return { title: `${data.first_name} ${data.last_name} — Kifo Memorial` }
}

export default async function MemorialPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: memorial, error } = await supabase
    .from("memorials")
    .select("*, tributes(*), candles(*), photos(*), events(*)")
    .eq("slug", slug)
    .single()
  if (error || !memorial) notFound()

  const fullName = `${memorial.first_name} ${memorial.middle_name || ""} ${memorial.last_name}`.trim()
  const birthYear = memorial.date_of_birth ? new Date(memorial.date_of_birth).getFullYear() : null
  const deathYear = memorial.date_of_passing ? new Date(memorial.date_of_passing).getFullYear() : null
  const years = birthYear && deathYear ? `${birthYear} — ${deathYear}` : ""

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#F0EBE3",minHeight:"100vh"}}>
      <div style={{height:280,background:"linear-gradient(135deg,#8A9E7E,#4E6245)",display:"flex",alignItems:"flex-end",padding:"2rem 3rem"}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"2.5rem",color:"white",marginBottom:"0.35rem"}}>{fullName}</h1>
          <p style={{color:"rgba(255,255,255,0.75)"}}>{years}{memorial.birthplace ? ` · ${memorial.birthplace}` : ""}</p>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"2rem auto",padding:"0 1.5rem"}}>
        {memorial.biography && (
          <div style={{background:"#F8F4EE",borderRadius:20,padding:"2rem",marginBottom:"1.5rem",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #fff"}}>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.3rem",color:"#2A1F16",marginBottom:"1rem"}}>About {memorial.first_name}</h2>
            <p style={{lineHeight:1.8,color:"#4A3828"}}>{memorial.biography}</p>
          </div>
        )}
        <div style={{background:"#F8F4EE",borderRadius:20,padding:"2rem",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #fff"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.3rem",color:"#2A1F16",marginBottom:"1.5rem"}}>Tributes ({memorial.tributes?.length||0})</h2>
          {memorial.tributes?.map((t: any) => (
            <div key={t.id} style={{borderBottom:"1px solid rgba(0,0,0,0.06)",paddingBottom:"1.25rem",marginBottom:"1.25rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}>
                <span style={{fontWeight:700,color:"#2A1F16"}}>{t.author_name}</span>
                <span style={{fontSize:"0.78rem",color:"#C8BFB0"}}>{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{lineHeight:1.7,color:"#4A3828"}}>{t.content}</p>
            </div>
          ))}
          {(!memorial.tributes?.length) && <p style={{color:"#9E8C7A",fontStyle:"italic"}}>Be the first to leave a tribute.</p>}
        </div>
      </div>
    </div>
  )
}
