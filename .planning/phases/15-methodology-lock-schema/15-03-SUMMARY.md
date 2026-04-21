---
phase: 15-methodology-lock-schema
plan: 03
subsystem: database/queries
tags: [drizzle, postgres, distinct-on, query-refactor, benchmark, tech-reviews, rubric-map]

# Dependency graph
requires:
  - phase: 15-01
    provides: "mode, superseded, run_uuid columns on tech_benchmark_runs; partial UNIQUE index (product_id, test_id, mode, run_uuid) WHERE superseded=false"
  - phase: 15-02
    provides: "RUBRIC_V1_1 exportable from src/lib/tech/rubric-map.ts with 43 entries including cpu:geekbench6:multi"
provides:
  - "src/lib/tech/queries.ts — getBenchmarkRunsForProducts uses selectDistinctOn([productId, testId, mode]) with superseded=false filter (D-16 verbatim)"
  - "src/lib/tech/queries.ts — getBenchmarkSpotlight resolves Geekbench 6 Multi via RUBRIC_V1_1['cpu:geekbench6:multi'] natural-key id lookup (D-17)"
  - "src/db/seeds/_phase15-compare-assert.ts — throwaway tsx assertion script proving no duplicate (productId, testId, mode) triples at DB level"
affects: ["16-ingest-pipeline", "17-bpr-medal", "18-leaderboard"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "selectDistinctOn([col1, col2, col3], {...}).orderBy(asc(col1), asc(col2), asc(col3), desc(tieBreakerCol)) — Postgres DISTINCT ON cols must lead ORDER BY in same order"
    - "In-memory re-sort after DISTINCT ON to restore display order (sortOrder, testName)"
    - "Rubric-map id lookup: RUBRIC_V1_1[key] -> WHERE discipline=x AND mode=y AND name=z LIMIT 1"
    - "Assertion scripts use standalone postgres.js + drizzle (not @/lib/db) to avoid server-only guard"

key-files:
  created:
    - "src/db/seeds/_phase15-compare-assert.ts"
  modified:
    - "src/lib/tech/queries.ts"

key-decisions:
  - "D-16 3-column DISTINCT ON (productId, testId, mode) — no mode='ac' WHERE filter in getBenchmarkRunsForProducts; callers filter downstream"
  - "PublicBenchmarkRun interface UNCHANGED — mode used internally for DISTINCT ON but not exposed"
  - "getBenchmarkSpotlight remains AC-only (editorial: homepage hero is single canonical score) — mode='ac' filter kept in spotlight sub-queries"
  - "Assertion script uses standalone postgres.js + drizzle pattern (same as rubric seed) — queries.ts has server-only guard blocking direct tsx import"

patterns-established:
  - "Phase assertions use standalone DB connection, not @/lib/db imports — avoids server-only guard"
  - "DISTINCT ON ORDER BY must exactly match the DISTINCT ON columns as leading cols, tie-breaker appended last"

requirements-completed: [METH-04, METH-07]

# Metrics
duration: ~6min
completed: 2026-04-21
---

# Phase 15 Plan 03: Query Refactors Summary

**getBenchmarkRunsForProducts refactored to 3-col selectDistinctOn (D-16) + superseded=false; getBenchmarkSpotlight refactored to RUBRIC_V1_1 id lookup (D-17); runtime assertion script passes on current empty DB**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-21T08:50:59Z
- **Completed:** 2026-04-21T08:56:49Z
- **Tasks:** 2
- **Files modified:** 1 (queries.ts)
- **Files created:** 1 (_phase15-compare-assert.ts)

## Accomplishments

- Refactored `getBenchmarkRunsForProducts` to use `selectDistinctOn([productId, testId, mode])` with `superseded=false` WHERE filter — D-16 canonical form
- No `mode='ac'` WHERE filter in `getBenchmarkRunsForProducts` — callers filter downstream as D-16 specifies
- `PublicBenchmarkRun` interface unchanged — `mode` used internally for DISTINCT ON semantics only
- Refactored `getBenchmarkSpotlight` to resolve Geekbench 6 Multi via `RUBRIC_V1_1["cpu:geekbench6:multi"]` + natural-key id lookup (D-17)
- Both spotlight sub-queries filter `mode='ac' AND superseded=false` (AC-only editorial convention)
- Created `_phase15-compare-assert.ts` — standalone tsx assertion proving no duplicate (productId, testId, mode) triples via selectDistinctOn replay + DB-level GROUP BY count check

## Task Commits

1. **Task 1: Refactor getBenchmarkRunsForProducts with 3-col selectDistinctOn + superseded filter** - `f99bc78` (feat)
2. **Task 2: Refactor getBenchmarkSpotlight to RUBRIC_V1_1 id lookup + create assertion script** - `54dd723` (feat)

## Files Created/Modified

- `src/lib/tech/queries.ts` — `getBenchmarkRunsForProducts` and `getBenchmarkSpotlight` refactored
- `src/db/seeds/_phase15-compare-assert.ts` — Phase 15 throwaway runtime assertion script (safe to delete after Phase 16 ingest tests)

## Exact Query Signatures After Refactor

### getBenchmarkRunsForProducts

```
selectDistinctOn([productId, testId, mode], {...fields incl. mode})
  .from(techBenchmarkRuns)
  .innerJoin(techBenchmarkTests, eq(testId))
  .where(and(inArray(productId, productIds), eq(superseded, false)))
  .orderBy(asc(productId), asc(testId), asc(mode), desc(recordedAt))
```

- DISTINCT ON columns: `(productId, testId, mode)` — 3-column form (D-16 verbatim)
- No `mode='ac'` WHERE filter — both AC and Battery rows may coexist in result
- In-memory re-sort by `(sortOrder, testName)` after query

### getBenchmarkSpotlight

```
// Step 1: Lookup test id
RUBRIC_V1_1["cpu:geekbench6:multi"] -> {discipline, mode, name}
SELECT id FROM techBenchmarkTests
  WHERE discipline=x AND mode=y AND name=z LIMIT 1

// Step 2: Top AC run for that test
SELECT productId, score FROM techBenchmarkRuns
  .innerJoin(techReviews, status='published')
  .where(testId=..., mode='ac', superseded=false)
  .orderBy(score desc) LIMIT 1

// Step 3: Top 2 AC runs for that product
SELECT testName, unit, score FROM techBenchmarkRuns
  .where(productId=..., mode='ac', superseded=false)
  .orderBy(score desc) LIMIT 2
```

## D-16 / D-17 Confirmation

| Requirement | Status |
|-------------|--------|
| DISTINCT ON is 3-column `(productId, testId, mode)` | Confirmed |
| No `mode='ac'` WHERE in getBenchmarkRunsForProducts | Confirmed |
| `superseded=false` filter in getBenchmarkRunsForProducts | Confirmed (line 703) |
| `superseded=false` filter in spotlight candidate query | Confirmed (line 810) |
| `superseded=false` filter in spotlight topRuns query | Confirmed (line 846) |
| `PublicBenchmarkRun` interface unchanged (no mode field) | Confirmed |
| getBenchmarkSpotlight resolves via RUBRIC_V1_1 id lookup | Confirmed (line 779) |
| ilike removed from spotlight | Confirmed (grep returns 0) |
| `mode='ac'` WHERE in spotlight (editorial AC-only) | Confirmed (2 occurrences) |

## Runtime Assertion Output

```
OK: no products in DB — empty-input path verified. Skipping duplicate-triple and
spotlight assertions (no data). no duplicate (product, test, mode) live rows at DB
level (vacuously true).
```

No products exist yet (Mac review returns 2026-04-25 per STATE.md). The empty-input path is verified. The assertion will fully exercise duplicate-check logic once Phase 16 ingest runs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Assertion script uses standalone postgres.js (not queries.ts import)**
- **Found during:** Task 2 (creating assertion script)
- **Issue:** Plan's `_phase15-compare-assert.ts` template imports from `"../client"` (does not exist) and `"../../lib/tech/queries"` which has `import "server-only"` at top — tsx would throw `Error: server-only` at runtime.
- **Fix:** Adopted standalone postgres.js + drizzle pattern from `rubric-v1.1.ts` seed. Replicated the selectDistinctOn query logic directly in the script instead of calling `getBenchmarkRunsForProducts()`. DB-level uniqueness assertion still proves the invariant correctly.
- **Files modified:** `src/db/seeds/_phase15-compare-assert.ts` (created with standalone pattern)
- **Verification:** `pnpm tsx src/db/seeds/_phase15-compare-assert.ts` exits 0
- **Committed in:** `54dd723` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking — import incompatibility)
**Impact on plan:** Zero functional impact. The assertion proves the same D-16 invariant. Standalone pattern is already the project precedent for seed scripts that need DB access.

## Wave + Dependency Note

Plan 03 runs in wave 3 (depends on [15-01, 15-02]) explicitly. This avoids a latent race if plan 02's rubric-map.ts artifact was not available when plan 03's Task 2 ran. Serialization cost accepted (one extra wave) in exchange for explicit dependency correctness.

## Phase 15 Complete

All 3 plans in phase 15 are now complete:
- 15-01: Schema migration (4 pgEnums, 17 columns, 3 indexes, 1 CHECK, 1 new table)
- 15-02: Rubric v1.1 seed (43 test rows, 23 BPR-eligible, RUBRIC_V1_1 map)
- 15-03: Query refactors (getBenchmarkRunsForProducts D-16 + getBenchmarkSpotlight D-17 + assertion)

Phase 16 (JSONL ingest pipeline) is now unblocked.

## Known Stubs

None — both refactored functions return correct data structures. The assertion returns "no data" (vacuously passing) because no products/runs exist yet; this is correct for the current DB state and will fully exercise duplicate detection once Phase 16 ingest data lands.

---
*Phase: 15-methodology-lock-schema*
*Completed: 2026-04-21*
