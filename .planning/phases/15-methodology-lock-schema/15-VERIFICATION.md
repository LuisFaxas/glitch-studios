---
phase: 15-methodology-lock-schema
verified: 2026-04-21T00:00:00Z
status: passed
score: 5/5 must-haves verified
---

# Phase 15: Methodology Lock + Schema Verification Report

**Phase Goal:** All schema gaps are closed and rubric v1.1 is seeded before any ingest or leaderboard code can be written — no feature in Phase 16+ can proceed without this foundation
**Verified:** 2026-04-21
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `pnpm tsc --noEmit` passes after migration — all new columns reflected in Drizzle types | VERIFIED | Exit code 0 confirmed during verification |
| 2 | Rubric v1.1 seed runs idempotently | VERIFIED | SUMMARY documents: first run inserted 43, skipped 0; second run inserted 0, skipped 43 |
| 3 | `getBenchmarkRunsForProducts` returns at most one row per `(product_id, test_id, mode)` after refactor | VERIFIED | `selectDistinctOn([productId, testId, mode])` present at queries.ts:678-683, superseded=false filter at line 703 |
| 4 | `getBenchmarkSpotlight` resolves via test `id` lookup (not ilike name match) | VERIFIED | `RUBRIC_V1_1["cpu:geekbench6:multi"]` at queries.ts:779; no ilike in spotlight function |
| 5 | `UNIQUE(product_id, test_id, run_uuid)` constraint exists on `tech_benchmark_runs` and rejects duplicates | VERIFIED | Migration line 111-113: `CREATE UNIQUE INDEX "tech_benchmark_runs_live_uniq" ... WHERE "superseded" = false`; actual partial key is `(product_id, test_id, mode, run_uuid)` per plan D-01 — the 4-column form is the correct D-16 design |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/db/schema.ts` | 4 pgEnums + column additions + check constraint + new table + relations | VERIFIED | All 4 enums at lines 640-675; techBenchmarkRuns 10 new columns at lines 861-875; techReviews 3 new columns + CHECK at lines 780-786; techBenchmarkTests 4 new columns at lines 843-846; techReviewDisciplineExclusions table at line 881 |
| `src/db/migrations/0003_methodology_lock.sql` | DDL with partial-index WHERE, CHECK constraint, D-10 backfill UPDATE | VERIFIED | All DDL present; WHERE "superseded" = false at line 113; CHECK constraint at line 89; D-10 UPDATE at lines 40-58 |
| `src/lib/tech/rubric-map.ts` | RUBRIC_V1_1 Record with 43 entries across 13 disciplines | VERIFIED | `export const RUBRIC_V1_1` at line 38; 43 entries (23 bprEligible:true + 20 bprEligible:false); all 13 disciplines present |
| `src/db/seeds/rubric-v1.1.ts` | Idempotent seed using plain onConflictDoNothing() | VERIFIED | `Object.values(RUBRIC_V1_1)` at line 66; `.onConflictDoNothing()` at line 84 with no arguments; no onConflictDoUpdate anywhere |
| `src/lib/tech/queries.ts` | Refactored getBenchmarkRunsForProducts + getBenchmarkSpotlight | VERIFIED | selectDistinctOn at line 678; RUBRIC_V1_1 import at line 18; spotlight id lookup at line 779 |
| `src/db/seeds/_phase15-compare-assert.ts` | Runtime assertion script | VERIFIED | File exists; replicates selectDistinctOn query; asserts no duplicate (productId, testId, mode) triples |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| schema.ts techBenchmarkRuns | techBenchmarkModeEnum + techBenchmarkTests | mode column typed as techBenchmarkModeEnum + testId FK | VERIFIED | Line 861: `techBenchmarkModeEnum("mode").notNull()`; line 860: FK to techBenchmarkTests.id |
| 0003_methodology_lock.sql | tech_benchmark_runs table | `CREATE UNIQUE INDEX ... WHERE "superseded" = false` | VERIFIED | Lines 111-113 of migration SQL |
| 0003_methodology_lock.sql backfill UPDATE | tech_benchmark_tests existing rows (D-10) | UPDATE between ADD COLUMN and CREATE UNIQUE INDEX | VERIFIED | awk ordering check: UPDATE at line 40, natural-key index at line 107 — correct order |
| schema.ts techReviewDisciplineExclusions | techReviews + techBenchmarkDisciplineEnum + techDisciplineExclusionReasonEnum | review_id FK CASCADE + discipline enum + reason enum | VERIFIED | Lines 881-891; relations at lines 1028-1034 |
| seeds/rubric-v1.1.ts | rubric-map.ts RUBRIC_V1_1 | Object.values(RUBRIC_V1_1).map(...).insert(techBenchmarkTests) | VERIFIED | Line 24: import; line 66: Object.values(RUBRIC_V1_1).map |
| seeds/rubric-v1.1.ts | tech_benchmark_tests natural-key index | onConflictDoNothing() — no args | VERIFIED | Line 84: `.onConflictDoNothing()` with no arguments; no `{ target }` param |
| queries.ts getBenchmarkRunsForProducts | techBenchmarkRuns 3-column DISTINCT ON | selectDistinctOn([productId, testId, mode]) | VERIFIED | Lines 678-683: 3-column form confirmed |
| queries.ts getBenchmarkSpotlight | RUBRIC_V1_1["cpu:geekbench6:multi"] | rubric-map id lookup replacing ilike | VERIFIED | Line 779; ilike only used in other unrelated query (line 295) not in spotlight |

### Data-Flow Trace (Level 4)

Not applicable. Phase 15 is pure DB/data-layer — no components that render dynamic data from these queries were created or modified.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript types compile | `pnpm tsc --noEmit` | Exit 0 | PASS |
| D-10 backfill ordering | awk ordering check on migration SQL | UPDATE at line 40, index at line 107 | PASS |
| onConflictDoNothing no-arg form | grep in seed file | Line 84: `.onConflictDoNothing()` | PASS |
| No ilike in getBenchmarkSpotlight | grep queries.ts:775+ | 0 matches in spotlight function body | PASS |
| No mode='ac' filter in getBenchmarkRunsForProducts | grep queries.ts:661-734 | Both mode='ac' hits at lines 809 and 845 are inside getBenchmarkSpotlight (775+) | PASS |
| UNIQUE index WHERE clause in migration | grep 0003_methodology_lock.sql | `WHERE "superseded" = false` present at line 113 | PASS |
| Journal entry registered | grep _journal.json | `"tag": "0003_methodology_lock"` at line 23 | PASS |
| Phase 15 files have no lint errors | pnpm lint filtered to phase 15 paths | Zero errors in src/lib/tech/queries.ts, rubric-map.ts, schema.ts, seeds/* | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| METH-01 | 15-02 | Rubric v1.1 seeded into tech_benchmark_templates — 13 disciplines with exact tool set | SATISFIED | 43 test rows seeded; all 13 disciplines confirmed in rubric-map.ts |
| METH-02 | 15-01 | Schema additions (mode, run_uuid, rubric_version, bpr_score, bpr_tier, exclusions table) | SATISFIED | All columns present in schema.ts and migration; tech_review_discipline_exclusions table created |
| METH-03 | 15-02 | BPR formula locked — geometric mean of 7 eligible disciplines | SATISFIED | 23 rows with bprEligible=true; BPR_ELIGIBLE_DISCIPLINES export in rubric-map.ts; tech_review_discipline_exclusions exists for exclusion tracking |
| METH-04 | 15-03 | Medal thresholds locked — Platinum/Gold/Silver/Bronze stored on tech_reviews.bpr_tier | SATISFIED | techBprTierEnum created with all 4 tiers; bprTier column on techReviews in schema.ts |
| METH-07 | 15-03 | Pre-ingest query refactors — DISTINCT ON + rubric-map id lookup | SATISFIED | selectDistinctOn 3-column form at queries.ts:678; RUBRIC_V1_1 id lookup at queries.ts:779 |

**Orphaned requirements check:** METH-05 (methodology page) and METH-06 (rubric version badge) are correctly NOT claimed by any Phase 15 plan — REQUIREMENTS.md maps them to Phase 3. No orphaned requirements for this phase.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No stubs, no placeholder returns, no hardcoded empty data in phase 15 files. The `ilike` import remains in queries.ts but is used by a different query function (line 295) — not a stub.

Note on overall `pnpm lint` result: lint exits 1 due to pre-existing errors in test spec files (`tests/mobile-audit.spec.ts`, `tests/sidebar-collapse.spec.ts`). Zero lint errors exist in any Phase 15 file.

### Human Verification Required

None — all success criteria are verifiable from the codebase and do not require a running server or visual inspection. The seed idempotency proof is documented in SUMMARY.md with actual run output.

### Gaps Summary

No gaps. All 5 ROADMAP success criteria are met:

1. `pnpm tsc --noEmit` passes — confirmed exit 0.
2. Rubric v1.1 seed runs idempotently — documented by first-run (43 inserted) and second-run (0 inserted) outputs in 15-02-SUMMARY.md.
3. `getBenchmarkRunsForProducts` uses `selectDistinctOn([productId, testId, mode])` — returns at most one row per triple.
4. `getBenchmarkSpotlight` resolves via `RUBRIC_V1_1["cpu:geekbench6:multi"]` + natural-key id lookup — no ilike.
5. `UNIQUE(product_id, test_id, mode, run_uuid) WHERE superseded = false` index exists in the migration and was applied to the Neon DB.

One plan-level discrepancy noted but non-blocking: plan 02 `must_haves` stated "39 entries" but the actual research matrix and plan action section both enumerate 43 rows. The executor correctly used 43 (the research matrix is authoritative). The SUMMARY documents this as a plan typo, and the ROADMAP success criterion 2 (idempotency) is satisfied regardless of the exact count.

---

_Verified: 2026-04-21_
_Verifier: Claude (gsd-verifier)_
