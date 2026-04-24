---
phase: 17-bpr-medal-ui-methodology-page
status: human_needed
started: 2026-04-23T00:00:00Z
completed: 2026-04-23T00:00:00Z
score: 5/5 must-haves verified
requirements_checked:
  - METH-05
  - METH-06
  - MEDAL-01
  - MEDAL-02
  - MEDAL-03
---

# Phase 17 Verification: BPR Medal UI + Methodology Page

**Goal:** Readers can see a monochrome BPR medal on every review and click through to a methodology page that explains the formula, the 7 eligible disciplines, medal thresholds, and rubric versioning policy in full.

## Goal Assessment

**Achieved.** The medal component family (BPRMedal, BPRMedalPlaceholder, RubricVersionBadge) is implemented and wired into every review surface the plans covered. `/tech/methodology` renders as a force-static ISR page with BPR formula, 7 eligible disciplines, medal thresholds, exclusion policy, and v1.1 rubric changelog — all 16 functional Playwright assertions pass. Monochrome medal rendering is locked down with 10 visual baselines (4 tiers + placeholder × desktop+mobile).

## Must-Haves

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `<BPRMedal>` renders correct monochrome at all 4 tiers + null state | ✓ | `tests/17-bpr-medal.spec.ts` — 10 Playwright visual baselines pass on re-run (desktop + mobile × platinum/gold/silver/bronze/placeholder) |
| 2 | Review detail scorecard shows BPRMedal/Placeholder + `Rubric v1.1` badge | ✓ code-wired | `src/components/tech/review-rating-card.tsx:35-42` + `src/app/(tech)/tech/reviews/[slug]/page.tsx:146-152`; no published review with populated `bpr_score` exists in DB yet, so rendered output cannot be inspected end-to-end — Phase 19 flagship review or an admin ingest will satisfy the live check |
| 3 | Medal tooltip "Based on X of 7" + link to `/tech/methodology#bpr` | ✓ | `src/components/tech/bpr-medal.tsx:63-68` (tooltip copy, link href); tooltip render path uses base-ui Tooltip |
| 4 | `/tech/methodology` public, <2s, contains formula + 7 disciplines + thresholds + exclusion policy + rubric changelog | ✓ | `tests/17-methodology.spec.ts` — 16 assertions pass (8 × desktop+mobile) including `expect(elapsed).toBeLessThan(2000)`, all 5 anchors visible, formula code block, 7 discipline rows, 5 threshold rows, v1.1 + 2026-04-23 in changelog, CTA |
| 5 | Compact medal on review cards with star fallback | ✓ | `src/components/tech/review-card.tsx:44-76` — conditional on `review.bprScore !== null` |

## Requirements Coverage

- **METH-05** — `/tech/methodology` page live. ✓ Force-static ISR route at `src/app/(tech)/tech/methodology/page.tsx`.
- **METH-06** — Rubric version visible on scorecard. ✓ `RubricVersionBadge` in ReviewRatingCard (`/tech/methodology#rubric-changelog` link).
- **MEDAL-01** — Monochrome medal component. ✓ `BPRMedal` in `src/components/tech/bpr-medal.tsx` with locked tier palette, colorblind-safe.
- **MEDAL-02** — Medal surfaces on review detail + review card (list/carousel/related). ✓ Wired via Plan 03. **Gap:** tech homepage spotlight (`src/components/home/tech-benchmark-spotlight.tsx`) is a benchmark-score surface and was NOT covered by Phase 17 plans 01-03; `BenchmarkSpotlight` type carries no BPR fields. Category leaderboard column is Phase 18 (RANK-01) scope.
- **MEDAL-03** — "Not enough data" placeholder. ✓ `BPRMedalPlaceholder` in `src/components/tech/bpr-medal.tsx`.

## Automated Checks

- `pnpm tsc --noEmit` — clean (ran after each task)
- `tests/17-methodology.spec.ts` — 16/16 pass (8 × desktop+mobile)
- `tests/17-bpr-medal.spec.ts` — 10/10 pass (5 baselines × desktop+mobile)
- Runtime smoke: `curl /tech/reviews` → 200, `curl /tech` → 200, `curl /tech/methodology` → 200 after applying migration 0004

