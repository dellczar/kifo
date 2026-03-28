import Stripe from 'stripe'

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })
  return _stripe
}

export const PLANS = {
  premium_monthly: {
    priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
    name: 'Premium Monthly',
    amount: 899, // cents
    interval: 'month' as const,
  },
  premium_annual: {
    priceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID!,
    name: 'Premium Annual',
    amount: 7995,
    interval: 'year' as const,
  },
  lifetime: {
    priceId: process.env.STRIPE_LIFETIME_PRICE_ID!,
    name: 'Lifetime',
    amount: 14995,
    interval: null,
  },
} as const

export type PlanKey = keyof typeof PLANS
