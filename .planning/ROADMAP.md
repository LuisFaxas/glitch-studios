# Roadmap: Glitch Studios

## Milestones

- ~~**v1.0 Full Scaffold**~~ - Phases 1-4.1 (shipped 2026-03-28)
- **v2.0 Quality Overhaul** - Phases 5-14 (in progress)

## Phases

<details>
<summary>v1.0 Full Scaffold (Phases 1-4.1) - SHIPPED 2026-03-28</summary>

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation + Public Site** - Project scaffold, cyberpunk identity, auth, and all public-facing pages
- [x] **Phase 1.1: Foundation Bug Fixes** - INSERTED -- Fix blog typography, sign-out UI, contact preselect, Neon driver
- [x] **Phase 1.2: Design Language Overhaul** - INSERTED -- Transform site into Cyberpunk Metro tile grid with glitch animations
- [x] **Phase 1.3: Supabase DB Driver Fix** - INSERTED -- Switch from Neon HTTP driver to Supabase-compatible Postgres driver
- [x] **Phase 1.4: Visual Polish & Sidebar Overhaul** - INSERTED -- Fix all visual defects from 2026-03-25 audit
- [x] **Phase 2: Beat Store** - Beat catalog, persistent player, licensing, cart, checkout, and digital delivery
- [x] **Phase 3: Booking System** - Calendar booking, time slot selection, deposit payments, and booking management
- [x] **Phase 4: Admin Dashboard + Email** - Unified admin management, email campaigns, newsletter, media library, and site settings
- [x] **Phase 4.1: Stabilization & Integration Fix** - INSERTED -- Fix client-bundle crash, auth 500, configure services, verify all routes

### Phase 1: Foundation + Public Site
**Goal**: Visitors can browse a fully styled Glitch Studios website with service pages, portfolio, artist profiles, blog, and contact form -- and create an account
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, INFR-05, INFR-06, BOOK-01, BOOK-05, BOOK-06, PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, CONT-01, CONT-02, CONT-03, AUTH-01, AUTH-02, AUTH-05
**Plans:** 6/6

Plans:
- [x] 01-01-PLAN.md
- [x] 01-02-PLAN.md
- [x] 01-03-PLAN.md
- [x] 01-04-PLAN.md
- [x] 01-05-PLAN.md
- [x] 01-06-PLAN.md

### Phase 1.1: Foundation Bug Fixes (INSERTED)
**Goal**: Fix functional bugs from v1.0 audit
**Depends on**: Phase 1
**Plans:** 2/2

Plans:
- [x] 01.1-01-PLAN.md
- [x] 01.1-02-PLAN.md

### Phase 1.2: Design Language Overhaul (INSERTED)
**Goal**: Transform site into Cyberpunk Metro tile grid with glitch animations
**Depends on**: Phase 1.1
**Plans**: 3/3

Plans:
- [x] 01.2-01-PLAN.md
- [x] 01.2-02-PLAN.md
- [x] 01.2-03-PLAN.md

### Phase 1.3: Supabase DB Driver Fix (INSERTED)
**Goal**: Switch to Supabase-compatible Postgres driver
**Depends on**: Phase 1.2
**Plans**: 1/1

### Phase 1.4: Visual Polish & Sidebar Overhaul (INSERTED)
**Goal**: Fix all visual defects from 2026-03-25 audit
**Depends on**: Phase 1.3
**Plans**: 3/3

Plans:
- [x] 01.4-01-PLAN.md
- [x] 01.4-02-PLAN.md
- [x] 01.4-03-PLAN.md

### Phase 2: Beat Store
**Goal**: Clients can browse beats, preview audio, select licenses, checkout, and download
**Depends on**: Phase 1
**Plans:** 8/8

Plans:
- [x] 02-01-PLAN.md
- [x] 02-02-PLAN.md
- [x] 02-03-PLAN.md
- [x] 02-04-PLAN.md
- [x] 02-05-PLAN.md
- [x] 02-06-PLAN.md
- [x] 02-07-PLAN.md
- [x] 02-08-PLAN.md

### Phase 3: Booking System
**Goal**: Clients can book studio services through a calendar, pay deposit, manage bookings
**Depends on**: Phase 2
**Plans:** 6/6

