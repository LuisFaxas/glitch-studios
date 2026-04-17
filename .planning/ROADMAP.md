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
- [x] **Phase 1.4: Visual Polish & Sidebar Overhaul** - INSERTED -- Fix all visual defects from 2015-03-25 audit
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
**Goal**: Fix all visual defects from 2015-03-25 audit
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

- [x] **Phase 5: Admin Dashboard UX** - Independent sidebar scroll, cohesive dashboard layout
- [x] **Phase 6: Homepage** - Clear hierarchy, compelling CTAs, logical content flow
- [x] **Phase 6.1: Homepage Flair** - INSERTED -- Splash animation, scroll effects, Glitch logo in hero
- [x] **Phase 7: Beats Catalog** - Industry-standard layout with prominent art, intuitive filters (Plan 03 deferred — seed data)
- [x] **Phase 7.1: Listening Experience & Waveform Overhaul** - INSERTED -- Real waveforms, interactive scrubbing, mini-player widget, mobile waveform
- [x] **Phase 7.2: Mobile Experience Overhaul** - INSERTED -- Tab bar restructure, player coexistence, responsive hero (Plan 04 deferred — verification after 07.3)
- [ ] **Phase 7.3: Mobile Menu Overhaul** - INSERTED -- Fix the mobile nav overlay to be usable, clean, and industry-quality
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
**Plans**: 1/1

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
**Plans**: 3 plans

Plans:
- [x] 06.1-01-PLAN.md -- Splash overlay, hero logo swap, scroll indicator, scroll effects, beat card spacing, footer logo
- [x] 06.1-02-PLAN.md -- Playwright visual verification and user approval
- [x] 06.1-03-PLAN.md -- Scroll-aware sidebar collapse for centered logos

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
**Plans**: 3 plans

Plans:
- [x] 07-01-PLAN.md -- New components: beat card, card grid, view toggle, unified filter bar
- [x] 07-02-PLAN.md -- Wire catalog with view toggle, redesign list rows and page layout
- [x] 07-03-PLAN.md -- ~~Real beat upload, Playwright visual verification~~ DEFERRED

### Phase 07.6: Reviews display & comparison tables (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 7
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 07.6 to break down)

### Phase 07.5: Product reviews data model & admin input (INSERTED)

**Goal:** Deliver the Drizzle schema and admin input surfaces for Glitch Tech's review vertical — 12 new `tech_*` tables, a Studios↔Tech admin context switcher, admin CRUD for categories (3-level tree with DnD reorder), products (flat form with dynamic specs by category), reviews (full-featured Tiptap editor with autosave, 4-dimension ratings, pros/cons, media gallery, audience callouts, draft→published workflow), and spec/benchmark template drawers per category.
**Requirements**: TECH-01, TECH-02, TECH-03
**Depends on:** Phase 7.4
**Success Criteria** (what must be TRUE):
  1. 12 `tech_*` tables exist in src/db/schema.ts and migrate cleanly (categories, spec templates/fields, products, product_specs join, reviews, review pros/cons/gallery, benchmark templates/tests/runs)
  2. Admin sidebar renders Studios/Tech segmented pills with route-aware active state and a persistent shared section (Media/Clients/Roles/Settings)
  3. Admin can build a 3-level category tree with inline rename, DnD reorder, and keyboard fallback
  4. Per-category spec template editor (Text/Number/Enum/Boolean) and benchmark template editor ship as right-side drawers
  5. Product form renders typed dynamic spec fields based on selected category; category change mid-edit shows a confirmation dialog
  6. Review editor ships two-column body+preview on desktop, tab mode on narrow viewports, right-rail Details sheet for rating/pros-cons/media/audience/publishing, autosave (2s debounce + 30s periodic), explicit Publish/Unpublish
  7. Playwright specs cover context switcher, category CRUD, product form with dynamic specs, and review editor; `pnpm tsc --noEmit` + `pnpm lint` pass phase-wide
**Plans:** 7/7 plans complete

