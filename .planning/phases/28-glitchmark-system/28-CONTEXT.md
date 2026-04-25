# Phase 28: GlitchMark System - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Lock the formula, schema, ingest hook, and methodology surface for **GlitchMark** — a single per-device aggregate score combining ALL recorded benchmarks for that device. Compute on ingest in the same transaction as BPR. Persist with a version tag so future formula iterations preserve historical scores. Document the formula publicly on `/tech/methodology`.

**In scope:**
- Drizzle schema additions to `tech_reviews` + new `tech_glitchmark_history` table + idempotent SQL migration
- New `reference_score` column on `tech_benchmark_tests` (admin-set baseline per test)
- `src/lib/tech/glitchmark.ts` pure-function module mirroring `bpr.ts` patterns
- Compute hook: invoked from the same code path as `recomputeBpr` on ingest commit (`src/actions/admin-tech-ingest.ts`)
- Admin UI: surface `reference_score` field in benchmark-test edit form
- Methodology page: new `## GlitchMark` section explaining formula + reference baseline table

**Out of scope (other phases):**
- Master leaderboard column rendering, sortable UI → Phase 29 (RANK-*)
- Per-benchmark cross-category leaderboard pages → Phase 30
- Review detail card placement of GlitchMark badge → Phase 36 flagship review (FLAG-03) once formula is live
- Formula v2 (any future formula change) → its own phase

</domain>

<decisions>
## Implementation Decisions

### Formula
- **D-01:** Per-test **reference baseline ratio** for normalization. Each device's per-test score = `raw_score / reference_score` (or its inverse for `lower_is_better` tests). Stable: adding new devices does not shift any prior score. Mirrors `bpr.ts` ratio approach exactly.
- **D-02:** **Geometric mean** of all per-test ratios = the GlitchMark ratio. Reuses the `Math.exp(sumLn / n)` math from `computeBprFromPairs`. Penalizes weak categories — a single bad benchmark cannot be averaged away.
- **D-03:** **Output = ratio × 100**. Reference device = 100. MBP M5 Max example: a 1.65 geometric-mean ratio displays as `GlitchMark 165`. Unbounded above. Reads naturally as "65% above baseline."

### Reference baseline
- **D-04:** **Admin-set per test, locked at v1**. Add `reference_score` (numeric) column to `tech_benchmark_tests`. Admin enters the baseline raw score when creating/editing a test. Baselines are part of the v1 contract — published on the methodology page; do not silently shift them after launch.
- **D-05:** Reference device for v1 = **MBP 14 M3 base** (per audit Section I framing). Where MBP 14 M3 has not run a test (rare), admin picks a substitute reference for that test and notes it in the methodology page baseline table.

### Missing-benchmark handling
- **D-06:** **Min-N floor + partial flag**. Floor = **8 recorded tests**. Below 8 → `glitchmark_score = NULL`. ≥ 8 and < 12 → score computed with `glitchmark_is_partial = true`. ≥ 12 → score computed with `glitchmark_is_partial = false`. Mirrors BPR's 5-of-7 floor pattern.
- **D-07:** UI display when partial: `GlitchMark 142 · partial (10/18 tests)`. Display string format is locked here for downstream UI plans.

### Schema
- **D-08:** Add four columns to `tech_reviews`:
  - `glitchmark_score numeric(7,2)` — nullable, the displayed number (e.g. `165.32`)
  - `glitchmark_test_count integer` — nullable, count of tests included
  - `glitchmark_is_partial boolean` — nullable, true when test_count < 12 but ≥ 8
  - `glitchmark_version text` — nullable, defaults to `'v1'` on insert
- **D-09:** New `tech_glitchmark_history` table — one row per `(review_id, version)` preserving prior versions when the formula changes. Columns: `id`, `review_id` FK, `version` text, `score numeric(7,2)`, `test_count int`, `is_partial bool`, `computed_at timestamp`, `formula_notes text` (optional human-readable summary of what v2 changed). The "live" score on `tech_reviews` is always the latest version; `tech_glitchmark_history` is append-only.
- **D-10:** Add `reference_score numeric` (nullable) to `tech_benchmark_tests`. Tests without a reference cannot contribute to GlitchMark — surfaced in admin UI as a "GlitchMark eligibility" warning.

### Compute hook
- **D-11:** GlitchMark recomputes in the **same transaction** as `recomputeBpr` on ingest commit (GLITCHMARK-03). Failure of GlitchMark recompute fails the whole ingest — BPR + GlitchMark are atomic. Pure function exported for unit testing without DB, same pattern as `computeBprFromPairs`.
- **D-12:** Module location: `src/lib/tech/glitchmark.ts`. Companion test file: `src/lib/tech/glitchmark.spec.ts`. Mirrors `bpr.ts` / `bpr.spec.ts` co-location.

