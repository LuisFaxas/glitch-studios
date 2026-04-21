# Architecture: v3.0 GlitchTek Launch — Integration Design

**Project:** Glitch Studios / GlitchTek
**Researched:** 2026-04-20
**Scope:** New capabilities layered on top of v2.0 Phases 7.4/7.5/7.6 shipped code
**Source:** schema.ts, queries.ts, all admin-tech-*.ts, benchmark logging.sh, 00_README.md

---

## What Actually Exists (Confirmed from Source)

### `tech_benchmark_templates` (schema.ts lines 779-786)

Columns: `id`, `categoryId` (unique FK to techCategories), `createdAt`

Missing: no `rubric_version`, no discipline grouping, no version identifier.

### `tech_benchmark_tests` (schema.ts lines 788-800)

Columns: `id`, `templateId` (FK), `name`, `unit`, `direction` (higher_is_better | lower_is_better), `sortOrder`, `createdAt`

Missing: no `mode` (ac/battery) column, no `discipline` column, no `bpr_eligible` flag.

### `tech_benchmark_runs` (schema.ts lines 802-814)

Columns: `id`, `productId` (FK), `testId` (FK), `score` (numeric 14,4), `notes`, `recordedAt`, `createdBy` (FK to user)

Missing: no `mode` (ac|battery) column, no `source_file`, no `ingest_batch_id`.

### `tech_reviews` (schema.ts lines 717-744)

No `bpr_score` column. No `bpr_tier` column.

### `blogPosts` and `blogCategories` (schema.ts lines 148-171)

No `brand` discriminator column on either table.

### JSONL Format (Confirmed from logging.sh)

File naming: `${discipline}-${tool}-${ISO8601timestamp}.jsonl`
Example: `cpu-geekbench6-2026-04-20T14:30:00+00:00.jsonl`

Line 1 — header (always present, always first):
```json
{"_header":true,"discipline":"cpu","tool":"geekbench6","timestamp":"2026-04-20T14:30:00+00:00","macos_build":"24F74","hostname":"CPRs-MacBook-Pro","rubric_version":"1.1"}
```

Lines 2+ — data lines (variable schema per discipline/tool):
```json
{"run":1,"multi":29180,"single":3842}
```

Data field names vary by tool. The `header.discipline` + `header.tool` fields are the ingest key for matching to rubric tests.

### 13 Disciplines (from 00_README.md) + BPR Eligibility

| Section | Discipline | AC/Battery Split? |
|---------|------------|-------------------|
| 3.1 | CPU (Geekbench 6, Cinebench 2024, hyperfine/ripgrep) | YES |
| 3.2 | GPU (3DMark Wild Life Extreme / Steel Nomad / Solar Bay, Blender) | YES |
| 3.3 | Memory + Storage (STREAM, AmorphousDiskMark, Blackmagic) | NO |
| 3.4 | LLM / AI (llama-bench, MLX-LM) | YES |
| 3.5 | Video Export (HandBrakeCLI, FFmpeg) | YES |
| 3.6 | Dev / Compile (cargo, xcodebuild, npm tsc) | YES |
| 3.7 | Python (pyperformance, PyTorch MPS) | YES |
| 3.8 | Games (BG3, Cyberpunk GPTK, 3DMark Solar Bay) | NO (AC only meaningful) |
| 3.9 | Thermal (Cinebench loop, stress-ng) | NO (AC only) |
| 3.10 | Battery Life (video loop, Safari YouTube, web rotation) | NO (battery only) |
| 3.11 | Wireless + Ports (iperf3, TB5) | NO |
| 3.12 | Display (DisplayCAL, system_profiler, Lagom) | NO |
| 3.13 | BPR Rollup | Computed from AC+battery pairs, not a standalone run |

BPR = geometric mean of all (battery_score / ac_score) ratios across disciplines that have both modes. Tier: Platinum >= 90%, Gold >= 80%, Silver >= 70%, Bronze < 70%.

---

## Schema Additions Required

### 1. New enum: `techBenchmarkModeEnum`

