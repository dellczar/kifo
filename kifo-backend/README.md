# Kifo Backend

Next.js 14 + Supabase + Stripe + Resend + Anthropic

## Stack
- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — PostgreSQL + Auth + Storage
- **Stripe** — payments + subscriptions
- **Resend** — transactional email
- **Anthropic** — Claude AI (server-side, key never exposed)

## Quick start

### 1. Clone and install
```bash
git clone https://github.com/dellczar/kifo-backend
cd kifo-backend
npm install
```

### 2. Set up Supabase
1. Create project at supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in SQL editor
3. Create storage buckets: `memorial-photos`, `profile-avatars`, `memorial-covers`
4. Enable Google OAuth in Auth > Providers

### 3. Set up Stripe
1. Create products and prices in Stripe dashboard
2. Premium Monthly: $8.99/mo recurring
3. Premium Annual: $79.95/yr recurring  
4. Lifetime: $149.95 one-time

### 4. Configure environment
```bash
cp .env.local .env.local.example
# Fill in all values in .env.local
```

### 5. Run locally
```bash
npm run dev
# In another terminal:
npm run stripe:listen   # Forward Stripe webhooks
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/memorials` | ✅ | List user's memorials |
| POST | `/api/memorials` | ✅ | Create memorial |
| GET | `/api/memorials/[slug]` | — | Get memorial + all data |
| PATCH | `/api/memorials/[slug]` | ✅ | Update memorial |
| DELETE | `/api/memorials/[slug]` | ✅ | Delete memorial |
| GET | `/api/tributes?memorial_id=` | — | List tributes |
| POST | `/api/tributes` | — | Post tribute (anonymous ok) |
| GET | `/api/candles?memorial_id=` | — | List candles |
| POST | `/api/candles` | — | Light a candle |
| POST | `/api/photos` | ✅ | Get signed upload URL |
| PUT | `/api/photos` | ✅ | Save photo record |
| POST | `/api/ai/tribute` | ✅ Premium | Generate AI tribute |
| POST | `/api/ai/lifestory` | ✅ Lifetime | Generate life story chapter |
| POST | `/api/stripe/checkout` | ✅ | Create Stripe checkout session |
| POST | `/api/stripe/webhook` | Stripe | Handle Stripe events |
| GET | `/api/auth/me` | ✅ | Get current user + profile |

## Plan limits

| Feature | Free | Premium | Lifetime |
|---------|------|---------|----------|
| Memorials | 1 | Unlimited | Unlimited |
| Photos | 10 | Unlimited | Unlimited |
| AI Tribute Writer | ✗ | 10/month | Unlimited |
| AI Life Story | ✗ | ✗ | Unlimited |

## Deploy to Vercel
```bash
vercel deploy
# Set all env vars in Vercel dashboard
# Update Stripe webhook URL to https://yourapp.vercel.app/api/stripe/webhook
```
