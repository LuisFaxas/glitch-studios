# Glitch Studios

## What This Is

A website for Glitch Studios — a music and video production studio and creative agency. The site serves as both a storefront for booking services (studio sessions, mixing/mastering, video production, SFX, graphic design) and a media platform for showcasing work (beat catalog, video portfolio, artist profiles, blog). Clients can book via calendar, purchase beat licenses, and manage their account. Admins manage everything from a built-in dashboard.

## Core Value

Clients can discover Glitch Studios' work and book services or buy beats in one seamless experience.

## Current Milestone: v2.0 Quality Overhaul

**Goal:** Transform every page from scaffolded placeholder to polished, industry-leading quality — sequential, one page at a time, with Playwright visual verification.

**Target features:**
- Admin dashboard UX fix (independent sidebar scroll, layout polish)
- Homepage redesign (clear hierarchy, CTAs, compelling first impression)
- Beats catalog overhaul (industry-standard UX, reference BeatStars/Airbit)
- Auth & navigation flow (client vs admin clarity, discoverable dashboard)
- Services + booking flow polish (more info, better step flow)
- Blog page improvement (consistent cards, engagement hooks)
- Portfolio refinements (detail view navigation)
- Artists/Team page (define purpose, richer content, carousel)
- Contact page expansion (WhatsApp, phone, social, location)
- Global polish (real social media icons, footer, sign-up placement, player widget)

**Process change:** Sequential phases, Playwright screenshots during development, user reviews each page before moving on.

## Requirements

### Validated

- [x] Public-facing website with cyberpunk/glitch aesthetic — Validated in Phase 1 + 1.1 + 1.2: Cyberpunk Metro tile grid with glitch animations
- [x] Service pages for studio sessions, mixing/mastering, video production, SFX, graphic design — Validated in Phase 1
- [x] Video portfolio with embedded playback — Validated in Phase 1
- [x] Artist/producer profile pages — Validated in Phase 1
- [x] Blog/news section — Validated in Phase 1.1 (typography fix)
- [x] Caddy dev server configuration for local development — Validated in Phase 1
- [x] Vercel deployment — Validated in Phase 1.1 (Neon HTTP driver)
- [x] Beat catalog with audio previews and e-commerce checkout — Validated in Phase 2: Beat Store
- [x] Stripe + PayPal payment processing — Validated in Phase 2: Beat Store (PayPal via Stripe Dashboard)
- [x] Client accounts — view bookings, downloads, purchase history — Validated in Phase 2: Beat Store (purchase history + re-download)
- [x] Email system — transactional (booking confirmations, receipts), newsletters, contact inbox from admin dash — Partially validated in Phase 2: Beat Store (purchase receipt email via Resend)

### Active

- [ ] Calendar-based booking system for all services
- [ ] Admin dashboard — manage content, bookings, clients, site settings, pricing, team bios (partially delivered in Phase 2: beat/bundle CRUD)

### Out of Scope

- Real-time chat/messaging — complexity not justified for v1
- Mobile app — web-first, responsive design covers mobile
- Streaming/subscription model — not part of initial vision
- Multi-language support — English only for v1

## Context

- **Tech stack:** Next.js, Tailwind CSS, Embla Carousel, Framer Motion
- **Deployment:** Vercel
- **Local dev:** Caddy reverse proxy reserved for this project
- **Payments:** Stripe + PayPal dual checkout
- **Visual direction:** Cyberpunk/futuristic but flat, minimal, and sleek. Black & white base with glitch-style texture. NOT neon-glow. Inspired by Graphite.com (dark elegance, clean type), The Verge (bold editorial layout), Resend (minimal developer aesthetic), Feastables (high contrast, bold type). Dramatic typography hierarchy, high contrast, subtle glitch effects as character.
- **Design reference:** Owner's personal portfolio at faxas.net/design — glassmorphic panels, frosted typography effects, constellation animations, flip card interactions, hover animations, living component library approach. Pull coolest elements from there.
- **Owner:** Trap Snyder (Josh) — music producer, content creator, streamer. Wants fast results, easy to operate.

## Constraints

- **Tech stack**: Next.js + Tailwind + Embla + Framer Motion — already decided
- **Architecture**: Mobile-first design with desktop optimization
- **Deployment**: Vercel — hosting platform locked in
- **Local dev**: Caddy — must be configured and reserved for this project
- **Operability**: Admin dashboard must be simple enough for non-technical daily use
- **Payments**: Must support both Stripe and PayPal at checkout

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Tailwind + Embla | User's preferred stack, strong Vercel integration | -- Pending |
| Stripe + PayPal dual payment | Maximum buyer coverage | Validated Phase 2 — Stripe Embedded Checkout, PayPal via Stripe Dashboard |
| Calendar-based booking | Direct scheduling vs. inquiry forms — faster for clients | -- Pending |
| Flat black & white cyberpunk aesthetic | Brand identity — sleek, futuristic, minimal | Validated Phase 1.2 — Metro tile grid, glitch animations, monochrome |
| Admin + client auth | Clients need account access for bookings/downloads | -- Pending |

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
*Last updated: 2026-03-28 — Milestone v2.0 started. v1.0 delivered full functional scaffold (40 plans, 9 phases). v2.0 focuses on UX quality overhaul.*
