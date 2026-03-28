# Nexus Sight — League of Legends Stats Checker

## Overview
TypeScript pnpm monorepo, fully in Polish. Users search players by Riot ID across regions to view ranked stats, match history, champion mastery, deep gameplay analysis, live game detection, and a dedicated live game page.

## Architecture
- **Frontend**: React + Vite (`artifacts/web`), wouter for routing, TanStack React Query, Framer Motion
- **Backend**: Express API server (`artifacts/api-server`), connects to Riot Games API
- **Shared**: OpenAPI spec (`lib/api-spec/openapi.yaml`) → codegen to `lib/api-client-react` and `lib/api-zod`
- **Codegen**: `pnpm --filter @workspace/api-spec run codegen`

## Routes
- `/` — Home page with search
- `/profile/:region/:gameName/:tagLine` — Player profile (stats, matches, analysis)
- `/live/:region/:gameName/:tagLine` — Live game page (OP.GG-style team view)
- `/promo` — TikTok promo page

## Design System
- Primary: Electric cyan `#00d4ff` (`hsl(196,100%,50%)`)
- Background: Ultra-dark navy `hsl(218,60%,3%)`
- Fonts: Barlow Condensed (display/numbers), Rajdhani (labels/buttons), Inter (body)
- CSS utilities: `.glow-cyan`, `.neon-border`, `.tag-chip`, `.search-btn`, `.grid-bg`, `.scanline-card`
- All content in Polish

## Key Files
- `artifacts/web/src/index.css` — Design system CSS
- `artifacts/web/src/pages/home.tsx` — Homepage
- `artifacts/web/src/pages/profile.tsx` — Player profile
- `artifacts/web/src/pages/live.tsx` — Live game page
- `artifacts/api-server/src/routes/summoner.ts` — All Riot API endpoints
- `artifacts/api-server/src/routes/analysis.ts` — Analysis engine (~670 lines)
- `lib/api-spec/openapi.yaml` — API spec (source of truth)

## Important Notes
- Never edit generated files in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/`
- `refetchInterval` in react-query v5 does NOT work on errored queries — use `useEffect + setInterval + refetch()` workaround
- Champion metadata from Data Dragon 14.24.1
- `pushHistory` defined in BOTH home.tsx and profile.tsx (intentional duplicates)
- `Link` from wouter renders its own `<a>` — never wrap in plain `<a>`
- Workflows: "Start application" runs both API server (port 8080) and web (PORT env var); individual artifact workflows also exist
