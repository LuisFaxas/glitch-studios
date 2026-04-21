# Research Summary: GlitchTek v3.0 Launch

**Project:** Glitch Studios — GlitchTek v3.0
**Domain:** Hardware review site with benchmark leaderboards, JSONL ingest pipeline, BPR rollup, methodology publication
**Researched:** 2026-04-20
**Confidence:** HIGH

---

## Executive Summary

GlitchTek v3.0 transforms the existing v2.0 tech review foundation (12 `tech_*` tables, admin CRUD, review detail/list/compare pages all live) into a credible, differentiated hardware review publication by adding category leaderboards, a locked rubric methodology, JSONL benchmark ingestion from the Mac harness, BPR medal scoring, and a tech blog. The entire build strategy is schema-first: Phase 1 adds all required columns and locks the rubric v1.1 seed before any ingest, BPR, or leaderboard code is written. This is not optional sequencing — the rubric seed populates the `tech_benchmark_tests` rows that the ingest pipeline matches against, and the BPR-eligible discipline list must be frozen before the first medal is computed.

The single most important decision is that BPR (Battery Performance Ratio) is computed from the geometric mean of `(battery_score / ac_score)` ratios across exactly 7 eligible disciplines (CPU, GPU, LLM, Video, Dev, Python, Games), not stored as a free-text field and not derived from arbitrary editorial choices. BPR is materialized as a column on `tech_reviews` (not computed at query time) to enable SQL-level leaderboard sorting. Medal tiers are formula-defined at 90/80/70% thresholds. This is GlitchTek's primary differentiator over every competing review site that reports battery life in hours rather than performance retention under battery.

The single largest risk is schema debt carried into ingest: the current `tech_benchmark_runs` table has no `mode` column, no `run_uuid`, no `rubric_version`, no unique constraint on `(product_id, test_id)`, and `getBenchmarkRunsForProducts` (used by the existing compare tool) returns all runs without deduplication. If ingest runs before these are fixed, the compare tool breaks silently and the leaderboard produces corrupt results. Phase 1 must address all schema gaps before Phase 2 touches the DB.

---

## Key Findings

### Confirmed Stack Additions (v3.0 only)

Everything below is net-new for v3.0. The full v1.0/v2.0 stack (Next.js 16, Tailwind v4, Drizzle/Neon, Better Auth, Resend, Uploadthing, Tiptap, recharts, nuqs, zod) is already installed and validated.

**New production npm package: 1**
- `@tanstack/react-table ^8.21.3` — headless sortable/filterable table engine for leaderboards. Confirmed NOT currently in package.json. The existing `src/components/ui/table.tsx` is a plain HTML wrapper with no sort logic.

**New shadcn/ui component: 1**
- `toggle-group` (via `pnpm dlx shadcn@latest add toggle-group`) — leaderboard column visibility picker. Confirmed absent from `src/components/ui/`.

**No new packages needed for:**
- JSONL ingest — `zod` (already ^4.3.6) + `file.text()` + `JSON.parse` per line
- BPR computation — pure `Math.exp` / `Math.log` in a new `src/lib/tech/bpr.ts`
- Medal badge — CSS variants extending existing `src/components/ui/badge.tsx`
- Methodology page (public) — `isomorphic-dompurify` already installed
- Methodology content authoring — Tiptap already installed
- URL-state filters — `nuqs` already installed

**Explicitly skip:**
- `@next/mdx` — methodology content is DB-driven via Tiptap (Josh is non-technical; MDX requires a git commit to update)
- `js-yaml` — YAML manifests stay on the review Mac; not ingested into the website DB for v3.0
- `@tanstack/react-virtual` — corpus is <20 products at launch; virtualization threshold is ~200 rows

### Locked Methodology Constants

These are immutable once Phase 1 ships. Any future deviation requires a rubric version bump, not an edit to existing rows.

**BPR formula:**
```
BPR = exp( mean( ln(battery_score_d / ac_score_d) ) )  for d in BPR-eligible disciplines
```
Expressed as a percentage (multiply result by 100).

**BPR-eligible disciplines (exactly 7):**
`cpu`, `gpu`, `llm`, `video`, `dev`, `python`, `games`

Explicitly excluded from BPR denominator: `memory`, `storage`, `thermal`, `wireless`, `display`, `battery_life`. These are AC-only or battery-only disciplines with no ratio pair.

