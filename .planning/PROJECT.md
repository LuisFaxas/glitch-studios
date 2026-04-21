# Glitch Studios

## What This Is

Glitch Studios is a two-brand platform:

- **Glitch Studios** (music/video production studio + creative agency) — storefront for booking services, beat catalog with e-commerce checkout, portfolio, artist profiles, blog, client accounts.
- **Glitch Tech** (sister site, `(tech)/` route group, glitchtech.io) — hardware reviews with a rigorous 13-discipline rubric, comparison tool, category browse, benchmark data. Backed by the `GlitchTech-Bench` harness on the review Mac.

Both brands share a single Next.js app, root layout, auth, cart, audio player, and admin backend. Middleware routes the host to the appropriate brand (`glitchstudios.io` → studios, `glitchtech.io` → tech, with cross-brand sidebar links that open the sibling in a new tab so audio persists).

## Core Value

One platform that makes Glitch Studios' work discoverable and Glitch Tech's hardware reviews credible — clients book/buy, tech readers trust the scorecards.

## Current Milestone: v3.0 GlitchTek Launch

**Goal:** Take GlitchTek from "foundation live" to "launched with credibility." Lock the methodology, hydrate rubric v1.1 benchmarks from the Mac harness, ship the flagship MBP 16" M5 Max review, and add category leaderboards so readers can rank every reviewed product side-by-side. Templates flow together; every future review slots into the locked structure without ad-hoc reinvention.

**Target features (in priority order):**
1. Methodology lock-in — rubric v1.1 schema + review template spec + `/tech/methodology` page
2. JSONL log ingestion from the Mac bench harness
3. BPR rollup + medal UI (Platinum / Gold / Silver / Bronze)
4. Category master leaderboard — sortable/filterable ranked tables per category (the headline feature)
5. Flagship review: MBP 16" M5 Max 64GB
6. GlitchTek blog at `/tech/blog`
7. glitchtech.io deployment hardening

**Process commitment:** Phase 1 locks the methodology. Subsequent phases reference it — if data doesn't fit, we fix the template, not hack the review.

**Explicitly NOT in scope:** 2-way `/tech/compare` stays as-is. Studios contact page still deferred. Only one flagship review.

## Requirements

### Validated (shipped milestones)

**v1.0 Full Scaffold (Phases 1–4.1):**
- [x] Public-facing cyberpunk-aesthetic site (home, services, portfolio, artists, blog, contact) — v1.0
- [x] Beat catalog + e-commerce checkout (Stripe + PayPal) — v1.0
- [x] Calendar-based booking system with deposits — v1.0
- [x] Admin dashboard — content/bookings/clients/settings/pricing/team — v1.0
- [x] Transactional email + newsletter — v1.0
- [x] Vercel deployment, Caddy local dev, Neon DB, Better Auth — v1.0

**v2.0 Quality Overhaul (Phases 5–14):**
- [x] Admin dashboard UX (independent sidebar scroll, cohesive layout) — v2.0 Phase 5
- [x] Homepage + flair (splash, scroll effects, real Glitch logo hero) — v2.0 Phases 6, 6.1
- [x] Beats catalog UX (waveforms, listening experience, mobile) — v2.0 Phases 7, 7.1, 7.2, 7.3
- [x] Glitch Tech sub-brand foundation (route group, brand shell, cross-links) — v2.0 Phase 7.4
- [x] Tech product + review data model (12 `tech_*` tables, admin CRUD, review editor with autosave) — v2.0 Phase 7.5
- [x] Tech public surface (review detail, list, categories, compare tool, homepage data) — v2.0 Phase 7.6
- [x] Auth + navigation (role-based redirects, client dashboard) — v2.0 Phase 8
- [x] Services + booking UX polish (coming-soon mode, wizard, booking-live flag) — v2.0 Phase 9
- [x] Blog refinement (consistent cards, engagement hooks, category nav) — v2.0 Phase 10
- [x] Portfolio detail nav (prev/next keyboard + swipe, wrap-around, hero + chip filter grid) — v2.0 Phase 11
- [x] Artists & Team (internal + collaborators sections, rich cards, chip filter) — v2.0 Phase 12
- [x] Global polish (brand social icons, footer newsletter, player widget) — v2.0 Phase 14

### Active (v3.0)

- [ ] Rubric v1.1 locked in schema + methodology page
- [ ] JSONL ingest pipeline (Mac → DB)
- [ ] BPR rollup + medal UI
- [ ] Category master leaderboards (sortable/filterable ranked tables)
- [ ] MBP 16" M5 Max 64GB flagship review published
- [ ] `/tech/blog` live
- [ ] glitchtech.io deploy hardened