Plans:
- [x] 07.5-01-PLAN.md -- Install shadcn command, extract slugify, append 12 tech_* tables + 3 enums + relations, generate + push migration
- [x] 07.5-02-PLAN.md -- AdminContextSwitcher component + refactor admin-sidebar.tsx (studios/tech/shared section split)
- [x] 07.5-03-PLAN.md -- 5 server action files (categories/products/reviews/benchmarks/templates) + 9 /admin/tech/* route pages (list pages functional, new/edit pages stubs)
- [x] 07.5-04-PLAN.md -- CategoryTreeView with dnd-kit + keyboard, CategoryDetailPanel, SpecTemplateEditor drawer, BenchmarkTemplateEditor drawer, wire /admin/tech/categories
- [x] 07.5-05-PLAN.md -- CategoryPicker (shadcn Command-in-Popover), DynamicSpecFields, ProductForm (create+edit with category-change warning), wire /admin/tech/products new/edit
- [x] 07.5-06-PLAN.md -- useAutosave hook, AutosaveIndicator, RatingSlider, ProsConsInput, MarkdownPreviewPane, ReviewEditor (body+preview desktop / tab mode mobile / Details sheet), listReviewers action, wire /admin/tech/reviews new/edit
- [x] 07.5-07-PLAN.md -- Playwright specs (context switcher, category tree, product form, review editor) + phase typecheck/lint gate + human visual verification checkpoint

### Phase 07.4: Brand architecture & Glitch Tech sub-brand foundation (INSERTED)

**Goal:** Glitch Tech launches as its own entity at /tech with independent layout, nav, and landing page — sharing the Glitch Studios codebase, design system, admin, auth, and database. Ships the architectural shell (new `(tech)/` route group) and a full /tech homepage with placeholder content ready for 7.5/7.6 to populate.
**Requirements**: TECH-01, TECH-02, TECH-03
**Depends on:** Phase 7
**Success Criteria** (what must be TRUE):
  1. `/tech` is a distinct entity with its own layout, its own nav (Reviews / Categories / Compare / Benchmarks / About), and its own mobile tab bar — not a subpage of Glitch Studios
  2. Glitch Tech uses the Cyberpunk Metro aesthetic with a subtle accent variant + "GLITCH TECH" logo wordmark
  3. /tech landing page has full homepage structure with placeholder content (hero, featured reviews, category tiles, benchmark spotlight, compare CTA, newsletter)
  4. Each sidebar has a cross-link tile to the other entity's logo, using Next.js `<Link>` for seamless in-tab transition with preserved audio/cart/auth state
  5. Glitch Studios homepage has a dedicated promotional section for Glitch Tech
  6. Glitch Studios main nav (`publicNavItems`, mobile tab bar) is unchanged — no "Tech" item added
**Plans:** 5/5 plans complete

Plans:
- [x] 07.4-01-PLAN.md -- Parameterize layout primitives (TileNav, BottomTabBar, MobileNavOverlay, LogoTile, GlitchLogo, HeroSection), move FloatingCartButton to root, formalize TECH-01/02/03
- [x] 07.4-02-PLAN.md -- Create tech-nav-config + (tech)/ route group layout + 7 placeholder pages (/tech, /reviews, /reviews/[slug], /categories, /compare, /benchmarks, /about)
- [x] 07.4-03-PLAN.md -- Build GlitchTechPromoSection + TechCrossLinkTile, wire into Studios homepage and sidebar
- [x] 07.4-04-PLAN.md -- Build Tech landing page (6 sections) + Tech sidebar widgets (Latest Review, Featured Product, Social Tech) + StudiosCrossLinkTile + TechLogoTile, wire into Tech layout
- [x] 07.4-05-PLAN.md -- Cross-brand transition animation in template.tsx + [data-brand='tech'] CSS hook + Playwright verification suite + human verification

### Phase 07.2: Mobile Experience Overhaul (INSERTED)

**Goal:** Mobile experience is a first-class citizen -- working navigation, responsive hero, dynamic player/tab bar coexistence, and no layout breakage on any page
**Depends on:** Phase 7.1
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11
**Success Criteria** (what must be TRUE):
  1. Tab bar renders 6 equal slots in order: Beats, Services, Portfolio, Blog, Menu, Cart -- menu trigger on the right, not center
  2. Player bar stacks above the tab bar when audio is playing, with dynamic bottom padding on content
  3. Hero section is 70vh on mobile (vs 90vh desktop), centered without sidebar offset, CTAs visible without scrolling
  4. Mobile nav overlay logo tile spans full width, all nav tiles and Sign In accessible
  5. Every public page renders correctly at 375px, 390px, and 430px with no horizontal overflow
**Plans**: 4 plans

Plans:
- [x] 07.2-01-PLAN.md -- Playwright mobile audit (screenshot all pages at 3 viewports)
- [x] 07.2-02-PLAN.md -- Tab bar restructure, dynamic padding, overlay logo fix
- [x] 07.2-03-PLAN.md -- Hero section mobile height and sidebar offset fix
- [x] 07.2-04-PLAN.md -- ~~Post-fix audit, page-by-page fixes, user verification~~ DEFERRED (run after 07.3)

**INSERTED**: yes

### Phase 07.3: Mobile Menu Overhaul (INSERTED)

**Goal**: Mobile nav overlay menu is clean, usable, and industry-quality — not a cluttered tile grid crammed into a fixed viewport
**Depends on**: Phase 7.2
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10
**Success Criteria** (what must be TRUE):
  1. Mobile menu overlay is visually clean and easy to navigate on 375px viewport
  2. All navigation destinations are reachable with clear tap targets
  3. Menu does not feel cluttered or cramped — content fits naturally without overflow
  4. Menu design matches the cyberpunk metro aesthetic of the rest of the site
**Plans**: 1 plan

Plans:
- [x] 07.3-01-PLAN.md -- Grid restructure, remove Now Playing, stagger animation, swipe-to-dismiss

**INSERTED**: yes

### Phase 07.1: Listening Experience & Waveform Overhaul (INSERTED)

**Goal**: Every beat touchpoint (cards, rows, sidebar widget, player bar) shows real audio-driven waveforms with interactive scrubbing, replacing all decorative placeholders
**Depends on:** Phase 7
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-12, D-13, D-14, D-15
**Success Criteria** (what must be TRUE):
  1. Beat cards and list rows display real waveform shapes from pre-computed peaks data, not decorative Math.sin() bars
  2. Card waveforms are interactive -- click/drag to scrub starts and controls playback
  3. Sidebar now-playing widget is a rich mini-player with cover art, track info, time display, and interactive waveform
  4. Desktop player bar shows elapsed/total time display next to the waveform
  5. Mobile player bar has a real waveform with tap/drag scrubbing replacing the 2px progress bar
  6. All waveforms render from pre-computed peaks stored in the database (not client-side audio decoding)
**Plans**: 3 plans

Plans:
- [x] 07.1-01-PLAN.md -- Data layer (schema, types, peaks utility, seed) + reusable Waveform canvas component
- [x] 07.1-02-PLAN.md -- Beat card, list row, and sidebar widget waveform integration
- [x] 07.1-03-PLAN.md -- Player bar enhancements (desktop time display + mobile waveform)

**INSERTED**: yes

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
v2.0: 5 -> 6 -> 6.1 -> 7 -> 7.1 -> 7.2 -> 7.3 -> 8 -> 9 -> 10 -> 11 -> 12 -> 13 -> 14

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
| 5. Admin Dashboard UX | v2.0 | 1/1 | Complete | 2026-03-29 |
| 6. Homepage | v2.0 | 2/2 | Complete | 2026-03-30 |
| 6.1 Homepage Flair | v2.0 | 3/3 | Complete | 2026-03-30 |
| 7. Beats Catalog | v2.0 | 2/3 | Complete (Plan 03 deferred) | 2026-03-31 |
| 7.1 Listening Experience & Waveform Overhaul | v2.0 | 3/3 | Complete | 2026-03-31 |
| 7.2 Mobile Experience Overhaul | v2.0 | 3/4 | Complete (Plan 04 deferred) | 2026-04-01 |
| 7.3 Mobile Menu Overhaul | v2.0 | 0/1 | **Next up** | - |
| 7.4 Brand architecture & Glitch Tech sub-brand foundation | v2.0 | 0/5 | Planned | - |
| 7.5 Product reviews data model & admin input | v2.0 | 0/7 | Planned | - |
| 8. Auth & Navigation | v2.0 | 0/0 | Not started | - |
| 9. Services & Booking | v2.0 | 0/0 | Not started | - |
| 10. Blog | v2.0 | 0/0 | Not started | - |
| 11. Portfolio | v2.0 | 0/0 | Not started | - |
| 12. Artists & Team | v2.0 | 0/0 | Not started | - |
| 13. Contact | v2.0 | 0/0 | Not started | - |
| 14. Global Polish | v2.0 | 0/0 | Not started | - |
