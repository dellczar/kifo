# Kifo Backend — Setup Guide

## 1. Install dependencies
```bash
npm install
```

## 2. Set environment variables
Edit `.env.local` and fill in:
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `STRIPE_SECRET_KEY` + price IDs — from stripe.com
- `RESEND_API_KEY` — from resend.com

Supabase keys are already filled in.

## 3. Enable Google OAuth in Supabase
1. Go to https://supabase.com/dashboard/project/vcejuynwdxlgiakfcojs/auth/providers
2. Enable Google provider
3. Add your Google OAuth Client ID + Secret
4. Add `http://localhost:3000/auth/callback` to allowed redirect URLs

## 4. Create Stripe products
```
Premium Monthly: $8.99/month → copy price ID to STRIPE_PREMIUM_MONTHLY_PRICE_ID
Premium Annual:  $79.95/year → copy price ID to STRIPE_PREMIUM_ANNUAL_PRICE_ID  
Lifetime:        $149.95 one-time → copy price ID to STRIPE_LIFETIME_PRICE_ID
```

## 5. Run locally
```bash
npm run dev
# In another terminal:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 6. Deploy to Vercel
```bash
npm install -g vercel
vercel deploy
```
Then add all env vars in Vercel dashboard.
Update Stripe webhook URL to: `https://your-app.vercel.app/api/stripe/webhook`

## API Endpoints
- POST /api/auth/signin
- POST /api/auth/signup  
- POST /api/auth/signout
- POST /api/auth/reset-password
- GET  /api/memorials
- POST /api/memorials
- GET  /api/memorials/[slug]
- PATCH /api/memorials/[slug]
- GET  /api/gallery
- GET  /api/profile
- PATCH /api/profile
- POST /api/tributes
- POST /api/candles
- POST /api/photos
- POST /api/ai/tribute
- POST /api/ai/lifestory
- POST /api/stripe/checkout
- POST /api/stripe/webhook
- GET  /api/cron/reminders (daily cron)