### Out of Scope

- Real-time chat/messaging — complexity not justified
- Mobile app — web-first, responsive covers mobile
- Streaming/subscription model — not part of vision
- Multi-language — English only

### Deferred

- **Phase 13 Contact page** (WhatsApp, phone, map, socials) — business info not finalized. Parked during v2.0.
- **Tech-side production bug** — audio stops when crossing from glitchstudios.io to glitchtech.io (separate domain = full page reload). Mitigated by opening cross-brand link in new tab. Full same-origin fix deferred to a future infra phase.

## Context

- **Tech stack:** Next.js 16 App Router + Tailwind v4 + Embla + Framer Motion (home splash) + motion/react (template transitions). Drizzle ORM + Neon Postgres (1 DB, shared schema for both brands). Better Auth. Resend + React Email. Uploadthing. shadcn/ui + Radix + Lucide.
- **Tech brand additions (v2.0):** `recharts` (compare charts), `isomorphic-dompurify` (review body HTML), `cmdk` (product/category pickers), `nuqs` (URL-state filters), `@tiptap/*` (review editor), `dnd-kit` (category tree).
- **Deployment:** Single Vercel project serves both brands via middleware host routing. DNS: Cloudflare (per infra direction in memory).
- **Local dev:** Caddy reverse proxy on `*.codebox.local`; PM2 manages dev servers on CodeBox VM.
- **Design:** Flat monochrome palette (`#000000 #0a0a0a #111111 #222222 #444444 #555555 #888888 #f5f5f0`). Hover-glitch on headings for homepage/tech/services only (blog + portfolio + artists opted out after the duplicate-layer technique clipped multiline titles). Brand SVGs for socials (Instagram, YouTube, SoundCloud, X).
- **Owner:** Trap Snyder (Josh) — music producer, content creator, streamer. Wants fast results, easy to operate.
- **Review Mac:** MBP 16" M5 Max 64GB, due back 2026-04-25. CPU §3.1 benchmarks captured; 12 disciplines remaining. See GlitchTech-Bench on the Mac Desktop (pack v1.1 / rubric v1.1).

## Constraints

- **Tech stack:** Next.js + Tailwind + Embla + Framer Motion — locked
- **Architecture:** Mobile-first with desktop optimization
- **Deployment:** Vercel — locked
- **Local dev:** Caddy — reserved for this project
- **Operability:** Admin must stay usable for non-technical daily use
- **Payments:** Stripe + PayPal at checkout
- **Two brands, one app:** Do not split into separate deployments. Shared layout, shared auth, shared admin; brand divergence via route groups + host routing.
- **CodeBox build limits:** Never run `next build` in parallel agents (2GB RAM + 300% CPU each). Use `pnpm tsc --noEmit` + `pnpm lint` for verification.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Tailwind + Embla | User preference, Vercel integration | Validated v1.0+v2.0 — pnpm workspace, App Router, Tailwind v4 arbitrary values |
| Stripe + PayPal dual payment | Maximum buyer coverage | Validated v1.0 — Stripe Embedded Checkout, PayPal via Stripe Dashboard |
| Calendar-based booking | Direct scheduling > inquiry forms | Validated v1.0 — phase 3 shipped |
| Flat monochrome cyberpunk | Brand identity — minimal, sleek | Validated v1.0 Phase 1.2 — Metro tile grid, glitch animations |
| Better Auth over NextAuth | Active project, Drizzle adapter, built-in RBAC | Validated v1.0 |
| Drizzle over Prisma | Lighter, no codegen, Neon-native | Validated v1.0+v2.0 — 12 tech_ tables added without migration friction |
| Two brands in one app | Shared infra, cross-brand nav, single DB | Validated v2.0 — middleware host routing, `(tech)/` route group, `data-brand` CSS hook |
| GlitchHeading hover-glitch | Interactive easter-egg on all headers | ⚠️ Revisit — removed from blog/portfolio/artists v2.0 (duplicate-layer technique clips multi-line titles). Homepage/tech/services only. |
| Rubric v1.1 for tech reviews | Cross-device comparability + BPR medal tier | — Pending v3.0 wire-up (schema exists; discipline mapping + BPR rollup not yet implemented) |
| Cross-brand link in new tab | Audio persists on studios tab when crossing domains | Validated v2.0 Phase 14 — full same-origin fix deferred |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-21 — v2.0 Quality Overhaul shipped. 10 phases, 47 plans, Playwright-verified per phase. GlitchTek foundation (7.4/7.5/7.6) live on the public tech surface with admin CRUD; hydration with rubric v1.1 benchmarks + first published review is the v3.0 target.*
