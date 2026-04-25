---
phase: 28-glitchmark-system
plan: 01
subsystem: database
tags: [drizzle, postgres, migration, glitchmark, scoring]

requires:
  - phase: 27-media-video-strategy-foundation
    provides: idempotent migration pattern (ALTER TABLE ... ADD COLUMN IF NOT EXISTS, phase{N}_migration_meta guard, standalone postgres-js runner) most recently applied via 0007_phase27_media.sql
provides:
  - 4 nullable GlitchMark columns on tech_reviews (score, test_count, is_partial, version)
  - reference_score numeric(14,4) on tech_benchmark_tests
  - tech_glitchmark_history table with (review_id, version) unique index + ON DELETE CASCADE
  - phase28_migration_meta placeholder for future one-shot ops
  - pnpm db:migrate:phase28 runner script
  - Drizzle exports techGlitchmarkHistory + techGlitchmarkHistoryRelations
affects: [28-02, 28-03, 28-04]

tech-stack:
  added: []
  patterns:
    - Numeric precision: glitchmark_score numeric(7,2) — supports 0..99999.99 (well above expected 0..1000 range)
    - reference_score numeric(14,4) — supports raw ranges from latency in ms to Cinebench Multi (~30000)
    - Versioning column: text default 'v1' (mirrors rubric_version '1.1' pattern)

key-files:
  created:
    - src/db/migrations/0008_phase28_glitchmark.sql
    - scripts/run-phase28-migration.ts
  modified:
    - src/db/schema.ts (4 cols on techReviews + reference_score on techBenchmarkTests + new techGlitchmarkHistory table)
    - package.json (db:migrate:phase28 script)

key-decisions:
  - "No seed data for reference_score — operator populates baselines via SQL UPDATE post-launch (D-15 deferred)"
  - "ON DELETE CASCADE on tech_glitchmark_history.review_id — when review is deleted, all version rows go with it"
  - "phase28_migration_meta created as placeholder so future v1→v2 backfills can use the proven idempotency pattern"

patterns-established:
  - "Migration runner naming: scripts/run-phase{N}-migration.ts → pnpm db:migrate:phase{N} (Phase 26/27/28)"

requirements-completed: [GLITCHMARK-01, GLITCHMARK-02, GLITCHMARK-07]

duration: 5min
completed: 2026-04-25
---

# Phase 28-01: GlitchMark Schema Summary

**4 GlitchMark columns + reference_score + history table live in production. Idempotent migration applied twice with identical state — proven safe.**

## Performance

- **Duration:** ~5 min
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Drizzle schema: 4 cols added to techReviews, reference_score added to techBenchmarkTests, new techGlitchmarkHistory table exported
- Idempotent SQL migration applied to prod Supabase DB
- Verification: `tech_glitchmark_history table: EXISTS`, `tech_reviews glitchmark columns: 4/4 present`, `tech_benchmark_tests reference_score: PRESENT`
- Re-ran migration — no errors, same state

## Task Commits

1. **Tasks 1-3 bundled:** `810b905` (feat) — schema + migration SQL + runner + script + applied

## Files Created/Modified
- `src/db/schema.ts` — 4 cols on techReviews, reference_score on techBenchmarkTests, techGlitchmarkHistory + relations appended
- `src/db/migrations/0008_phase28_glitchmark.sql` — created
- `scripts/run-phase28-migration.ts` — created
- `package.json` — db:migrate:phase28 script added

## Decisions Made
None — plan executed exactly as written.

## Deviations from Plan
None.

## Issues Encountered
None.

## Next Phase Readiness
- 28-02 can write to glitchmark_* columns + tech_glitchmark_history
- 28-03 can read tech_benchmark_tests.reference_score for the baseline table
- 28-04 has the schema in place to compute on every ingest commit

---
*Phase: 28-glitchmark-system*
*Completed: 2026-04-25*
