# Nexus Sight — League of Legends Stats Checker

## Overview
TypeScript pnpm monorepo, fully in Polish. Users search players by Riot ID across regions to view ranked stats, match history, champion mastery, deep gameplay analysis, live game detection, and a dedicated live game page.

## Architecture
- **Frontend**: React + Vite (`artifacts/web`), wouter for routing, TanStack React Query, Framer Motion
- **Backend**: Express API server (`artifacts/api-server`), connects to Riot Games API
- **Shared**: OpenAPI spec (`lib/api-spec/openapi.yaml`) → codegen to `lib/api-client-react` and `lib/api-zod`
- **Codegen**: `pnpm --filter @workspace/api-spec run codegen`

## Routes
- `/` — Home page with search + FAQ + about section
- `/profile/:region/:gameName/:tagLine` — Player profile (stats, matches, analysis)
- `/ai-analysis/:region/:gameName/:tagLine` — AI Analiza Gracza (Gemini-powered full report)
- `/live/:region/:gameName/:tagLine` — Live game page (OP.GG-style team view)
- `/champion/:region/:gameName/:tagLine/:championName` — Champion detail page (KDA, WR, builds, matchups)
- `/promo` — TikTok promo page
- `/privacy` — Polityka Prywatności (Google AdSense compliance)
- `/terms` — Regulamin
- `/about` — O nas / kontakt

## Design System
- Theme: Clean light mode
- Primary: `hsl(200,90%,38%)` blue
- Background: `hsl(220,20%,97%)` light gray
- Cards: white with `hsl(220,15%,88%)` borders, subtle shadows
- Fonts: Barlow Condensed (display/numbers), Rajdhani (labels/buttons), Inter (body)
- CSS utilities: `.glow-cyan`, `.neon-border`, `.tag-chip`, `.search-btn`, `.grid-bg`, `.scanline-card`
- All content in Polish

## Key Files
- `artifacts/web/src/index.css` — Design system CSS (includes .prose-custom for legal pages)
- `artifacts/web/src/lib/constants.ts` — DD version helpers: `setDDVersion`, `getDDVersion`, `getDDBase()`
- `artifacts/web/src/pages/home.tsx` — Homepage (with FAQ section)
- `artifacts/web/src/pages/profile.tsx` — Player profile (champion breakdown and mastery link to champion page)
- `artifacts/web/src/pages/live.tsx` — Live game page
- `artifacts/web/src/pages/champion.tsx` — Champion detail page (KDA, WR, item builds, matchups, history)
- `artifacts/web/src/pages/privacy.tsx` — Privacy Policy page
- `artifacts/web/src/pages/terms.tsx` — Terms of Service page
- `artifacts/web/src/pages/about.tsx` — About page
- `artifacts/web/src/components/Footer.tsx` — Global footer with legal links
- `artifacts/api-server/src/lib/cache.ts` — In-memory TTL cache (60–300s per endpoint)
- `artifacts/api-server/src/lib/ddragon.ts` — Auto-fetches latest Data Dragon version (refreshes every 6h)
- `artifacts/api-server/src/lib/riot-fetch.ts` — Riot API wrapper with 429 retry logic (respects Retry-After)
- `artifacts/api-server/src/routes/summoner.ts` — All Riot API endpoints (uses cache + riot-fetch)
- `artifacts/api-server/src/routes/champion.ts` — Champion detail endpoint `/api/summoner/:puuid/champion/:name`
- `artifacts/api-server/src/routes/analysis.ts` — Analysis engine (~940 lines, 22 algorithms)
- `lib/api-spec/openapi.yaml` — API spec (source of truth)

## Authentication (Email Accounts)
- **DB table**: `public.users (id UUID PK, email TEXT UNIQUE, password_hash TEXT, created_at TIMESTAMPTZ)` — created at server start
- **Password hashing**: Node.js `crypto.scryptSync` (no external package needed) — format: `${salt}:${hash}`
- **JWT**: `jsonwebtoken` package; secret from `JWT_SECRET` env var (or random per process if not set — set in prod!); expires in 30 days
- **Auth helpers**: `artifacts/api-server/src/lib/auth.ts` — hashPassword, verifyPassword, generateToken, verifyToken, getUserFromRequest
- **Auth routes** (in `routes/auth.ts`):
  - `POST /api/auth/register` — creates user, returns `{token, user}`
  - `POST /api/auth/login` — validates password, returns `{token, user}`
  - `GET /api/auth/me` — returns user info from JWT (requires `Authorization: Bearer <token>`)
- **Frontend**: JWT stored in `localStorage` as `nexus_auth_token`; auth modal in `ai-analysis.tsx` with login/register tabs

## Monetization — Stripe Payment (AI Analysis)
- **Model**: One-time payment, 9.99 PLN (999 groszy) per player analysis, valid 30 days; tied to user account
- **Connector**: Replit Stripe connector (ID: `connection:conn_stripe_01KN2NEVG7D47RDECJB4WS02KJ`)
- **stripeClient.ts**: `artifacts/api-server/src/stripeClient.ts` — never cache Stripe client; uses `REPLIT_CONNECTORS_HOSTNAME` + `REPL_IDENTITY`/`WEB_REPL_RENEWAL` token
- **Payment DB table**: `public.ai_analysis_payments (session_id, puuid, user_id UUID, status, created_at, paid_at, expires_at)` — created automatically; `user_id` ties payment to account
- **Backend routes** (in `routes/stripe-payments.ts`):
  - `POST /api/stripe/create-ai-checkout` — requires auth JWT; creates Stripe Checkout with user_id in metadata; BLIK+Card+P24 enabled
  - `GET /api/stripe/check-access?puuid=` — requires auth JWT; checks if user has paid for this player
  - `POST /api/stripe/verify-after-payment` — requires auth JWT + `{puuid}`; scans recent Stripe sessions to confirm payment
  - `POST /api/stripe/webhook` — processes Stripe webhook events (must receive raw body; registered before `express.json()`)
- **Payment guard**: `routes/ai-analysis.ts` → extracts JWT from Authorization header → checks `checkPaymentForUser(userId, puuid)` → returns 401/402 if needed
- **Frontend flow**: `ai-analysis.tsx` → checks localStorage for JWT → validates via `/api/auth/me` → checks access via `/api/stripe/check-access` → shows AuthModal / login prompt / PaymentWall / report
- **After Stripe redirect**: success URL has `?paid=1` → frontend calls `verify-after-payment` to confirm and unlock access

## Important Notes
- Never edit generated files in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/`
- `refetchInterval` in react-query v5 does NOT work on errored queries — use `useEffect + setInterval + refetch()` workaround
- DD version is fetched dynamically at runtime via `/api/ddragon-version`; use `getDDBase()` in new frontend code, never hardcode version
- Cache: all Riot API endpoints are cached server-side (search=60s, ranked=120s, matches=90s, mastery=300s, analysis=120s, live=30s, champion=180s)
- `pushHistory` defined in BOTH home.tsx and profile.tsx (intentional duplicates)
- `Link` from wouter renders its own `<a>` — never wrap in plain `<a>`
- Workflows: "Start application" runs both API server (port 8080) and web (PORT env var); individual artifact workflows also exist — if "Start application" fails because port 8080 is occupied, restart individual `artifacts/api-server: API Server` workflow instead
