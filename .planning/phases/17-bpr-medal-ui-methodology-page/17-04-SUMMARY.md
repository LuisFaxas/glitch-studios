---
phase: 17-bpr-medal-ui-methodology-page
plan: 04
subsystem: ui
tags: [bpr, medal, spotlight, drizzle, tech-homepage]
gap_closure: true

requires:
  - phase: 17-bpr-medal-ui-methodology-page
    provides: BPRMedal + BPRMedalPlaceholder components, bpr_discipline_count column, techReviews.bprScore/bprTier/bprDisciplineCount
provides:
  - BPR medal rendered on /tech homepage spotlight (4th surface, closes MEDAL-02)
  - Extended BenchmarkSpotlight type with bprScore, bprTier, bprDisciplineCount, reviewSlug
affects: [future tech homepage iterations, MEDAL requirement audits]

tech-stack:
  added: []
  patterns:
    - "BPR fields piggyback on existing techReviews inner-join in getBenchmarkSpotlight() — no new round-trip"
    - "Spotlight medal renders with default asLink=true + showTooltip=true (distinct from review-card surfaces where asLink=false)"

key-files:
  created: []
  modified:
    - src/lib/tech/queries.ts
    - src/components/home/tech-benchmark-spotlight.tsx

key-decisions:
  - "Spotlight medal uses default asLink=true + showTooltip=true — spotlight's Compare CTA sits in a sibling layout region, so the medal link is not nested inside another anchor (unlike review-card surfaces)"
  - "No RubricVersionBadge on spotlight — rubric version is a scorecard detail (METH-06 scope), not homepage scope"
  - "BPR fields piggyback on existing candidate SELECT — no second join, no new DB round-trip"

patterns-established:
  - "Homepage spotlight is the fourth canonical BPR-medal surface (after review detail scorecard, review card list/carousel/related)"

requirements-completed: [MEDAL-02]

duration: ~12min
completed: 2026-04-23
---

# Phase 17 Plan 04: MEDAL-02 Homepage Spotlight Gap Closure Summary

**BPR medal now renders in the /tech "Editor's Choice" spotlight — fourth required medal surface, closing the MEDAL-02 gap flagged in 17-VERIFICATION.md**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-23
- **Completed:** 2026-04-23
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Extended `BenchmarkSpotlight` type with `bprScore`, `bprTier`, `bprDisciplineCount`, `reviewSlug`
- `getBenchmarkSpotlight()` populates BPR fields from the already-joined `techReviews` row — no second query
- `TechBenchmarkSpotlight` renders `BPRMedal` (full variant, tooltip + link) or `BPRMedalPlaceholder` between the "Editor's Choice" label and the product title

## Task Commits

1. **Task 1: Extend BenchmarkSpotlight type + populate BPR fields** — `1ecb9b7` (feat)
2. **Task 2: Render BPRMedal/Placeholder inside TechBenchmarkSpotlight** — `ef37b80` (feat)
3. **Task 3: Runtime smoke-check /tech landing page** — no commit (verification-only per plan)

## Files Created/Modified
- `src/lib/tech/queries.ts` — `BenchmarkSpotlight` gains four new fields; `getBenchmarkSpotlight()` selects and returns them
- `src/components/home/tech-benchmark-spotlight.tsx` — imports + medal row above product title

## Decisions Made
- Spotlight medal renders with default `asLink=true` + `showTooltip=true` (not `asLink={false}` like review-card surfaces) because the spotlight's Compare CTA is in a different layout region, so the medal is not nested inside another Link.
- Kept Compare CTA, topScores `<dl>`, hero image column, and Editor's Choice label untouched — scope strictly limited to adding the medal row.
- No `RubricVersionBadge` on spotlight (METH-06 scope control — scorecard-only).

## Deviations from Plan

None — plan executed exactly as written.

One minor discrepancy: plan Task 1 acceptance criteria predicted `grep -c "reviewSlug: string | null"` would return 1 and `grep -c "reviewSlug: techReviews.slug"` would return 1, but the codebase already had a `reviewSlug` field in the leaderboard row shape (queries.ts:562, 573). After this plan both grep counts return 2, which is the correct post-state. The plan author scoped the check to new fields only; the pre-existing field is unrelated and intentional.

## Issues Encountered

During the runtime smoke-check, `pm2 logs` showed historical `500` errors for `/tech` and `/tech/reviews` with `column tech_reviews.bpr_discipline_count does not exist`. Those are pre-migration requests (before commit `158ba58 chore(17): add apply-0004-migration script + apply to DB`). Three consecutive fresh `curl` requests after Task 2 all returned `200`; current pm2 log tail shows `GET /tech 200` for recent requests. The column exists now.

## Open Items

- `spotlight_present: false` — `/tech` currently short-circuits to null because no published review has a populated `bpr_score` in the seed DB. This is the acceptable pre-flagship-review state per Task 3 step (3). When a flagship BPR-eligible review is published, the medal branch will render automatically.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- MEDAL-02 gap closed. Phase 17 verification can now re-run.
- `/tech` landing page returns 200 after changes; `tsc --noEmit` clean; ESLint clean on both modified files.

---
*Phase: 17-bpr-medal-ui-methodology-page*
*Completed: 2026-04-23*
