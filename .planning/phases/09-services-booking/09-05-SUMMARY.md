---
phase: 09-services-booking
plan: 05
subsystem: ui
tags: [services, detail-panel, portfolio]

requires:
  - phase: 09-services-booking
    provides: PORTFOLIO-SERVICE-MATCH.md locked query (Plan 09-02); manifesto branching (Plan 09-04)
provides:
  - Services page enriched with booking config + portfolio per service
  - ServiceDetailPanel with 9 UI-SPEC sections
  - B-01 mobile accordion fix (first service expanded by default)
affects: [09-07]

tech-stack:
  added: []
  patterns:
    - Extracted `getPortfolioForService` to `src/lib/services/portfolio-for-service.ts` with react.cache
    - Data enrichment on the Server Component (page.tsx), pass-through to Client Component (ServiceGrid)

key-files:
  created:
    - src/lib/services/portfolio-for-service.ts
  modified:
    - src/app/(public)/services/page.tsx
    - src/components/services/service-grid.tsx

key-decisions:
  - Extracted `getPortfolioForService` to a dedicated lib file (not inlined) — future callers (e.g., Phase 11 portfolio detail) can reuse.
  - Fixed MOBILE-BREAKS B-01 inline: `expandedSlug` now defaults to `services[0]?.slug` so the first service's detail is visible on mobile load.
  - EXAMPLE WORK hides for all 5 services today (portfolio vocab mismatch per Plan 09-02 audit) — expected.

patterns-established:
  - "9-section detail panel order locked via UI-SPEC: Name, Description, Pricing, Duration & Includes, Highlights, Process, Policies, Example Work, CTA. Each section uses label tokens (12px mono muted) for headings."

requirements-completed: [BOOK-08]

duration: ~40 min
completed: 2026-04-20
---

# Phase 09 Plan 05 Summary

**Service detail panel expanded to 9 UI-SPEC sections; mobile accordion now defaults to first service.**

## Sections Rendered Per Service (as of data today)

| Service | Duration & Includes | Policies | Example Work |
|---------|---------------------|----------|--------------|
| recording-session | yes (2 hrs) | yes | no (no portfolio match) |
| mixing-mastering | yes (1 hr) | yes | no |
| video-production | yes (data-driven) | yes | no |
| sfx-design | yes | yes | no |
| graphic-design | yes | yes | no |

## Locked Query Predicate (copied verbatim from PORTFOLIO-SERVICE-MATCH.md)

```ts
and(
  eq(portfolioItems.isActive, true),
  or(
    eq(portfolioItems.type, service.type),
    eq(portfolioItems.category, service.slug),
  )
)
```

## Helper Extracted, Not Inlined

`getPortfolioForService` lives in `src/lib/services/portfolio-for-service.ts` with `react.cache` wrapping for per-request dedupe. Future phases (e.g. Phase 11 portfolio detail page) can import it.

## Downstream consumer

Plan 09-07 re-runs mobile audit — expects B-01 resolved (first service visible on load).
