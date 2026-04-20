---
phase: 09-services-booking
plan: 02
subsystem: database
tags: [drizzle, postgres, audit, portfolio, services]

requires:
  - phase: 03-booking-system
    provides: services and portfolioItems schemas with type/slug/category text columns
provides:
  - Evidence-based portfolio<->service match convention locked for Wave 3
  - Reusable audit script (can be re-run if seed data changes)
affects: [09-05]

tech-stack:
  added: []
  patterns:
    - Standalone Drizzle script pattern using dotenv + postgres-js client with idle_timeout=5

key-files:
  created:
    - scripts/09-portfolio-service-match-audit.ts
    - .planning/phases/09-services-booking/audit/PORTFOLIO-SERVICE-MATCH.md
  modified: []

key-decisions:
  - Chosen: Option C (union OR of type + slug-as-category) — all three options give 0/5 coverage today, so chose the most permissive for future seed-data compatibility.
  - UI-SPEC hide-if-empty fallback (row 8) applies to all 5 services today — EXAMPLE WORK block is hidden site-wide until seed data aligns.
  - Admin-controlled portfolioItems.serviceId FK flagged as out-of-phase enhancement (future 09.1 or data convention).

patterns-established:
  - "Evidence-before-query audit pattern: run DB count across candidate predicates, commit the audit output, then lock the query body verbatim. Future services or portfolio items inherit the rule without re-deciding."

requirements-completed: [BOOK-08]

duration: ~20 min
completed: 2026-04-20
---

# Phase 09 Plan 02 Summary

**Portfolio-service match convention locked: Option C (union OR). Zero overlap today, so EXAMPLE WORK hides everywhere per UI-SPEC fallback.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-20
- **Completed:** 2026-04-20
- **Tasks:** 2 completed
- **Files created:** 2

## Accomplishments

- **Audit script:** `scripts/09-portfolio-service-match-audit.ts` compares all three candidate join conventions across active services and portfolio items; fallback to seed-file mode if DB unreachable.
- **Decision record:** `PORTFOLIO-SERVICE-MATCH.md` locks Option C with verbatim Drizzle query body for Wave 3.

## Convention Chosen

**C** — union of `portfolioItems.type = services.type` OR `portfolioItems.category = services.slug`.

## Exact Drizzle Predicate Wave 3 Will Use

```ts
and(
  eq(portfolioItems.isActive, true),
  or(
    eq(portfolioItems.type, service.type),
    eq(portfolioItems.category, service.slug),
  )
)
```

Limit 3, ordered by `desc(isFeatured), asc(sortOrder)`.

## Coverage Reality

| Option | Services matched / 5 |
|--------|---------------------|
| A (by type) | 0 |
| B (by slug-as-category) | 0 |
| C (union) | 0 |

Portfolio vocab (`video`, `case_study`) and service vocab (`studio_session`, `mixing`, `video_production`, `sfx`, `graphic_design`) use different enums. Seed data backfill OR future `portfolioItems.serviceId` FK would light up Option C without a Wave 3 code change.

## Downstream Consumer

Plan 09-05 Task 1 pastes the locked query body into `src/lib/services/portfolio-for-service.ts`. Plan 09-05 Task 2 skips the EXAMPLE WORK block when the per-service list is empty.
