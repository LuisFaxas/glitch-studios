---
phase: 28-glitchmark-system
plan: 04
subsystem: api
tags: [ingest, transaction, glitchmark, atomicity]

requires:
  - phase: 28-glitchmark-system
    provides: recomputeGlitchmark (Plan 28-02)
provides:
  - GlitchMark recompute hooked into existing ingest commit transaction next to BPR recompute
  - Atomic guarantee: if either BPR or GlitchMark recompute throws, the whole ingest rolls back
affects: []

tech-stack:
  added: []
  patterns:
    - Two scoring systems (BPR + GlitchMark) share one tx — same READ COMMITTED scope sees uncommitted run inserts
    - GlitchMark write path lives entirely inside the recompute function — no extra plumbing in the action

key-files:
  created: []
  modified:
    - src/actions/admin-tech-ingest.ts (recomputeGlitchmark import + one call inside db.transaction)

key-decisions:
  - "No new revalidatePath calls — existing post-tx revalidations cover review detail/list/homepage. Master leaderboard (Phase 29) will add its own revalidation when it ships."
  - "Pass `validatedSession.productId` (not reviewId) — recomputeGlitchmark looks up the review from product"

patterns-established:
  - "When adding a new compute step to an existing ingest tx, place it AFTER the existing tx-aware computes and BEFORE the closing `})` — avoids accidentally moving it outside the tx"

requirements-completed: [GLITCHMARK-03]

duration: 2min
completed: 2026-04-25
---

# Phase 28-04: Ingest Hook Summary

**One-line wiring: `await recomputeGlitchmark(productId, tx)` now runs inside the same db.transaction as the BPR recompute. BPR + GlitchMark are atomic together.**

## Performance

- **Duration:** ~2 min
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- `recomputeGlitchmark` imported into admin-tech-ingest.ts
- Call placed AFTER the BPR update inside the existing `db.transaction(async (tx) => { ... })` block
- Same `tx` client passed → same READ COMMITTED scope as BPR
- tsc + lint clean

## Task Commits

1. **Task 1:** `a8456e3` (feat) — wire recomputeGlitchmark into ingest commit transaction

## Files Created/Modified
- `src/actions/admin-tech-ingest.ts` — added 1 import line + 5 lines inside the transaction

## Decisions Made
None — plan executed exactly as written.

## Deviations from Plan
None.

## Issues Encountered
None.

## Next Phase Readiness
- Phase 28 is now functionally complete: schema + formula + ingest hook + methodology surface all live
- Operator action D-13: set `reference_score` per test via SQL `UPDATE`, then re-ingest a product to populate `glitchmark_score`
- Phase 29 (master leaderboard) will sort by `tech_reviews.glitchmark_score`
- Phase 36 (FLAG-03) will surface GlitchMark badge on review detail card

---
*Phase: 28-glitchmark-system*
*Completed: 2026-04-25*
