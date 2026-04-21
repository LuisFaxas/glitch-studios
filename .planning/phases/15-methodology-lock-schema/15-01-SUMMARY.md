---
phase: 15-methodology-lock-schema
plan: 01
subsystem: database
tags: [drizzle, postgres, schema, pgEnum, migration, tech-reviews, benchmark]

# Dependency graph
requires:
  - phase: 07.5-tech-foundation
    provides: "tech_ tables (tech_reviews, tech_benchmark_tests, tech_benchmark_runs) without methodology columns"
provides:
  - "4 new pgEnums: benchmark_mode, benchmark_discipline, bpr_tier, discipline_exclusion_reason"
  - "10 new columns on tech_benchmark_runs (mode, run_uuid, rubric_version, superseded, source_file, ingest_batch_id, ambient_temp_c, macos_build, run_flagged, permalink_url)"
  - "4 new columns on tech_benchmark_tests (discipline, mode, bpr_eligible, min_ram_gb)"
  - "3 new columns on tech_reviews (bpr_score, bpr_tier, rubric_version)"
  - "CHECK constraint: tech_reviews status=published requires published_at NOT NULL"
  - "New table tech_review_discipline_exclusions with CASCADE FK + UNIQUE(review_id, discipline)"
  - "Partial UNIQUE index on tech_benchmark_runs: (product_id, test_id, mode, run_uuid) WHERE superseded=false"
  - "Natural-key UNIQUE index on tech_benchmark_tests: (template_id, discipline, mode, name)"
  - "Migration 0003_methodology_lock.sql applied to Neon Postgres"
affects: ["16-ingest-pipeline", "17-bpr-medal", "18-leaderboard", "15-02-rubric-seed", "15-03-query-refactors"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pgEnum naming: lowercase snake_case Postgres name, camelCase `...Enum` TS export"
    - "Partial unique index via uniqueIndex().on().where(sql`col = val`)"
    - "CHECK constraint via pgTable extras callback: check(name, sql`...`)"
    - "Migration applied via direct postgres-js script (same as 0002 precedent — drizzle-kit generate hits interactive prompt on column conflicts)"
    - "D-10 backfill UPDATE emitted in migration between ADD COLUMN and CREATE UNIQUE INDEX"

key-files:
  created:
    - "src/db/migrations/0003_methodology_lock.sql"
  modified:
    - "src/db/schema.ts"
    - "src/db/migrations/meta/_journal.json"
    - "src/actions/admin-tech-benchmarks.ts"

key-decisions:
  - "Table named tech_review_discipline_exclusions (D-20/METH-02), NOT tech_benchmark_exclusions from ROADMAP wording — CONTEXT is authoritative"
  - "discipline column kept nullable on tech_benchmark_tests (per RESEARCH §P-3) — rubric seed and app layer guarantee non-null on new rows"
  - "Migration applied via direct postgres-js script — drizzle-kit generate hit interactive prompt (column conflict on renamed benchmark_runs columns); same pattern as 0002"
  - "Partial index WHERE clause hand-authored in SQL (not generated) — drizzle-kit historical gaps #461/#3349/#2506/#4727 confirmed; WHERE superseded=false present and verified in pg_indexes"
  - "admin-tech-benchmarks.ts createRun updated to provide mode+runUuid for new NOT NULL columns (mode defaults to 'ac', runUuid auto-generated via crypto.randomUUID())"

patterns-established:
  - "Methodology lock enums are declared right after techBenchmarkDirectionEnum in the Glitch Tech enums section"
  - "pgTable extras callback pattern for uniqueIndex + check used for tech tables going forward"

requirements-completed: [METH-01, METH-02, METH-03, METH-04, METH-07]

# Metrics
duration: ~15min
completed: 2026-04-21
---

# Phase 15 Plan 01: Methodology Lock Schema Summary

**4 new pgEnums + 17 new columns + 3 unique indexes + 1 CHECK constraint + 1 new table applied to Neon Postgres via 0003_methodology_lock.sql**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-21T08:22:00Z
- **Completed:** 2026-04-21T08:37:57Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added 4 new pgEnums (`benchmark_mode`, `benchmark_discipline`, `bpr_tier`, `discipline_exclusion_reason`) to schema.ts and Postgres
- Added 10 new columns to `tech_benchmark_runs` including `mode`, `run_uuid`, `rubric_version`, `superseded` + partial UNIQUE index enforcing one live run per (product, test, mode, run_uuid)
- Added 4 new columns to `tech_benchmark_tests` + natural-key UNIQUE index enabling idempotent rubric seed (plan 02)
- Added 3 new columns to `tech_reviews` + CHECK constraint: published reviews must have `published_at NOT NULL`
- Created `tech_review_discipline_exclusions` table with CASCADE FK and UNIQUE(review_id, discipline) — enabling BPR gap suppression per discipline (Phase 16/17)

## Task Commits

1. **Task 1: Append enums + modify existing tech tables in schema.ts** - `01e045f` (feat)
2. **Task 2: Author + apply 0003_methodology_lock.sql migration** - `01d0562` (feat)

## Files Created/Modified

- `src/db/schema.ts` — Added 4 pgEnums, modified techReviews/techBenchmarkTests/techBenchmarkRuns, added techReviewDisciplineExclusions table + relations
- `src/db/migrations/0003_methodology_lock.sql` — Full DDL migration: 4 CREATE TYPE, 14 ALTER TABLE ADD COLUMN, 1 CREATE TABLE, 1 ADD CONSTRAINT, 3 CREATE UNIQUE INDEX, safety guards DO $$ block, D-10 backfill UPDATE
- `src/db/migrations/meta/_journal.json` — Added idx 3 entry for 0003_methodology_lock
- `src/actions/admin-tech-benchmarks.ts` — Updated createRun() to provide required mode + runUuid fields (auto-fix)

## Decisions Made

- **Table name reconciliation:** `tech_review_discipline_exclusions` (D-20/METH-02) not `tech_benchmark_exclusions` (ROADMAP wording error). CONTEXT + REQUIREMENTS are authoritative.
- **discipline nullable:** Left nullable at DB level per RESEARCH §P-3 recommendation. Rubric seed (plan 02) populates all new rows; D-10 backfill UPDATE handles any pre-existing rows (0 rows found in preflight).
- **Migration apply path:** Direct postgres-js script. `pnpm db:generate` hit an interactive prompt (column conflict detection between old and new `tech_benchmark_runs` columns) — same issue as Phase 07.5 which used `db:push`. Wrote SQL manually per RESEARCH §Migration Workflow, applied via `apply-migration.ts` script (deleted after use).
- **Partial index WHERE clause:** Hand-authored in the SQL file (not relying on drizzle-kit generation). Post-migration verified via `pg_indexes` — `WHERE (superseded = false)` confirmed present.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated admin-tech-benchmarks.ts createRun() to include required mode + runUuid**
- **Found during:** Task 1 (pnpm tsc --noEmit verification)
- **Issue:** `tech_benchmark_runs` now has NOT NULL columns `mode` and `run_uuid` with no DB defaults. The existing `createRun()` server action passed only `productId`, `testId`, `score`, `notes`, `createdBy` — missing required fields.
- **Fix:** Added optional `mode?: "ac" | "battery"` to `BenchmarkRunInput` interface (defaulting to `"ac"` for legacy admin entries); added `runUuid: crypto.randomUUID()` to the insert values.
- **Files modified:** `src/actions/admin-tech-benchmarks.ts`
- **Verification:** `pnpm tsc --noEmit` exits 0
- **Committed in:** `01e045f` (Task 1 commit)

**2. [Rule 3 - Blocking] Used direct postgres-js apply instead of pnpm drizzle-kit migrate**
- **Found during:** Task 2 (migration generation)
- **Issue:** `pnpm db:generate` failed with "Interactive prompts require a TTY terminal" — drizzle-kit detected column conflicts in `tech_benchmark_runs` (old columns vs. new expanded definition) and wanted interactive rename/drop decisions.
- **Fix:** Authored `0003_methodology_lock.sql` manually (per RESEARCH §Migration Workflow precedent); applied via a temporary `apply-migration.ts` postgres-js script (deleted post-apply). This is identical to how 0002 was applied per `0002_glitch_tech_foundation.sql` header comment.
- **Verification:** All post-migration sanity checks passed (pg_indexes, pg_constraint, zero NULL discipline rows, all new tables/enums/columns confirmed)
- **Committed in:** `01d0562` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug fix, 1 blocking issue)
**Impact on plan:** Both fixes were necessary for correctness. The direct-apply approach is the documented project precedent. No scope creep.

