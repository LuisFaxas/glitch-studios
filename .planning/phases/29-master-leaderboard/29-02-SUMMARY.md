# Phase 29 Plan 02 — SUMMARY

**Status:** complete
**Commit:** e475340
**Date:** 2026-04-25

## What was built

- `src/lib/tech/leaderboard.ts` — server-only data layer for the master leaderboard
  - `getLeaderboardRows(categorySlug)` — returns flattened-descendant published+placeholder rows, sorted by GlitchMark DESC NULLS LAST. DISTINCT ON canonical benchmark runs (Phase 15 D-16 pattern). Joins reviews + products + sub-category + hero image + benchmark runs + product specs + discipline exclusions.
  - `getLeaderboardBenchmarkColumns(categorySlug)` — returns the locked 4-column set: Geekbench 6 Multi, 3DMark Steel Nomad, LLM tg128, Battery video-loop.
  - Both wrapped in `unstable_cache` with `tags: ["leaderboard"]`.
  - `LeaderboardRow` + `LeaderboardBenchmarkColumn` exports — Plan 03's component contract.
- `src/actions/admin-tech-reviews.ts` — `publishReview` + `unpublishReview` now call `updateTag("leaderboard")` to invalidate the cache.
- `src/actions/admin-tech-ingest.ts` — ingest commit (after `recomputeGlitchmark`) now calls `updateTag("leaderboard")`.

## Key decisions

- **Next.js 16 API split:** `revalidateTag(tag, profile)` now requires a CacheLife profile. Switched to `updateTag(tag)` (single-arg, read-your-own-writes variant for server actions). The leaderboard cache invalidates via `updateTag` in all three sites.
- **Placeholder leakage guard:** the `OR(status='published', status='placeholder')` filter exists ONLY in `leaderboard.ts`. No existing `WHERE status='published'` filter elsewhere was modified.
- **Rubric key matching:** `tech_benchmark_tests` has no `key` column in this codebase. Built a `name → rubricKey` map from `RUBRIC_V1_1` at module init, then matched runs by test name.
- **Spec field matching:** `tech_spec_fields` keyed by `name` (not `key`); seed inserts these names verbatim.
- **AC preference:** when a (product, test) pair has both AC and battery canonical runs, the AC mode wins per Phase 15 D-16 sort axis.

## Verification

- `pnpm tsc --noEmit` exits 0
- `getLeaderboardRows` exists, exports `LeaderboardRow`, uses `unstable_cache` + `tags: ["leaderboard"]`, uses `selectDistinctOn`, contains `OR(eq(techReviews.status, "placeholder"))`, uses `DESC NULLS LAST`, reuses `getCategoryDescendantIds`.
- `updateTag("leaderboard")` present in publishReview, unpublishReview, and admin-tech-ingest.ts ingest commit (3 occurrences total).
- No diff in `src/lib/tech/queries.ts` (existing `WHERE status='published'` filters unchanged).
