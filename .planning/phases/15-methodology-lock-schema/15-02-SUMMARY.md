---
phase: 15-methodology-lock-schema
plan: 02
subsystem: database
tags: [drizzle, postgres, seed, rubric, benchmark, tech-reviews]

# Dependency graph
requires:
  - phase: 15-01
    provides: "natural-key UNIQUE index on tech_benchmark_tests (template_id, discipline, mode, name), all 4 methodology pgEnums"
provides:
  - "src/lib/tech/rubric-map.ts — RUBRIC_V1_1 Record with 43 entries across 13 disciplines, 23 BPR-eligible"
  - "src/db/seeds/rubric-v1.1.ts — idempotent pnpm tsx seed, plain onConflictDoNothing(), exits 0 both runs"
  - "Laptops category (id=337ce831-cfbf-4d26-aae8-0bfa630eb977) and benchmark template (id=9334d843-45e7-4670-a8a8-9586eca42563) created in DB"
  - "43 tech_benchmark_tests rows seeded with non-null discipline, 23 with bpr_eligible=true and mode='both'"
affects: ["16-ingest-pipeline", "17-bpr-medal", "18-leaderboard", "15-03-query-refactors"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seed scripts use `require('dotenv')` with config({ path: '.env.local' }) to load Next.js env files from project root"
    - "Seed creates missing prerequisite rows (category/template) rather than erroring on clean DB"
    - "onConflictDoNothing() with no arguments is the correct Drizzle 0.45.x API for append-only seeds"

key-files:
  created:
    - "src/lib/tech/rubric-map.ts"
    - "src/db/seeds/rubric-v1.1.ts"

key-decisions:
  - "43 entries total (not 39) — RESEARCH.md matrix and plan action section both have 43 rows; the '39' in plan must_haves is a typo"
  - "Seed auto-creates Laptops category if absent — makes seed self-contained on a fresh DB (Rule 3 fix)"
  - "Used require('dotenv') (not import 'dotenv/config') — dotenv is a transitive dep not declared in package.json; require avoids TypeScript type error"

patterns-established:
  - "RUBRIC_V1_1 key format: <discipline>:<tool>:<field> (D-15) — all lowercase, colon-separated"
  - "BPR_ELIGIBLE_DISCIPLINES array export alongside RUBRIC_V1_1 for Phase 17 BPR computation"

requirements-completed: [METH-01, METH-02, METH-03]

# Metrics
duration: ~7min
completed: 2026-04-21
---

# Phase 15 Plan 02: Rubric Map + Seed Summary

**RUBRIC_V1_1 TypeScript map (43 entries, 13 disciplines) + idempotent Drizzle seed using plain onConflictDoNothing() — first run inserted 43, second run inserted 0**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-04-21T08:41:41Z
- **Completed:** 2026-04-21T08:48:10Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `src/lib/tech/rubric-map.ts` with `RUBRIC_V1_1` — canonical `Record<string, RubricTestSpec>` covering all 13 disciplines, 43 total test rows, 23 BPR-eligible rows (7 disciplines: cpu, gpu, llm, video, dev, python, games)
- Created `src/db/seeds/rubric-v1.1.ts` — idempotent, append-only, runs via `pnpm tsx`; uses plain `.onConflictDoNothing()` (Drizzle 0.45.x API)
- Seed verified idempotent: first run inserted 43 / skipped 0; second run inserted 0 / skipped 43; both exits 0

## Rubric Counts

| Metric | Count |
|--------|-------|
| Total RUBRIC_V1_1 entries | 43 |
| BPR-eligible (mode='both', bprEligible=true) | 23 |
| Non-BPR (mode='ac' or mode='battery') | 20 |
| Disciplines covered | 13 |
| BPR-eligible disciplines | 7 (cpu, gpu, llm, video, dev, python, games) |

## Seed Run Outputs (Idempotency Proof)

**First run:**
```
Created Laptops category: 337ce831-cfbf-4d26-aae8-0bfa630eb977
Created benchmark template for Laptops category: 9334d843-45e7-4670-a8a8-9586eca42563
Rubric v1.1 seed: inserted 43, skipped 0, total 43
```

**Second run:**
```
Rubric v1.1 seed: inserted 0, skipped 43, total 43
```

## DB References (for Phase 16)

- **Laptops category ID:** `337ce831-cfbf-4d26-aae8-0bfa630eb977`
- **Benchmark template ID:** `9334d843-45e7-4670-a8a8-9586eca42563`

Phase 16 ingest should look up `tech_benchmark_tests.id` via `RUBRIC_V1_1[key]` mapping — not by these IDs directly.

## Drizzle 0.45.x API Confirmation

`onConflictDoNothing()` called with NO arguments — checker BLOCKER 3 compliant. The natural-key UNIQUE index on `(template_id, discipline, mode, name)` (created in plan 01) is the only constraint the INSERT can violate; Postgres auto-selects it. Confirmed by second-run idempotency (zero inserts on 43 attempted rows).

No `onConflictDoUpdate` anywhere in the seed code — append-only per D-14. All 3 occurrences of the string "onConflictDoUpdate" in the file are in comments explaining why it's not used.

## Task Commits

1. **Task 1: Create RUBRIC_V1_1 canonical rubric map** - `3b0708a` (feat)
2. **Task 2: Create idempotent rubric v1.1 seed** - `e5098e0` (feat)

## Files Created

- `src/lib/tech/rubric-map.ts` — exports `BenchmarkDiscipline`, `BenchmarkMode`, `BenchmarkDirection`, `RubricTestSpec`, `RUBRIC_V1_1`, `BPR_ELIGIBLE_DISCIPLINES`
- `src/db/seeds/rubric-v1.1.ts` — standalone seed, loads `.env.local`, creates Laptops category/template if absent, inserts 43 rows via `onConflictDoNothing()`

## Decisions Made

- **43 entries (not 39):** Plan `must_haves` said 39 but the action section and RESEARCH.md matrix both enumerate 43 rows (5+5+2+4+3+3+3+2+2+2+5+4+3=43). Trusted the action code and research matrix as authoritative.
- **Seed is self-contained:** Auto-creates Laptops category on fresh DB (Rule 3 auto-fix) — no prerequisite seed required to run this seed.
- **dotenv loading:** Used `require('dotenv')` pattern instead of `import 'dotenv/config'` since dotenv is a transitive dep not declared in package.json; import would cause TypeScript type error.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Seed auto-creates Laptops category on fresh DB**
- **Found during:** Task 2 (seed verification run)
- **Issue:** `tech_categories` table is empty in the connected DB; the plan assumed Phase 07.5 had pre-seeded a "laptops" category. The seed exited 1 with "ERROR: Laptops category not found."
- **Fix:** Changed the Laptops category lookup from a hard-fail exit to an auto-create (level=1, slug="laptops", name="Laptops"). The benchmark template creation already handled the "create if absent" case. Category creation is idempotent via the `slug` UNIQUE constraint on `tech_categories`.
- **Files modified:** `src/db/seeds/rubric-v1.1.ts`
- **Verification:** Seed ran successfully on first run (created category + template + 43 test rows), second run skipped all 43
- **Committed in:** `e5098e0` (Task 2 commit)

**2. [Rule 1 - Bug] Plan entry count discrepancy (43 vs 39)**
- **Found during:** Task 1 (node verification)
- **Issue:** `must_haves.truths[0]` says "39 entries" and acceptance criteria says "exactly 39 unique keys", but the RESEARCH matrix has 43 rows and the plan action section shows all 43 entries. The math 5+5+3+3+3+2+2+2+4+2+5+4+3=43 confirms 43.
- **Fix:** Created rubric-map.ts with all 43 entries (matching the research matrix and action section). The "39" in must_haves is a plan typo.
- **Verification:** `Object.keys(RUBRIC_V1_1).length` returns 43; 23 BPR-eligible as required
- **Committed in:** `3b0708a` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for correctness. Seed is more robust (self-contained on fresh DB). Entry count matches research matrix.

## Issues Encountered

- `dotenv` is a transitive dep but not in `package.json` — `import 'dotenv/config'` caused TypeScript TS2307 error. Resolved with `const dotenv = require('dotenv')` (runtime require, no type declarations needed).
- `src/lib/db.ts` has `import 'server-only'` — cannot import from seed scripts. Used standalone `postgres()` + `drizzle()` instantiation (same pattern as existing `seed.ts` / `seed-admin.ts`).

## User Setup Required

None — no external service configuration required beyond existing DATABASE_URL in `.env.local`.

## Next Phase Readiness

- **Plan 03 (getBenchmarkSpotlight refactor):** Unblocked — `RUBRIC_V1_1["cpu:geekbench6:multi"]` is importable
- **Phase 16 (ingest pipeline):** Unblocked — 43 `tech_benchmark_tests` rows seeded with discipline/mode fields; `RUBRIC_V1_1` importable from `@/lib/tech/rubric-map` for (discipline, tool, field) → test-id translation
- **Phase 17 (BPR Medal):** Unblocked — `bpr_eligible=true` on 23 rows, `BPR_ELIGIBLE_DISCIPLINES` array exported

---
*Phase: 15-methodology-lock-schema*
*Completed: 2026-04-21*