Add after `techBenchmarkDirectionEnum` in schema.ts:

```typescript
export const techBenchmarkModeEnum = pgEnum("tech_benchmark_mode", [
  "ac",       // plugged-in
  "battery",  // on battery
  "any",      // no power constraint (storage, display, wireless, etc.)
])
```

### 2. `tech_benchmark_tests` — two new columns

`mode`: which power state this test is run under. Set at template-definition time (the rubric seed). BPR computation joins on pairs of tests that share all attributes except mode.

`discipline`: groups tests for the methodology page and leaderboard column headers. Nullable at DB level so existing rows (if any) are safe; the seed script populates it for all new rows.

```typescript
// In techBenchmarkTests table, after direction:
mode:       techBenchmarkModeEnum("mode").notNull().default("any"),
discipline: text("discipline"),   // "cpu" | "gpu" | "memory" | "llm" | "video" | "dev" | "python" | "games" | "thermal" | "battery" | "wireless" | "display"
```

Migration:
```sql
ALTER TABLE tech_benchmark_tests ADD COLUMN mode tech_benchmark_mode NOT NULL DEFAULT 'any';
ALTER TABLE tech_benchmark_tests ADD COLUMN discipline text;
```

### 3. `tech_benchmark_runs` — three new columns

`mode`: which power state this specific run was captured in. Populated by the ingest action based on the admin's selection at upload time. Enables queries like "show all battery-mode runs for this product."

`source_file`: original JSONL filename (basename only, not full path). Enables "which file did this come from?" in the admin UI audit trail.

`ingest_batch_id`: UUID shared by all runs from one upload session. Enables preview dry-run and atomic rollback: `DELETE FROM tech_benchmark_runs WHERE ingest_batch_id = $1`.

```typescript
// In techBenchmarkRuns table, after notes:
mode:          techBenchmarkModeEnum("mode").notNull().default("any"),
sourceFile:    text("source_file"),
ingestBatchId: uuid("ingest_batch_id"),
```

Migration:
```sql
ALTER TABLE tech_benchmark_runs ADD COLUMN mode tech_benchmark_mode NOT NULL DEFAULT 'any';
ALTER TABLE tech_benchmark_runs ADD COLUMN source_file text;
ALTER TABLE tech_benchmark_runs ADD COLUMN ingest_batch_id uuid;
```

### 4. `tech_reviews` — two new columns

BPR is stored (not computed at runtime) because:
- The leaderboard sorts by it across many products — SQL-level sorting requires a column, not a function
- The geomean computation (`EXP(AVG(LN(ratio)))`) is non-trivial in SQL and expensive at query time
- Recomputed whenever: a new benchmark run is ingested for this product, or on review publish

`bpr_score`: decimal ratio (e.g., 0.9312 = 93.12%). NULL until benchmark data exists.
`bpr_tier`: string tier label. NULL until enough AC+battery pairs exist to compute.

```typescript
// In techReviews table, after overallOverride:
bprScore: numeric("bpr_score", { precision: 5, scale: 4 }),
bprTier:  text("bpr_tier"),   // "platinum" | "gold" | "silver" | "bronze" | null
```

Migration:
```sql
ALTER TABLE tech_reviews ADD COLUMN bpr_score numeric(5,4);
ALTER TABLE tech_reviews ADD COLUMN bpr_tier text;
```

### 5. `tech_benchmark_templates` — one new column

Links each template to a rubric version string for the methodology page display.

```typescript
// In techBenchmarkTemplates table, after categoryId:
rubricVersion: text("rubric_version").notNull().default("1.1"),
```

Migration:
```sql
ALTER TABLE tech_benchmark_templates ADD COLUMN rubric_version text NOT NULL DEFAULT '1.1';
```

### 6. `blog_posts` and `blog_categories` — brand discriminator

The brand discriminator is the cheapest path because the Studios blog code (actions, components, route pages) is fully reusable with a one-line filter added. Creating a parallel `tech_blog_posts` table would duplicate ~600 lines of admin + public route code for identical functionality.