**Medal tier thresholds (verbatim from 00_README.md §3.13):**
- Platinum: BPR >= 90% — "Full performance untethered"
- Gold: BPR >= 80% — "Minimal unplugged penalty"
- Silver: BPR >= 70% — "Noticeable throttle, usable"
- Bronze: BPR < 70% — "Significant performance drop on battery"
- None: insufficient AC+battery pairs (fewer than 3)

**Rubric versioning policy (append-only):**
- Never modify existing `tech_benchmark_tests` rows after any benchmark run references them
- New rubric version = new rows with incremented `rubric_version` string
- Leaderboard defaults to latest rubric version; shows version selector when multiple exist
- Each `tech_benchmark_runs` row carries its own `rubric_version` — per-row, not per-product

**Discipline exclusion enum (controlled — not free text):**
`no_hardware` | `requires_license` | `device_class_exempt`
Only `device_class_exempt` (e.g., Mac Mini has no battery) suppresses a BPR gap warning. `requires_license` surfaces as "estimated" in the UI.

**Default sort direction:** GlitchTek Score descending. Null scores always sort to bottom (`NULLS LAST`) regardless of ascending or descending direction.

### Schema Changes Required

All changes go into a single Drizzle migration in Phase 1. Total: 1 new enum + 14 column additions across 5 tables + 1 new table.

**New enum: `tech_benchmark_mode`**
Values: `'ac'`, `'battery'`, `'any'`

**`tech_benchmark_tests` — 4 new columns:**
- `mode tech_benchmark_mode NOT NULL DEFAULT 'any'`
- `discipline text` (nullable for safe migration of existing rows)
- `bpr_eligible boolean NOT NULL DEFAULT false`
- `min_ram_gb integer` (nullable; gates tests like "Llama 70B requires >=64GB")

**`tech_benchmark_runs` — 6 new columns:**
- `mode tech_benchmark_mode NOT NULL DEFAULT 'any'`
- `rubric_version text NOT NULL DEFAULT '1.1'`
- `run_uuid uuid NOT NULL`
- `source_file text`
- `ingest_batch_id uuid`
- `run_flagged boolean NOT NULL DEFAULT false`

**Unique constraint on `tech_benchmark_runs`:**
`UNIQUE (product_id, test_id, run_uuid)`

**`tech_reviews` — 2 new columns:**
- `bpr_score numeric(5,4)` (nullable)
- `bpr_tier text` (nullable; `'platinum'|'gold'|'silver'|'bronze'`)

Stored (not computed at query time) because: leaderboard sort requires a real column; geomean is expensive across many products at query time; recomputed on each ingest commit.

**`tech_benchmark_templates` — 1 new column:**
- `rubric_version text NOT NULL DEFAULT '1.1'`

**`blog_posts` — 1 new column:**
- `brand text NOT NULL DEFAULT 'studios'`

**`blog_categories` — 1 new column:**
- `brand text NOT NULL DEFAULT 'studios'`

Existing rows auto-inherit `'studios'` default — no data migration needed. Check existing `UNIQUE(slug)` constraint on `blog_categories`; if present, change to `UNIQUE(slug, brand)`.

**New table: `tech_benchmark_exclusions`**
`(id, product_id FK, test_id FK, reason_enum, notes, created_at)`
Distinguishes "not yet tested" from "explicitly excluded" in leaderboard cells.

**ARCHITECTURE/PITFALLS `mode` column conflict resolved:**
`mode` lives on both `tech_benchmark_tests` (template property: which power state this test runs under) AND on `tech_benchmark_runs` (run property: which power state was actually captured). These are different semantic uses. Both columns are required.

**`publishedAt` enforcement:**
Add CHECK constraint: `CHECK (status != 'published' OR published_at IS NOT NULL)`. Set `published_at = NOW()` in application layer when status changes to `'published'` if NULL.

### Architecture Approach

The build is a pure extension to the existing app — no new services, no new deployment units. New routes live within the `(tech)/` route group. Admin surfaces extend `src/app/admin/tech/`. Data access splits into two new modules (`src/lib/tech/leaderboard.ts` and `src/lib/tech/bpr.ts`) to prevent `queries.ts` from growing unbounded.

