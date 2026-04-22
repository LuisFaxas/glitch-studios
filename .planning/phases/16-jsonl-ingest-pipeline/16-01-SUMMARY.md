---
phase: 16-jsonl-ingest-pipeline
plan: 01
subsystem: tech/bpr
tags: [bpr, tdd, unit-tests, geometric-mean, vitest]
requires:
  - src/lib/tech/rubric-map.ts (BPR_ELIGIBLE_DISCIPLINES, BenchmarkDiscipline)
  - src/db/schema.ts (techBenchmarkRuns, techBenchmarkTests, techReviews, techReviewDisciplineExclusions)
  - src/lib/db.ts (db client)
provides:
  - "computeBprScore(productId, options?, tx?) → { score, tier, perDiscipline }"
  - "bprMedal(score) → BprTier | null"
  - "computeBprFromPairs(ratios) → number | null"
  - "BprTier type union"
  - "DbClient type (db | PostgresJsTransaction)"
affects:
  - "Plan 02 server actions: import computeBprScore + bprMedal for commit transaction recompute"
  - "Plan 04 Playwright E2E: validates computeBprScore end-to-end after wizard commit"
tech-stack:
  added: [vitest@4.1.5, "@vitest/ui@4.1.5"]
  patterns:
    - "vitest config stubs `server-only` to enable unit testing modules that mark themselves RSC-only"
    - "Pure formula helper (computeBprFromPairs) exported separately for DB-free unit testing"
    - "Optional tx parameter with `client = tx ?? db` pattern — future server actions pass their transaction client for READ COMMITTED visibility"
key-files:
  created:
    - "src/lib/tech/bpr.ts (181 lines — BPR library)"
    - "src/lib/tech/bpr.spec.ts (62 lines — vitest unit tests, 18 cases)"
    - "vitest.config.ts (config with @ alias + server-only stub)"
    - "src/test/stubs/server-only.ts (no-op stub for server-only in vitest)"
  modified:
    - "package.json (+vitest, +@vitest/ui devDeps)"
    - "pnpm-lock.yaml (lockfile)"
decisions:
  - "Kept bprMedal + computeBprFromPairs + computeBprScore in one file (bpr.ts) rather than splitting into bpr-pure.ts + bpr-db.ts — vitest resolves `server-only` via alias stub, so a single module works and mirrors the plan's reference layout."
  - "Added vitest + config (not previously installed). Previous tests in the repo are Playwright-only. Vitest is now the project-standard unit-test runner for pure library modules."
  - "Used `select({...}).from(techReviews)` to look up reviews instead of `db.query.techReviews.findFirst` — select is transparent across tx/db clients without wrestling the PostgresJsTransaction generic for Drizzle Query API."
  - "DbClient type exported so Plan 02 server actions get a strongly-typed parameter shape and can pass their `tx` cleanly."
metrics:
  duration_min: 10
  completed: 2026-04-22T13:23:52Z
---

# Phase 16 Plan 01: BPR Computation Library Summary

Pure BPR math (bprMedal + computeBprFromPairs) plus async computeBprScore with innerJoin + optional transaction client, unit-tested under vitest with 18 passing cases.

## What Shipped

- **`src/lib/tech/bpr.ts`** — three exports:
  - `bprMedal(score)` — D-13 tier thresholds (>=90 platinum, >=80 gold, >=70 silver, >=60 bronze, <60 null, null→null).
  - `computeBprFromPairs(ratios)` — pure geometric mean: `Math.exp(sum(Math.log(r_i)) / n) * 100`. Returns null when `ratios.length < 5` (D-12 guard).
  - `computeBprScore(productId, options?, tx?)` — async: queries non-superseded runs for the product via `innerJoin techBenchmarkRuns × techBenchmarkTests`, filters by rubricVersion (default `"1.1"`), respects `techReviewDisciplineExclusions`, groups by discipline × mode, averages AC and Battery per discipline, computes per-discipline ratio, runs `computeBprFromPairs` → `bprMedal`.
- **Optional `tx` parameter** typed as `DbClient = typeof db | PostgresJsTransaction<any, any>`. Internal queries call `client = tx ?? db` so callers inside `db.transaction(async (tx) => { ... })` can pass `tx` and read uncommitted rows in the same connection.
- **`src/lib/tech/bpr.spec.ts`** — 18 vitest cases: 11 `bprMedal` boundary cases (per D-13 boundaries 90 / 89.99 / 80 / 79.99 / 70 / 69.99 / 60 / 59.99 / 0 / null) + 7 `computeBprFromPairs` math cases (ratios of 1.0 → 100, known-geomean, empty array → null, <5 → null, 5-pair minimum, 7-pair full, mixed high/low).
- **`vitest.config.ts` + `src/test/stubs/server-only.ts`** — resolves `@/` path alias and stubs the `server-only` marker package so modules that import `"server-only"` can still be loaded in vitest (Node) context. This was the planner's anticipated infra decision; using the alias keeps `bpr.ts` collocated and imports the real `db` symbol for type checking.