## Issues Encountered

- `drizzle.__drizzle_migrations` table was empty (0 entries) — `_journal.json` only had 0000/0001. Migration 0002 was applied directly and never registered. Added 0003 to `_journal.json` for tracking; 0002 was already applied to DB (all 12 `tech_*` tables confirmed present pre-migration).
- D-10 backfill UPDATE was a no-op (0 rows in `tech_benchmark_tests`) — confirmed by preflight and post-migration `count(*) = 0` check.

## Preflight Results

- `tech_benchmark_tests` rows: **0** (no seed file inserts into this table — verified)
- `tech_benchmark_runs` rows: **0** (D-10 assumption confirmed — Mac returns 2026-04-25)
- Published reviews with NULL `published_at`: **0** (CHECK constraint safe to add)

## Post-Migration Verification

| Check | Expected | Actual |
|-------|----------|--------|
| `pg_indexes` partial index WHERE clause | `WHERE (superseded = false)` | `WHERE (superseded = false)` |
| `pg_constraint` CHECK constraint | Present | `CHECK (((status <> 'published') OR (published_at IS NOT NULL)))` |
| `count(*) WHERE discipline IS NULL` | 0 | 0 |
| `tech_review_discipline_exclusions` table | Exists | Exists |
| 4 new enums in `pg_type` | All present | All present |
| `tech_benchmark_runs` new columns | 10 added | 10 confirmed |
| `pnpm tsc --noEmit` | Exits 0 | Exits 0 |

## Next Phase Readiness

- **Plan 02 (rubric seed):** Unblocked — natural-key UNIQUE index exists, all discipline/mode columns present
- **Plan 03 (query refactors):** Unblocked — `mode`, `superseded`, `runUuid` columns present for DISTINCT ON queries
- **Phase 16 (ingest pipeline):** Unblocked — `run_uuid`, `mode`, `superseded`, `ingest_batch_id` all present
- **Phase 17 (BPR medal UI):** Unblocked — `bpr_tier`, `bpr_score`, `rubric_version` on `tech_reviews` present

---
*Phase: 15-methodology-lock-schema*
*Completed: 2026-04-21*
