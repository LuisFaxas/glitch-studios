---
phase: 01-foundation-public-site
plan: 03
subsystem: ui
tags: [homepage, hero, embla-carousel, framer-motion, scroll-animations, services-page, tabs, testimonials, portfolio]

# Dependency graph
requires:
  - phase: 01-02
    provides: GLITCH logo component, shadcn/ui components, public layout shell, side nav, bottom tab bar, footer
provides:
  - Full homepage with hero, services overview, featured beats carousel, video portfolio carousel, testimonials carousel
  - Framer Motion scroll-in animation wrapper (ScrollSection)
  - Embla carousels with autoplay for testimonials, navigation for beats and portfolio
  - Tabbed services page with deep-linking via URL hash
  - Organization schema structured data
affects: [01-04, 02-beat-store, 03-booking]

# Tech tracking
tech-stack:
  added: []
  patterns: [Embla carousel with autoplay plugin, Framer Motion whileInView scroll animations, force-dynamic for DB-dependent pages, base-ui Tabs with controlled value and hash routing]

key-files:
  created:
    - src/components/home/scroll-section.tsx
    - src/components/home/hero-section.tsx
    - src/components/home/services-overview.tsx
    - src/components/home/featured-carousel.tsx
    - src/components/home/video-portfolio-carousel.tsx
    - src/components/home/testimonials-carousel.tsx
    - src/components/services/service-tabs.tsx
    - src/app/(public)/services/page.tsx
  modified:
    - src/app/(public)/page.tsx

key-decisions:
  - "Used force-dynamic on homepage and services page to avoid static generation errors with dummy DB URL"
  - "Hero uses bg-black placeholder div instead of video element until R2 showreel URL is available"
  - "Featured beats carousel renders placeholder cards with Coming Soon text for Phase 2"
  - "Video portfolio carousel shows empty state message when no items exist in DB"

patterns-established:
  - "ScrollSection wrapper for consistent whileInView fade-up animations across all homepage sections"
  - "Embla carousel pattern: useEmblaCarousel hook + ChevronLeft/ChevronRight nav buttons + section heading"
  - "force-dynamic export for any page doing runtime DB queries"
  - "URL hash deep-linking for tabbed interfaces (services page)"

requirements-completed: [INFR-05, INFR-06, BOOK-01, BOOK-06, PORT-04]

# Metrics
duration: 6min
completed: 2026-03-25
---

# Phase 1 Plan 3: Homepage + Services Page Summary

**Full homepage with hero, Embla carousels (beats/portfolio/testimonials with autoplay), Framer Motion scroll-in animations, and tabbed services page with DB-driven content and URL hash deep-linking**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-25T08:55:55Z
- **Completed:** 2026-03-25T09:01:55Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Complete homepage with 5 sections in exact order: Hero, Services Overview, Featured Beats, Video Portfolio, Testimonials
- Three Embla carousels: featured beats (placeholder), video portfolio (YouTube thumbnail support), testimonials (autoplay 3s)
- Framer Motion scroll-in animations via reusable ScrollSection wrapper (opacity 0 + y:40 to visible, once per element)
- Hero section with video placeholder, GLITCH logo, tagline, dual equally-styled CTAs
- Tabbed services page fetching from database with URL hash deep-linking, pricing, feature checklists, and booking CTAs
- Organization schema structured data on homepage

## Task Commits

Each task was committed atomically:

1. **Task 1: Build homepage with hero, scroll animations, and all section components** - `86798d7` (feat)
2. **Task 2: Build tabbed services page with pricing and CTAs** - `f8db8af` (feat)

## Files Created/Modified
- `src/components/home/scroll-section.tsx` - Reusable Framer Motion whileInView scroll-in animation wrapper
- `src/components/home/hero-section.tsx` - 90vh hero with video placeholder, GLITCH logo, tagline, dual CTAs
- `src/components/home/services-overview.tsx` - Services card grid for homepage, receives services as prop
- `src/components/home/featured-carousel.tsx` - Embla carousel with 6 placeholder beat cards (Phase 2 replacement)
- `src/components/home/video-portfolio-carousel.tsx` - Embla carousel for portfolio items with YouTube thumbnail extraction
- `src/components/home/testimonials-carousel.tsx` - Embla carousel with autoplay plugin, star ratings, decorative quotes
- `src/components/services/service-tabs.tsx` - Controlled tabs with hash routing, feature lists, pricing, CTAs
- `src/app/(public)/services/page.tsx` - Services page Server Component with SEO metadata and OG tags
- `src/app/(public)/page.tsx` - Full homepage Server Component fetching services, testimonials, portfolio from DB

## Decisions Made
- Used `force-dynamic` on homepage and services page because the dummy DATABASE_URL fallback cannot connect during static generation -- runtime-only DB queries
- Hero section uses a `bg-black` div with `data-video-placeholder="true"` attribute instead of a `<video>` element until the R2-hosted showreel URL is provided
- Featured beats carousel uses hardcoded placeholder cards since beat data comes in Phase 2
- Video portfolio carousel extracts YouTube video IDs from URLs for thumbnail display instead of embedding iframes (lazy loading per plan anti-pattern guidance)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added force-dynamic export to homepage**
- **Found during:** Task 1 (build verification)
- **Issue:** Homepage Server Component runs DB queries during static generation, but the dummy DATABASE_URL cannot connect to a real database
- **Fix:** Added `export const dynamic = "force-dynamic"` to skip static generation
- **Files modified:** src/app/(public)/page.tsx
- **Verification:** npm run build exits 0
- **Committed in:** 86798d7 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for build to succeed. No scope creep.

## Issues Encountered
- npm install required for worktree (node_modules not present) -- standard worktree setup

## Known Stubs
- Hero video background: placeholder `bg-black` div instead of actual `<video>` element. Will be replaced when R2 showreel URL is available.
- Featured beats carousel: 6 placeholder cards with "Coming Soon" text. Will be replaced with real beat data in Phase 2.
- Organization schema `sameAs` array is empty (social profile URLs not yet configured).
- Organization schema `logo` URL is a placeholder.

## Next Phase Readiness
- Homepage and services page fully wired to database, ready for seed data
- Carousel components ready to receive real data when available
- Services page tab deep-linking works for cross-page navigation (e.g., "Learn More" from homepage cards)
- ScrollSection wrapper available for reuse on any future page sections

## Self-Check: PASSED

---
*Phase: 01-foundation-public-site*
*Completed: 2026-03-25*
