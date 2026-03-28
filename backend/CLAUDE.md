# Kifo — Claude Code Project Context

> Drop this file in the root of your repo. Claude Code reads it automatically on startup.

## What is Kifo?

A memorial platform helping families create beautiful online memorials for loved ones.
Two separate deployments that work together:

- **Static frontend** → 14 HTML pages at `https://dellczar.github.io/kifo/`
- **Next.js backend** → Auth, DB, payments, AI at `~/kifo/backend/`

## Repos

| Repo | Location | Purpose |
|------|----------|---------|
| `github.com/dellczar/kifo` | `~/kifo/` | Static HTML frontend (GitHub Pages) |
| `backend` | `~/kifo/backend/` | Next.js 15 backend (Vercel) |

---

## Quick Start

```bash
# Static frontend — open directly in browser
open ~/kifo/index.html

# Backend — start dev server
cd ~/kifo/backend
npm install
npm run dev
# → http://localhost:3000
```

---

## Current Status (as of last session)

### ✅ Working
- All 14 HTML pages live at `https://dellczar.github.io/kifo/`
- Neumorphic design system with warm cream palette
- Pure SVG hero scene (golden sky, hills, candle, flowers, doves)
- Recent memorials carousel section with 8 illustrated portrait cards
- Mobile responsive — hamburger drawer, all breakpoints
- Supabase schema deployed (10 tables, all with RLS)
- All API keys collected and in `.env.local`
- Backend runs locally — sign up / sign in flow works
- Stripe products created (3 price IDs)
- Anthropic + Resend connected

### ❌ In Progress — Vercel Build Failing
The backend builds locally but fails on Vercel. Root causes:

1. **Duplicate JS in `index.html`** — fixed (orphaned `});` + duplicate function defs)
2. **TypeScript errors in Next.js 15** — being fixed file by file (see `docs/TYPESCRIPT-FIXES.md`)
3. **Vercel env vars** — all added via CLI ✅

### 🔲 Not Yet Started
- Stripe webhook secret (needs real Vercel URL first)
- Google OAuth setup in Supabase
- Supabase Storage buckets (`memorial-photos`, `profile-avatars`, `memorial-covers`)
- Wire static HTML AI calls through backend proxy (currently calling Anthropic directly from browser)
- Full Next.js migration of 14 HTML pages

---

## File Structure

```
~/kifo/                          ← GitHub repo (static frontend)
├── index.html                   ← Homepage (neumorphic, SVG hero)
├── kifo-memorial.html           ← Individual memorial page
├── kifo-wizard.html             ← 4-step creation wizard
├── kifo-dashboard.html          ← Admin dashboard
├── kifo-events.html             ← Event planning
├── kifo-gallery.html            ← Public memorial gallery
├── kifo-signin.html             ← Sign in / create account
├── kifo-settings.html           ← Account settings
├── kifo-ai-tribute.html         ← AI Tribute Writer standalone
├── kifo-lifestory.html          ← AI Life Story Generator
├── kifo-profile.html            ← Public curator profile
├── kifo-pricing.html            ← Pricing & upgrade flow
├── kifo-about.html              ← About & contact
├── 404.html                     ← Not found page
└── CLAUDE.md                    ← This file (copy here too)

~/kifo/backend/           ← Next.js backend
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← ROOT layout ✅
│   │   ├── page.tsx             ← Redirects to /dashboard
│   │   ├── globals.css
│   │   ├── (app)/               ← Protected route group
│   │   │   ├── layout.tsx       ← REQUIRED ✅
│   │   │   ├── dashboard/
│   │   │   └── memorial/[slug]/
│   │   ├── (auth)/              ← Auth route group
│   │   │   ├── layout.tsx       ← REQUIRED ✅
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── auth/callback/       ← OAuth callback
│   │   └── api/
│   │       ├── auth/            ← signup, signout, reset-password, me
│   │       ├── memorials/       ← GET, POST, [slug] GET/PATCH/DELETE
│   │       ├── tributes/        ← POST
│   │       ├── candles/         ← GET, POST
│   │       ├── photos/          ← POST (signed upload URLs)
│   │       ├── profile/         ← GET, PATCH
│   │       ├── gallery/         ← GET (public search)
│   │       ├── ai/tribute/      ← POST (server-side Claude)
│   │       ├── ai/lifestory/    ← POST (server-side Claude)
│   │       ├── stripe/checkout/ ← POST
│   │       ├── stripe/webhook/  ← POST
│   │       └── cron/reminders/  ← GET (daily 9am)
│   ├── lib/
│   │   ├── supabase.ts          ← createClient() + createServerSupabaseClient()
│   │   ├── stripe.ts
│   │   ├── resend.ts
│   │   └── anthropic.ts
│   ├── hooks/
│   │   └── useUser.ts
│   ├── middleware.ts             ← Protects /dashboard /wizard /settings
│   └── types/
│       └── database.ts          ← Supabase types
├── .env.local                   ← ALL KEYS FILLED IN
├── CLAUDE.md                    ← Copy here too
└── vercel.json                  ← Cron: 0 9 * * *
```

