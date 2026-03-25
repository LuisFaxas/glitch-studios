# Glitch Studios

## What This Is

A website for Glitch Studios — a music and video production studio and creative agency. The site serves as both a storefront for booking services (studio sessions, mixing/mastering, video production, SFX, graphic design) and a media platform for showcasing work (beat catalog, video portfolio, artist profiles, blog). Clients can book via calendar, purchase beat licenses, and manage their account. Admins manage everything from a built-in dashboard.

## Core Value

Clients can discover Glitch Studios' work and book services or buy beats in one seamless experience.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Public-facing website with cyberpunk/glitch aesthetic (flat black & white, minimal, futuristic, sleek)
- [ ] Service pages for studio sessions, mixing/mastering, video production, SFX, graphic design
- [ ] Calendar-based booking system for all services
- [ ] Beat catalog with audio previews and e-commerce checkout
- [ ] Video portfolio with embedded playback
- [ ] Artist/producer profile pages
- [ ] Blog/news section
- [ ] Admin dashboard — manage content, bookings, clients, site settings, pricing, team bios
- [ ] Client accounts — view bookings, downloads, purchase history
- [ ] Email system — transactional (booking confirmations, receipts), newsletters, contact inbox from admin dash
- [ ] Stripe + PayPal payment processing
- [ ] Caddy dev server configuration for local development
- [ ] Vercel deployment

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
| Stripe + PayPal dual payment | Maximum buyer coverage | -- Pending |
| Calendar-based booking | Direct scheduling vs. inquiry forms — faster for clients | -- Pending |
| Flat black & white cyberpunk aesthetic | Brand identity — sleek, futuristic, minimal | -- Pending |
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
*Last updated: 2026-03-25 after initialization*
