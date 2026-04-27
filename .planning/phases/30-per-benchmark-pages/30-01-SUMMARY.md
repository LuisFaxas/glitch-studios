---
phase: 30-per-benchmark-pages
plan: 01
status: complete
completed: 2026-04-27
---

# Plan 30-01 — Slug + Leaderboard Data Layer

## Files Created

- `src/lib/tech/benchmark-slug.ts` — `slugFromRubricKey`, `rubricKeyFromSlug`, `getAllBenchmarkSlugs`
- `src/lib/tech/benchmark-slug.spec.ts` — vitest spec, 12 tests, all pass
- `src/lib/tech/benchmark-leaderboard.ts` — `getLeaderboardForBenchmark` (server-only, unstable_cache), `BenchmarkLeaderboardRow`, `BenchmarkLeaderboardResult`
- `tests/30-01-benchmark-slug.spec.ts` — Playwright spec, 5 tests, all pass on desktop project

## Verification

- `pnpm vitest run src/lib/tech/benchmark-slug.spec.ts` — 12/12 passed (310ms)
- `pnpm exec playwright test tests/30-01-benchmark-slug.spec.ts --project=desktop` — 5/5 passed (1.9s)
- `pnpm tsc --noEmit` — clean for new files (one pre-existing error in `tests/forensics-overlay-leak.spec.ts:37` unrelated to this plan)
- `pnpm lint` — clean for new files (53 pre-existing baseline errors elsewhere; none introduced by this plan)
- Brand sweep — no `GlitchTek` typos in any new file

## Deviations

- Playwright spec uses relative imports (`../src/lib/tech/...`) instead of `@/` alias. Reason: `playwright.config.ts` does not declare a resolve alias, and no existing Playwright spec in this repo imports from `@/`. The plan anticipated this fallback ("If the alias isn't configured for tests, the spec must use a relative import").
- Pre-existing baseline tsc and lint failures (`tests/forensics-overlay-leak.spec.ts`, `tests/mobile-audit.spec.ts`, etc.) are out of scope for this plan. Acceptance criteria for Plan 30-01 are met for all new files.

## Notes for Plan 30-02 author

- All 43 RUBRIC_V1_1 keys produce URL-safe kebab-case slugs (`/^[a-z0-9-]+$/`).
- `getAllBenchmarkSlugs()` is the canonical enumeration source for `generateStaticParams`.
- The leaderboard query module is server-only — only consumable from server components / route handlers.
- Empty-state distinction is in place: `getLeaderboardForBenchmark` returns `null` for unknown rubric keys (caller should `notFound()`) vs. `{ rows: [] }` when the rubric key is valid but no `tech_benchmark_tests` row exists yet (caller renders honest empty-state panel).

## Coverage

- SC-2 (slug derivation) — landed
- SC-3 (cross-category leaderboard data) — landed (data layer)
- SC-4 (baseline-relative score) — landed (direction-aware formula)
- SC-5 (honest empty-state) — landed (return shape distinguishes 404 vs empty)
- SC-6 (SSG via RUBRIC_V1_1) — landed (`getAllBenchmarkSlugs` enumeration)
