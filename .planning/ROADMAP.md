# Roadmap: Glitch Studios

## Overview

Glitch Studios ships in four phases, moving from a public-facing site with the cyberpunk identity through the two revenue features (beat sales, then booking), and finishing with the unified admin dashboard. Each phase delivers a complete, usable capability. The beat store comes before booking because it establishes payment infrastructure that booking reuses, and because beat sales are the primary revenue stream.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation + Public Site** - Project scaffold, cyberpunk identity, auth, and all public-facing pages
- [x] **Phase 1.1: Foundation Bug Fixes** - INSERTED — Fix blog typography, sign-out UI, contact preselect, Neon driver
- [ ] **Phase 1.2: Design Language Overhaul** - INSERTED — Transform site into Cyberpunk Metro tile grid with glitch animations
- [ ] **Phase 2: Beat Store** - Beat catalog, persistent player, licensing, cart, checkout, and digital delivery
- [ ] **Phase 3: Booking System** - Calendar booking, time slot selection, deposit payments, and booking management
- [ ] **Phase 4: Admin Dashboard + Email** - Unified admin management, email campaigns, newsletter, media library, and site settings

## Phase Details

### Phase 1: Foundation + Public Site
**Goal**: Visitors can browse a fully styled Glitch Studios website with service pages, portfolio, artist profiles, blog, and contact form -- and create an account
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, INFR-05, INFR-06, BOOK-01, BOOK-05, BOOK-06, PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, CONT-01, CONT-02, CONT-03, AUTH-01, AUTH-02, AUTH-05
**Success Criteria** (what must be TRUE):
  1. Visitor can navigate a mobile-first site with the cyberpunk/glitch black-and-white aesthetic, Framer Motion transitions, and Embla carousels on all major pages
  2. Visitor can browse service pages with pricing, watch the homepage video showreel, view video/audio portfolio, read artist profiles, and read blog posts
  3. Visitor can submit the contact form and sign up for the newsletter
  4. User can register an account, log in, log out, and stay logged in across browser refresh
  5. Site is deployed on Vercel with Caddy configured for local dev, and SEO fundamentals (metadata, Open Graph, sitemap) are in place
**Plans:** 6/6 plans executed

Plans:
- [x] 01-01-PLAN.md -- Scaffold Next.js project, install dependencies, Tailwind v4 design system, Drizzle schema, seed data, Caddy config
- [x] 01-02-PLAN.md -- Better Auth with admin/client roles, login/register pages, GLITCH logo, side nav, bottom tab bar, footer, public layout
- [x] 01-03-PLAN.md -- Homepage (hero, services overview, beat carousel, portfolio carousel, testimonials) with scroll animations, tabbed services page
- [x] 01-04-PLAN.md -- Portfolio carousel with lazy YouTube embeds, case study pages, artist grid and profile pages
- [x] 01-05-PLAN.md -- Blog index with pagination and categories, blog post pages, contact form with server action
- [x] 01-06-PLAN.md -- SEO (sitemap, robots.txt, structured data), custom 404, Vercel config, final verification checkpoint

**UI hint**: yes

### Phase 1.1: Foundation Bug Fixes
**Goal**: Fix functional bugs and production risks identified in v1.0 milestone audit — blog typography, sign-out UI, contact form preselect, and Neon serverless driver
**Depends on**: Phase 1
**Requirements**: CONT-01, AUTH-01, AUTH-05, BOOK-05, INFR-02
**Gap Closure**: Closes gaps from v1.0-MILESTONE-AUDIT.md
**Success Criteria** (what must be TRUE):
  1. Blog post bodies render with proper typography (headings, lists, paragraphs styled)
  2. Authenticated user can sign out via a button in the side nav
  3. Clicking "Book Now" on a service page preselects that service in the contact form dropdown
  4. Database client uses Neon HTTP driver compatible with Vercel serverless
**Plans:** 2/2 plans executed

Plans:
- [x] 01.1-01-PLAN.md -- Install @tailwindcss/typography, add sign-out UI to nav, fix contact form preselect
- [x] 01.1-02-PLAN.md -- Migrate database client from postgres-js to Neon HTTP serverless driver

**INSERTED**: yes

