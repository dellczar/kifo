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
  const { data: memorial, error } = await supabase.from("memorials").select("*, tributes(*), candles(*), photos(*), events(*)").eq("slug", slug).single()
  if (error || !memorial) notFound()
  const fullName = `${memorial.first_name} ${memorial.middle_name || ""} ${memorial.last_name}`.trim()
  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#F0EBE3",minHeight:"100vh"}}>
      <div style={{height:280,background:"linear-gradient(135deg,#8A9E7E,#4E6245)",display:"flex",alignItems:"flex-end",padding:"2rem 3rem"}}>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"2.5rem",color:"white"}}>{fullName}</h1>
      </div>
      <div style={{maxWidth:900,margin:"2rem auto",padding:"0 1.5rem"}}>
        {memorial.biography && <div style={{background:"#F8F4EE",borderRadius:20,padding:"2rem",boxShadow:"4px 4px 10px #ccc7be,-3px -3px 8px #fff"}}><p style={{lineHeight:1.8,color:"#4A3828"}}>{memorial.biography}</p></div>}
      </div>
    </div>
  )
}