```typescript
// In blogPosts table, after isFeatured:
brand: text("brand").notNull().default("studios"),  // "studios" | "tech"

// In blogCategories table, after slug:
brand: text("brand").notNull().default("studios"),
```

Migration:
```sql
ALTER TABLE blog_posts ADD COLUMN brand text NOT NULL DEFAULT 'studios';
ALTER TABLE blog_categories ADD COLUMN brand text NOT NULL DEFAULT 'studios';
```

All existing rows automatically stay as `"studios"`. No data migration needed.

---

## New Route Files

### Leaderboard

**Path: `src/app/(tech)/tech/categories/[slug]/rankings/page.tsx`**

Rationale over alternatives:
- `/tech/rankings/[category]` creates a parallel slug hierarchy that requires duplicating `getCategoryBySlug` + `getCategoryBreadcrumb` calls and has weaker SEO authority (the canonical slug lives under `/tech/categories/`)
- Enhancing the existing `/tech/categories/[slug]/page.tsx` with an inline tab would require converting it to a client component or adding nuqs-stateful server component nesting — both complicate the current clean RSC-only pattern on that page

The sub-route keeps category detail clean. The category detail page gets one new "View Rankings" link button only.

The rankings page uses `nuqs` for `sort` and `dir` URL params, server-fetches all rows on load, and passes them to the client `<LeaderboardTable>` component.

### Methodology

**Path: `src/app/(tech)/tech/methodology/page.tsx`**

Server component, force-static with ISR revalidation. Reads live from DB (not MDX) because:
- Rubric v1.2 will exist. MDX requires a redeploy to update; DB does not.
- The `tech_benchmark_tests` rows grouped by `discipline` + `rubric_version` are the methodology — no separate "methodology content" table needed.
- Consistent with how every other content piece in this app is managed (DB-driven).

New query `getMethodologyData()` added to `src/lib/tech/queries.ts`.

### Tech Blog

Two public route files:
```
src/app/(tech)/tech/blog/page.tsx            — list page
src/app/(tech)/tech/blog/[slug]/page.tsx     — detail page
```

Near-copies of `src/app/(public)/blog/page.tsx` and `src/app/(public)/blog/[slug]/page.tsx` with `brand: "tech"` injected into all queries. The `(tech)` route group wraps them in the GlitchTek layout automatically — no layout changes needed.

Four admin route files:
```
src/app/admin/tech/blog/page.tsx             — list
src/app/admin/tech/blog/new/page.tsx         — new post form
src/app/admin/tech/blog/[id]/edit/page.tsx   — edit form
src/app/admin/tech/blog/categories/page.tsx  — category management
```

These are near-copies of `src/app/admin/blog/` equivalents with `brand: "tech"` added to server action calls. No new components needed; the same form components work with the brand filter.

---

## New Admin Surfaces

### JSONL Ingest: Dedicated Sub-Route

**Path: `src/app/admin/tech/reviews/[id]/ingest/page.tsx`**

Rationale over putting it on the review edit page: ingest is a one-time, potentially destructive operation. It deserves intentional navigation and a multi-step confirmation flow. The review edit page gets one link button pointing here.

The wizard has three steps rendered in one page (no separate route per step):
1. Upload JSONL file + select mode (ac | battery) — file input + radio buttons
2. Preview table returned by dry-run server action — green rows (new), yellow rows (duplicate), red rows (unmatched)
3. Commit button (active only after preview shows ≥1 matched row) — calls commit action

### Methodology Editing

No admin CRUD. The rubric is a versioned developer artifact, not user-editable content. Josh (non-technical admin) should never touch rubric structure. The seed script (`src/db/seeds/rubric-v1.1.ts`) is the interface — run once, idempotent, version-controlled in git. Future v1.2 gets `src/db/seeds/rubric-v1.2.ts`. The admin UI surfaces methodology read-only via a link to `/tech/methodology`.

---

## New Components

### `src/components/tech/bpr-medal.tsx`

```typescript
interface BprMedalProps {
  tier: "platinum" | "gold" | "silver" | "bronze" | null
  score?: number   // e.g. 0.9312 (decimal, not percent)
  size?: "sm" | "md" | "lg"
}
```

