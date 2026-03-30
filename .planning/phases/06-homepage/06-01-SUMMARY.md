---
phase: 06-homepage
plan: 01
subsystem: ui
tags: [next.js, hero, cta, drizzle, server-components]

requires:
  - phase: 05-admin-dashboard
    provides: admin homepage section management
provides:
  - Redesigned hero with 3 CTAs (Book, Browse Beats, View Portfolio)
  - Server-side beats and blog post data fetching on homepage
  - Blog section type registered in admin homepage editor
affects: [06-02, homepage, beats, blog]

tech-stack:
  added: []
  patterns: [Promise.allSettled for parallel data fetching, section renderer map pattern]

key-files:
  created: []
  modified:
    - src/components/home/hero-section.tsx
    - src/app/(public)/page.tsx
    - src/actions/admin-homepage.ts

key-decisions:
  - "Used transparent bg instead of #111 for secondary CTAs to match plan spec exactly"

patterns-established:
  - "Homepage data fetching: all queries in single Promise.allSettled, extract with fallback"
  - "Section renderer map: each section type maps to a render function receiving config"

requirements-completed: [HOME-01, HOME-02]

duration: 2min
completed: 2026-03-30
---

# Phase 06 Plan 01: Hero Redesign & Data Layer Summary

**Redesigned hero with 3 CTAs (Book/Browse/Portfolio) and wired server-side beats + blog data fetching via Promise.allSettled**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-30T14:46:57Z
- **Completed:** 2026-03-30T14:49:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Hero section now has descriptive subtitle ("Music Production // Video // Creative Services") instead of vague tagline
- Three CTAs visible above fold: Book a Session (primary), Browse Beats (secondary), View Portfolio (secondary)
- CTAs stack vertically on mobile for 375px compatibility
- Homepage fetches published beats (limit 6) and blog posts (limit 3) from DB
- Blog section type registered in admin homepage editor DEFAULT_SECTIONS

## Task Commits

Each task was committed atomically:

1. **Task 1: Redesign hero section with 3 CTAs and descriptive subtitle** - `68b8be1` (feat)
2. **Task 2: Add beats and blog data fetching to page.tsx and register blog section renderer** - `c95debd` (feat)

## Files Created/Modified
- `src/components/home/hero-section.tsx` - Redesigned hero with 3 CTAs, mobile stacking, social proof line
- `src/app/(public)/page.tsx` - Added beats + blog data fetching, BlogSection renderer, updated static fallback
- `src/actions/admin-homepage.ts` - Added blog to DEFAULT_SECTIONS array

## Decisions Made
- Used transparent background for secondary CTAs (matching plan spec) instead of the existing #111 dark fill

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
- `BlogSection` import in page.tsx references a component that does not yet exist (`src/components/home/blog-section.tsx`). This is intentional per plan -- Plan 02 will create this file. The import was added now so Plan 02 only needs to create the component.

## Next Phase Readiness
- Hero redesign complete, ready for visual verification
- Data layer established for beats and blog -- Plan 02 can build the blog section component
- FeaturedCarousel now receives real beat data via `beats` prop

---
*Phase: 06-homepage*
*Completed: 2026-03-30*
