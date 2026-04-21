# Phase 15: Methodology Lock + Schema — Research

**Researched:** 2026-04-21
**Domain:** Drizzle 0.45.2 / drizzle-kit 0.31.10 + Postgres (Neon) — schema migration, pgEnum, partial unique index, CHECK constraint, DISTINCT ON, natural-key upsert seed
**Confidence:** HIGH

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

**UNIQUE constraint on `tech_benchmark_runs`:**
- D-01 — Partial unique index: `UNIQUE (product_id, test_id, mode, run_uuid) WHERE superseded = false`. Drizzle form: `uniqueIndex("tech_benchmark_runs_unique_live").on(...).where(sql\`superseded = false\`)`. (Supported since drizzle-orm 0.29+.)
- D-02 — `superseded boolean NOT NULL DEFAULT false`. No nullable.

**Column typing:**
- D-03 — `benchmark_mode` pgEnum `('ac' | 'battery' | 'both')` shared by `tech_benchmark_tests.mode` and `tech_benchmark_runs.mode`. `'both'` only valid on tests; runs are always `'ac'` or `'battery'`.
- D-04 — `benchmark_discipline` pgEnum (13 values): `cpu | gpu | llm | video | dev | python | games | memory | storage | thermal | wireless | display | battery_life`.
- D-05 — `bpr_tier` pgEnum (`platinum | gold | silver | bronze`), nullable on `tech_reviews`.
- D-06 — `discipline_exclusion_reason` pgEnum (`no_hardware | requires_license | device_class_exempt | test_failed`).
- D-07 — `rubric_version` as `text` (not enum).
- D-08 — `run_uuid` as `uuid` (not text).
- D-09 — `ingest_batch_id` as `uuid`, nullable.

**Backfill & defaults:**
- D-10 — No backfill required (`tech_benchmark_runs` is empty). Existing `tech_benchmark_tests` seed rows UPDATEd in-migration to derive `discipline` from category/name; seed then extends.
- D-11 — DB-default assignment (full list in CONTEXT): `rubric_version → '1.1'`, `superseded → false`, `mode`/`run_uuid` required (no existing rows), others nullable.

**Rubric v1.1 seed:**
- D-12 — All 13 disciplines seeded upfront in `src/db/seeds/rubric-v1.1.ts`.
- D-13 — Idempotency via `ON CONFLICT DO NOTHING` on natural-key unique index `UNIQUE (template_id, discipline, mode, name)`.
- D-14 — Seed is append-only (no `ON CONFLICT DO UPDATE`). Mistakes require rubric v1.2.
- D-15 — `src/lib/tech/rubric-map.ts` exports `RUBRIC_V1_1: Record<string, {...}>` keyed by `"<discipline>:<tool>:<field>"`.

**Query refactors:**
- D-16 — `getBenchmarkRunsForProducts` uses `selectDistinctOn([productId, testId, mode])` ordered `recorded_at DESC` filtered `superseded = false`.
- D-17 — `getBenchmarkSpotlight` uses `RUBRIC_V1_1["cpu:geekbench6:multi"]` → `tech_benchmark_tests.id` lookup (no `ilike`).
- D-18 — Regression verification: Playwright smoke on `/tech/compare` + `pnpm tsc --noEmit` + `pnpm lint`. No `next build`.

**Review publish rule:**
- D-19 — Add `CHECK (status != 'published' OR published_at IS NOT NULL)`. App layer fills `published_at = NOW()` in existing admin mutation — no trigger.

**New table `tech_review_discipline_exclusions`:**
- D-20 — Columns: `id uuid PK`, `review_id uuid NOT NULL FK → tech_reviews ON DELETE CASCADE`, `discipline benchmark_discipline NOT NULL`, `reason discipline_exclusion_reason NOT NULL`, `notes text NULL`, `created_at timestamp DEFAULT now() NOT NULL`.
- D-21 — `UNIQUE (review_id, discipline)`.
- D-22 — Only `device_class_exempt` suppresses BPR gap warning (enforced in Phase 16, not here).

**Scope boundary:**
- D-23 — `brand` column on `blog_posts` / `blog_categories` is **NOT** in Phase 15. That belongs to Phase 20 (BLOG-01). ROADMAP success-criterion #1's mention of `brand` is a roadmap wording bug; scope is METH-01..07.

### Claude's Discretion

- Drizzle file organization (one migration file vs. multiple).
- Helper type names (`BenchmarkDiscipline`, `BprTier`, etc.) — follow camelCase.
- Rubric-map key string shape (colon-separated flat vs. nested) — recommend flat colon keys per D-15 for O(1) ingest lookup.
- Whether to add a trigger for `published_at` — D-19 explicitly says CHECK only, no trigger.

### Deferred Ideas (OUT OF SCOPE)

- BPR computation (`src/lib/tech/bpr.ts`) — Phase 16 plan 01.
- Methodology page content — Phase 17 (METH-05).
- Rubric version selector UI — Phase 17/18 (METH-06).
- `brand` blog column — Phase 20 (BLOG-01).
- Discipline exclusion admin UI — Phase 16.
- BPR badge component — Phase 17 (MEDAL-01..03).
- Rubric v1.2/v2.0 tooling — deferred until needed.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| METH-01 | Rubric v1.1 seeded into `tech_benchmark_templates` (all 13 disciplines) | §Rubric v1.1 Discipline × Test Matrix (complete row list) + §Seed Idempotency |
| METH-02 | Schema additions — enums, 14 columns across 5 tables, `tech_review_discipline_exclusions`, partial UNIQUE, CHECK constraint | §Drizzle 0.45.x Syntax Cheatsheet + §Migration Workflow + §Naming Reconciliation |
| METH-03 | BPR formula locked — geomean over 7 eligible disciplines | Discipline list frozen via `benchmark_discipline` enum (D-04) + `mode = 'both'` rows for 7 eligibles. Computation itself is Phase 16. |
| METH-04 | Medal thresholds locked — Platinum 90 / Gold 80 / Silver 70 / Bronze 60 | `bpr_tier` pgEnum (D-05) stores the outcome; thresholds applied by Phase 16 `bprMedal()`. |
| METH-07 | Pre-ingest query refactors — `DISTINCT ON` + id lookup | §Query Refactor Patterns (DISTINCT ON + rubric-map id lookup) |

---

## Executive Summary (< 200 words)

Drizzle ORM 0.45.2 + drizzle-kit 0.31.10 are already installed. All required APIs exist in the local `node_modules`: `pgEnum`, `uniqueIndex(...).on(...).where(sql\`...\`)`, `check(name, sql\`...\`)` as a pgTable extras entry, and `db.selectDistinctOn([cols], fields).from(...).orderBy(...)`. No package install is needed for Phase 15.