### Versioning
- **D-13:** **`v1` string**, bumped on formula change. `glitchmark_version` text column defaults to `'v1'`. Future formula change → `'v2'` (no semantic versioning). Mirrors existing `rubric_version` ('1.1') pattern on `tech_reviews`. Methodology page documents what each version changed in a "Version history" subsection.

### Surface
- **D-14:** **GlitchMark methodology lives as a section inside `/tech/methodology`** (no separate `/tech/glitchmark` route in v1). The section includes:
  1. What GlitchMark is (1 paragraph, plain English)
  2. The formula (geometric mean of per-test ratios × 100, with one worked example using the MBP M5 Max numbers once available)
  3. Reference-baseline table — every eligible test + its v1 reference value
  4. Min-N floor + partial-flag policy
  5. Version history (v1 only at launch)

### Admin
- **D-15:** Admin **benchmark-test edit form** gains a `reference_score` numeric input. When empty, the test is excluded from GlitchMark computation (same as `bpr_eligible: false` excludes a test from BPR). Admin sees a "GlitchMark-eligible: yes/no" badge derived from `reference_score IS NOT NULL`.

### Relationship to BPR (re-affirmed from Audit Section I)
- **D-16:** **GlitchMark and BPR coexist forever**. BPR = qualitative editorial tier (Platinum/Gold/Silver/Bronze on a rubric subset). GlitchMark = quantitative aggregate ratio over the full benchmark set. Methodology page has both sections side by side. Review detail card surfaces both. Master leaderboard (Phase 29) gets a column for each.

### Claude's Discretion
- **Migration file naming:** `0008_phase28_glitchmark.sql` following the Phase 26/27 pattern.
- **Column order in `tech_reviews`:** group the four GlitchMark columns together, after the existing `bpr_*` columns — readability convention.
- **Index strategy on `tech_glitchmark_history`:** `(review_id, version)` unique + `(version)` btree for migration reporting. Researcher/planner can adjust if perf evidence suggests otherwise.
- **Test choice for the worked-example methodology paragraph:** Cinebench R23 Multi (most recognizable cross-platform). Planner can pick a different test if a more illustrative one emerges.