The leaderboard is server-fetched (full dataset on load) and client-sorted via TanStack Table with nuqs URL state. At <20 products, client-sort in memory is correct. At >500, flip to server-sort by reading nuqs params at the Server Component level — the component interface stays identical. The methodology page is ISR (force-static, revalidate on admin save) backed by DB rows from `tech_benchmark_tests`, not MDX.

**Major new components:**
1. `src/lib/tech/rubric-map.ts` — static constant mapping `(discipline, tool, field)` triples to test names; single source of truth for test name strings; imported by both seed and ingest parser
2. `src/db/seeds/rubric-v1.1.ts` — idempotent seed; creates benchmark template + all `tech_benchmark_tests` rows for Laptops category
3. `src/actions/admin-tech-benchmarks.ts` (modified) — adds `ingestBenchmarkRunsDryRun` + `commitBenchmarkIngest`
4. `src/components/tech/leaderboard-table.tsx` — client component; TanStack Table + shadcn `<Table>`
5. `src/components/tech/bpr-medal.tsx` — pure CSS pill; links to `/tech/methodology#bpr`; renders null when tier is null
6. `src/app/(tech)/tech/categories/[slug]/rankings/page.tsx` — leaderboard public route
7. `src/app/(tech)/tech/methodology/page.tsx` — public methodology page (ISR)
8. `src/app/admin/tech/reviews/[id]/ingest/page.tsx` — 3-step ingest wizard
9. Tech blog: 2 public routes + 4 admin routes (near-copies of Studios blog with `brand: "tech"` filter)

### Critical Pitfalls

**Blockers (must fix in Phase 1 or before first ingest):**

1. **No unique constraint on `tech_benchmark_runs` (B-1, H-7)** — Current schema allows unlimited duplicate `(product_id, test_id)` rows. The existing compare tool (`getBenchmarkRunsForProducts`) returns all rows; after ingest this breaks silently. Fix: add `run_uuid` + `UNIQUE(product_id, test_id, run_uuid)` in Phase 1 migration; refactor `getBenchmarkRunsForProducts` to `DISTINCT ON (product_id, test_id) ORDER BY recorded_at DESC` as Phase 2 step 0.

2. **Partial ingest corruption (B-2)** — Any line failure mid-ingest leaves the DB in a half-state with a phantom BPR score. Fix: parse-then-commit only — validate all lines with Zod before opening the DB transaction; wrap all inserts in a single `db.transaction()`.

3. **Rubric version mismatch on leaderboard (B-3, H-8)** — v1.1 and v1.2 scores in the same leaderboard column produce invalid comparisons. Fix: `rubric_version` per run row; leaderboard filters to single version by default; test rows are append-only.

4. **BPR gameable by arbitrary discipline exclusion (B-4)** — Free-text exclusions allow inflating BPR by dropping weak disciplines. Fix: controlled enum with only `device_class_exempt` suppressing BPR gap warning; 7-discipline list frozen in Phase 1.

5. **`getBenchmarkSpotlight` fragile ilike match (I-2)** — `ilike(name, "%Geekbench 6 Multi%")` breaks if test name changes after seed. Fix in Phase 2: replace with join via `tech_benchmark_tests.id` using seeded UUID, or add `is_spotlight_candidate boolean`.

---

## Implications for Roadmap

### Phase 1: Schema + Methodology Lock (BLOCKS EVERYTHING)

**Rationale:** No ingest code can run without rubric seed populating `tech_benchmark_tests`. No BPR without `mode` columns. No leaderboard sort without `bpr_score` on `tech_reviews`. No rubric tracking without `rubric_version` columns. This phase produces the immutable foundation everything else references.

**Delivers:**
- Drizzle migration: 1 new enum, 14 columns across 5 tables, 1 new `tech_benchmark_exclusions` table, `UNIQUE(product_id, test_id, run_uuid)` constraint, `publishedAt` CHECK constraint
- `src/lib/tech/rubric-map.ts`
- `src/db/seeds/rubric-v1.1.ts` — idempotent; Laptops template + all test rows with `discipline`, `mode`, `bpr_eligible`, `direction`, `unit`
- `/tech/methodology` page skeleton
- Editorial style guide stub (superlative disclaimer, no keyword stuffing)

