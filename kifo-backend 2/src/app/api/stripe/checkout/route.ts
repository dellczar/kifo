import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getStripe, PLANS, PlanKey } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { plan } = await req.json() as { plan: PlanKey }
  if (!PLANS[plan]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id, email").eq("id", user.id).single()

  // Get or create Stripe customer
  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: profile?.email || user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
  }

  const planConfig = PLANS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  // Lifetime = one-time payment, others = subscription with trial
  const sessionConfig: any = {
    customer: customerId,
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { supabase_user_id: user.id, plan },
  }

  if (planConfig.interval === null) {
    // One-time payment
    sessionConfig.mode = "payment"
    sessionConfig.line_items = [{ price: planConfig.priceId, quantity: 1 }]
    sessionConfig.payment_intent_data = { metadata: { supabase_user_id: user.id, plan } }
  } else {
    // Subscription with 30-day trial
    sessionConfig.mode = "subscription"
    sessionConfig.line_items = [{ price: planConfig.priceId, quantity: 1 }]
    sessionConfig.subscription_data = {
      trial_period_days: 30,
      metadata: { supabase_user_id: user.id, plan },
    }
  }

  const session = await getStripe().checkout.sessions.create(sessionConfig)
  return NextResponse.json({ url: session.url })
}
