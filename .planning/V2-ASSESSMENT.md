# Glitch Studios v2 Assessment

**Date:** 2026-03-28
**Assessed by:** User + codebase audit
**Overall rating:** 4/10

## Current State Summary

v1 delivered a complete functional scaffold: every feature exists in code, every CRUD operation works in admin, auth/payments/email are wired up. But the **user experience is a 4/10** — it feels like a template with placeholder content, not an industry-leading studio site.

The gap isn't missing features — it's **quality, polish, and coherence**.

---

## Page-by-Page Assessment

### Homepage — 4/10
**Issues:**
- Layout is a mess, unusable
- Tags/elements scattered without clear hierarchy
- No clear value proposition above the fold
- Doesn't guide visitors to key actions (book, buy beats, explore)

**What exists:** Hero section, service tiles, latest blog post widget, featured content

### Beats Page — 4/10
**Issues:**
- Search and filters are scattered, not intuitive
- Tags (moods) displayed chaotically
- Not industry-leading — compare to BeatStars, Airbit, etc.
- Beat rows lack visual appeal (no cover art prominently displayed)

**What exists:** Full search, genre/key/mood/BPM filtering via nuqs, beat rows with expand/collapse, license modal, cart integration, bundle section

**Admin control:** Full CRUD — create/edit/delete beats, set pricing per license tier, manage producers, upload files

### Services Page — 6/10
**Issues:**
- Need to verify admin control over all services and pricing
- Could be more engaging

**What exists:** Master-detail layout (desktop), accordion (mobile), service tiles with pricing labels, "Book Now" CTA for bookable services

**Admin control:** Full CRUD — create/edit/delete services, configure booking settings (deposit type, cancellation policy, prep instructions), toggle active/bookable status. Pricing is via `priceLabel` field (text, not calculated).

### Booking Flow — 5/10
**Issues:**
- Barren, not enough information at each step
- Not all services visible
- Date/time/payment flow confusing
- Steps feel disconnected

**What exists:** 5-step wizard (service → date → time → details → payment), Stripe deposit, recurring booking option, room selection, availability calendar

**Admin control:** Full — manage rooms, availability, blocked dates, service booking configs, view/manage all bookings in calendar + list views

### Portfolio Page — 7/10 (highest rated)
**Issues:**
- Detail view confusing — how to navigate between items
- Video browsing experience needs work

**What exists:** Carousel with sprawling animations, category filters, individual case study pages at `/portfolio/[slug]`

**Admin control:** via portfolio_items table, but no dedicated admin page found — may need `/admin/portfolio` CRUD

### Artists Page — unrated (basic)
**Issues:**
- Very basic — just "Our Team" heading with cards
- Unclear purpose: team? collaborating artists? both?
- No carousel like portfolio
- No meaningful content beyond name/title/image

**What exists:** Grid of team members from `teamMembers` table, individual pages at `/artists/[slug]`

**Decision needed:** Should this show (a) internal team only, (b) external collaborators, or (c) both with clear sections?

### Blog Page — 5/10
**Issues:**
- Inconsistent card sizes (user reported "Welcome to Glitch" different size)
- No scrolling/infinite load
- Nothing draws attention or explains what blogs offer
- Barren feeling

**What exists:** 3-column grid, category filtering, pagination (9/page), hover glitch animation, consistent card component (code shows same aspect-ratio for all)

**Note:** Card sizes should be consistent per code — the visual inconsistency may be from varying content length (title/excerpt clamping) or missing cover images triggering different layouts

### Contact Page — 4/10
**Issues:**
- Email form only — too simple
- No WhatsApp integration
- No phone number
- No physical address/location
- No social media links

**What exists:** Name, email, subject, message, optional service dropdown. Submits to DB + notification email.

### Cart & Checkout — working
**What exists:** Drawer-style cart, Stripe Embedded Checkout, guest checkout, order polling, download links (MP3/WAV/stems/license PDF), post-purchase account upsell

### Player Widget — 7/10
**Issues:** Could look better, unclear if fully functional
**What exists:** Persistent bottom bar with play/pause, beat info, waveform visualization (WaveSurfer.js)