**Phase 1 unblocker tasks (must complete before Phase 2 code is written):**
- Add `run_uuid`, `mode`, `rubric_version` columns to `tech_benchmark_runs` + `UNIQUE` constraint
- Refactor `getBenchmarkRunsForProducts` to `DISTINCT ON` canonical query (I-1)
- Fix `getBenchmarkSpotlight` ilike fragility (I-2)
- Add `publishedAt` CHECK constraint

**Pitfall coverage:** B-1, B-3, B-4, B-5, H-4, H-5, H-8, L-2, L-3, M-7

### Phase 2: JSONL Ingest Pipeline (blocks Phase 5)

**Rationale:** Review Mac returns 2026-04-25. CPU §3.1 already captured; 12 disciplines remaining. Ingest must be ready by then. No leaderboard data without this pipeline.

**Delivers:**
- `src/lib/tech/bpr.ts` — `computeBprScore(productId)` + `bprMedal(score)`
- `ingestBenchmarkRunsDryRun` + `commitBenchmarkIngest` in existing `admin-tech-benchmarks.ts`
- `src/app/admin/tech/reviews/[id]/ingest/page.tsx` — 3-step wizard (upload + mode select → preview dry-run → commit)
- "Import Benchmark Data" link on review edit page

**Constraints:** transactional (parse-all-then-commit), preview shows matched/duplicate/unmatched, atomic rollback via `ingest_batch_id`, rejects ambient_temp > 26°C without admin override, recomputes and stores `bpr_score`/`bpr_tier` after commit.

**Pitfall coverage:** B-2, H-7, I-1, I-2

### Phase 3: BPR Medal UI + Methodology Page (can parallel Phase 2)

**Rationale:** `bpr-medal.tsx` needs no live data; can start immediately after Phase 1. Must complete before Phase 4 leaderboard (BPR column uses this component).

**Delivers:**
- `src/components/tech/bpr-medal.tsx` — links to `/tech/methodology#bpr`, shows discipline count on hover, requires Josh color approval before ship
- Full `/tech/methodology` page: BPR formula with geomean rationale, worked example, 7-discipline list, medal tier table, rubric v1.1 test inventory, changelog
- BPR medal added to review detail scorecard
- Tie-breaking order documented: BPR desc, overall rating desc, name asc

**Pitfall coverage:** B-4, H-5, H-6, M-4

### Phase 4: Category Leaderboard (the headline feature)

**Rationale:** Requires Phase 1 schema + Phase 2 data + Phase 3 BPR component. This is the v3.0 headline feature.

**Delivers:**
- `src/lib/tech/leaderboard.ts` — `getLeaderboardRows` (requires published review; `NULLS LAST` explicit; single rubric version filter) + `getLeaderboardBenchmarkColumns`
- `src/components/tech/leaderboard-table.tsx` — TanStack Table + nuqs URL state; sticky first 2 columns; no pagination; all rows rendered
- `src/app/(tech)/tech/categories/[slug]/rankings/page.tsx`
- "View Rankings" link on category detail page
- Filter schema: category pills + sort dropdown + year select + max price range; all in URL; max 6 filter dimensions
- `unstable_cache` wrapper on category tree queries

**Default columns (8):** `#` / `Device` / `GlitchTek Score` (default sort DESC) / `BPR` / `Battery` / `Geekbench MC` / `Price` / `Year`

**Pitfall coverage:** H-1, H-2, H-3, M-1, M-2, M-3, M-6, I-3

### Phase 5: Flagship MBP Review (content, validates pipeline)

**Rationale:** Content phase; validates entire ingest + leaderboard pipeline against real data before deploy hardening.

**Delivers:**
- Product + review created via existing admin UI
- All JSONL files uploaded via Phase 2 wizard (AC + battery modes per eligible discipline)
- Review body: all 13 discipline `<h3>` sections, verdict >=150 chars, gallery >=3 images at 1920×1080 16:9
- Template completeness checklist 5/5 before publish
- No superlatives without scope qualifiers in H1/title

**Pitfall coverage:** M-5, M-7, M-8, L-1, L-2

### Phase 6: GlitchTek Blog (parallel to 3 or 5)

**Rationale:** Independent of Phases 2-5. Only requires Phase 1 (`brand` column on blog tables). Lowest risk phase.

