---
phase: 01-foundation-public-site
plan: 06
subsystem: seo, infra
tags: [sitemap, robots, seo, 404, vercel, nextjs, open-graph, json-ld]

# Dependency graph
requires:
  - phase: 01-03
    provides: "Homepage with JSON-LD structured data, page layouts"
  - phase: 01-04
    provides: "Blog, portfolio, artist pages with dynamic routes"
  - phase: 01-05
    provides: "Authentication pages (login, register)"
provides:
  - "Dynamic sitemap with static and DB-driven routes"
  - "Robots.txt configuration"
  - "Custom 404 page with cyberpunk styling"
  - "Vercel deployment configuration"
  - "Next.js image remote patterns for YouTube and R2"
affects: [deployment, seo, production]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Next.js MetadataRoute convention for sitemap/robots", "force-dynamic for DB-dependent route handlers"]

key-files:
  created:
    - src/app/sitemap.ts
    - src/app/robots.ts
    - src/app/not-found.tsx
    - vercel.json
  modified:
    - next.config.ts
    - .env.example

key-decisions:
  - "Used force-dynamic on sitemap to avoid build-time DB connection requirement"
  - "Minimal vercel.json -- Next.js handles most config automatically"

patterns-established:
  - "MetadataRoute convention: sitemap.ts and robots.ts at app root for SEO"
  - "force-dynamic export for routes that query the database"

requirements-completed: [CONT-03, INFR-02, PORT-02]

# Metrics
duration: 3min
completed: 2026-03-25
---

# Phase 1 Plan 6: SEO, 404, and Deployment Summary

**Dynamic sitemap with DB-driven blog/portfolio/artist routes, robots.txt, custom cyberpunk 404 page, and Vercel deployment config**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-25T09:16:31Z
- **Completed:** 2026-03-25T09:19:59Z
- **Tasks:** 1 of 2 (checkpoint pending)
- **Files modified:** 6

## Accomplishments
- Dynamic sitemap at /sitemap.xml listing all static routes plus DB-driven blog posts, portfolio items, and artist profiles
- Robots.txt disallowing /api/, /login, /register with sitemap reference
- Custom 404 page with GlitchLogo, cyberpunk styling, and "Back to Home" link
- Vercel deployment config (vercel.json) with nextjs framework
- Next.js image remote patterns configured for img.youtube.com, *.r2.dev, *.r2.cloudflarestorage.com
- NEXT_PUBLIC_SITE_URL added to .env.example
- Verified all pages have proper metadata exports (root layout template, static pages, dynamic generateMetadata)
- JSON-LD Organization schema already present on homepage from Plan 03

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SEO fundamentals, 404 page, and Vercel deployment config** - `0d69d2b` (feat)

**Plan metadata:** pending (checkpoint not yet resolved)

## Files Created/Modified
- `src/app/sitemap.ts` - Dynamic sitemap with static + DB-driven routes for blog, portfolio, artists
- `src/app/robots.ts` - Robots.txt with allow/disallow rules and sitemap reference
- `src/app/not-found.tsx` - Custom 404 page with GlitchLogo and cyberpunk styling
- `vercel.json` - Vercel deployment config (nextjs framework)
- `next.config.ts` - Added image remotePatterns for YouTube and R2
- `.env.example` - Added NEXT_PUBLIC_SITE_URL

## Decisions Made
- Used `force-dynamic` on sitemap.ts because it queries the database at runtime; without it, Next.js attempts static generation during build which fails without DATABASE_URL
- Kept vercel.json minimal -- Next.js projects on Vercel auto-configure most settings

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added force-dynamic to sitemap.ts**
- **Found during:** Task 1 (build verification)
- **Issue:** Sitemap tried to connect to Neon DB during static build, failing with fetch error
- **Fix:** Added `export const dynamic = "force-dynamic"` to sitemap.ts
- **Files modified:** src/app/sitemap.ts
- **Verification:** `npm run build` exits 0
- **Committed in:** 0d69d2b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for build to succeed. No scope creep.

## Issues Encountered
- Worktree had no node_modules; ran npm install before build verification

## Checkpoint: Verify Complete Phase 1 Site

**Status:** Awaiting human verification

The complete Phase 1 site is built and ready for visual/functional verification:

- Cyberpunk/glitch visual identity (black and white, JetBrains Mono, animated GLITCH logo)
- Collapsible side nav (desktop) and bottom tab bar (mobile)
- Homepage with hero, services overview, beat carousel, portfolio carousel, testimonials
- Tabbed services page with pricing and CTAs
- Portfolio page with Embla carousel and lazy YouTube embeds
- Artist/team grid and individual profile pages
- Blog with pagination and category filtering
- Contact form with server action submission
- Authentication (register, login, logout, session persistence)
- SEO (sitemap, robots.txt, structured data, Open Graph)
- Custom 404 page

### Verification Steps
1. Run `npm run dev` and open http://localhost:3000
2. Homepage: Verify GLITCH logo animates, hero renders, scroll down for all 5 sections
3. Navigation: Toggle side nav on desktop; resize to mobile for bottom tab bar
4. Services: Verify tabbed interface with 5 services
5. Portfolio: Verify Embla carousel with video cards
6. Artists: Verify team grid and individual profiles
7. Blog: Verify post grid with pagination
8. Contact: Submit form, verify success toast
9. Auth: Register, logout, login, refresh for session persistence
10. Mobile: Verify responsive layouts
11. 404: Visit /nonexistent for custom 404
12. SEO: Visit /sitemap.xml for route listing

## User Setup Required

None - no external service configuration required beyond existing .env setup.

## Next Phase Readiness
- All Phase 1 public pages complete and verified building
- SEO fundamentals in place for search engine discoverability
- Vercel deployment config ready -- set NEXT_PUBLIC_SITE_URL in Vercel dashboard
- Phase 2 (Beat Store) can proceed once Phase 1 is approved

---
*Phase: 01-foundation-public-site*
*Completed: 2026-03-25 (pending checkpoint approval)*
