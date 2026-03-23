import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession
      const userId = session.metadata?.supabase_user_id
      const plan = session.metadata?.plan
      if (!userId || !plan) break

      if (session.mode === "payment") {
        // Lifetime plan
        await supabase.from("profiles").update({
          plan: "lifetime",
          stripe_customer_id: session.customer as string,
          subscription_status: "active",
        }).eq("id", userId)
      }
      break
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break

      const isActive = ["active", "trialing"].includes(sub.status)
      await supabase.from("profiles").update({
        plan: isActive ? "premium" : "free",
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq("id", userId)
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break

      await supabase.from("profiles").update({
        plan: "free",
        stripe_subscription_id: null,
        subscription_status: "canceled",
        subscription_period_end: null,
      }).eq("id", userId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