### Out of scope confirmations (do NOT plan these)
- Public `/tech/glitchmark` standalone route — methodology section only in v1
- Per-discipline weights — pure geometric mean, no editorial weighting (BPR already encodes that)
- Recompute-on-baseline-change automation — baselines are locked at v1 launch; if admin edits a baseline post-launch, it does NOT trigger a mass recompute (that's a v2 problem)
- Cross-category aggregate (e.g., "best laptop AND mobile combined") — per-device, period
- "GlitchMark Hall of Fame" surface — out of v4.0

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope + decisions
- `.planning/REQUIREMENTS.md` §"GlitchMark (GLITCHMARK-*)" lines 74-83 — GLITCHMARK-01..08 acceptance criteria
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §"SECTION I — GlitchMark Design Session" lines 1919-1946 — locked role + scope + what was deferred to this phase

### Existing scoring system (the pattern to mirror)
- `src/lib/tech/bpr.ts` — pure-function module + tx-aware DB calls; `computeBprFromPairs` is the geometric-mean reference implementation
- `src/lib/tech/bpr.spec.ts` — co-located unit tests for the pure function (mirror this for `glitchmark.spec.ts`)
- `src/db/schema.ts` lines 683-735 — benchmark enums (`techBenchmarkDirectionEnum`, `techBenchmarkDisciplineEnum`, `techBprTierEnum`)
- `src/db/schema.ts` lines 875-932 — `tech_benchmark_templates`, `tech_benchmark_tests`, `tech_benchmark_runs`, indices
- `src/db/schema.ts` lines 821-874 — `tech_reviews` table (where GlitchMark columns will be added; bpr columns at lines 828-831 are the precedent)
- `src/actions/admin-tech-ingest.ts` — ingest commit code path; new module hooks here next to BPR recompute

### Migration pattern
- `src/db/migrations/0006_phase26_auth.sql` — DO $$ EXCEPTION enum guard, IF NOT EXISTS, `phase26_migration_meta` row guard
- `src/db/migrations/0007_phase27_media.sql` — Phase 27 application of same pattern (just shipped; freshest example)
- `scripts/run-phase27-migration.ts` — standalone postgres-js runner; clone for `scripts/run-phase28-migration.ts`

### Methodology page (where the new section lands)
- `src/app/(tech)/tech/methodology/page.tsx` — existing methodology page; GlitchMark section renders alongside BPR section

### Project memory (read at agent startup)
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/project_glitchmark.md` — origin concept, why this phase exists, BPR vs GlitchMark comparison table
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/project_brand_name.md` — brand is GlitchTech (not GlitchTek); fix as touched, no bulk rename
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/project_placeholder_first_build.md` — placeholder-first; MBP M5 Max as the one real device for ingest validation
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/feedback_no_executors.md` — no gsd-executor subagents; work inline

### CodeBox constraints (read by planner before sizing tasks)
- `~/CLAUDE.md` + `~/workspaces/CLAUDE.md` — pnpm only, never run `next build` in parallel agents, prefer `pnpm tsc --noEmit` for verification

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/lib/tech/bpr.ts`** — pure-function pattern (geometric-mean math, tier thresholds, tx-aware DB writer, exported for unit tests). `glitchmark.ts` clones this skeleton.
- **`src/db/schema.ts` benchmark domain** (lines 683-932) — enums, tables, relations all in place. GlitchMark only adds columns + one new history table; no new entities.
- **`src/actions/admin-tech-ingest.ts`** — ingest commit transaction is the single hook point for both BPR and GlitchMark recompute. No new ingest plumbing required.
- **`src/app/(tech)/tech/methodology/page.tsx`** — existing trust-layer surface; new section slots in.
- **Phase 27 idempotent migration pattern** (`0007_phase27_media.sql` + `run-phase27-migration.ts` + `pnpm db:migrate:phase{N}`) is the freshest template.

### Established Patterns
- **Numeric persistence:** `numeric(precision, scale)` — bpr uses `(5,4)` for 0.0000-99.9999; GlitchMark unbounded ratios × 100 → `numeric(7,2)` (allows up to 99999.99, plenty of headroom).
- **Versioning column:** text default ('1.1' for rubric_version) — same approach for `glitchmark_version` ('v1').
- **Pure function + DB writer split:** `computeBprFromPairs(ratios)` is testable without DB; `recomputeBpr(productId, tx)` does the DB work. Same split for GlitchMark.
- **Per-discipline eligibility flag:** `bpr_eligible boolean` on `tech_benchmark_tests` excludes a test from BPR. GlitchMark eligibility derived from `reference_score IS NOT NULL` (no separate boolean — having a baseline IS the eligibility).

### Integration Points
- **Schema:** append to `src/db/schema.ts` after `techBenchmarkRuns` and `techReviews` blocks
- **Migration:** `src/db/migrations/0008_phase28_glitchmark.sql` + `scripts/run-phase28-migration.ts` + `pnpm db:migrate:phase28`
- **Compute:** `src/lib/tech/glitchmark.ts` exports `computeGlitchmarkFromRatios(ratios)` (pure) + `recomputeGlitchmark(productId, tx)` (DB)
- **Ingest hook:** add `await recomputeGlitchmark(productId, tx)` in `src/actions/admin-tech-ingest.ts` immediately after the existing BPR recompute call
- **Admin form:** add `reference_score` numeric input to whatever form edits `tech_benchmark_tests` (likely under `src/app/admin/tech/benchmarks/`)
- **Methodology page:** new `<GlitchmarkSection>` component or inline JSX in the page

</code_context>

<specifics>
## Specific Ideas

- **Reference device anchor:** MBP 14 M3 base = 1.0 / score 100 (per audit Section I framing). Methodology page calls it out by name.
- **Real-data validation gate:** before declaring v1 locked in production, the operator should run the formula against the MBP 16 M5 Max numbers and sanity-check that "GlitchMark ~150-180" feels right. If MBP M5 Max scores 99 or 350, baselines need adjustment before launch. The phase delivers the math and the schema; the operator-side sanity check happens after the FLAG-* phase publishes real benchmarks.
- **Methodology page tone:** match the existing BPR section's voice — first-person plural, plain-English, no hedging. The formula is published, not proprietary. Industry-standard ambition is explicit.

</specifics>

<deferred>
## Deferred Ideas

- **Standalone `/tech/glitchmark` page** with deeper FAQ / interactive comparison — methodology section is enough for v1; expand only if the section grows past ~600 words
- **Recompute-all on baseline edit** — baselines are immutable in v1; v2 phase can add an admin job
- **Per-discipline weights** — geometric mean is intentionally unweighted; weighting belongs in v2 only if a real need surfaces
- **Cross-category GlitchMark** ("best across laptops + phones + tablets") — per-device only in v1
- **"GlitchMark Hall of Fame"** showcase surface — out of v4.0
- **Mobile-first device support beyond laptops** — per audit Section I "laptops + mobile devices first," but no mobile devices ingested in v1; mobile expansion is implicit-future, not new scope here

</deferred>

---

*Phase: 28-glitchmark-system*
*Context gathered: 2026-04-25*