Plans:
- [x] 03-01-PLAN.md
- [x] 03-02-PLAN.md
- [x] 03-03-PLAN.md
- [x] 03-04-PLAN.md
- [x] 03-05-PLAN.md
- [x] 03-06-PLAN.md

### Phase 4: Admin Dashboard + Email
**Goal**: Admin can manage all content, clients, settings, and email from unified dashboard
**Depends on**: Phase 3
**Plans**: 8/8

Plans:
- [x] 04-01-PLAN.md
- [x] 04-02-PLAN.md
- [x] 04-03-PLAN.md
- [x] 04-04-PLAN.md
- [x] 04-05-PLAN.md
- [x] 04-06-PLAN.md
- [x] 04-07-PLAN.md
- [x] 04-08-PLAN.md

### Phase 04.1: Stabilization & Integration Fix (INSERTED)
**Goal**: Every built feature works end-to-end in browser
**Depends on**: Phase 4
**Plans:** 2/3

Plans:
- [x] 04.1-01-PLAN.md
- [x] 04.1-02-PLAN.md
- [ ] 04.1-03-PLAN.md

</details>

### v2.0 Quality Overhaul (In Progress)

**Milestone Goal:** Transform every page from scaffolded placeholder to polished, industry-leading quality -- sequential, one page at a time, with Playwright visual verification.

- [ ] **Phase 5: Admin Dashboard UX** - Independent sidebar scroll, cohesive dashboard layout
- [ ] **Phase 6: Homepage** - Clear hierarchy, compelling CTAs, logical content flow
- [ ] **Phase 7: Beats Catalog** - Industry-standard layout with prominent art, intuitive filters
- [ ] **Phase 8: Auth & Navigation** - Role-based redirects, discoverable client accounts
- [ ] **Phase 9: Services & Booking** - Comprehensive service info, clear booking step flow
- [ ] **Phase 10: Blog** - Consistent cards, engagement hooks, smooth browsing
- [ ] **Phase 11: Portfolio** - Detail view navigation, refined carousel animations
- [ ] **Phase 12: Artists & Team** - Clear sections, rich content, browsing mechanism
- [ ] **Phase 13: Contact** - WhatsApp, phone, location map, social links
- [ ] **Phase 14: Global Polish** - Brand social icons, footer signup, player widget refinement

## Phase Details

### Phase 5: Admin Dashboard UX
**Goal**: Admin dashboard feels like a real product -- sidebar scrolls independently, layout is visually cohesive and easy to navigate daily
**Depends on**: Phase 4.1
**Requirements**: ADMIN-01, ADMIN-02
**Success Criteria** (what must be TRUE):
  1. Admin sidebar scrolls independently when main content area is scrolled -- long sidebar menus are fully accessible without losing page position
  2. Dashboard stat tiles, activity feed, and navigation elements share a consistent visual weight and spacing -- nothing looks like a placeholder
  3. Admin can navigate between all dashboard sections without layout shift or visual jank
**Plans**: 1 plan

Plans:
- [x] 05-01-PLAN.md -- Fix viewport scroll, merge sidebar sections, polish dashboard layout

### Phase 6: Homepage
**Goal**: First-time visitors immediately understand what Glitch Studios offers and know exactly where to go next
**Depends on**: Phase 5
**Requirements**: HOME-01, HOME-02, HOME-03
**Success Criteria** (what must be TRUE):
  1. Above-the-fold content communicates what Glitch Studios is and what it offers within 3 seconds of page load
  2. Visitor can see and click obvious CTAs to book a session, browse beats, and explore the portfolio without scrolling past the fold
  3. Below-fold sections (services, featured beats, testimonials, blog) flow in a logical narrative order with no scattered or orphaned elements
  4. Homepage renders correctly on mobile (375px) with no overlapping elements or broken layout
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 06-01-PLAN.md -- Hero redesign with 3 CTAs and data layer wiring
- [x] 06-02-PLAN.md -- Below-fold section polish (featured beats, services, testimonials, blog)

### Phase 06.1: Homepage Flair (INSERTED)