Returns `null` when `tier` is null. Used in:
- `src/app/(tech)/tech/reviews/[slug]/page.tsx` — in the scorecard section alongside the four rating dimensions (add import near the top; render in the scorecard JSX block)
- `src/components/tech/leaderboard-table.tsx` — one BPR cell per product row

### `src/components/tech/leaderboard-table.tsx`

Client component (`"use client"`). Uses `@tanstack/react-table` (already in project via admin dashboard tables) + the existing shadcn `Table` wrapper from `src/components/ui/table.tsx`.

All rows pre-fetched server-side and passed as props. No client-side data fetching. Sorting is URL-stateful via `nuqs`. Responsive: `overflow-x-auto` scroll container (same as existing compare tool), not viewport-split components.

```typescript
interface LeaderboardTableProps {
  rows: LeaderboardRow[]
  benchmarkColumns: LeaderboardColumn[]   // dynamic per category template
}

interface LeaderboardRow {
  productId: string
  productName: string
  productSlug: string
  manufacturer: string | null
  heroImageUrl: string | null
  reviewSlug: string | null
  overallRating: number | null
  bprScore: number | null
  bprTier: string | null
  priceUsd: number | null
  benchmarkScores: Record<string, number>  // testId (ac mode) → score
}

interface LeaderboardColumn {
  testId: string
  testName: string
  unit: string
  direction: "higher_is_better" | "lower_is_better"
  discipline: string
}
```

Fixed columns: Rank, Product, Overall Rating, BPR, Price.
Dynamic columns: one per key benchmark test for the category (AC mode only for display; battery mode implicit in BPR).

### `src/lib/tech/leaderboard.ts` (new query module)

Split from `src/lib/tech/queries.ts` to prevent that file from growing unbounded. Contains:
- `getLeaderboardRows(categoryIds: string[], sortKey: string, sortDir: "asc" | "desc"): Promise<LeaderboardRow[]>`
- `getLeaderboardBenchmarkColumns(templateId: string): Promise<LeaderboardColumn[]>`

The benchmark scores join uses `mode = 'ac'` for display consistency (battery scores appear only as the BPR computation input, not as separate leaderboard columns).

### `src/lib/tech/bpr.ts` (new utility module)

```typescript
export async function computeBprScore(productId: string): Promise<{ score: number | null; tier: string | null }>
```

Algorithm:
1. Fetch all `tech_benchmark_runs` for productId
2. Join to `tech_benchmark_tests` to get discipline + mode + test name
3. For each test that exists in both `mode = 'ac'` and `mode = 'battery'`: compute ratio = battery_score / ac_score
4. Geometric mean = `Math.exp(ratios.map(r => Math.log(r)).reduce((a,b)=>a+b,0) / ratios.length)`
5. If fewer than 3 AC+battery pairs exist: return `{score: null, tier: null}` (not enough data)
6. Apply tier thresholds: >= 0.90 platinum, >= 0.80 gold, >= 0.70 silver, else bronze

### `src/lib/tech/rubric-map.ts` (new static constant)

Maps `(discipline, tool, field)` triples to rubric test names. Used by the ingest parser to match JSONL data fields to `tech_benchmark_tests` rows.

```typescript
export interface RubricEntry {
  discipline: string
  tool: string
  field: string         // JSONL data line key, e.g. "multi"
  testNameAc: string    // Must exactly match tech_benchmark_tests.name where mode='ac'
  testNameBattery: string | null  // null for tools that don't do battery runs
}

export const RUBRIC_MAP: RubricEntry[] = [
  { discipline: "cpu", tool: "geekbench6", field: "multi",  testNameAc: "cpu / geekbench6 / multi-core", testNameBattery: "cpu / geekbench6 / multi-core (battery)" },
  { discipline: "cpu", tool: "geekbench6", field: "single", testNameAc: "cpu / geekbench6 / single-core", testNameBattery: "cpu / geekbench6 / single-core (battery)" },
  // ... all 13 disciplines × N tools × M fields
]
```