**Delivers:**
- Modify `src/actions/admin-blog.ts` — add `brand` param to 4 functions
- 2 public routes: `src/app/(tech)/tech/blog/page.tsx` + `[slug]/page.tsx`
- 4 admin routes under `src/app/admin/tech/blog/`
- "Blog" link added to admin tech nav

### Phase 7: Deploy Hardening (after Phase 4 + Phase 5)

**Rationale:** Leaderboard live + flagship review published = highest-value content to index on day one.

**Delivers:**
- Cloudflare DNS: A + AAAA records for `glitchtech.io` + `www.glitchtech.io`
- Vercel: add custom domains; TLS auto-provisioned
- Modify `src/app/sitemap.ts`: add tech review + category + methodology + blog routes
- `src/middleware.ts` and `robots.ts` need no changes

### Phase Ordering Rationale

- Phase 1 blocks 2, 3, 4, 6 — schema and rubric seed must exist before any feature writes to DB
- Phase 2 blocks Phase 4 (data) and Phase 5 (ingest pipeline)
- Phase 3 can run in parallel with Phase 2 (no data dependency for component code)
- Phase 6 can run in parallel with 3 or 5 (only needs Phase 1 blog columns)
- Phase 5 blocks Phase 7 — flagship review is the primary content asset at launch

### Research Flags

No phases require `/gsd:research-phase` during planning. All patterns are established:

- **Phase 1** — Drizzle migration patterns proven in this codebase (12 tech_ tables already added without friction)
- **Phase 2** — Ingest wizard is a new UX pattern for this codebase; plan the 3-step preview/commit flow carefully before coding; no prior implementation to copy
- **Phase 3** — Pure React + CSS; no research needed
- **Phase 4** — TanStack Table v8 + nuqs is well-documented; Postgres `DISTINCT ON` + `NULLS LAST` are standard
- **Phase 5** — Content work; no technical research
- **Phase 6** — Exact Studio blog copy with one WHERE filter; no research needed
- **Phase 7** — Cloudflare + Vercel DNS is standard

---

## Open Questions to Resolve Before Planning

1. **Power state gap in JSONL header** — v1.1 `logging.sh` has no `power_state` field. Two options: (a) add to harness v1.2 before remaining bench runs, or (b) admin selects AC/battery manually in the ingest wizard. Recommendation: ship (b) for v3.0 since Mac returns 2026-04-25 and some disciplines are already captured; plan harness v1.2 afterward.

2. **Medal badge color approval** — Proposed colors deviate from flat monochrome palette. Josh must sign off before Phase 3 ships. Blocking for Phase 3.

3. **Rubric map completeness** — `rubric-map.ts` requires knowing all JSONL field names for all 13 disciplines. CPU §3.1 is captured (multi, single confirmed). Other 12 disciplines pending. Phase 1 can seed with CPU rows; extend rubric map as disciplines are benchmarked.

4. **Category-level default column config** — Which benchmark tests are default visible columns per category (Laptops vs hypothetical GPUs)? Must be concretely decided per category in the seed script.

5. **`blog_categories` uniqueness constraint** — Check if `schema.ts` has `UNIQUE(slug)` on `blog_categories`. If yes, change to `UNIQUE(slug, brand)` in Phase 1 migration before running it.

---

## Deferred / Out of Scope

| Item | Source | Reason |
|---|---|---|
| `@next/mdx` | STACK | Josh non-technical; methodology must update without a redeploy |
| `js-yaml` | STACK | YAML manifests stay on Mac; no ingest path for v3.0 |
| `@tanstack/react-virtual` | FEATURES | Threshold ~200 rows; v3.0 corpus <20 |
| Column visibility toggle | FEATURES | Corpus <20; add post-v3.0 |
| `tech_benchmark_evidence` table | FEATURES | Defer to v3.1; inline Uploadthing screenshots sufficient |
| Category-dependent score weights | FEATURES | Meaningless until multiple products per category |
| JSONL raw log viewer | FEATURES | Geekbench permalink + screenshot sufficient for launch credibility |
| Affiliate links | FEATURES | Undermines credibility; explicitly never |
| Paywalled scores | FEATURES | All scores free; transparency is the brand |
| Letter tier rankings (S/A/B/C/D) | FEATURES | Arbitrary cutoffs; use numeric BPR instead |
| 2-way `/tech/compare` changes | PROJECT | Stays as-is; not in v3.0 scope |
| Contact page (Phase 13) | PROJECT | Business info not finalized |
| Audio cross-domain fix | PROJECT | Cross-brand link opens in new tab; full fix deferred |

