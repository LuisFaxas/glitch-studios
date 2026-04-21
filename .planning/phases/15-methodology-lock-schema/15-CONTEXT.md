# Phase 15: Methodology Lock + Schema - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Close every schema gap that blocks ingest (Phase 16), medal UI (Phase 17), and leaderboards (Phase 18). Three concrete deliverables:

1. **One Drizzle migration** — 3 new enums (`benchmark_mode`, `bpr_tier`, `discipline_exclusion_reason`), 14 column additions across 5 existing tech tables, 1 new `tech_review_discipline_exclusions` table, a partial UNIQUE index on `tech_benchmark_runs`, and a CHECK constraint on `tech_reviews.published_at`.
2. **Rubric v1.1 seed** — `src/lib/tech/rubric-map.ts` (the `(discipline, tool, field) → tech_benchmark_tests.id` lookup) + `src/db/seeds/rubric-v1.1.ts` seeding all 13 disciplines' test rows idempotently.
3. **Two pre-ingest query refactors** — `getBenchmarkRunsForProducts` → `DISTINCT ON (product_id, test_id, mode)` (one canonical row per pair), `getBenchmarkSpotlight` → rubric-map id lookup (no fragile `ilike "Geekbench 6 Multi"` name match). `/tech/compare` must not regress.

No UI, no ingest code, no BPR computation. This phase ships the ground Phase 16+ stands on.

</domain>

<decisions>
## Implementation Decisions

### UNIQUE Constraint on `tech_benchmark_runs`
- **D-01:** Partial unique index: `UNIQUE (product_id, test_id, mode, run_uuid) WHERE superseded = false`.
  - Rationale: matches REQUIREMENTS.md and research pitfall B-1. Allows superseded history rows to coexist with the live row for the same `(product, test, mode)`. AC and Battery rows within one `run_uuid` coexist because `mode` is part of the key.
  - Implementation: `uniqueIndex("tech_benchmark_runs_unique_live").on(...).where(sql\`superseded = false\`)` in Drizzle. Supported since drizzle-orm 0.29+.
- **D-02:** `superseded boolean NOT NULL DEFAULT false`. No nullable — ingest must set it explicitly when replacing.

### Column Typing
- **D-03:** `benchmark_mode` as **pgEnum**: `('ac' | 'battery' | 'both')`. Applies to both `tech_benchmark_tests.mode` and `tech_benchmark_runs.mode`.
  - On tests: `'both'` means the test is run in both modes (CPU, GPU, LLM, Video, Dev, Python, Games). On runs: only `'ac'` or `'battery'` (never `'both'` — each run row is one mode).
- **D-04:** `discipline` on `tech_benchmark_tests` as **pgEnum** `benchmark_discipline`:
  `('cpu' | 'gpu' | 'llm' | 'video' | 'dev' | 'python' | 'games' | 'memory' | 'storage' | 'thermal' | 'wireless' | 'display' | 'battery_life')`.
  - Rationale: 13 values are locked by rubric v1.1 policy — adding a discipline requires a rubric version bump (= new migration anyway), so enum is the right match. Type-safe Drizzle inference downstream.
- **D-05:** `bpr_tier` as pgEnum `bpr_tier` with values `('platinum' | 'gold' | 'silver' | 'bronze')`. Nullable on `tech_reviews` — null means "no medal" (score < 60% or fewer than 5 of 7 eligible disciplines). Never store a Bronze when data is insufficient.
- **D-06:** `discipline_exclusion_reason` as pgEnum `('no_hardware' | 'requires_license' | 'device_class_exempt' | 'test_failed')`.
- **D-07:** `rubric_version` as `text` (not enum) — version strings evolve; string comparison is enough for filtering.
- **D-08:** `run_uuid` as `uuid` (not text) — Postgres-native type, supports `::uuid` casts. Admin wizard generates via `crypto.randomUUID()`.
- **D-09:** `ingest_batch_id` as `uuid` nullable — same ingest-session id used across all lines in one JSONL upload; nullable for pre-Phase-16 rows (none exist) and for any seed data.