The rubric seed script and the ingest parser both import from this file — single source of truth for test names.

---

## JSONL Ingest Data Flow

### Full Algorithm

```
Admin navigates to: /admin/tech/reviews/[id]/ingest

Step 1 — Upload form
  Input: JSONL File (multipart), mode: "ac" | "battery" (radio), dryRun: true

Step 2 — Server action: ingestBenchmarkRunsDryRun(reviewId, file, mode)
  a. Read file.text() into memory (files are < 2KB)
  b. Split on newlines, parse each line as JSON
  c. Line 1: assert _header:true, extract discipline + tool + rubric_version
     - If rubric_version !== "1.1": return { error: "Unsupported rubric version" }
  d. Lines 2+: for each data field in line:
     - Look up (discipline, tool, fieldKey) in RUBRIC_MAP
     - If no entry: push to unmatched[]
     - Else: look up testName for the given mode in RUBRIC_MAP
       - Query: SELECT id FROM tech_benchmark_tests WHERE name = $testName AND mode = $mode
       - If testId found: check for existing run (productId × testId × mode)
         - Existing run found: push to duplicates[] with {testId, testName, existingScore, newScore}
         - No existing run: push to matched[] with {testId, testName, score, mode}
     - Score: extract numeric value from the data field (Number(line[field]))
  e. Return IngestPreview { matched, unmatched, duplicates, totalLines, batchId: crypto.randomUUID() }

Step 3 — UI shows preview table
  - matched rows: green (will be inserted)
  - duplicate rows: yellow (show existing vs new score; checkbox to overwrite)
  - unmatched rows: red (will be skipped)
  - Commit button active only if matched.length > 0

Step 4 — Server action: commitBenchmarkIngest(reviewId, batchId, matched, overwriteDuplicates)
  a. db.transaction(async (tx) => {
       for each run in matched:
         tx.insert(techBenchmarkRuns).values({
           productId,
           testId: run.testId,
           score: String(run.score),
           mode: run.mode,
           sourceFile: originalFilename,
           ingestBatchId: batchId,
           createdBy: session.user.id,
         })
       if overwriteDuplicates:
         for each dup in selectedDuplicates:
           tx.update(techBenchmarkRuns)
             .set({ score: String(dup.newScore), sourceFile, ingestBatchId: batchId })
             .where(and(eq(productId), eq(testId), eq(mode)))
     })
  b. Call computeBprScore(productId) from src/lib/tech/bpr.ts
  c. UPDATE tech_reviews SET bpr_score = $score, bpr_tier = $tier WHERE product_id = $productId
  d. revalidatePath(`/admin/tech/reviews/${reviewId}/edit`)
  e. revalidatePath(`/tech/reviews/${reviewSlug}`, "page")  -- if review is published
  f. Return { inserted, overwritten, skipped, batchId }
```

### Error Handling

- **Partial ingest prevention**: everything in a single `db.transaction()`. If any INSERT fails, all inserts roll back.
- **Rollback after commit**: `DELETE FROM tech_benchmark_runs WHERE ingest_batch_id = $batchId` — one query, atomic, safe.
- **Duplicate handling**: default skip (safest). Admin explicitly checks "overwrite" per duplicate row in the preview UI.
- **Rubric version mismatch**: fail before parsing any data lines, return a clear error message.
- **File size**: no streaming needed. JSONL files are < 2KB (one discipline = ~5-20 data points).
- **Non-numeric score**: `Number(line[field])` returns NaN → push to unmatched with reason "non-numeric value".

### Where the Action Lives

Modify `src/actions/admin-tech-benchmarks.ts` (existing file). Add:
- `export async function ingestBenchmarkRunsDryRun(...): Promise<IngestPreview>`
- `export async function commitBenchmarkIngest(...): Promise<IngestResult>`

Do NOT create a new action file. The existing benchmark actions file is the right place — it already imports `techBenchmarkRuns`, `techBenchmarkTests`, `techProducts` and has `requirePermission`.

---

## Deploy Hardening