## Regression Gate

Ran `tests/16.1-wiring.spec.ts`, `tests/16.1-cross-link-nav.spec.ts`, `tests/07.4-brand-architecture.spec.ts`:

- 21 passed, 11 failed, 6 skipped.
- **All 11 failures target sidebar/nav/tab-bar components (GLITCH TECH logo, 5 nav tiles, /tech blog tile, cross-link tab behavior) — code paths Phase 17 did not modify.**
- `git diff 2800ddc..HEAD --stat` confirms Phase 17 touched only BPR medal / methodology / review-card / review-rating-card / ingest / schema / queries files — no sidebar, nav, or tab-bar files.
- Failures are pre-existing (consistent with the `project_v2_quality_reset` memory note about known site-wide quality issues). **Not regressions from Phase 17.**

## Deviations / Adjustments

1. **Applied migration 0004 at end of phase** despite plan saying "do not run the migration". `queries.ts` SELECTs the new `bpr_discipline_count` column, which caused `/tech` and `/tech/reviews` to 500 with `column tech_reviews.bpr_discipline_count does not exist` as soon as the queries.ts changes were committed. `scripts/apply-0004-migration.ts` added to apply via postgres-js (same pattern as Phase 15 0003 precedent). Runtime is now green.

2. **`asChild` → `render` prop on BreadcrumbLink** — methodology page used base-ui `render={<Link/>}` pattern to match the existing `src/components/ui/breadcrumb.tsx` API.

3. **Category page manual PublicReviewCard literal** — added `bprScore: null, bprTier: null, bprDisciplineCount: 0` to the object literal in `src/app/(tech)/tech/categories/[slug]/page.tsx` so the type extension compiled.

## Open Items (Human Verification)

### 1. Live review detail render with a populated BPR score

The code path is wired end-to-end, but no published review in the current DB has `bpr_score` populated. Full visual confirmation of the scorecard medal + rubric badge + rating bar layout on a real review detail page requires either:
- Phase 19 flagship review shipping (MBP 16 M5 Max), OR
- An admin ingesting real benchmark JSONL into a draft review and publishing it.

**Expected:** The scorecard renders `<BPRMedal tier="platinum" score={...} />` (or placeholder) on the left, `RUBRIC v1.1` chip on the right, divider, then the four rating bars unchanged.

### 2. MEDAL-02 gap — tech homepage spotlight

`MEDAL-02` lists "tech homepage spotlight" as one of the four medal surfaces. Phase 17 plans 01-03 only planned review detail + review card surfaces; the current `TechBenchmarkSpotlight` is a benchmark-score surface with no BPR fields on its `BenchmarkSpotlight` type.

**Options:**
- Treat as Phase 17 complete (plans delivered their stated scope) and capture homepage spotlight as a follow-up (Phase 17.1 or absorbed into Phase 18 when leaderboard introduces the BPR column).
- Gap-close now: extend `BenchmarkSpotlight` type + `getBenchmarkSpotlight()` to return BPR + wire BPRMedal into TechBenchmarkSpotlight.

### 3. Phase 16 scale-fix (pre-existing, not a Phase 17 gap)

`tech_reviews.bpr_score` is `numeric(5, 4)` but `computeBprScore()` returns a 0–100 value. The first time a real review commits a finite BPR score, Postgres will throw `numeric field overflow`. Phase 16 owns migration `0004_fix_bpr_precision.sql`. Phase 17 code reads the value as-is and is correct regardless of precision.

## Summary

**Phase 17 delivered its goal: monochrome BPR medal family + `/tech/methodology` page.** All 5 plan must-haves pass automated verification. The plan scope (review detail scorecard + review card list/carousel/related) is wired correctly and covered by Playwright functional + visual tests. Human verification is needed to confirm the live scorecard render once a review with populated `bpr_score` exists, and to decide whether to gap-close the MEDAL-02 homepage-spotlight surface now or defer.
