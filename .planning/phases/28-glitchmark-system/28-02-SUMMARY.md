---
phase: 28-glitchmark-system
plan: 02
subsystem: api
tags: [scoring, geometric-mean, drizzle, transaction, vitest]

requires:
  - phase: 28-glitchmark-system
    provides: schema (Plan 28-01) — glitchmark_* columns + tech_glitchmark_history + reference_score
provides:
  - computeGlitchmarkFromRatios pure function (geometric mean × 100, null < 8)
  - isPartialCount helper
  - GLITCHMARK_VERSION / GLITCHMARK_FLOOR / GLITCHMARK_FULL exported constants
  - recomputeGlitchmark(productId, tx?) DB writer — joins runs↔tests on superseded=false + reference_score IS NOT NULL, mode-priority pick (ac > battery > both), direction-aware ratio, upserts tech_reviews + tech_glitchmark_history keyed (review_id, version)
affects: [28-04]

tech-stack:
  added: []
  patterns:
    - Pure function + DB writer split (mirrors bpr.ts/bpr.spec.ts co-location)
    - Tx-aware writer signature (tx?: DbClient) — composes inside ingest db.transaction()
    - vitest co-located spec — 13 cases pass

key-files:
  created:
    - src/lib/tech/glitchmark.ts
    - src/lib/tech/glitchmark.spec.ts
  modified: []

key-decisions:
  - "Filter on `eq(techBenchmarkRuns.superseded, false)` not isNull(supersededAt) — column is `superseded` boolean, not a timestamp (caught by tsc; fixed before commit)"
  - "Mode-priority pick (ac > battery > both, latest first) — single representative score per (product, test); stable across multi-mode rubrics"
  - "Direction-aware ratio: raw/reference for higher_is_better, reference/raw for lower_is_better — symmetric handling"
  - "Skip tests where raw or reference is non-finite or ≤ 0 — guards against bad ingest data without crashing the whole compute"

patterns-established:
  - "Use `eq(column, false)` for boolean equality filtering (consistent with Drizzle conventions, more readable than negating)"

requirements-completed: [GLITCHMARK-01, GLITCHMARK-03]

duration: 8min
completed: 2026-04-25
---

# Phase 28-02: GlitchMark Scoring Module Summary

**Pure-function geometric-mean formula + tx-aware DB writer co-located with vitest spec. 13/13 tests pass. Module is ready to be wired into ingest by Plan 28-04.**

## Performance

- **Duration:** ~8 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- src/lib/tech/glitchmark.ts mirrors bpr.ts split-architecture exactly
- 7 vitest cases for the pure function (floor / partial / full / known-value / reference / above / below baseline)
- 4 cases for isPartialCount (boundary tests)
- 3 cases for exported constants
- Mode-priority + direction-aware ratio logic correctly handles ac/battery/both modes and higher/lower-is-better tests
- Idempotent history upsert via `onConflictDoUpdate` keyed (review_id, version)

## Task Commits

1. **Tasks 1-2 bundled:** `4ea4b9a` (feat) — glitchmark.ts + glitchmark.spec.ts (13 vitest tests pass)

## Files Created/Modified
- `src/lib/tech/glitchmark.ts` — created
- `src/lib/tech/glitchmark.spec.ts` — created (13 tests)

## Decisions Made
- **`superseded` column name correction** — plan referenced `supersededAt` (timestamp) but actual schema uses `superseded` (boolean). Fixed during execution; spec still passes.

## Deviations from Plan
- Minor: column-name correction described above. Plan's filter intent (exclude superseded runs) preserved.

## Issues Encountered
- tsc caught the `supersededAt` typo immediately. One-line fix.

## Next Phase Readiness
- Plan 28-04 imports `recomputeGlitchmark` and calls it inside the ingest tx
- Plan 28-03's `getGlitchmarkBaselines` runs in the same module ecosystem (shares the `eligible = reference_score IS NOT NULL` rule)

---
*Phase: 28-glitchmark-system*
*Completed: 2026-04-25*