No new code files. Configuration-only:
- Cloudflare: A + AAAA records for `glitchtech.io` and `www.glitchtech.io` pointing to Vercel's edge IPs
- Vercel project: add both custom domains; Vercel provisions TLS automatically
- Middleware: already handles `glitchtech.io` host at line 8 and 65 of `src/middleware.ts` — no code change needed

Modify `src/app/sitemap.ts`:
- Import `getAllPublishedReviewSlugs` from `src/lib/tech/queries.ts`
- Import `db` and query `techCategories` for slugs
- Add `/tech/reviews/[slug]` entries with `lastModified: publishedAt`
- Add `/tech/categories/[slug]` entries
- Add static entries for `/tech/methodology` and `/tech/blog`

`src/app/robots.ts` needs no change (current `allow: "/"` covers both brands).

---

## Build Order (Phase Dependencies)

### Phase 1 — Schema + Rubric Seed (BLOCKS EVERYTHING)

No other phase can start until migrations run and rubric tests exist in DB.

Deliverables:
- All 8 `ALTER TABLE` statements run as a Drizzle migration (`drizzle-kit generate` + `drizzle-kit migrate`)
- `src/db/seeds/rubric-v1.1.ts` — creates benchmark template for the Laptops category with all 13 disciplines, one `tech_benchmark_tests` row per (tool × metric × mode) pair, correct `direction`, `unit`, `discipline` fields
- `src/lib/tech/rubric-map.ts` — static RUBRIC_MAP constant

### Phase 2 — JSONL Ingest Pipeline (blocks Phase 5)

Depends on: Phase 1 (schema columns + rubric tests must exist for matching)

Deliverables:
- `src/lib/tech/bpr.ts` — `computeBprScore(productId)`
- Modify `src/actions/admin-tech-benchmarks.ts` — add `ingestBenchmarkRunsDryRun` and `commitBenchmarkIngest`
- `src/app/admin/tech/reviews/[id]/ingest/page.tsx` — wizard UI
- Modify `src/app/admin/tech/reviews/[id]/edit/page.tsx` — add one "Import Benchmark Data" button that links to the ingest sub-route (add after the existing action buttons at the top of the edit page; no logic change, just a Link)

### Phase 3 — BPR Medal UI + Methodology Page (blocks Phase 4's BPR column in leaderboard)

Depends on: Phase 1 (rubric in DB for methodology page). Loosely depends on Phase 2 (bpr_score populated for at least one product to test the medal). Can start in parallel with Phase 2 since the component itself needs no data.

Deliverables:
- `src/components/tech/bpr-medal.tsx`
- Add `getMethodologyData()` to `src/lib/tech/queries.ts`
- `src/app/(tech)/tech/methodology/page.tsx`
- Modify `src/app/(tech)/tech/reviews/[slug]/page.tsx` — add `import { BprMedal } from "@/components/tech/bpr-medal"` at top; render `<BprMedal tier={review.bprTier} score={review.bprScore} />` in the scorecard section (the block that already renders ratingPerformance/ratingBuild/ratingValue/ratingDesign)

### Phase 4 — Category Leaderboard (blocks Phase 7 value, but not hard dependency)

Depends on: Phase 1 (schema), Phase 2 (benchmark runs ingested so leaderboard has data), Phase 3 (`<BprMedal>` component used in leaderboard table)

Deliverables:
- `src/lib/tech/leaderboard.ts` — `getLeaderboardRows`, `getLeaderboardBenchmarkColumns`
- `src/components/tech/leaderboard-table.tsx`
- `src/app/(tech)/tech/categories/[slug]/rankings/page.tsx`
- Modify `src/app/(tech)/tech/categories/[slug]/page.tsx` — add one "View Rankings" link button (add near the reviewed products section heading; one `<Link href={`/tech/categories/${category.slug}/rankings`}>View Rankings</Link>` node)

### Phase 5 — MBP Flagship Review (content, not code)

Depends on: Phase 2 (ingest pipeline for benchmark data)