### Phase 1.2: Design Language Overhaul
**Goal**: Transform the site from generic dark theme into Cyberpunk Metro — dark brutalist tile grid navigation, glitch hover animations, sidebar widget dashboard, and flat tile-based components across all pages
**Depends on**: Phase 1.1
**Requirements**: INFR-03, INFR-04, INFR-05, INFR-06
**Design Spec**: .planning/DESIGN-LANGUAGE.md
**Logo**: Untitled-2.png (official GLITCH wordmark with horizontal scan-line distortion)
**Success Criteria** (what must be TRUE):
  1. Sidebar is a Metro tile dashboard (mixed sizes), not a link list
  2. All tiles trigger glitch distortion (clip-path jitter + scan line) on hover
  3. Current page tile inverts (white bg/black text)
  4. 3+ widgets below nav tiles (Now Playing, Studio Status, Latest Post, Social)
  5. All content cards use flat tile language (sharp corners, 2-4px gaps)
  6. Services page uses tile grid instead of tabs
  7. Page transitions have 200ms glitch effect
  8. Mobile bottom tab uses icon-only tiles
  9. Zero accent colors — monochrome only
  10. Respects prefers-reduced-motion
**Plans**: 3 plans

Plans:
- [x] 01.2-01-PLAN.md -- CSS animation foundation: glitch-hover, scan-line keyframes, spacing tokens, and base Tile component (2 tasks)
- [ ] 01.2-02-PLAN.md -- Desktop sidebar: LogoTile, TileNav, 4 widgets (Now Playing, Studio Status, Latest Post, Social), app layout integration (3 tasks, depends on 01.2-01)
- [ ] 01.2-03-PLAN.md -- Mobile nav, services master-detail/accordion, card restyling, page transitions, final design verification (checkpoint, depends on 01.2-02)

**INSERTED**: yes
**UI hint**: yes

### Phase 2: Beat Store
**Goal**: Clients can browse beats, preview audio with a persistent player, select license tiers, add to cart, checkout with Stripe or PayPal, and instantly download purchased files
**Depends on**: Phase 1
**Requirements**: BEAT-01, BEAT-02, BEAT-03, BEAT-04, BEAT-05, BEAT-06, BEAT-07, BEAT-08, BEAT-09, BEAT-10, BEAT-11, MAIL-01, AUTH-03, ADMN-01
**Success Criteria** (what must be TRUE):
  1. Visitor can browse the beat catalog with genre/BPM/key/mood filters and text search, and preview watermarked audio through a persistent player with waveform that survives page navigation
  2. Visitor can select a license tier for any beat, add multiple beats to a persistent cart, and complete checkout via Stripe or PayPal
  3. Buyer receives a purchase receipt email and can instantly download purchased files (including auto-generated license PDF) via signed URLs
  4. Logged-in client can view purchase history and re-download past purchases from their dashboard
  5. Admin can create, edit, and delete beats with metadata, files, pricing, license tiers, co-producer splits, and bundle pricing from the admin area
**Plans**: TBD
**UI hint**: yes

### Phase 3: Booking System
**Goal**: Clients can book studio services through a calendar interface, pay a deposit, and manage their bookings
**Depends on**: Phase 2
**Requirements**: BOOK-02, BOOK-03, BOOK-04, AUTH-04, MAIL-02, ADMN-02
**Success Criteria** (what must be TRUE):
  1. Visitor can select a service type, pick an available time slot on the calendar, and complete a booking with deposit payment via Stripe or PayPal
  2. Client receives a booking confirmation email with session details and can view upcoming and past bookings in their dashboard
  3. Admin can view, confirm, cancel, and reschedule bookings from the admin area
**Plans**: TBD
**UI hint**: yes

### Phase 4: Admin Dashboard + Email
**Goal**: Admin can manage all site content, clients, settings, and email communications from a unified, task-oriented dashboard
**Depends on**: Phase 3
**Requirements**: ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, MAIL-03, MAIL-04, MAIL-05
**Success Criteria** (what must be TRUE):
  1. Admin can manage blog posts, service pages, team bios, and testimonials through content CRUD; and upload, organize, and manage all media (images, audio, video) from a media library
  2. Admin can view the client list with purchase and booking history, edit site settings (pricing, availability, about page, contact info), and customize the homepage (reorder sections, edit hero, feature beats/videos)
  3. Admin can view contact form submissions, reply to messages, compose and send newsletter broadcasts, and manage subscriber lists -- all from the dashboard
  4. Role-based access (owner, editor, manager) restricts admin actions to appropriate permission levels
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 1.1 -> 1.2 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Public Site | 6/6 | Done | 2026-03-25 |
| 1.1 Foundation Bug Fixes | 2/2 | Done | 2026-03-25 |
| 1.2 Design Language Overhaul | 0/3 | Planning | - |
| 2. Beat Store | 0/TBD | Not started | - |
| 3. Booking System | 0/TBD | Not started | - |
| 4. Admin Dashboard + Email | 0/TBD | Not started | - |