---

## Pre-Launch Checklist

- [ ] `tech_benchmark_runs`: `run_uuid` + `UNIQUE(product_id, test_id, run_uuid)`, `mode`, `rubric_version`, `ingest_batch_id`, `source_file`, `run_flagged`
- [ ] `tech_benchmark_tests`: `bpr_eligible`, `min_ram_gb`, `mode`, `discipline`
- [ ] `tech_benchmark_exclusions` table with `reason_enum` (not free text)
- [ ] `tech_reviews`: `bpr_score`, `bpr_tier`
- [ ] `blog_posts` + `blog_categories`: `brand` column
- [ ] `getBenchmarkRunsForProducts` refactored to `DISTINCT ON` canonical query
- [ ] `getBenchmarkSpotlight` ilike fragility fixed
- [ ] `publishedAt` CHECK constraint enforced
- [ ] JSONL ingest: validates all lines before committing any (parse-then-commit)
- [ ] Ingest rejects ambient_temp > 26°C without admin override
- [ ] Leaderboard query requires `status = 'published'` review before showing product
- [ ] Leaderboard: sort + filters persist in URL via nuqs
- [ ] Null scores always sort to bottom (`NULLS LAST`)
- [ ] BPR badge links to `/tech/methodology#bpr`, shows discipline count on hover
- [ ] `/tech/methodology`: exact BPR formula, geomean rationale, worked example, 7-discipline list
- [ ] Leaderboard shows rubric version badge; does not mix v1.1 + v1.2 scores in same column
- [ ] Flagship MBP review: 5/5 template completeness checks before publish
- [ ] No review title/H1 contains a superlative without a scope qualifier

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Confirmed from live package.json, directory listing, pnpm info queries |
| Features | HIGH | Cross-referenced against 9 competitor sites; BPR formula + thresholds verbatim from 00_README.md §3.13 |
| Architecture | HIGH | All existing files read directly; schema gaps confirmed by reading schema.ts line by line |
| Pitfalls | HIGH | Schema read directly, rubric pack read directly, session log read directly; specific line-number references throughout |

**Overall confidence: HIGH**

### Gaps to Address During Planning

- Rubric map for 12 remaining disciplines — extend as bench runs complete (Mac returns 2026-04-25)
- `blog_categories` constraint — check `schema.ts` before writing Phase 1 migration
- Harness v1.2 power_state decision — decide before Phase 2 planning starts
- Medal color approval — needs Josh sign-off before Phase 3 executes

---

## Sources

All HIGH confidence (read directly from source):

- `src/db/schema.ts` — tech_* tables, benchmark_runs shape, absence of new columns
- `src/lib/tech/queries.ts` — getBenchmarkRunsForProducts, getBenchmarkSpotlight ilike pattern
- `package.json` — confirmed installed packages, absence of @tanstack/react-table
- `src/components/ui/` directory — confirmed shadcn inventory, absence of toggle-group
- `pack/disciplines/_lib/logging.sh` — JSONL format + line structure
- `~/workspaces/_scratch/glitchtech-bench-mac/00_README.md §3.1–3.13` — 13 disciplines, BPR formula, medal thresholds, AC-only disciplines
- `~/workspaces/_scratch/glitchtech-bench-mac/03_session-log.md` — real data shape, provenance fields
- `~/workspaces/_scratch/glitchtech-bench-mac/CLAUDE.md` — JSONL logging architecture, rubric v1.1 versioning policy
- `.planning/PROJECT.md` — v3.0 scope, constraints, prior shipped phases
- `src/middleware.ts` — glitchtech.io host routing
- `pnpm info @tanstack/react-table version` → 8.21.3 (live, 2026-04-20)
- cpubenchmark.net, tomshardware.com CPU Hierarchy, notebookcheck.net rating criteria, rtings.com, browser.geekbench.com, gamersnexus.net, laptopmag.com — competitor feature patterns

---
*Research completed: 2026-04-20*
*Ready for roadmap: yes*