This is a content phase. Steps:
1. Create product + review draft via existing `/admin/tech` UI — no new files
2. Upload all JSONL files from the Mac using the Phase 2 ingest wizard
3. Write review body in the Tiptap editor
4. Upload gallery images
5. Publish

Validates the ingest pipeline against real data before Phase 7 deployment hardening.

### Phase 6 — GlitchTek Blog

Depends on: Phase 1 (brand column on blog_posts and blog_categories)

Independent of Phases 2-5. Can run in parallel after Phase 1 completes.

Deliverables:
- Modify `src/actions/admin-blog.ts` — add `brand?: string` param (default `"studios"`) to `listPosts`, `upsertPost`, `listCategories`, `saveCategory`; inject as Drizzle `where` filter
- `src/app/(tech)/tech/blog/page.tsx`
- `src/app/(tech)/tech/blog/[slug]/page.tsx`
- `src/app/admin/tech/blog/page.tsx`
- `src/app/admin/tech/blog/new/page.tsx`
- `src/app/admin/tech/blog/[id]/edit/page.tsx`
- `src/app/admin/tech/blog/categories/page.tsx`
- Modify `src/app/admin/tech/page.tsx` — add "Blog" row to the admin tech navigation list

### Phase 7 — Deploy Hardening

Depends on: Phase 4 (leaderboard live), Phase 5 (flagship review published — most valuable to index on day one)

Deliverables:
- Cloudflare DNS records (outside codebase)
- Vercel custom domain config (outside codebase)
- Modify `src/app/sitemap.ts` — add tech review + category + blog + methodology routes

---

## Integration Points: Existing File → New File

| Existing File | What Changes | New File It Touches |
|---|---|---|
| `src/db/schema.ts` | Add 1 new enum, 9 columns across 5 tables | Drizzle migration files |
| `src/actions/admin-tech-benchmarks.ts` | Add 2 new exported functions | `src/app/admin/tech/reviews/[id]/ingest/page.tsx` |
| `src/actions/admin-blog.ts` | Add `brand` param to 4 functions | All 4 `src/app/admin/tech/blog/` pages |
| `src/lib/tech/queries.ts` | Add `getMethodologyData()` | `src/app/(tech)/tech/methodology/page.tsx` |
| `src/app/admin/tech/reviews/[id]/edit/page.tsx` | Add one "Import Benchmark Data" link button | `src/app/admin/tech/reviews/[id]/ingest/page.tsx` |
| `src/app/(tech)/tech/reviews/[slug]/page.tsx` | Add `<BprMedal>` import + one render call | `src/components/tech/bpr-medal.tsx` |
| `src/app/(tech)/tech/categories/[slug]/page.tsx` | Add one "View Rankings" link button | `src/app/(tech)/tech/categories/[slug]/rankings/page.tsx` |
| `src/app/admin/tech/page.tsx` | Add "Blog" nav link | `src/app/admin/tech/blog/page.tsx` |
| `src/app/sitemap.ts` | Add tech routes | — |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Schema gaps identified | HIGH | Read schema.ts line by line; all columns confirmed absent |
| JSONL format | HIGH | Read logging.sh source + 00_README.md |
| 13 disciplines + BPR definition | HIGH | Read 00_README.md §3 in full |
| Existing admin action patterns | HIGH | Read all 5 admin-tech-*.ts files |
| Existing public query patterns | HIGH | Read queries.ts in full |
| Route group + middleware structure | HIGH | Confirmed via filesystem + middleware.ts |
| Blog brand discriminator decision | HIGH | Confirmed no brand column exists; adapting 4 existing pages beats duplicating ~600 lines |
| BPR stored as materialized column | MEDIUM | Architectural judgment; Postgres generated column or view are alternatives but complicate Drizzle schema inference and leaderboard sort |
| Leaderboard as sub-route | MEDIUM | Judgment call; could equally be `/tech/rankings/[category]` — sub-route chosen for slug canonicality and to avoid breadcrumb duplication |
| Ingest wizard UX complexity estimate | MEDIUM | No prior ingest wizard in this codebase; multi-step pattern is well-established but implementation effort may vary |
