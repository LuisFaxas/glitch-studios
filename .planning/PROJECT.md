# Glitch Studios

## What This Is

Glitch Studios is a two-brand platform:

- **Glitch Studios** (music/video production studio + creative agency) — storefront for booking services, beat catalog with e-commerce checkout, portfolio, artist profiles, blog, client accounts.
- **Glitch Tech** (sister site, `(tech)/` route group, glitchtech.io) — hardware reviews with a rigorous 13-discipline rubric, comparison tool, category browse, benchmark data. Backed by the `GlitchTech-Bench` harness on the review Mac.

Both brands share a single Next.js app, root layout, auth, cart, audio player, and admin backend. Middleware routes the host to the appropriate brand (`glitchstudios.io` → studios, `glitchtech.io` → tech, with cross-brand sidebar links that open the sibling in a new tab so audio persists).

## Core Value

One platform that makes Glitch Studios' work discoverable and Glitch Tech's hardware reviews credible — clients book/buy, tech readers trust the scorecards.

## Current Milestone: v4.0 Production Launch

**Status:** Active (started 2026-04-24)
**Predecessor:** v3.0 closed partial — Phases 15, 16, 16.1, 17 shipped; remaining work carried over. See [MILESTONES.md](MILESTONES.md).

**Goal:** Get the site to production — polished, performant, content-complete, and credible. Visual audit drives direction; every surface gets held to a launchable standard. GlitchMark ships as a distinct scoring system (not a rebrand of BPR). Remaining v3.0 launch work (master leaderboard, flagship review, blog, deploy hardening) completes inside this milestone.

**Process commitment:**
- Phase 22 is a visual audit — the audit determines what phases 23+ actually are. No speculative phase-planning before the audit runs.
- Every surface audited gets triaged: `[BLOCK]` (blocks launch), `[POLISH]` (launch-nice-to-have), `[BACKLOG]` (post-launch), `[OK]` (fine as-is).
- GSD gap fix: "parked for future phase" agreements during conversation must be captured to ROADMAP, REQUIREMENTS, or memory in the same turn — no verbal-only handshakes (GlitchMark was lost this way).

**Target features (high-level — concrete phases derived from visual audit):**
1. Visual audit & discovery — catalog every surface, triage every issue (Phase 22)
2. Email delivery end-to-end (Resend + React Email) — launch blocker
3. Site-wide performance audit + fixes — launch blocker (3-4s admin switcher today)
4. **GlitchMark system** — formula, schema, UI surface, methodology page — NEW, never roadmapped
5. Category master leaderboard (v3.0 carry-over — headline feature, never shipped)
6. Flagship MBP 16 M5 Max review published (v3.0 carry-over)
7. GlitchTek blog (v3.0 carry-over)
8. Trailer video surface (v3.0 carry-over)
9. Per-page quality fixes derived from the audit (homepage, beats, services, booking, portfolio, artists, blog, contact, admin surfaces, global components)
10. Production deploy hardening — glitchtech.io domain, per-brand sitemap, OG tags, UAT admin cleanup, env/secret audit

**Explicitly NOT in scope (yet):**
- Feature work beyond audit-surfaced items (new capabilities belong in v4.1+)
- 2-way `/tech/compare` redesign stays as-is unless audit flags it
- Programmatic CLI (999.6) — defer post-launch
- Studios contact page redesign still deferred unless audit flags it

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

**v3.0 GlitchTek Launch (Phases 15–17 shipped, closed partial 2026-04-24):**
- [x] Rubric v1.1 locked in schema (Phase 15)
- [x] JSONL ingest pipeline (Mac → DB) (Phase 16)
- [x] Public site maintenance pass — sub-brand nav, splash, hero parity, responsive audit (Phase 16.1)
- [x] BPR rollup + medal UI + `/tech/methodology` page (Phase 17)

### Active (v4.0 Production Launch)

Derived from audit — placeholder list pending Phase 22 output.

- [ ] Visual audit & discovery (Phase 22 — seeds phases 23+)
- [ ] Email delivery end-to-end (Resend + React Email) — launch blocker
- [ ] Site-wide performance audit + fixes — launch blocker
- [ ] **GlitchMark system** — aggregate-all-benchmarks composite score, distinct from BPR
- [ ] Category master leaderboard (carry-over from v3.0)
- [ ] Flagship MBP 16 M5 Max review published (carry-over from v3.0)
- [ ] GlitchTek blog (carry-over from v3.0)
- [ ] Trailer video surface (carry-over from v3.0)
- [ ] Per-page quality fixes (populated from Phase 22 findings)
- [ ] Production deploy hardening — glitchtech.io domain, sitemaps, OG, UAT admin cleanup, env audit

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
| Rubric v1.1 for tech reviews | Cross-device comparability + BPR medal tier | Validated v3.0 Phase 15 — schema locked (4 enums, 17 cols, partial UNIQUE, CHECK), RUBRIC_V1_1 (43 entries, 13 disciplines) seeded; BPR rollup pending Phase 16/17 |
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
*Last updated: 2026-04-24 — v4.0 Production Launch milestone started. v3.0 closed partial with Phases 15-17 shipped; remaining launch work (17.5, 18, 19, 20, 20.5, 21) carried over. New scope: GlitchMark scoring system (distinct from BPR, captured in memory after being lost from the planning record), email delivery, performance, and production polish. Phase 22 is a visual audit that determines the rest of the milestone phases.*