## BPR Formula (locked this plan)

```text
ratios[i] = avg(battery_score_for_discipline_i) / avg(ac_score_for_discipline_i)
BPR = exp( sum_i( ln(ratios[i]) ) / n ) * 100
       where n = count of BPR_ELIGIBLE_DISCIPLINES with both AC + Battery data
                 AND not in techReviewDisciplineExclusions for the review

Returns null when n < 5 (D-12 gate).
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocker] Vitest not installed in the repo**

- **Found during:** Task 1 (before RED test could be run)
- **Issue:** The plan assumes vitest is available, but the repo only had Playwright. `pnpm vitest run ...` would have failed.
- **Fix:** Installed `vitest@4.1.5` + `@vitest/ui@4.1.5` as dev dependencies; added `vitest.config.ts` with `@/` path alias and a `server-only` stub so unit tests can import modules that mark themselves RSC-only.
- **Files modified:** `package.json`, `pnpm-lock.yaml`, `vitest.config.ts` (new), `src/test/stubs/server-only.ts` (new)
- **Commit:** 536be30 (landed alongside GREEN implementation — config was a prerequisite)

**2. [Minor deviation] Plan's sample test file referenced `computeBprScore` tx wiring test via a try/catch that swallows DB connection errors**

- **What changed:** Dropped that test case. It asserted "does not throw a TypeError about tx", which TypeScript already enforces at compile time. The remaining 18 cases (bprMedal boundaries + computeBprFromPairs math) give the same contract coverage without a flaky try/catch-on-DB-connection shape that is hard to reason about.
- **Why:** `pnpm tsc --noEmit` already guarantees the tx parameter shape compiles; unit-testing live DB from vitest would require a real DATABASE_URL, which the planner explicitly said should be validated end-to-end by Plan 04. No loss of safety.
- **Coverage still present:** tx parameter is exercised by TypeScript compilation + Plan 04 E2E (planned).

### Out-of-Scope Discoveries

None.

### Architectural Decisions

None — plan called for a single bpr.ts with three exports and that is what shipped.

## Known Stubs

None. Every symbol is fully wired to real DB schema and rubric-map.

## Verification

- `pnpm vitest run src/lib/tech/bpr.spec.ts` → `18/18 passed` (start 09:22:52, 915ms)
- `pnpm tsc --noEmit` → exit 0
- `pnpm lint src/lib/tech/bpr.ts src/lib/tech/bpr.spec.ts src/test/stubs/server-only.ts` → clean
- Acceptance criteria greps:
  - `export function bprMedal` ✓
  - `export function computeBprFromPairs` ✓
  - `export async function computeBprScore` ✓
  - `BPR_ELIGIBLE_DISCIPLINES` imported from rubric-map ✓
  - `ratios.length < 5` short-circuit present ✓
  - `Math.exp` + `Math.log` formula present ✓
  - `innerJoin` used (direct DB query, not getBenchmarkRunsForProducts) ✓
  - `DbClient` / `PostgresJsTransaction` type surfaced ✓
  - `tx ?? db` fallback in place ✓

## Commits

| Task | Type | Hash | Message |
| ---- | ---- | ---- | ------- |
| 1 — RED | test | ff00a47 | test(16-01): add failing tests for bpr.ts — bprMedal + computeBprFromPairs |
| 1 — GREEN | feat | 536be30 | feat(16-01): implement bpr.ts — BPR computation + medal tier library |

## Requirements Closed

- **ING-05** — BPR computation library in place (pure math + async DB-backed).
- **ING-06** — BPR recompute hook point ready (computeBprScore accepts tx client; Plan 02 wires it into the commit transaction).

## Hand-off Notes to Downstream Plans

- **Plan 02** (server actions): `import { computeBprScore, bprMedal } from "@/lib/tech/bpr"`. Inside `db.transaction(async (tx) => { ... })`, call `computeBprScore(productId, { rubricVersion }, tx)` AFTER inserts/supersedes but BEFORE returning from the transaction. Then `UPDATE techReviews SET bprScore = result.score, bprTier = result.tier`.
- **Plan 04** (Playwright E2E): no additional bpr.ts work needed. Test should assert `tech_reviews.bpr_score` and `bpr_tier` columns populate correctly for the flagship MBP fixture after the wizard commits.
- **Phase 17** (medal UI): reads `tech_reviews.bpr_score` + `bpr_tier` directly from the DB; no new bpr.ts code required, but the `perDiscipline` map can be surfaced via a small `getBprBreakdown(productId)` helper later if the UI wants to render per-discipline retention bars.

## Self-Check: PASSED

- `src/lib/tech/bpr.ts` exists: FOUND
- `src/lib/tech/bpr.spec.ts` exists: FOUND
- `vitest.config.ts` exists: FOUND
- `src/test/stubs/server-only.ts` exists: FOUND
- Commit ff00a47 in git log: FOUND
- Commit 536be30 in git log: FOUND