**Critical risks for the planner:**
1. `drizzle-kit generate` has a documented history (issues #3349, #461, #2506, #4727) of producing incorrect SQL for partial index WHERE predicates. Plan must **inspect the generated migration** and, if the `WHERE superseded = false` clause is missing, hand-edit the SQL file before running `db:push` / migrate. This is a known, recurring gap — not a one-off bug.
2. Existing `tech_benchmark_tests` seed rows need in-migration `UPDATE` to populate the new `discipline` + `mode` columns before the NOT NULL constraint applies (D-10). The seed script then appends new rows via `ON CONFLICT DO NOTHING` on the natural-key index `(template_id, discipline, mode, name)`.
3. `tech_benchmark_runs` is empty in production (Mac returns 2026-04-25), so the partial UNIQUE and new NOT NULL columns can land in one transaction without backfill.

**Primary recommendation:** one migration file (`0003_methodology_lock.sql`) authored via `pnpm db:generate`, then **manually verified** for the partial index WHERE clause and the CHECK constraint before apply. Seed runs as `pnpm tsx src/db/seeds/rubric-v1.1.ts` and is idempotent. Query refactors use `db.selectDistinctOn(...)` (confirmed present in `node_modules/drizzle-orm/pg-core/db.d.ts:198-199`).

---

## Drizzle 0.45.x / drizzle-kit 0.31.x Syntax Cheatsheet

All snippets verified against the installed `node_modules` type declarations. File paths cited for audit.

### 1. pgEnum

Already the project's pattern (13 uses in `src/db/schema.ts:621-636`). Follow existing convention: lowercase snake-case enum name, PascalCase `...Enum` TS export, column helper calls the enum as a function.

```typescript
// src/db/schema.ts — append after techBenchmarkDirectionEnum (line 636)

export const techBenchmarkModeEnum = pgEnum("benchmark_mode", [
  "ac",
  "battery",
  "both",
])

export const techBenchmarkDisciplineEnum = pgEnum("benchmark_discipline", [
  "cpu", "gpu", "llm", "video", "dev", "python", "games",
  "memory", "storage", "thermal", "wireless", "display", "battery_life",
])

export const techBprTierEnum = pgEnum("bpr_tier", [
  "platinum", "gold", "silver", "bronze",
])

export const techDisciplineExclusionReasonEnum = pgEnum(
  "discipline_exclusion_reason",
  ["no_hardware", "requires_license", "device_class_exempt", "test_failed"],
)
```

drizzle-kit emits `CREATE TYPE <name> AS ENUM (...)` automatically. Existing 0002 migration wraps enum CREATE in `DO $$ ... IF NOT EXISTS ... $$`; follow that pattern if the generated SQL is re-applied defensively.

### 2. Partial Unique Index with WHERE Predicate

API present at `node_modules/drizzle-orm/pg-core/indexes.d.ts:67` (`.where(condition: SQL): this`) and `:78` (`export declare function uniqueIndex(name?: string): IndexBuilderOn`).

```typescript
import { uniqueIndex, pgTable, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const techBenchmarkRuns = pgTable("tech_benchmark_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => techProducts.id, { onDelete: "cascade" }),
  testId: uuid("test_id").notNull().references(() => techBenchmarkTests.id, { onDelete: "cascade" }),
  mode: techBenchmarkModeEnum("mode").notNull(),
  runUuid: uuid("run_uuid").notNull(),
  superseded: boolean("superseded").notNull().default(false),
  // ... other columns
}, (t) => ({
  liveUniq: uniqueIndex("tech_benchmark_runs_live_uniq")
    .on(t.productId, t.testId, t.mode, t.runUuid)
    .where(sql`${t.superseded} = false`),
}))
```

⚠️ **drizzle-kit partial-index SQL generation is historically buggy** (see §Known drizzle-kit Gaps). The expected generated SQL:

```sql
CREATE UNIQUE INDEX "tech_benchmark_runs_live_uniq"
  ON "tech_benchmark_runs" ("product_id", "test_id", "mode", "run_uuid")
  WHERE "superseded" = false;
```

If drizzle-kit drops the `WHERE` clause, the planner MUST hand-edit `0003_*.sql`.

### 3. CHECK Constraint in `pgTable` extras

API present at `node_modules/drizzle-orm/pg-core/checks.d.ts:18` (`export declare function check(name: string, value: SQL): CheckBuilder`).

```typescript
import { check, pgTable } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const techReviews = pgTable("tech_reviews", {
  // ... existing columns (see schema.ts:717-743)
  bprScore: numeric("bpr_score", { precision: 5, scale: 4 }),
  bprTier: techBprTierEnum("bpr_tier"),
  rubricVersion: text("rubric_version").notNull().default("1.1"),
}, (t) => ({
  publishedAtChk: check(
    "tech_reviews_published_at_chk",
    sql`${t.status} != 'published' OR ${t.publishedAt} IS NOT NULL`,
  ),
}))
```

Generated SQL:
```sql
ALTER TABLE "tech_reviews" ADD CONSTRAINT "tech_reviews_published_at_chk"
  CHECK ("status" != 'published' OR "published_at" IS NOT NULL);
```

**Ordering guarantee:** No backfill needed — zero rows in `tech_reviews` currently have `status = 'published' AND published_at IS NULL` (no published reviews exist yet in v2.0 — tech reviews draft-only until Phase 19). Verify once with:
```sql
SELECT count(*) FROM tech_reviews WHERE status = 'published' AND published_at IS NULL;
-- expected: 0
```
If ever non-zero (shouldn't be), `UPDATE tech_reviews SET published_at = updated_at WHERE status='published' AND published_at IS NULL;` must run BEFORE the CHECK constraint.

### 4. DISTINCT ON (Drizzle)

API present at `node_modules/drizzle-orm/pg-core/db.d.ts:198-199`:
```typescript
selectDistinctOn(on: (PgColumn | SQLWrapper)[]): PgSelectBuilder<undefined>
selectDistinctOn<T extends SelectedFields>(on: (PgColumn | SQLWrapper)[], fields: T): PgSelectBuilder<T>
```

Canonical pattern (for the refactor of `getBenchmarkRunsForProducts`):

```typescript
import { asc, desc, eq, inArray, and } from "drizzle-orm"
import { db } from "@/db/client"
import { techBenchmarkRuns, techBenchmarkTests } from "@/db/schema"

const rows = await db
  .selectDistinctOn(
    [techBenchmarkRuns.productId, techBenchmarkRuns.testId, techBenchmarkRuns.mode],
    {
      productId: techBenchmarkRuns.productId,
      testId: techBenchmarkTests.id,
      testName: techBenchmarkTests.name,
      unit: techBenchmarkTests.unit,
      direction: techBenchmarkTests.direction,
      mode: techBenchmarkRuns.mode,
      score: techBenchmarkRuns.score,
      recordedAt: techBenchmarkRuns.recordedAt,
      sortOrder: techBenchmarkTests.sortOrder,
    },
  )
  .from(techBenchmarkRuns)
  .innerJoin(techBenchmarkTests, eq(techBenchmarkRuns.testId, techBenchmarkTests.id))
  .where(and(
    inArray(techBenchmarkRuns.productId, productIds),
    eq(techBenchmarkRuns.superseded, false),
  ))
  .orderBy(
    asc(techBenchmarkRuns.productId),
    asc(techBenchmarkRuns.testId),
    asc(techBenchmarkRuns.mode),
    desc(techBenchmarkRuns.recordedAt),
  )
```

**Postgres constraint the planner MUST honor:** `DISTINCT ON` columns must be the **leading** `ORDER BY` columns, in the same order as the `selectDistinctOn([...])` array, with the tie-breaker (`recorded_at DESC`) appended after. Getting this wrong raises:
```
ERROR: SELECT DISTINCT ON expressions must match initial ORDER BY expressions
```

### 5. Foreign Keys with ON DELETE CASCADE

Already the project's pattern (`src/db/schema.ts:721, 752, 759, 770`). For the new table:

```typescript
export const techReviewDisciplineExclusions = pgTable("tech_review_discipline_exclusions", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => techReviews.id, { onDelete: "cascade" }),
  discipline: techBenchmarkDisciplineEnum("discipline").notNull(),
  reason: techDisciplineExclusionReasonEnum("reason").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqPerReview: uniqueIndex("tech_review_discipline_exclusions_review_discipline_uniq")
    .on(t.reviewId, t.discipline),
}))
```

Plus a `relations()` entry:
```typescript
export const techReviewDisciplineExclusionsRelations = relations(
  techReviewDisciplineExclusions,
  ({ one }) => ({
    review: one(techReviews, {
      fields: [techReviewDisciplineExclusions.reviewId],
      references: [techReviews.id],
    }),
  }),
)
```

---

## Migration Workflow

### Commands

```bash
# 1. Generate SQL from schema diff (writes src/db/migrations/0003_*.sql + updates _journal.json)
pnpm db:generate

# 2. Inspect the generated file — see §Known drizzle-kit Gaps for what to verify
# 3. Apply
pnpm db:push            # dev: non-interactive push (project prefers this — see 0002 header comment)
# OR
pnpm drizzle-kit migrate  # prod: transactional apply of the numbered files
```

### Single-file layout

All schema changes land in **one** migration file, `src/db/migrations/0003_methodology_lock.sql` (next in sequence after `0002_glitch_tech_foundation.sql`). drizzle-kit emits enum CREATEs, ALTER TABLEs, new CREATE TABLEs, and index/constraint additions in that order within the same file. No benefit to splitting — the migration is a single atomic unit.

Expected SQL order (drizzle-kit emits in this order):
1. `CREATE TYPE "benchmark_mode" AS ENUM (...)`
2. `CREATE TYPE "benchmark_discipline" AS ENUM (...)`
3. `CREATE TYPE "bpr_tier" AS ENUM (...)`
4. `CREATE TYPE "discipline_exclusion_reason" AS ENUM (...)`
5. `ALTER TABLE "tech_benchmark_tests" ADD COLUMN ...` (5 columns — see §Schema Delta)
6. In-migration `UPDATE tech_benchmark_tests SET discipline = ..., mode = ...` (MUST BE ADDED BY HAND — drizzle-kit does not emit data migrations)
7. `ALTER TABLE "tech_benchmark_runs" ADD COLUMN ...` (9 columns)
8. `ALTER TABLE "tech_reviews" ADD COLUMN ...` (3 columns)
9. `ALTER TABLE "tech_benchmark_templates" ADD COLUMN rubric_version ...` (1 column — only if planner decides to add, per research doc; NOT in METH-02 core list, verify in CONTEXT)
10. `CREATE TABLE "tech_review_discipline_exclusions" (...)`
11. `CREATE UNIQUE INDEX "tech_benchmark_runs_live_uniq" ... WHERE "superseded" = false` ⚠️ VERIFY WHERE PRESENT
12. `CREATE UNIQUE INDEX "tech_benchmark_tests_natural_key_uniq" ON "tech_benchmark_tests" ("template_id", "discipline", "mode", "name")`
13. `CREATE UNIQUE INDEX "tech_review_discipline_exclusions_review_discipline_uniq" ...`
14. `ALTER TABLE "tech_reviews" ADD CONSTRAINT "tech_reviews_published_at_chk" CHECK (...)` ⚠️ VERIFY PRESENT

### Known drizzle-kit Gaps (verify against generated SQL)

| Gap | Drizzle issue | Check in 0003_*.sql | Manual fix if missing |
|-----|---------------|---------------------|----------------------|
| Partial index `WHERE` clause dropped | #461, #3349, #2506, #4727 | Grep for `WHERE "superseded"` in the index CREATE | Hand-edit: append `WHERE "superseded" = false` |
| CHECK constraint not emitted on some versions | #229 (closed but historical) | Grep for `ADD CONSTRAINT "tech_reviews_published_at_chk"` | Append ALTER TABLE ADD CONSTRAINT by hand |
| Data migrations (UPDATEs) never emitted | — (by design) | The `UPDATE tech_benchmark_tests SET discipline = ...` is NEVER emitted | Hand-add between column ADDs (step 6 above) |

**drizzle-kit 0.31.x status:** partial index `.where()` is syntactically supported in drizzle-orm's typed schema (confirmed in node_modules), but SQL emission for partial indexes has had regressions across multiple 0.2x/0.3x releases. **Assume manual verification is required** — this is the planner's first task after `db:generate`.

### Historical project pattern

`src/db/migrations/0002_glitch_tech_foundation.sql:1-4` notes explicitly that drizzle-kit generate hit an interactive-prompt block, so Phase 07.5 used direct `postgres-js` push and hand-mirrored the SQL. This confirms hand-editing generated SQL is an established, accepted pattern in this repo.

### `tech_benchmark_tests` column-add + backfill ordering

Per D-10: existing seed rows must have `discipline` populated before the NOT NULL constraint applies (note: CONTEXT leaves `discipline` nullable per research SUMMARY line 87 — but the enum-typed column in D-04 implies the planner will decide. The safest ordering that works either way):

```sql
-- 1) Add columns nullable first
ALTER TABLE tech_benchmark_tests
  ADD COLUMN mode benchmark_mode DEFAULT 'both' NOT NULL,
  ADD COLUMN discipline benchmark_discipline,   -- nullable initially
  ADD COLUMN bpr_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN min_ram_gb integer;

-- 2) Backfill discipline for existing (seeded) rows by mapping from name/template.
--    Existing rows are from Phase 07.5 admin scaffolding; shape known from schema.ts:788-800.
--    Planner inspects current rows and writes the UPDATE statements. Example pattern:
UPDATE tech_benchmark_tests
   SET discipline = CASE
     WHEN name ILIKE '%geekbench%' OR name ILIKE '%cinebench%' THEN 'cpu'
     WHEN name ILIKE '%3dmark%' OR name ILIKE '%blender%'       THEN 'gpu'
     -- ... etc
   END
 WHERE discipline IS NULL;

-- 3) Apply NOT NULL only after seed runs the first time (safer: keep nullable forever;
--    rely on seed + app-layer validation to guarantee non-null on new rows).
```

**Recommendation for planner:** keep `discipline` nullable at the DB level (matches research SUMMARY line 87). Enum-typed + nullable is legal. The rubric seed guarantees all new rows set it; existing rows get populated by the in-migration UPDATE. This avoids a fragile NOT NULL race during migration.

---

## Rubric v1.1 Discipline × Test Row Matrix

The seed inserts one `tech_benchmark_tests` row per discipline × tool × field × mode combination. The Phase 16 ingest JSONL matches `(header.discipline, header.tool, data.field)` against `RUBRIC_V1_1[<key>]` and finds the corresponding `tech_benchmark_tests.id`.

**Canonical key shape (D-15):** `"<discipline>:<tool>:<field>"` — lowercase, colon-separated, no spaces. Examples: `"cpu:geekbench6:multi"`, `"gpu:3dmark:wild_life_extreme"`, `"llm:llama_bench:tg128"`.

**`mode` semantics on tests:** `'both'` = this test is run in both AC and battery modes (BPR-eligible 7 disciplines). `'ac'` = AC-only. `'battery'` = battery-only. The `tech_benchmark_runs.mode` for a given run is always `'ac'` or `'battery'` (never `'both'`). One test row with `mode='both'` spawns two runs (one per mode) per ingest session.

### Full row list — Rubric v1.1

Legend: `HIB` = higher_is_better, `LIB` = lower_is_better. `sortOrder` is discipline-ordered (CPU=100s, GPU=200s, etc.) so leaderboard columns land in a predictable sequence.

**CPU — discipline='cpu', mode='both' (BPR-eligible)** — §3.1 of 00_README

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `cpu:geekbench6:multi` | geekbench6 | multi | Geekbench 6 Multi-Core | score | HIB | 101 |
| `cpu:geekbench6:single` | geekbench6 | single | Geekbench 6 Single-Core | score | HIB | 102 |
| `cpu:cinebench2024:multi` | cinebench2024 | multi | Cinebench 2024 Multi | score | HIB | 103 |
| `cpu:cinebench2024:single` | cinebench2024 | single | Cinebench 2024 Single | score | HIB | 104 |
| `cpu:hyperfine:ripgrep_cargo` | hyperfine | ripgrep_cargo_mean_s | ripgrep cargo (mean) | seconds | LIB | 105 |

**GPU — discipline='gpu', mode='both' (BPR-eligible)** — §3.2

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `gpu:3dmark:wild_life_extreme` | 3dmark | wild_life_extreme | 3DMark Wild Life Extreme | score | HIB | 201 |
| `gpu:3dmark:steel_nomad_light` | 3dmark | steel_nomad_light | 3DMark Steel Nomad Light | score | HIB | 202 |
| `gpu:3dmark:solar_bay` | 3dmark | solar_bay | 3DMark Solar Bay | score | HIB | 203 |
| `gpu:blender:monster` | blender | monster_samples_per_min | Blender Monster | samples/min | HIB | 204 |
| `gpu:blender:classroom` | blender | classroom_samples_per_min | Blender Classroom | samples/min | HIB | 205 |

**LLM — discipline='llm', mode='both' (BPR-eligible)** — §3.4

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `llm:llama_bench:tg128` | llama_bench | tg128 | llama.cpp tg128 | tok/s | HIB | 401 |
| `llm:llama_bench:pp512` | llama_bench | pp512 | llama.cpp pp512 | tok/s | HIB | 402 |
| `llm:mlx_lm:tg128` | mlx_lm | tg128 | MLX-LM tg128 | tok/s | HIB | 403 |

**Video — discipline='video', mode='both' (BPR-eligible)** — §3.5

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `video:handbrake:h264_1080p` | handbrake | h264_1080p_fps | HandBrakeCLI H.264 1080p | fps | HIB | 501 |
| `video:handbrake:hevc_4k` | handbrake | hevc_4k_fps | HandBrakeCLI HEVC 4K | fps | HIB | 502 |
| `video:ffmpeg:av1_encode` | ffmpeg | av1_encode_fps | FFmpeg AV1 encode | fps | HIB | 503 |

**Dev / Compile — discipline='dev', mode='both' (BPR-eligible)** — §3.6

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `dev:cargo:build_release` | cargo | build_release_s | cargo build --release | seconds | LIB | 601 |
| `dev:xcodebuild:clean_build` | xcodebuild | clean_build_s | xcodebuild clean build | seconds | LIB | 602 |
| `dev:npm:tsc_cold` | npm | tsc_cold_s | tsc --noEmit (cold) | seconds | LIB | 603 |

**Python — discipline='python', mode='both' (BPR-eligible)** — §3.7

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `python:pyperformance:geomean` | pyperformance | geomean | pyperformance geomean | score | HIB | 701 |
| `python:pytorch_mps:train_resnet` | pytorch_mps | train_resnet_samples_per_s | PyTorch MPS ResNet train | samples/s | HIB | 702 |

**Games — discipline='games', mode='both' (BPR-eligible)** — §3.8

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `games:bg3:avg_fps` | bg3 | avg_fps | Baldur's Gate 3 (avg fps) | fps | HIB | 801 |
| `games:cyberpunk_gptk:avg_fps` | cyberpunk_gptk | avg_fps | Cyberpunk 2077 (GPTK, avg fps) | fps | HIB | 802 |

**Memory — discipline='memory', mode='ac'** — §3.3

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `memory:stream:triad` | stream | triad_gb_s | STREAM Triad | GB/s | HIB | 301 |
| `memory:stream:copy` | stream | copy_gb_s | STREAM Copy | GB/s | HIB | 302 |

**Storage — discipline='storage', mode='ac'** — §3.3

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `storage:amorphous:seq_read` | amorphous | seq_read_mb_s | AmorphousDiskMark Seq Read | MB/s | HIB | 311 |
| `storage:amorphous:seq_write` | amorphous | seq_write_mb_s | AmorphousDiskMark Seq Write | MB/s | HIB | 312 |
| `storage:amorphous:rnd4k_read` | amorphous | rnd4k_read_mb_s | AmorphousDiskMark Rnd 4K Read | MB/s | HIB | 313 |
| `storage:amorphous:rnd4k_write` | amorphous | rnd4k_write_mb_s | AmorphousDiskMark Rnd 4K Write | MB/s | HIB | 314 |

**Thermal — discipline='thermal', mode='ac'** — §3.9

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `thermal:cinebench_loop:score_retention_pct` | cinebench_loop | score_retention_pct | Cinebench 10-min loop retention | percent | HIB | 901 |
| `thermal:stress_ng:peak_package_c` | stress_ng | peak_package_c | stress-ng peak SoC temp | celsius | LIB | 902 |

**Battery Life — discipline='battery_life', mode='battery'** — §3.10

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `battery_life:video_loop:hours` | video_loop | hours | Video loop (local 1080p) | hours | HIB | 1001 |
| `battery_life:safari_youtube:hours` | safari_youtube | hours | Safari YouTube stream | hours | HIB | 1002 |
| `battery_life:web_rotation:hours` | web_rotation | hours | Web browsing rotation | hours | HIB | 1003 |
| `battery_life:cinebench_drain:hours_to_20pct` | cinebench_drain | hours_to_20pct | Cinebench drain → 20% | hours | HIB | 1004 |
| `battery_life:standby:drain_pct_per_8h` | standby | drain_pct_per_8h | Overnight standby drain | %/8h | LIB | 1005 |

**Wireless — discipline='wireless', mode='ac'** — §3.11

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `wireless:iperf3:wifi_down_mbps` | iperf3 | wifi_down_mbps | iperf3 Wi-Fi down | Mbps | HIB | 1101 |
| `wireless:iperf3:wifi_up_mbps` | iperf3 | wifi_up_mbps | iperf3 Wi-Fi up | Mbps | HIB | 1102 |
| `wireless:tb5:read_mb_s` | tb5 | read_mb_s | TB5 SSD read | MB/s | HIB | 1103 |
| `wireless:tb5:write_mb_s` | tb5 | write_mb_s | TB5 SSD write | MB/s | HIB | 1104 |

**Display — discipline='display', mode='ac'** — §3.12

| key | tool | field | name | unit | direction | sortOrder |
|---|---|---|---|---|---|---|
| `display:displaycal:delta_e_avg` | displaycal | delta_e_avg | DisplayCAL ΔE average | delta-E | LIB | 1201 |
| `display:displaycal:gamut_p3_pct` | displaycal | gamut_p3_pct | DisplayCAL P3 gamut | percent | HIB | 1202 |
| `display:lagom:contrast_ratio` | lagom | contrast_ratio | Lagom contrast ratio | ratio | HIB | 1203 |

**Total rows seeded:** 39 across 13 disciplines. The Laptops category template is the initial target (existing single template from Phase 07.5); additional category templates are out-of-scope for Phase 15.

> **Planner note:** This matrix is derived from rubric v1.1 as documented in `.planning/research/SUMMARY.md` §Locked Methodology Constants and ARCHITECTURE.md §13 Disciplines, cross-referenced with `00_README.md` §3.1–§3.13 (research HIGH confidence). The exact JSONL field names (`tg128`, `score_retention_pct`, etc.) must match what the Mac harness writes — **if the harness emits different keys**, the rubric-map keys adjust accordingly. Only the **CPU §3.1** JSONL has been captured; the other 12 disciplines' field names are inferred from the rubric pack names. **Low-confidence field names are flagged**: rows in Memory through Display should be spot-checked against the harness logging scripts before seeding if already available, or accepted as the rubric authority if the harness is built against this rubric (which CONTEXT D-14 implies — append-only policy means seed is the source of truth, harness adapts).

---

## Seed Idempotency Mechanism

### Natural-key unique index

Per D-13:
```sql
CREATE UNIQUE INDEX "tech_benchmark_tests_natural_key_uniq"
  ON "tech_benchmark_tests" ("template_id", "discipline", "mode", "name");
```

Drizzle form (in `techBenchmarkTests` extras):
```typescript
}, (t) => ({
  naturalKey: uniqueIndex("tech_benchmark_tests_natural_key_uniq")
    .on(t.templateId, t.discipline, t.mode, t.name),
}))
```

### Seed `ON CONFLICT DO NOTHING` pattern

```typescript
// src/db/seeds/rubric-v1.1.ts
import "dotenv/config"
import { db } from "@/db/client"
import { techBenchmarkTemplates, techBenchmarkTests, techCategories } from "@/db/schema"
import { RUBRIC_V1_1 } from "@/lib/tech/rubric-map"
import { and, eq, sql } from "drizzle-orm"

async function main() {
  // Locate the Laptops template (seeded in Phase 07.5)
  const [laptops] = await db.select({ id: techCategories.id })
    .from(techCategories).where(eq(techCategories.slug, "laptops")).limit(1)
  if (!laptops) throw new Error("Laptops category missing — run Phase 07.5 seed first")

  const [template] = await db.select({ id: techBenchmarkTemplates.id })
    .from(techBenchmarkTemplates).where(eq(techBenchmarkTemplates.categoryId, laptops.id)).limit(1)
  if (!template) throw new Error("Laptops benchmark template missing")

  const rows = Object.values(RUBRIC_V1_1).map((r) => ({
    templateId: template.id,
    discipline: r.discipline,
    mode: r.mode,
    name: r.name,
    unit: r.unit,
    direction: r.direction,
    sortOrder: r.sortOrder,
  }))

  const result = await db
    .insert(techBenchmarkTests)
    .values(rows)
    .onConflictDoNothing({
      target: [
        techBenchmarkTests.templateId,
        techBenchmarkTests.discipline,
        techBenchmarkTests.mode,
        techBenchmarkTests.name,
      ],
    })
    .returning({ id: techBenchmarkTests.id })

  const inserted = result.length
  const skipped = rows.length - inserted
  console.log(`Rubric v1.1 seed: inserted ${inserted}, skipped ${skipped}, total ${rows.length}`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
```

**Run command:** `pnpm tsx src/db/seeds/rubric-v1.1.ts` (per CONTEXT — `tsx` is installed, `erasable TypeScript` supported on Node v24 workspace-wide).

**Idempotency proof:** running twice yields `inserted 39, skipped 0` the first run and `inserted 0, skipped 39` on subsequent runs. No errors, exit 0 both times.

**Append-only guard (D-14):** seed **never** uses `onConflictDoUpdate`. A mistake in v1.1 means a new `src/db/seeds/rubric-v1.2.ts` with a new `rubric_version`, not an in-place edit.

---

## Query Refactor Patterns

### `getBenchmarkRunsForProducts` — DISTINCT ON refactor

Existing (`src/lib/tech/queries.ts:660-687`) uses a plain `SELECT ... ORDER BY testSortOrder, testName`. Problem: returns every historical run per product+test, breaking the compare tool after first ingest (see pitfall §B-1, §H-7, §I-1).

Refactored version (verified against `node_modules/drizzle-orm/pg-core/db.d.ts:198-199`):

```typescript
export async function getBenchmarkRunsForProducts(
  productIds: string[],
): Promise<PublicBenchmarkRun[]> {
  if (productIds.length === 0) return []

  const rows = await db
    .selectDistinctOn(
      [techBenchmarkRuns.productId, techBenchmarkRuns.testId, techBenchmarkRuns.mode],
      {
        productId: techBenchmarkRuns.productId,
        testId: techBenchmarkTests.id,
        testName: techBenchmarkTests.name,
        unit: techBenchmarkTests.unit,
        direction: techBenchmarkTests.direction,
        mode: techBenchmarkRuns.mode,
        score: techBenchmarkRuns.score,
        recordedAt: techBenchmarkRuns.recordedAt,
        sortOrder: techBenchmarkTests.sortOrder,
      },
    )
    .from(techBenchmarkRuns)
    .innerJoin(techBenchmarkTests, eq(techBenchmarkRuns.testId, techBenchmarkTests.id))
    .where(and(
      inArray(techBenchmarkRuns.productId, productIds),
      eq(techBenchmarkRuns.superseded, false),
    ))
    .orderBy(
      asc(techBenchmarkRuns.productId),
      asc(techBenchmarkRuns.testId),
      asc(techBenchmarkRuns.mode),
      desc(techBenchmarkRuns.recordedAt),
    )

  // The compare tool currently consumes rows grouped by (productId, testId).
  // Returning mode in the row shape is backward-compatible — compare UI can ignore it
  // or filter to mode='ac' for display. Planner decides whether compare needs updating
  // in this phase or only in Phase 18 leaderboard work.
  return rows.map((r) => ({
    productId: r.productId,
    testId: r.testId,
    testName: r.testName,
    unit: r.unit,
    direction: r.direction,
    mode: r.mode,                // NEW — consumers must decide how to use
    score: Number(r.score),
    recordedAt: r.recordedAt,
  }))
}
```

**Return-shape consideration:** the existing `PublicBenchmarkRun` type does not include `mode`. The planner MUST either (a) add `mode` to the interface and update the compare page to filter `mode === 'ac'`, or (b) filter to `mode = 'ac'` in the query itself and keep the shape unchanged. **Recommendation: (b)** — since compare is AC-only by editorial convention (ARCHITECTURE.md line 313), filter to `mode='ac'` at the query and leave the public shape alone. Then the refactor is invisible to consumers.

If the planner chooses (b), the query becomes:
```typescript
.where(and(
  inArray(techBenchmarkRuns.productId, productIds),
  eq(techBenchmarkRuns.superseded, false),
  eq(techBenchmarkRuns.mode, "ac"),
))
// and the DISTINCT ON drops the mode column:
.selectDistinctOn([techBenchmarkRuns.productId, techBenchmarkRuns.testId], { ... })
.orderBy(asc(techBenchmarkRuns.productId), asc(techBenchmarkRuns.testId), desc(techBenchmarkRuns.recordedAt))
```

### `getBenchmarkSpotlight` — rubric-map id lookup

Existing (`src/lib/tech/queries.ts:728-740`) uses `ilike(techBenchmarkTests.name, "%Geekbench 6 Multi%")` — breaks if test renames (pitfall §I-2).

Refactored:
```typescript
import { RUBRIC_V1_1 } from "@/lib/tech/rubric-map"

export async function getBenchmarkSpotlight(): Promise<BenchmarkSpotlight | null> {
  // Resolve test id once via the rubric-map canonical key.
  const spotlightEntry = RUBRIC_V1_1["cpu:geekbench6:multi"]
  if (!spotlightEntry) return null

  // Look up the test row by natural key (template-scoped).
  // For v3.0 Laptops-only, a single-row lookup by (discipline, mode, name) is safe:
  const [spotlightTest] = await db
    .select({ id: techBenchmarkTests.id })
    .from(techBenchmarkTests)
    .where(and(
      eq(techBenchmarkTests.discipline, "cpu"),
      eq(techBenchmarkTests.mode, "both"),                 // CPU test row is 'both' (ingest produces ac + battery runs)
      eq(techBenchmarkTests.name, spotlightEntry.name),
    ))
    .limit(1)
  if (!spotlightTest) return null

  // Top AC run for this test, scoped to products with published reviews.
  const [candidate] = await db
    .select({ productId: techBenchmarkRuns.productId, score: techBenchmarkRuns.score })
    .from(techBenchmarkRuns)
    .innerJoin(techReviews, and(
      eq(techReviews.productId, techBenchmarkRuns.productId),
      eq(techReviews.status, "published"),
    ))
    .where(and(
      eq(techBenchmarkRuns.testId, spotlightTest.id),
      eq(techBenchmarkRuns.mode, "ac"),
      eq(techBenchmarkRuns.superseded, false),
    ))
    .orderBy(desc(techBenchmarkRuns.score))
    .limit(1)

  if (!candidate) return null
  // ... rest of existing function body (productRow / topRuns) unchanged
}
```

Renaming a test in `tech_benchmark_tests` no longer breaks the spotlight — the rubric-map constant is the source of truth.

---

## /tech/compare Regression Verification Strategy

**Context:** no existing Playwright spec targets `/tech/compare` rendering behaviour. The only references in `tests/` are navigation-link presence checks in `07.4-brand-architecture.spec.ts`. The planner must pick a verification approach.

### Lightest viable approach (recommended)

1. **TypeScript & lint gate:**
   ```bash
   pnpm tsc --noEmit
   pnpm lint
   ```
   These catch type regressions on the refactored query (new `mode` column, changed signatures). This is the first gate.

2. **Manual data seed + Playwright smoke:** seed two published products with a few benchmark runs (one `ac` + one `battery` per test) and assert the page renders without error + the benchmark table shows the seeded rows exactly once.

   Create a new throwaway script `src/db/seeds/_phase15-compare-fixtures.ts` (prefix underscore signals it is a migration-time fixture, not a permanent seed). It inserts:
   - Two minimal `tech_products` rows (e.g., `"MBP 16 M5 Max"` and `"MBP 14 M4 Pro"`) with a Laptops category reference
   - A published `tech_reviews` row per product (`status='published', published_at=NOW()`)
   - Two `tech_benchmark_runs` per product for `cpu:geekbench6:multi` (one `mode='ac'`, one `mode='battery'`, both `superseded=false`, same `run_uuid`)

   Plus a Playwright spec `tests/15-compare-regression.spec.ts`:
   ```typescript
   import { test, expect } from "@playwright/test"

   test("/tech/compare renders benchmark table without regression", async ({ page }) => {
     await page.goto("/tech/compare?a=mbp-16-m5max&b=mbp-14-m4pro")
     await expect(page.getByText("Geekbench 6 Multi-Core")).toBeVisible()
     // Exactly two cells — one per product — NOT four (which would indicate duplicate rows)
     const scoreCells = page.locator('[data-testid="benchmark-score"]')
     await expect(scoreCells).toHaveCount(2)
   })
   ```

3. **Command sequence for the planner:**
   ```bash
   pnpm tsc --noEmit                                         # gate 1: types
   pnpm lint                                                  # gate 2: lint
   pnpm tsx src/db/seeds/_phase15-compare-fixtures.ts         # seed fixtures
   pnpm playwright test tests/15-compare-regression.spec.ts   # gate 3: smoke
   ```

### Alternative (simpler, no Playwright)

If Playwright setup slows the phase: replace step 3 with a **runtime assertion script** that calls `getBenchmarkRunsForProducts([id1, id2])` directly and asserts `result.length === 2` (not 4). This avoids booting Next.js at all:

```typescript
// src/db/seeds/_phase15-compare-assert.ts
import { getBenchmarkRunsForProducts } from "@/lib/tech/queries"
const rows = await getBenchmarkRunsForProducts([id1, id2])
const duplicatePairs = rows.filter((r, i, a) =>
  a.findIndex(x => x.productId === r.productId && x.testId === r.testId) !== i
)
if (duplicatePairs.length > 0) {
  console.error("REGRESSION: duplicate (productId, testId) pairs:", duplicatePairs)
  process.exit(1)
}
console.log(`OK: ${rows.length} canonical rows, no duplicates`)
process.exit(0)
```

**Recommendation for planner:** ship both gates 1+2 and the runtime assertion script (fast, no flake). Add the Playwright spec only if plan 03 has budget — it's valuable but not blocking for Phase 15 sign-off per D-18 wording ("Playwright smoke on `/tech/compare`" — planner may interpret as assertion or spec).

### CodeBox constraint reminder (from CLAUDE.md)

Do NOT run `next build` as part of verification. Use `pnpm tsc --noEmit` and `pnpm lint` only. `next build` takes ~2GB RAM and 300% CPU — forbidden under CodeBox resource rules.

---

## Naming Reconciliation: Exclusions Table

**ROADMAP (line 51)** and **research ARCHITECTURE** use `tech_benchmark_exclusions` with `(product_id, test_id, reason_enum, notes)` — per-test granularity.

**CONTEXT D-20** uses `tech_review_discipline_exclusions` with `(review_id, discipline, reason, notes)` — per-discipline, per-review granularity.

These are **semantically different tables**. The CONTEXT shape is **correct** for METH-02 because:

1. Exclusion is a **review-time editorial decision** ("this review does not cover GPU because Mac has no discrete GPU"), not a per-benchmark-run event.
2. REQ METH-02 explicitly names `tech_review_discipline_exclusions` with `(review_id, discipline, reason, notes)`.
3. Phase 16 (BPR computation) excludes entire disciplines from the BPR rollup, not individual tests — so the exclusion key is `(review_id, discipline)` not `(product_id, test_id)`.

**Planner decision: use D-20 / CONTEXT shape — `tech_review_discipline_exclusions`** with the full schema in D-20 above. The roadmap wording `tech_benchmark_exclusions` is a roadmap-phase label (pre-decision); REQUIREMENTS is authoritative and uses the correct name.

**Flag this discrepancy in plan 01's commit message** so future readers know the table name choice was deliberate.

---

## Pitfalls Specific to This Migration

### P-1: Partial index WHERE clause silently dropped

**What goes wrong:** drizzle-kit generate emits the CREATE UNIQUE INDEX without the `WHERE superseded = false` clause. Migration runs. Index is now full-unique — rejects the valid case where a row is superseded and a new live row exists for the same `(product_id, test_id, mode, run_uuid)`.

**How to detect:** `grep "WHERE" src/db/migrations/0003_*.sql` — expect at least one match for the `tech_benchmark_runs_live_uniq` line. If absent, hand-edit.

**Fix:** Append ` WHERE "superseded" = false` to the CREATE UNIQUE INDEX statement in the migration file, then proceed to `db:push`.

### P-2: CHECK constraint pre-existing rows violation

**What goes wrong:** any existing `tech_reviews` row with `status = 'published' AND published_at IS NULL` blocks the CHECK constraint from applying. Migration fails with `CheckConstraintViolation`.

**How to detect (pre-migration):**
```sql
SELECT id, slug, status, published_at FROM tech_reviews
  WHERE status = 'published' AND published_at IS NULL;
```
Expected result: 0 rows (no tech reviews are published yet in v2.0).

**Fix if ever nonzero:** add an in-migration `UPDATE tech_reviews SET published_at = updated_at WHERE status='published' AND published_at IS NULL` BEFORE the `ADD CONSTRAINT`.

### P-3: `tech_benchmark_tests.discipline` UPDATE miscategorization

**What goes wrong:** the in-migration UPDATE that populates `discipline` for existing seed rows uses name-pattern heuristics. If an existing seed row has an ambiguous name (e.g., `"CPU/GPU Combined Score"`), it falls into the wrong bucket.

**Fix:** the planner inspects the current `tech_benchmark_tests` rows BEFORE writing the migration and uses exact-match `WHERE name = '...'` UPDATE clauses rather than `ILIKE` heuristics. If the existing seed has very few rows (likely < 10 from Phase 07.5 scaffolding), enumerate them explicitly.

**Alternative (safer):** keep `discipline` nullable at the DB level permanently. The rubric seed guarantees new rows have it. Any existing rows stay NULL and get categorized manually via admin UI later. Matches research SUMMARY.md line 87.

### P-4: Enum value added without `ALTER TYPE ... ADD VALUE`

**What goes wrong:** future rubric v1.2 wants to add a 14th discipline. Drizzle 0.45.x migration for enum value ADD is awkward — `ALTER TYPE` cannot run inside a transaction for some cases. Not a Phase 15 problem, but the planner should document that `benchmark_discipline` additions require a standalone migration file in the future.

**Fix:** no action for Phase 15. Add a note to the rubric-map module header warning future maintainers.

### P-5: `run_uuid` NOT NULL on existing empty table

**What goes wrong:** if `tech_benchmark_runs` somehow has rows (it shouldn't per D-10), the `ADD COLUMN run_uuid uuid NOT NULL` without a default fails.

**Fix (defensive):** check before migration: `SELECT count(*) FROM tech_benchmark_runs;` — expected 0. If nonzero, either add a one-time `DEFAULT gen_random_uuid()` in the ADD COLUMN and then drop the default, or backfill manually.

### P-6: Migration order for NOT NULL columns

**What goes wrong:** adding `mode benchmark_mode NOT NULL` before the enum type is created fails. drizzle-kit emits types before tables, so this should be safe, but verify SQL file order.

**Fix:** inspect generated SQL — ensure all `CREATE TYPE` precede all `ALTER TABLE ... ADD COLUMN ...<type>`.

### P-7: `sortOrder` collisions in rubric seed

**What goes wrong:** if the existing Phase 07.5 seed already has `tech_benchmark_tests` rows with `sortOrder` in the 100s, the new rubric seed's `101, 102, ...` collides. Non-fatal (sortOrder is not UNIQUE), but causes display ordering surprises.

**Fix:** Planner decides whether to (a) bump rubric seed sortOrders to 10000+ range to avoid collisions, or (b) accept that ordering follows insertion order where ties exist. Recommend (a) — reserve 100–9999 for legacy/manual admin-created rows, 10000+ for rubric-seeded rows.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| drizzle-orm | Schema + query refactors | ✓ | 0.45.2 | — |
| drizzle-kit | Migration generation | ✓ | 0.31.10 | Manual SQL authoring (project precedent in `0002_*.sql`) |
| tsx | Seed execution | ✓ | 4.21.0 (devDep) | `node --experimental-strip-types` per workspace CLAUDE.md |
| Neon Postgres | DB | ✓ | — | — (project-wide lock-in) |
| Playwright | `/tech/compare` regression | ✓ | 1.58.2 | Runtime assertion script (§Regression Verification) |
| pnpm | Install + scripts | ✓ | (project-wide) | — (workspace mandate) |
| @tanstack/react-table | Leaderboard table | ✗ (planned Phase 18) | — | N/A for Phase 15 |
| `toggle-group` (shadcn) | Leaderboard UI | ✗ (planned Phase 18) | — | N/A for Phase 15 |

**Missing dependencies with no fallback:** none for Phase 15.

**Missing dependencies with fallback:** none — all required tooling is installed.

---

## Project Constraints (from CLAUDE.md)

- **pnpm only** — never npm or yarn. Migration commands use `pnpm db:generate`, `pnpm db:push`.
- **No `next build` in parallel or in verification** — 2GB RAM, 300% CPU, CodeBox cannot afford. Use `pnpm tsc --noEmit` + `pnpm lint` for type/lint gate.
- **Node v24 + erasable TypeScript** — `tsx` is fine, so is `node --experimental-strip-types`. No compile step needed.
- **No emojis in code/files** unless user explicitly requests.
- **GSD workflow enforcement** — file-changing tools only inside a GSD phase execution. Plan 01–03 satisfy this.
- **No committed secrets, .env files** — migration script reads from `process.env.DATABASE_URL` (already conventional).
- **Drizzle + Neon locked in** (CLAUDE.md stack table). No ORM alternatives considered.

---

## Confidence Breakdown

| Area | Level | Reason |
|------|-------|--------|
| Drizzle 0.45.x syntax (pgEnum, uniqueIndex, check, selectDistinctOn) | HIGH | Verified against installed `node_modules/drizzle-orm/**/*.d.ts` — see file:line citations throughout |
| drizzle-kit partial-index WHERE generation reliability | MEDIUM-LOW | Multiple GitHub issues (#461, #3349, #2506, #4727) document recurring regressions across 0.2x/0.3x. Plan assumes manual verification needed. |
| Rubric v1.1 discipline × test matrix (CPU rows) | HIGH | CPU §3.1 captured from actual Mac bench session; keys match JSONL emission |
| Rubric matrix (remaining 12 disciplines) | MEDIUM | Derived from `00_README.md` §3.2–§3.13 rubric names; JSONL field names inferred from pack, not yet emitted by harness. Planner accepts as rubric authority per D-14 append-only policy. |
| Seed idempotency via `onConflictDoNothing` on natural-key | HIGH | Drizzle API verified; pattern is standard |
| `/tech/compare` regression strategy | MEDIUM | No prior compare regression spec exists; planner picks between Playwright spec and runtime assertion |
| Table name reconciliation (`tech_review_discipline_exclusions`) | HIGH | REQUIREMENTS.md METH-02 authoritative; ROADMAP wording is phase-label, not requirement |
| Existing empty state of `tech_benchmark_runs` | HIGH | D-10 + STATE.md confirm Mac bench hasn't run against this DB |
| CHECK constraint safety (no published reviews yet) | HIGH | v2.0 shipped tech reviews as draft-only; verifiable via single SELECT before apply |

---

## Sources

### Primary (HIGH confidence — file:line citations)
- `node_modules/drizzle-orm/pg-core/db.d.ts:188-199` — `selectDistinctOn` signature
- `node_modules/drizzle-orm/pg-core/indexes.d.ts:67,78` — `uniqueIndex(...).where(SQL)` API
- `node_modules/drizzle-orm/pg-core/checks.d.ts:18` — `check(name, sql)` API
- `src/db/schema.ts:621-814` — existing tech enums and tables; pgEnum pattern (13 existing enums)
- `src/db/migrations/0002_glitch_tech_foundation.sql:1-50` — existing migration style (idempotent DO $$ wrappers); manual-edit precedent
- `src/lib/tech/queries.ts:660-687` — existing `getBenchmarkRunsForProducts`
- `src/lib/tech/queries.ts:728-777` — existing `getBenchmarkSpotlight` (`ilike` pattern to replace)
- `drizzle.config.ts:1-11` — migration output dir = `./src/db/migrations`
- `.planning/phases/15-methodology-lock-schema/15-CONTEXT.md` — 23 locked decisions (D-01..D-23)
- `.planning/research/SUMMARY.md` §Locked Methodology Constants, §Schema Changes Required, §13 Disciplines
- `.planning/research/ARCHITECTURE.md` — schema deltas, rubric-map shape, JSONL header format
- `.planning/research/PITFALLS.md` §B-1, §B-3, §B-4, §H-7, §I-1, §I-2, §L-2
- `.planning/REQUIREMENTS.md` §METH-01..METH-07
- `.planning/ROADMAP.md` §Phase 15
- `package.json` — confirms drizzle-orm ^0.45.1 (installed 0.45.2), drizzle-kit ^0.31.10, tsx 4.21.0, @playwright/test 1.58.2
- `~/workspaces/_scratch/glitchtech-bench-mac/00_README.md` §3.1–§3.13 — 13-discipline rubric source

### Secondary (MEDIUM confidence — cross-referenced)
- [Drizzle ORM Indexes & Constraints](https://orm.drizzle.team/docs/indexes-constraints) — partial index `.where()` documented
- [Drizzle ORM v0.31.0 release](https://orm.drizzle.team/docs/latest-releases/drizzle-orm-v0310) — new index API with `.where()` clause

### Tertiary (LOW confidence / flag for validation)
- [drizzle-team/drizzle-orm#3349](https://github.com/drizzle-team/drizzle-orm/issues/3349) — partial unique index WHERE generation bug
- [drizzle-team/drizzle-orm#4727](https://github.com/drizzle-team/drizzle-orm/issues/4727) — `CREATE UNIQUE INDEX ... WHERE` feature request
- [drizzle-team/drizzle-kit-mirror#461](https://github.com/drizzle-team/drizzle-kit-mirror/issues/461) — partial unique index invalid WHERE clause
- [drizzle-team/drizzle-orm#2506](https://github.com/drizzle-team/drizzle-orm/issues/2506) — drizzle-kit generate unique index bug
- [drizzle-team/drizzle-orm#229](https://github.com/drizzle-team/drizzle-orm/issues/229) — historic CHECK constraint feature request (closed, kept for context)

These issues document known drizzle-kit regressions. Mark as authoritative only when symptoms match; otherwise treat generated SQL as correct.

---

## Metadata

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stable Drizzle 0.45.x line; re-verify if upgrading past 0.46 or drizzle-kit 0.32)
**Planner-facing readiness:** READY — 3 plans (migration DDL, rubric seed + map, query refactor + verification) have concrete code patterns, decision scope is fully locked, and all drizzle-kit quirks are flagged with manual remediation paths.

## RESEARCH COMPLETE