**Goal**: Homepage has wow factor — splash logo animation, scroll-driven Framer Motion effects, animated scroll indicator, actual Glitch logo in hero, and proper beat card spacing
**Depends on**: Phase 6
**Requirements**: HOME-01, HOME-03
**Success Criteria** (what must be TRUE):
  1. Homepage opens with a splash animation featuring the Glitch logo before transitioning to the hero section
  2. Actual Glitch logo component renders in the hero section (not plain text)
  3. Animated scroll indicator arrow is visible at the bottom of the hero section
  4. Featured beat cards have visible spacing between them (not tight Metro gap)
  5. Scroll-driven Framer Motion effects add dynamism as visitors scroll through homepage sections
**Plans**: 2 plans

Plans:
- [ ] 06.1-01-PLAN.md -- Splash overlay, hero logo swap, scroll indicator, scroll effects, beat card spacing, footer logo
- [ ] 06.1-02-PLAN.md -- Playwright visual verification and user approval

**INSERTED**: yes

### Phase 7: Beats Catalog
**Goal**: Producers and clients can browse beats with an experience that matches industry leaders like BeatStars and Airbit
**Depends on**: Phase 6.1
**Requirements**: BEATS-01, BEATS-02, BEATS-03
**Success Criteria** (what must be TRUE):
  1. Each beat card prominently displays cover art, title, producer name, BPM, and key -- matching the visual density of BeatStars/Airbit
  2. Search bar, genre filter, mood filter, BPM range, and key filter are grouped in a single cohesive filter bar -- not scattered across the page
  3. Mood tags on beat cards are organized in a clean, scannable layout (pills or chips) with no visual chaos
  4. Beats page renders correctly on mobile with no horizontal overflow or cramped controls
**Plans**: TBD
**UI hint**: yes

### Phase 8: Auth & Navigation
**Goal**: Users can find their account, log in, and land in the right place based on their role -- admin or client
**Depends on**: Phase 7
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. After login, admin users are redirected to /admin and regular users are redirected to /dashboard
  2. Main navigation includes visible "Sign In" / "My Account" links -- client account access is not buried or hidden
  3. Sign-up and login pages are clearly separated from admin login, with appropriate sizing and visual hierarchy
  4. A logged-in client can reach their dashboard (purchases, bookings) in one click from any page
**Plans**: TBD
**UI hint**: yes

### Phase 9: Services & Booking
**Goal**: Visitors get enough information about each service to confidently book, and the booking flow guides them clearly through each step
**Depends on**: Phase 8
**Requirements**: BOOK-06, BOOK-07, BOOK-08
**Success Criteria** (what must be TRUE):
  1. Each service page displays pricing, what's included, duration, and enough detail for a client to decide without contacting support
  2. Booking wizard steps (service, date, time, details, payment) are clearly separated with contextual information at each step -- no barren or confusing screens
  3. All bookable services are visible and selectable in the booking flow -- nothing is hidden or missing
  4. Service and booking pages render correctly on mobile with no broken step indicators or overlapping elements
**Plans**: TBD
**UI hint**: yes

### Phase 10: Blog
**Goal**: Blog page feels intentional and engaging -- visitors want to read, not bounce
**Depends on**: Phase 9
**Requirements**: BLOG-01, BLOG-02, BLOG-03
**Success Criteria** (what must be TRUE):
  1. All blog cards render at consistent sizes regardless of title length, excerpt length, or cover image presence
  2. Blog page includes a featured/hero post, category navigation, and reading time estimates that encourage browsing
  3. Pagination or infinite scroll works smoothly -- no jarring page reloads or dead-end states
  4. Blog page renders correctly on mobile with cards stacking cleanly in a single column
**Plans**: TBD
**UI hint**: yes

### Phase 11: Portfolio
**Goal**: Visitors can browse portfolio items fluidly with clear navigation between detail views
**Depends on**: Phase 10
**Requirements**: PORT-06, PORT-07
**Success Criteria** (what must be TRUE):
  1. Portfolio detail view has visible prev/next navigation to browse between items without returning to the grid
  2. Existing carousel animations and category filters work smoothly with no regressions from v1
  3. Portfolio page renders correctly on mobile with appropriate touch interactions