### Existing Data / Backfill
- **D-10:** No backfill needed. `tech_benchmark_runs` has no production rows — Mac bench harness has not run against this DB yet (Mac returns 2026-04-25). `tech_benchmark_tests` has seed rows from Phase 7.5 admin scaffolding; the migration adds `discipline`, `mode`, `direction` (already exists), `unit` (already exists) — `discipline` will default to the value derived from existing row's category/name via a one-time UPDATE in the same migration, then seed replaces/extends.
- **D-11:** All new NOT NULL columns ship with DB defaults so the migration is single-transaction-safe:
  - `tech_benchmark_runs.mode` → no default, required from ingest (no existing rows = safe).
  - `tech_benchmark_runs.rubric_version` → `DEFAULT '1.1'`.
  - `tech_benchmark_runs.superseded` → `DEFAULT false`.
  - `tech_benchmark_runs.run_uuid` → no default, required from ingest.
  - `tech_benchmark_runs.source_file` → nullable (diagnostic only).
  - `tech_benchmark_runs.ingest_batch_id` → nullable.
  - `tech_benchmark_runs.ambient_temp_c` → nullable.
  - `tech_benchmark_runs.macos_build` → nullable.
  - `tech_benchmark_runs.run_flagged` → nullable (reason text).
  - `tech_benchmark_runs.permalink_url` → nullable (Geekbench URL etc.).
  - `tech_reviews.bpr_score` → nullable numeric(5,4).
  - `tech_reviews.bpr_tier` → nullable bpr_tier enum.
  - `tech_reviews.rubric_version` → `DEFAULT '1.1'`.

### Rubric v1.1 Seed
- **D-12:** `src/db/seeds/rubric-v1.1.ts` seeds all 13 disciplines upfront.
  - Rationale: Phase 16 ingest dry-run needs every test row to exist so the rubric-map lookup resolves. CPU-only would leave 12 disciplines in "unknown test" state and block Phase 17/18 work that can otherwise proceed in parallel.
  - Phase 16 still ingests real numbers per-discipline as the Mac harness produces them — the seed just creates the `tech_benchmark_tests` rows (test name, discipline, mode, unit, direction) that ingest matches against.
- **D-13:** Idempotency via `ON CONFLICT DO NOTHING` on a new natural-key unique index: `UNIQUE (template_id, discipline, mode, name)` on `tech_benchmark_tests`. Running the seed twice is a no-op. The seed script exits 0 with a count summary (`Inserted N, Skipped M`).
- **D-14:** Seed is **append-only**. No `ON CONFLICT DO UPDATE`. Once a `tech_benchmark_tests` row references benchmark runs, its unit/direction/sort_order cannot be mutated — that would change the scoring of historical runs. A mistake in the v1.1 seed = bump to v1.2 with new rows. This is the rubric version policy.
- **D-15:** `src/lib/tech/rubric-map.ts` exports a typed constant `RUBRIC_V1_1: Record<string, { discipline, tool, field, mode, unit, direction, name, sortOrder }>` keyed by `(discipline):(tool):(field)` (e.g., `"cpu:geekbench6:multi"`). The seed script iterates this constant to insert rows. The Phase 16 ingest pipeline uses the same constant to look up `tech_benchmark_tests.id` from a JSONL line's `(discipline, tool, field)`.

### Query Refactors
- **D-16:** `getBenchmarkRunsForProducts` → use `DISTINCT ON (product_id, test_id, mode)` ordered by `recorded_at DESC` filtered by `superseded = false`. Drizzle supports this via `selectDistinctOn(...)`.
- **D-17:** `getBenchmarkSpotlight` → look up the Geekbench 6 Multi (AC) test via `RUBRIC_V1_1["cpu:geekbench6:multi"]` and match by `tech_benchmark_tests.id`, not `ilike` on name. Renaming a test row no longer breaks the spotlight.
- **D-18:** Regression verification: Playwright smoke on `/tech/compare` with two seeded products (admin can seed a minimal product pair in the test DB) + `pnpm tsc --noEmit` + `pnpm lint`. No `next build` (CodeBox constraint).

