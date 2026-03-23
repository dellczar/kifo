import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  let event: Stripe.Event
  try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!) }
  catch (err) { return NextResponse.json({ error: "Webhook error" }, { status: 400 }) }
  const supabase = createAdminClient()
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    if (userId) {
      const plan = session.mode === "payment" ? "lifetime" : "premium"
      await supabase.from("profiles").update({ plan }).eq("id", userId)
    }
  }
  return NextResponse.json({ received: true })
}