**Plans**: TBD
**UI hint**: yes

### Phase 12: Artists & Team
**Goal**: Visitors understand who is behind Glitch Studios and who they might collaborate with
**Depends on**: Phase 11
**Requirements**: TEAM-01, TEAM-02, TEAM-03
**Success Criteria** (what must be TRUE):
  1. Artists page has clear visual separation between internal team members and collaborating artists
  2. Each artist card displays role, specialties, social links, and a short bio -- not just a name and photo
  3. Artists page includes a carousel or horizontal browsing mechanism consistent with the portfolio page pattern
  4. Artists page renders correctly on mobile with cards readable at small viewports
**Plans**: TBD
**UI hint**: yes

### Phase 13: Contact
**Goal**: Visitors can reach Glitch Studios through their preferred channel -- form, WhatsApp, phone, or social media
**Depends on**: Phase 12
**Requirements**: CONTACT-01, CONTACT-02, CONTACT-03
**Success Criteria** (what must be TRUE):
  1. Contact page displays a WhatsApp link/button and phone number alongside the existing email form
  2. Contact page shows studio location with an embedded map (Google Maps or similar)
  3. Contact page includes social media links (Instagram, YouTube, SoundCloud, etc.) with recognizable icons
  4. Contact page renders correctly on mobile with all channels accessible without horizontal scrolling
**Plans**: TBD
**UI hint**: yes

### Phase 14: Global Polish
**Goal**: Site-wide details that span multiple pages are refined -- brand icons, footer, and player widget
**Depends on**: Phase 13
**Requirements**: POLISH-01, POLISH-02, POLISH-03
**Success Criteria** (what must be TRUE):
  1. All social media links across the site use actual brand icons (Instagram, YouTube, SoundCloud logos) -- not generic Lucide placeholders
  2. Footer newsletter signup is properly sized, clearly labeled, and positioned as a natural part of the footer -- not buried or undersized
  3. Audio player widget has polished controls, clear now-playing info, and looks intentional rather than bolted on
  4. All global changes render correctly on mobile without breaking any page layouts
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
v1.0: 1 -> 1.1 -> 1.2 -> 1.3 -> 1.4 -> 2 -> 3 -> 4 -> 4.1
v2.0: 5 -> 6 -> 6.1 -> 7 -> 8 -> 9 -> 10 -> 11 -> 12 -> 13 -> 14

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation + Public Site | v1.0 | 6/6 | Complete | 2026-03-25 |
| 1.1 Foundation Bug Fixes | v1.0 | 2/2 | Complete | 2026-03-25 |
| 1.2 Design Language Overhaul | v1.0 | 3/3 | Complete | 2026-03-25 |
| 1.3 Supabase DB Driver Fix | v1.0 | 1/1 | Complete | 2026-03-25 |
| 1.4 Visual Polish & Sidebar Overhaul | v1.0 | 3/3 | Complete | 2026-03-25 |
| 2. Beat Store | v1.0 | 8/8 | Complete | 2026-03-26 |
| 3. Booking System | v1.0 | 6/6 | Complete | 2026-03-26 |
| 4. Admin Dashboard + Email | v1.0 | 8/8 | Complete | 2026-03-27 |
| 4.1 Stabilization & Integration Fix | v1.0 | 2/3 | Complete | 2026-03-28 |
| 5. Admin Dashboard UX | v2.0 | 0/1 | In progress | - |
| 6. Homepage | v2.0 | 0/2 | Not started | - |
| 6.1 Homepage Flair | v2.0 | 0/2 | Not started | - |
| 7. Beats Catalog | v2.0 | 0/0 | Not started | - |
| 8. Auth & Navigation | v2.0 | 0/0 | Not started | - |
| 9. Services & Booking | v2.0 | 0/0 | Not started | - |
| 10. Blog | v2.0 | 0/0 | Not started | - |
| 11. Portfolio | v2.0 | 0/0 | Not started | - |
| 12. Artists & Team | v2.0 | 0/0 | Not started | - |
| 13. Contact | v2.0 | 0/0 | Not started | - |
| 14. Global Polish | v2.0 | 0/0 | Not started | - |
