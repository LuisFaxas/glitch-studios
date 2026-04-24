---
phase: 17-bpr-medal-ui-methodology-page
plan: 01
subsystem: ui
tags: [bpr, medal, drizzle, migration, next, server-component, base-ui]

requires:
  - phase: 15-methodology-lock-schema
    provides: tech_reviews.bpr_score, bpr_tier, rubric_version columns + techBprTierEnum
  - phase: 16-jsonl-ingest-pipeline
    provides: computeBprScore() returning perDiscipline map

provides:
  - tech_reviews.bpr_discipline_count integer column (migration 0004)
  - BPRMedal + BPRMedalPlaceholder components (src/components/tech/bpr-medal.tsx)
  - RubricVersionBadge component (src/components/tech/rubric-version-badge.tsx)
  - PublicReviewCard + PublicReviewDetail types extended with BPR fields

affects: [17-02, 17-03, 18-leaderboard, 19-flagship-review]

tech-stack:
  added: []
  patterns:
    - "Server-component first — client boundary only inside base-ui primitive wrappers"
    - "Monochrome tier lookup keyed by BprTier — colorblind-safe"

key-files:
  created:
    - src/db/migrations/0004_bpr_discipline_count.sql
    - src/components/tech/bpr-medal.tsx
    - src/components/tech/rubric-version-badge.tsx
  modified:
    - src/db/schema.ts
    - src/db/migrations/meta/_journal.json
    - src/actions/admin-tech-ingest.ts
    - src/lib/tech/queries.ts
    - src/app/(tech)/tech/categories/[slug]/page.tsx

key-decisions:
  - "Auto-mode D-1: bpr_discipline_count stored as integer column (not computed-on-read)"
  - "Auto-mode D-8: base-ui primitive contract — Tooltip uses render prop"
  - "Bronze label contrast exception (3.1:1) accepted per UI-SPEC §Accessibility"

patterns-established:
  - "Monochrome tier variants — fill/border differentiation only, zero hue"
  - "Link-wrapped chip with 44x44 tap target via before:absolute pseudo element"

requirements-completed:
  - MEDAL-01
  - MEDAL-03
  - METH-06

duration: 18min
completed: 2026-04-23
---

# Phase 17 Plan 01: BPR Medal Components + Schema Extension

**Monochrome BPR medal family (platinum/gold/silver/bronze + placeholder), bpr_discipline_count column, and extended PublicReview types so every downstream surface can render a medal without re-query.**

## Accomplishments
- Migration 0004 adds `tech_reviews.bpr_discipline_count integer NOT NULL DEFAULT 0`; ingest writes the non-null count derived from `computeBprScore().perDiscipline`.
- `BPRMedal` and `BPRMedalPlaceholder` exported from `src/components/tech/bpr-medal.tsx`: server components, four tier variants differentiated by fill+border only, 44×44 tap target via `before:absolute`, base-ui Tooltip via `render` prop.
- `RubricVersionBadge` exported from `src/components/tech/rubric-version-badge.tsx`: bordered-ghost `RUBRIC v{version}` chip linking to methodology changelog.
- `PublicReviewCard` + `PublicReviewDetail` extended with `bprScore`, `bprTier`, `bprDisciplineCount` (+ `rubricVersion` on detail). `fetchCardRows` and `getPublishedReviewBySlug` SELECT and map the fields.

## Task Commits

1. **Task 1: Schema + migration + ingest write** — `a26695f` (feat)
2. **Task 2: BPRMedal/Placeholder/RubricVersionBadge** — `2b0c231` (feat)
3. **Task 3: Extend PublicReview types + queries** — `0788756` (feat)

## Files Created/Modified
- `src/db/migrations/0004_bpr_discipline_count.sql` — ALTER TABLE adds bpr_discipline_count integer
- `src/db/migrations/meta/_journal.json` — idx 4 entry for migration 0004
- `src/db/schema.ts` — bprDisciplineCount drizzle column on techReviews
- `src/actions/admin-tech-ingest.ts` — write bprDisciplineCount from computeBprScore
- `src/components/tech/bpr-medal.tsx` — BPRMedal + BPRMedalPlaceholder server components
- `src/components/tech/rubric-version-badge.tsx` — RubricVersionBadge server component
- `src/lib/tech/queries.ts` — PublicReviewCard/Detail type extensions + SELECT + row map
- `src/app/(tech)/tech/categories/[slug]/page.tsx` — manual PublicReviewCard literal now includes the new fields

## Decisions Made
- **Auto-mode D-1:** bpr_discipline_count stored as integer column (not computed-on-read) — stable across repeated SELECTs, no recompute on every card render.
- **Auto-mode D-8:** base-ui primitive contract — BPRMedal uses `<TooltipTrigger render={wrapped} />` pattern, no custom animation wrapper.
- **Bronze contrast exception:** label contrast 3.1:1 accepted per UI-SPEC §Accessibility; documented inline.
- **Category page shim:** category [slug] page constructs PublicReviewCard literals manually for products-without-reviews — extended with `bprScore: null`, `bprTier: null`, `bprDisciplineCount: 0` so types compile. Star fallback will render (Plan 03 handles the branching).

## Deviations from Plan
None - plan executed as written. Only adjustment: added the three BPR fields to `src/app/(tech)/tech/categories/[slug]/page.tsx` because that file constructs a PublicReviewCard manually (not via queries.ts). Technically additive, same intent as the plan's queries.ts edits.

## Issues Encountered
None.

## Open Issues
**Phase 16 scale-fix pending:** `tech_reviews.bpr_score` is `numeric(5, 4)` but `computeBprScore()` returns 0–100. Phase 16 must ship migration `0004_fix_bpr_precision.sql` widening the column BEFORE the first real BPR score is committed. Phase 17 reads the value as-is (assuming 0–100) and is correct regardless of the underlying precision.

## Next Phase Readiness
- Plan 02 (methodology page) can proceed in parallel — no file overlap.
- Plan 03 (wire into review-rating-card + review-card) can consume BPRMedal/Placeholder/RubricVersionBadge and the extended `PublicReviewDetail.bprScore/bprTier/bprDisciplineCount/rubricVersion`.

---
*Phase: 17-bpr-medal-ui-methodology-page*
*Completed: 2026-04-23*
