---
phase: 17-bpr-medal-ui-methodology-page
plan: 03
subsystem: ui
tags: [bpr, medal, review-card, scorecard, playwright, visual-regression]

requires:
  - phase: 17-bpr-medal-ui-methodology-page/01
    provides: BPRMedal, BPRMedalPlaceholder, RubricVersionBadge + extended PublicReviewCard/Detail types
  - phase: 17-bpr-medal-ui-methodology-page/02
    provides: /tech/methodology page with #thresholds table chips

provides:
  - ReviewRatingCard renders BPRMedal + RubricVersionBadge above rating bars
  - ReviewCard renders compact BPRMedal with star fallback
  - Playwright visual baselines for 4 medal tiers + placeholder (desktop + mobile)
  - Playwright functional spec for /tech/methodology (<2s load, anchors, hero, disciplines, thresholds, changelog, CTA)

affects: [18-leaderboard, 19-flagship-review]

tech-stack:
  added: []
  patterns:
    - "Star-to-medal fallback on review cards — compact variant, no nested Link"
    - "Playwright visual regression using live dev-server chips as baseline source"

key-files:
  created:
    - tests/17-bpr-medal.spec.ts
    - tests/17-methodology.spec.ts
    - tests/17-bpr-medal.spec.ts-snapshots/ (10 PNG baselines)
  modified:
    - src/components/tech/review-rating-card.tsx
    - src/components/tech/review-card.tsx
    - src/app/(tech)/tech/reviews/[slug]/page.tsx

key-decisions:
  - "Visual baselines target the methodology threshold table chips — no mock-data route needed"
  - "Compact medal on review cards uses asLink=false because the outer card is already a Link (nested Link is invalid HTML)"

patterns-established:
  - "Playwright first-run with --update-snapshots for baseline generation; subsequent runs compare"
  - "Functional + visual tests live in same directory (tests/17-*.spec.ts)"

requirements-completed:
  - MEDAL-02
  - METH-06

duration: 14min
completed: 2026-04-23
---

# Phase 17 Plan 03: Wire Medal Components + Playwright Baselines

**BPR medal + rubric badge now render on every review detail scorecard and every review card (list, carousel, related). Playwright establishes 10 visual baselines for medal tiers and 8 functional assertions for the methodology page.**

## Accomplishments
- `ReviewRatingCard` renders medal (or dashed placeholder) on the left and `RUBRIC v{version}` chip on the right above a divider above the four rating bars.
- `ReviewCard` renders compact medal when `bprScore !== null`, else falls back to the original star row. `asLink=false` prevents nested Links.
- Review detail page call site passes four new props from `PublicReviewDetail`.
- `tests/17-methodology.spec.ts` — 8 functional tests × desktop+mobile = 16 passing (load <2s, anchors, wordmark, formula, 7 disciplines, 5 threshold rows, v1.1 changelog, CTA).
- `tests/17-bpr-medal.spec.ts` — 5 visual tests × desktop+mobile = 10 baselines committed, all green on re-run.

## Task Commits

1. **Task 1: Wire ReviewRatingCard** — `ad6c92f` (feat)
2. **Task 2: Wire ReviewCard compact medal** — `c1c2411` (feat)
3. **Task 3a: Playwright spec files** — `945a877` (test)
3. **Task 3b: Medal visual baselines** — `65db325` (test)

## Files Created/Modified
- `src/components/tech/review-rating-card.tsx` — 4 new props + medal/placeholder row + rubric badge + divider
- `src/components/tech/review-card.tsx` — conditional compact medal vs star fallback
- `src/app/(tech)/tech/reviews/[slug]/page.tsx` — passes bprScore/bprTier/bprDisciplineCount/rubricVersion
- `tests/17-bpr-medal.spec.ts` — 5 visual regression tests
- `tests/17-methodology.spec.ts` — 8 functional tests
- `tests/17-bpr-medal.spec.ts-snapshots/` — 10 baseline PNGs (desktop + mobile × 5 tiers)

## Decisions Made
- **No mock-data route:** visual baselines target the live `/tech/methodology` threshold table chips so both the tier palette and the placeholder pattern come from production code paths rather than a test-only component.
- **asLink=false on card medals:** the outer ReviewCard is a `<Link>`, so nesting another would be invalid HTML — compact medal on cards renders as a plain span via asLink prop.
- **First-run baseline generation:** ran `pnpm playwright test --update-snapshots` against the live PM2 dev server; all 10 snapshots committed after a clean re-run pass.

## Deviations from Plan
None — baselines generated and committed on first run. No `test.skip` wrapper needed.

## Issues Encountered
None.

## Open Issues

**Phase 16 scale-fix pending (BLOCKING Phase 19 flagship publish):** `tech_reviews.bpr_score` is declared `numeric(5, 4)` in `src/db/schema.ts` and migration `0003_methodology_lock.sql`, but `computeBprScore()` returns a 0–100 value. The first time a real review commits a finite BPR score, Postgres will throw `numeric field overflow`. Phase 17 code reads the number as-is (assuming 0–100) and is correct regardless of the underlying precision. Phase 16 must ship migration `0004_fix_bpr_precision.sql` widening the column (recommended `numeric(6, 2)`) BEFORE the Phase 19 flagship review is published. This plan flags but does not implement the fix.

## Next Phase Readiness
- MEDAL-02 satisfied: medal visible on every review detail + every review card.
- METH-06 satisfied: `RUBRIC v1.1` rendered next to scorecard.
- UI-SPEC criterion #1 baseline established; criterion #4 testable via tests/17-methodology.spec.ts.
- Phase 18 leaderboard can consume `PublicReviewCard.bprScore/bprTier/bprDisciplineCount` directly.

---
*Phase: 17-bpr-medal-ui-methodology-page*
*Completed: 2026-04-23*