### `tech_reviews.published_at` CHECK Constraint
- **D-19:** Add `CHECK (status != 'published' OR published_at IS NOT NULL)` — a published review MUST have a publish timestamp. Matches pitfall prevention in research. Application layer (admin mutation) sets `published_at = NOW()` when status flips to `published` and was NULL.

### New Table: `tech_review_discipline_exclusions`
- **D-20:** Columns: `id uuid PK`, `review_id uuid NOT NULL FK → tech_reviews ON DELETE CASCADE`, `discipline benchmark_discipline NOT NULL`, `reason discipline_exclusion_reason NOT NULL`, `notes text NULL`, `created_at timestamp DEFAULT now() NOT NULL`.
- **D-21:** `UNIQUE (review_id, discipline)` — one exclusion per discipline per review.
- **D-22:** Only `device_class_exempt` suppresses BPR gap warning (enforced in Phase 16 BPR computation, not in this phase).

### `brand` Column on Blog Tables (METH scope boundary)
- **D-23:** `brand` column on `blog_posts` / `blog_categories` is NOT in Phase 15. ROADMAP assigns that to **Phase 20 (BLOG-01)**. Phase 15 ships only the tech/methodology schema. (The ROADMAP success criterion #1 mentions `brand` in its list of columns — this is a mistake in the roadmap wording; REQ-IDs METH-01..07 cover only tech tables. Proceeding with the REQ-ID scope.)

### Claude's Discretion
- Exact Drizzle file organization (one migration file vs splitting enums/tables/indexes into multiple) — planner decides based on Drizzle-kit output.
- Naming of internal helper types (`BenchmarkDiscipline`, `BprTier`, etc.) — planner follows existing camelCase conventions in `src/db/schema.ts`.
- Whether to add a trigger vs rely on app-layer enforcement for `published_at = NOW()` — D-19 only requires the CHECK constraint; app-layer fill happens in the existing admin mutation (no trigger needed).
- Exact shape of the rubric-map key strings (colon-separated vs object vs nested) — planner picks the most ergonomic.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements + Roadmap
- `.planning/REQUIREMENTS.md` §Methodology & Schema (METH-01 through METH-07) — the authoritative column list and constraints
- `.planning/ROADMAP.md` §Phase 15: Methodology Lock + Schema — plans hint and success criteria
- `.planning/PROJECT.md` §Current Milestone — v3.0 GlitchTek Launch scope

### Research (read before planning)
- `.planning/research/SUMMARY.md` §Locked Methodology Constants, §Schema Changes Required
- `.planning/research/ARCHITECTURE.md` — schema deltas and rubric-map shape
- `.planning/research/PITFALLS.md` §B-1 (duplicate runs), §B-3 (rubric version mismatch), §B-4 (BPR gameability), §C-5 (published_at CHECK)
- `.planning/research/STACK.md` — Drizzle DISTINCT ON support, partial unique index syntax

### Existing Code (the migration modifies these)
- `src/db/schema.ts:621-814` — existing tech enums + tables: `techBenchmarkDirectionEnum`, `techReviews` (L717), `techBenchmarkTemplates` (L779), `techBenchmarkTests` (L788), `techBenchmarkRuns` (L802)
- `src/lib/tech/queries.ts:660-687` — `getBenchmarkRunsForProducts` (current MAX-style, no DISTINCT ON)
- `src/lib/tech/queries.ts:728-777` — `getBenchmarkSpotlight` (current `ilike "Geekbench 6 Multi"` match)
- `src/db/migrations/` — existing Drizzle migrations; new migration numbered `0003_*`
- `drizzle.config.ts` (project root) — Drizzle-kit config

### Project instructions
- `./CLAUDE.md` — CodeBox constraints (no parallel `next build`, prefer `tsc --noEmit`), pnpm only, Next.js 16 + Drizzle + Neon locked

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `pgEnum` pattern already used 13 times in `src/db/schema.ts` — follow naming (lowercase enum name, kebab column name).
- `uniqueIndex` + `sql\`...\`` pattern available via `drizzle-orm/pg-core` — used for partial index with `WHERE` predicate.
- Existing `createdAt`/`updatedAt` timestamp columns use `timestamp("...").defaultNow().notNull()` — new columns follow same convention.
- `relations()` API already wires `techReviews ↔ techBenchmarkRuns` indirectly via `techProducts` — new `tech_review_discipline_exclusions` table needs a new `relations()` entry.

### Established Patterns
- Migrations live in `src/db/migrations/` numbered `000N_*.sql` — generated via `pnpm drizzle-kit generate`. Current max is `0002_glitch_tech_foundation.sql`, so new migration is `0003_*`.
- Seed scripts run via `pnpm tsx src/db/seeds/<file>.ts` (project has Node v24 + erasable TS support per workspace CLAUDE.md).
- No existing `src/db/seeds/` directory — must be created. Existing seed files are at `src/db/seed.ts`, `seed-admin.ts`, `seed-beat.ts` (flat layout). Plan 02 introduces the new `seeds/` subdir for the rubric seed.
- Query refactors sit inside `src/lib/tech/queries.ts` (777 lines — single file with all tech read queries). Keep in-place; do not split.

### Integration Points
- Phase 16 (ingest) reads `rubric-map.ts` and inserts into `tech_benchmark_runs` using the new columns.
- Phase 17 (medal UI) reads `tech_reviews.bpr_tier` + `bpr_score`.
- Phase 18 (leaderboard) depends on `getBenchmarkRunsForProducts` returning DISTINCT ON rows.
- `/tech/compare` (shipped v2.0) consumes `getBenchmarkRunsForProducts` — regression tested here.
- Tech homepage consumes `getBenchmarkSpotlight` — regression tested here.

</code_context>

<specifics>
## Specific Ideas

- **Partial unique index** — Drizzle form: `uniqueIndex("tech_benchmark_runs_live_uniq").on(techBenchmarkRuns.productId, techBenchmarkRuns.testId, techBenchmarkRuns.mode, techBenchmarkRuns.runUuid).where(sql\`superseded = false\`)`.
- **CHECK constraint** — Drizzle form in `pgTable` extras: `check("tech_reviews_published_at_chk", sql\`status != 'published' OR published_at IS NOT NULL\`)`.
- **Rubric-map key format** — `"<discipline>:<tool>:<field>"` (e.g., `"cpu:geekbench6:multi"`, `"gpu:3dmark:wild_life"`). Flat string key keeps lookup O(1) and matches the JSONL schema Phase 16 ingests.
- **Seed exit format** — `console.log(\`Rubric v1.1 seed: inserted \${inserted}, skipped \${skipped}, total \${inserted+skipped}\`)` followed by `process.exit(0)`.
- **Regression pairs for /tech/compare verification** — if no published products exist, plan 03 creates two draft products + a handful of seeded benchmark runs in an `_after-migrate-check.ts` throwaway script, or uses Playwright seeded fixtures. Planner picks.
- **publishedAt CHECK migration order** — add the CHECK constraint AFTER any backfill of existing published rows. Current review rows: none published, none with publishedAt NULL+status=published, so safe to add immediately.

</specifics>

<deferred>
## Deferred Ideas

- **BPR computation function** — belongs in Phase 16 plan 01 (`src/lib/tech/bpr.ts`). Phase 15 only adds the columns to store the result.
- **Methodology page content** — Phase 17 (METH-05).
- **Rubric version selector UI** — Phase 17/18 (METH-06).
- **brand column on blog tables** — Phase 20 (BLOG-01). Not in METH-* scope despite roadmap success-criterion #1 wording.
- **Discipline exclusion admin UI** — Phase 16 (admin wizard for `tech_review_discipline_exclusions` CRUD). Phase 15 only creates the table.
- **BPR badge component + tooltip** — Phase 17 (MEDAL-01..03).
- **Rubric v1.2 / v2.0 policy** — append-only policy is documented (D-14) but migration tooling for next version deferred until actually needed.

</deferred>

---

*Phase: 15-methodology-lock-schema*
*Context gathered: 2026-04-21*