### Social Media Icons — broken
**Issues:** Using generic Lucide icons (Camera, Video, Headphones) instead of actual platform icons (Instagram, YouTube, SoundCloud). Users can't tell where they're going.
**Fix:** Replace with actual brand SVGs or use `lucide-react` brand equivalents (they don't exist in Lucide — need `react-icons` or custom SVGs)

### Sign Up Flow — confusing
**Issues:**
- Sign up button buried and small in footer
- Admin vs client credential flow unclear
- Login redirects to /admin regardless of role
- No visible "My Account" or client dashboard link in navigation
- Client dashboard exists at /dashboard but isn't discoverable

**What exists:**
- `/register` — create account (name, email, password)
- `/login` — sign in (redirects to /admin currently)
- `/dashboard/purchases` — client purchase history
- `/dashboard/bookings` — client booking history
- Middleware only protects /admin/* routes

### Admin Dashboard — needs work
**Issues:**
- Sidebar doesn't scroll independently from main content
- Everything feels placeholder-y

**What exists:** Full sidebar navigation, stat tiles, activity feed, CRUD for: services, beats, blog (with categories), bundles, team, bookings (calendar + list), rooms, availability, packages, clients, newsletter, testimonials, media, inbox, roles, settings, homepage config

---

## What's Actually Strong (don't rebuild)

1. **Admin CRUD** — comprehensive, covers every entity
2. **Payment integration** — Stripe embedded checkout for both beats and bookings
3. **Auth system** — Better Auth with roles (owner/admin/user), session management
4. **Database schema** — well-structured, covers all use cases
5. **Booking wizard** — 5-step flow with real availability checking
6. **Portfolio animations** — highest rated page, keep the approach
7. **Design system** — Cyberpunk Metro language exists, just needs better application

## What Needs a New Approach

1. **Homepage** — needs complete redesign with clear hierarchy and CTAs
2. **Beats page** — needs industry-standard layout (BeatStars/Airbit reference)
3. **Contact page** — needs WhatsApp, phone, social, location
4. **Artists page** — needs clear purpose and richer content
5. **Blog page** — needs visual consistency and engagement hooks
6. **Social icons** — need actual brand icons
7. **Auth/navigation flow** — clients need discoverable account access
8. **Admin sidebar** — needs independent scroll

---

## Recommendation: v2 Milestone

**Yes, create a new milestone.** v1 proved the stack and built the backend. v2 should be a **quality-focused, sequential page overhaul** with these principles:

1. **One page at a time** — sequential phases, not parallel
2. **Playwright verification** — every phase uses screenshots to verify visual output
3. **Reference-driven** — each page redesign references best-in-class examples
4. **Admin-verified** — each phase confirms admin CRUD controls the page content
5. **Mobile-first** — verify on mobile viewport before desktop

### Proposed v2 Phase Order (by impact and dependency)

| Phase | Page | Priority | Why this order |
|-------|------|----------|----------------|
| 1 | Admin Dashboard UX | HIGH | Fix sidebar scroll + layout — needed to verify all other pages |
| 2 | Homepage | HIGH | First impression, gateway to everything else |
| 3 | Beats Catalog | HIGH | Core revenue page, needs industry-standard UX |
| 4 | Auth & Navigation | HIGH | Client accounts, discoverable dashboard, role-based redirects |
| 5 | Services + Booking | MEDIUM | Already decent, needs polish and flow improvements |
| 6 | Blog | MEDIUM | Content marketing, needs engagement hooks |
| 7 | Portfolio | LOW | Already 7/10, minor refinements |
| 8 | Artists/Team | MEDIUM | Needs purpose definition and richer content |
| 9 | Contact | MEDIUM | Add WhatsApp, phone, social, location |
| 10 | Global Polish | LOW | Social icons, footer, sign-up placement, player widget |

### Process Change for v2

- **Each phase**: discuss → plan → execute → Playwright verify → user review
- **No blind scaffolding**: AI must screenshot and verify before marking complete
- **User reviews each page** before moving to next
- **Smaller phases**: one page per phase, 2-3 plans max