---

## Design System

### Palette
```css
--bg: #F0EBE3           /* warm cream base */
--bg-light: #F8F4EE     /* card backgrounds */
--bg-dark: #EDE8E0      /* inputs */
--terracotta: #C4714F   /* primary action */
--terra-dark: #A55A38
--gold: #C8973A
--sage: #5C7A62
--ink: #2A1F16          /* text */
--text-mid: #6B5540
--text-light: #9E8C7A
--sand: #C8BFB0
```

### Neumorphic Shadows
```css
--neu-out: 6px 6px 14px #d4cfc7, -6px -6px 14px #ffffff
--neu-in: inset 4px 4px 10px #d4cfc7, inset -4px -4px 10px #ffffff
--neu-card: 8px 8px 20px #ccc7be, -8px -8px 20px #ffffff
```

### Fonts
- **Headings**: Cormorant Garamond (serif, elegant)
- **Body**: Lato (sans-serif, readable)

### Hero
Pure SVG scene — no external images. Golden hour sky gradient, rolling hills, flickering candle, wood-framed portrait, flowers, doves. Fully responsive, zero overlay issues.

---

## Credentials & Services

> See `docs/CREDENTIALS.md` for full keys. Never commit that file.

| Service | Account | Status |
|---------|---------|--------|
| Supabase | `vcejuynwdxlgiakfcojs` | ✅ Live, schema deployed |
| Stripe | `acct_1GmWbhFLBV1iVACp` (kifo.org) | ✅ Test mode, 3 products |
| Anthropic | Claude API | ✅ Key in .env.local |
| Resend | GitHub OAuth signup | ✅ Key in .env.local |
| Vercel | `dellczar-8140s-projects/kifo` | ✅ Env vars added, build failing |
| GitHub Pages | `dellczar/kifo` | ✅ Live |

---

## Key Rules for Claude Code

### Next.js 15 Breaking Changes
```typescript
// ✅ CORRECT — params is now a Promise
type Params = Promise<{ slug: string }>
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params  // must await!
}

// ❌ WRONG — old Next.js 14 style
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params  // breaks in Next.js 15
}
```

### Supabase Client Usage
```typescript
// Client Components ("use client") — browser
import { createClient } from "@/lib/supabase"
const supabase = createClient()

// Server Components, API routes — server only
import { createServerSupabaseClient } from "@/lib/supabase"
const supabase = await createServerSupabaseClient()

// Admin/bypass RLS — server only
import { createAdminClient } from "@/lib/supabase"
const supabase = createAdminClient()
```

### TypeScript — Cast Supabase Results
Supabase's `.single()` returns `never` type without explicit typing. Always cast:
```typescript
const { data } = await supabase.from("profiles").select("*").eq("id", id).single()
const profile = data as any  // or cast to your type
```

### Route Groups Need Layouts
Every Next.js route group `(groupname)` **must** have its own `layout.tsx`:
```typescript
// src/app/(app)/layout.tsx  ← required
// src/app/(auth)/layout.tsx ← required
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

### supabase.ts — No Top-Level next/headers Import
```typescript
// ✅ CORRECT — dynamic import inside function
export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers')  // dynamic!
  const cookieStore = await cookies()
  // ...
}

// ❌ WRONG — breaks client components
import { cookies } from 'next/headers'  // top-level import
```

---

## Immediate Next Tasks

1. **Fix remaining TypeScript build errors** — run `npm run build 2>&1 | grep "Type error"` and fix each
2. **Deploy to Vercel** — `git add . && git commit -m "fix" && git push`
3. **Set Stripe webhook** — after Vercel URL is known, add to Stripe dashboard → copy `whsec_...` → update Vercel env var `STRIPE_WEBHOOK_SECRET`
4. **Enable Google OAuth** — Supabase dashboard → Authentication → Providers → Google
5. **Create Storage buckets** — Supabase dashboard → Storage → create: `memorial-photos`, `profile-avatars`, `memorial-covers` (all public)
6. **Fix mobile JS on other pages** — check all `kifo-*.html` files for duplicate function definitions

---

## Useful Commands

```bash
# Check build errors
cd ~/kifo/backend
npm run build 2>&1 | grep -E "Type error|\.ts:|\.tsx:" | head -20

# Deploy via git
git add . && git commit -m "message" && git push

# Check specific error
npm run build 2>&1 | grep -A 8 "Type error"

# Fix npm permissions if needed
sudo chown -R 501:20 "/Users/dellon/.npm"

# Stripe listen locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Related Docs

- `docs/CREDENTIALS.md` — all API keys and service details
- `docs/DATABASE.md` — Supabase schema, all 10 tables
- `docs/TYPESCRIPT-FIXES.md` — log of all TypeScript fixes applied
- `docs/FRONTEND-PAGES.md` — all 14 HTML pages, what each does
- `docs/DEPLOYMENT.md` — step-by-step deploy guide
