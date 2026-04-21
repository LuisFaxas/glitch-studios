# Phase 16: JSONL Ingest Pipeline - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin uploads a JSONL benchmark log produced by the Mac harness → 3-step wizard validates and previews → atomic transaction commits inserts → BPR is recomputed and pages revalidate. Four concrete deliverables (matching ROADMAP plan hint):

1. **`src/lib/tech/bpr.ts`** — `computeBprScore(productId)` (geometric mean of `battery_d / ac_d` across 7 BPR-eligible disciplines) + `bprMedal(score)` (Platinum/Gold/Silver/Bronze/null thresholds).
2. **Server actions in `src/actions/admin-tech-benchmarks.ts`** — `ingestBenchmarkRunsDryRun(reviewId, jsonlText, options)` and `commitBenchmarkIngest(reviewId, validatedSession, options)`. Per-line Zod validation, rubric-map lookup, single `db.transaction` commit, BPR recompute on success, `revalidatePath` calls for review detail + leaderboards + tech homepage.
3. **3-step wizard UI at `src/app/admin/tech/reviews/[id]/ingest/page.tsx`** — Step 1 upload + mode pick + rubric-version pick; Step 2 dry-run preview (discipline accordion, inline errors, supersede confirm, ambient-temp override); Step 3 commit + post-commit summary.
4. **"Import Benchmark Data" link** wired into `src/app/admin/tech/reviews/[id]/edit/page.tsx` + Playwright E2E + unit tests for `bpr.ts`.

Out of scope: BPR medal UI (Phase 17), `/tech/methodology` page (Phase 17), category leaderboard (Phase 18), discipline exclusion editor (planned for Phase 17 review edit page — see Deferred). This phase ships the data path; subsequent phases consume the data.

</domain>

<decisions>
## Implementation Decisions

### JSONL File Shape (Mac Harness Contract)

- **D-01:** **Header line + result lines.** First non-blank line of the JSONL file is a header object:
  ```jsonc
  {"type": "header", "run_uuid": "01HXY...", "ambient_temp_c": 22.4, "macos_build": "25D2128", "lpm_enabled": false, "hostname": "MBP-16-M5", "started_at": "2026-04-25T14:32:00Z"}
  ```
  Subsequent non-blank lines are result rows. Header parsed once, applied to every result row at insert time. Single source of truth for run-level metadata; ~10× smaller payload than per-line repetition.
  - Rationale: matches PITFALLS B-5 (source attribution) without bloating the file. Rejects the "sidecar manifest" alternative because it doubles the upload UX.

- **D-02:** **Per-result-line schema (Zod):**
  ```ts
  z.object({
    discipline: BenchmarkDisciplineEnum,        // 13-value enum, must match RUBRIC_V1_1
    tool: z.string().min(1),                    // e.g. "geekbench6", "blender"
    field: z.string().min(1),                   // e.g. "multi", "single", "monster"
    mode: z.enum(["ac", "battery"]),            // never "both" on a result row
    score: z.number().finite().nonnegative(),
    unit: z.string().min(1),                    // e.g. "pts", "fps", "MB/s"
    timestamp: z.string().datetime(),
  })
  ```
  The composite key `${discipline}:${tool}:${field}` is the lookup into `RUBRIC_V1_1`. Unknown combos = red "unknown" rows in preview, NOT a hard reject.
  - `permalink_url` is **not** part of the per-line schema for this phase — admin can fill it later via the existing run edit UI if needed (Claude's Discretion).
  - `run_flagged` is **not** parsed from per-line payload in this phase. Only admin override (D-09) populates it. Mac harness pack v1.2 may emit it later — schema can be extended without breaking v1.1 contract.

- **D-03:** **Header validation = hard-block at Step 1.** If header line is missing, malformed, or missing any required field (`run_uuid`, `ambient_temp_c`, `macos_build`, `lpm_enabled`, `hostname`, `started_at`), the upload step fails immediately with an error listing exactly which fields are missing. No dry-run. Admin must re-export from Mac.
  - Rejects the "allow inline edit in wizard" alternative (which the ROADMAP comment "website compensates with metadata entry" hinted at) — explicit choice to keep the harness contract strict and avoid manual-fill drift in published reviews.

### Dry-Run Preview UX

- **D-04:** **Discipline accordion.** Top-level accordion per discipline (CPU, GPU, LLM, Video, Dev, Python, Games, Memory, Storage, Thermal, Wireless, Display, Battery Life). Section headers show status pills: "CPU: 5 matched, 1 duplicate, 0 unknown". Sections with zero rows are collapsed/dimmed. Mirrors how Josh thinks about a benchmark session.

- **D-05:** **Per-row metadata = test name + score + unit + status.**
  Example row: `Geekbench 6 Multi (AC) — 18,742 pts — ✓ matched`.
  - Click row → expands to show the verbatim JSONL line (raw payload).
  - Status icons: ✓ green (matched, will insert), ⟳ yellow (duplicate of existing non-superseded run, will supersede), ✗ red (unknown rubric key OR validation failure).

- **D-06:** **Inline error message under each red row.** One-liner reason directly below the row when status is red:
  - `Unknown rubric key: "cpu:cinebench:r24" — not in RUBRIC_V1_1`
  - `Score must be finite, got "Infinity"`
  - `discipline "neuralengine" not a valid enum value`
  - No tooltip-only errors — admin must see the reason in the visual flow.

### Supersede Confirmation

- **D-07:** **Single batch confirm checkbox (banner).** When dry-run finds N duplicate rows, top of Step 2 shows a yellow banner:
  > "N rows will mark previous benchmarks as superseded. [Show details ▾]"
  Detail expander lists `(test_name, mode, old_run_uuid → new_run_uuid)`. Admin must check **"I confirm superseding N previous runs"** before commit button enables. One decision for the whole batch — no per-row supersede toggles.

- **D-08:** Supersede transaction is part of the same `db.transaction()` as the new inserts. If commit fails for any reason, no row is superseded and no row is inserted (atomic rollback per PITFALLS B-2).

### Hot-Run / Ambient Override

- **D-09:** **Hard-block file when `ambient_temp_c > 26`.** Step 2 commit button disabled. Banner:
  > "Ambient 28.4°C exceeds 26°C threshold — results may be thermally throttled."
  Admin must check **"Override and ingest anyway"** AND type a reason of ≥10 chars. Reason saved to `run_flagged` on **every row** in the session (not just CPU/GPU rows). Whole-file override, no partial bypass.
  - Rationale: per PITFALLS B-5, mixing thermally-affected and clean rows in one session would silently corrupt provenance. Either the whole session is canonical or the whole session is flagged.

- **D-10:** No automatic anomaly detection in this phase. `run_flagged` is only set by D-09 (admin ambient override). Future phases may add outlier detection (rejected for MVP — needs baseline corpus that doesn't exist yet).

### Discipline Exclusions

- **D-11:** **Exclusions are NOT set inside the ingest wizard.** Admin manages `tech_review_discipline_exclusions` from a separate panel on the existing review edit page (`/admin/tech/reviews/[id]/edit`). Ingest just respects whatever's already in the table when computing BPR. Keeps wizard focused.
  - **Scope note:** the exclusion editor UI itself is a Phase 17 deliverable (it's coupled to the medal UI that consumes exclusions). Phase 16 just needs `bpr.ts` to read the exclusions table during the post-commit recompute and skip excluded disciplines from the geometric mean.

### BPR Computation

- **D-12:** `src/lib/tech/bpr.ts` exports two pure functions:
  ```ts
  export function bprMedal(score: number | null): "platinum" | "gold" | "silver" | "bronze" | null
  export async function computeBprScore(productId: string, options?: { rubricVersion?: string }): Promise<{ score: number | null, tier: BprTier | null, perDiscipline: Record<Discipline, number | null> }>
  ```
  - `computeBprScore` queries `getBenchmarkRunsForProducts([productId])` (already DISTINCT ON product/test/mode after Phase 15), groups by discipline, computes per-discipline `battery_avg / ac_avg` ratio, then geometric mean across the 7 eligible disciplines (CPU, GPU, LLM, Video, Dev, Python, Games), then `* 100`.
  - Excluded disciplines (per `tech_review_discipline_exclusions` for that review's product) are dropped from the geometric mean.
  - If fewer than 5 of 7 eligible disciplines have both AC + Battery data, return `{score: null, tier: null}` (no medal — protects against premature publish).

- **D-13:** Tier thresholds (locked in METH-04, restated for clarity): score ≥90 → platinum, ≥80 → gold, ≥70 → silver, ≥60 → bronze, <60 → null.

### Server Action Contracts

- **D-14:** Two server actions in `src/actions/admin-tech-benchmarks.ts`:
  ```ts
  export async function ingestBenchmarkRunsDryRun(reviewId: string, jsonlText: string): Promise<DryRunResult>
  export async function commitBenchmarkIngest(reviewId: string, validatedSession: ValidatedSession, opts: { confirmSupersede: boolean, ambientOverride?: { reason: string } }): Promise<CommitResult>
  ```
  Return shapes drive the UI directly (no client-side recomputation of preview state).

- **D-15:** Commit transaction (per PITFALLS B-2 — parse-then-commit):
  1. Re-validate `validatedSession` server-side (defense against client tampering).
  2. Open `db.transaction(async (tx) => { ... })`.
  3. Mark duplicate rows `superseded = true`.
  4. Insert all new rows with shared `run_uuid`, `ingest_batch_id` (new uuid), `rubric_version`, `ambient_temp_c`, `macos_build`, `run_flagged` (if D-09 override).
  5. Compute new BPR via `computeBprScore(productId)` and update `tech_reviews.bpr_score` + `bpr_tier` within same transaction.
  6. After transaction commits, fire `revalidatePath` for: `/tech/reviews/[slug]`, `/tech/reviews`, `/tech/categories/[slug]/rankings` (when Phase 18 ships — placeholder safe), `/tech` (homepage spotlight).

### Test Coverage

- **D-16:** **Unit tests for `bpr.ts` + Playwright E2E for the wizard.**
  - **Unit (`tests/unit/bpr.spec.ts` or co-located `src/lib/tech/bpr.spec.ts` per project convention — planner picks):** `bprMedal` boundary tests (89/90/79/80/etc.), `computeBprScore` cases (happy path, missing discipline, all exclusions, all-zero ratios → null, fewer-than-5-disciplines → null).
  - **Playwright E2E (`tests/16-ingest-wizard.spec.ts`):** upload happy fixture → assert accordion structure + counts → commit → assert DB has expected rows + bpr_tier on tech_reviews. Second test: upload duplicate fixture → assert supersede banner + checkbox flow. Third test: upload hot fixture → assert ambient block + override flow.

- **D-17:** **Fixtures live in `tests/fixtures/phase16-ingest/`:**
  - `cpu-31-happy.jsonl` — header (ambient 22°C) + ~40 CPU §3.1 result lines that match `RUBRIC_V1_1` (Geekbench 6 single/multi AC+Battery, Cinebench 2024, Hyperfine, ripgrep — both modes per test).
  - `cpu-31-with-duplicate.jsonl` — happy fixture re-issued with a different `run_uuid` (used to test supersede flow).
  - `cpu-31-hot.jsonl` — happy fixture with `ambient_temp_c: 28` in header (used to test override flow).
  - `cpu-31-malformed.jsonl` — line 12 has `score: "Infinity"` and one line has `discipline: "neuralengine"` (used to test red-row error UX).

### Claude's Discretion
- File organization within `src/actions/admin-tech-benchmarks.ts` vs splitting into a new `src/actions/admin-tech-ingest.ts` (planner picks based on file size after Phase 15 changes).
- Type names for `DryRunResult`, `ValidatedSession`, `CommitResult` (follow existing camelCase + project type-naming conventions).
- Whether the Step 1 upload uses `useFormState`/Server Action upload, a controlled file input, or shadcn/ui's file input pattern (planner picks the simplest path that handles a ~50KB JSONL upload without UploadThing — local file content goes straight into the server action as a string).
- Exact route for `revalidatePath` calls — leaderboard route doesn't exist yet (Phase 18). Planner can wire a placeholder array and the leaderboard phase plugs in. No-op `revalidatePath` on a non-existent route is safe.
- Whether `permalink_url` is added to the per-line schema as an optional field now (passthrough, stored if present) or deferred — planner decides; either is forward-compatible.
- Where to store the in-memory `validatedSession` between Step 2 and Step 3 (URL state via `nuqs`? React state + form action? short-lived server cache?) — planner picks; UX requirement is just that admin can leave Step 3 unconfirmed without losing dry-run state on a single back-click.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements + Roadmap
- `.planning/REQUIREMENTS.md` §Methodology & Schema (METH-01..04 — already validated, restate the BPR formula and tier thresholds) and §Ingest Pipeline (ING-01..06 — the full requirement list for this phase)
- `.planning/ROADMAP.md` §Phase 16: JSONL Ingest Pipeline — plan hint (4 plans) and 5 success criteria
- `.planning/PROJECT.md` §Current Milestone — v3.0 GlitchTek Launch scope

### Research (read before planning)
- `.planning/research/PITFALLS.md` §B-1 (duplicate runs / supersede), §B-2 (parse-then-commit transaction), §B-3 (rubric version filtering), §B-4 (BPR gameability via exclusions), §B-5 (source attribution + ambient temp threshold)
- `.planning/research/ARCHITECTURE.md` — ingest pipeline shape and transaction boundary
- `.planning/research/STACK.md` — Drizzle `db.transaction` API, Zod validation patterns, Server Actions in Next.js 16
- `.planning/research/SUMMARY.md` §Locked Methodology Constants

### Phase 15 outputs (the foundation this phase consumes)
- `.planning/phases/15-methodology-lock-schema/15-CONTEXT.md` — schema + rubric decisions (D-01..D-23) — especially D-08 (`run_uuid` is uuid not text), D-09 (`ingest_batch_id` is uuid nullable), D-15 (RUBRIC_V1_1 key shape `discipline:tool:field`)
- `.planning/phases/15-methodology-lock-schema/15-01-SUMMARY.md` — exact columns/enums/indexes that landed
- `.planning/phases/15-methodology-lock-schema/15-02-SUMMARY.md` — `RUBRIC_V1_1` shape (43 entries, 13 disciplines, 23 BPR-eligible) and `BPR_ELIGIBLE_DISCIPLINES` array
- `.planning/phases/15-methodology-lock-schema/15-03-SUMMARY.md` — `getBenchmarkRunsForProducts` and `getBenchmarkSpotlight` are now safe to call (DISTINCT ON + superseded filter)

### Existing Code (the wizard + actions modify these)
- `src/db/schema.ts` — all tech tables (post-Phase 15: `techBenchmarkRuns` with `mode`, `runUuid`, `superseded`, etc.; `techBenchmarkTests` with `discipline`, `mode`, `bprEligible`; `techReviews` with `bprScore`, `bprTier`; `techReviewDisciplineExclusions`)
- `src/lib/tech/rubric-map.ts` — `RUBRIC_V1_1` constant and `BPR_ELIGIBLE_DISCIPLINES`
- `src/lib/tech/queries.ts:678-703` — `getBenchmarkRunsForProducts` (use this from `bpr.ts`)
- `src/actions/admin-tech-benchmarks.ts` — existing action shape + `createRun` (now defaults `mode="ac"` + auto-generates `runUuid` per Phase 15-01 fix)
- `src/app/admin/tech/reviews/[id]/edit/page.tsx` — where the "Import Benchmark Data" link is wired
- `src/db/seeds/rubric-v1.1.ts` — pattern for an idempotent dotenv+postgres-js script (planner can mirror for fixture-loading helpers if needed)

### Project instructions
- `./CLAUDE.md` — CodeBox constraints (no parallel `next build`, prefer `tsc --noEmit` + `pnpm lint`), pnpm only, Playwright tests OK in series
- User memory: "User rejects expensive agent spawns; try smaller models progressively" — planner should default to sonnet executors

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `RUBRIC_V1_1` in `src/lib/tech/rubric-map.ts` — single source of truth for `(discipline, tool, field)` → `tech_benchmark_tests` natural key. The dry-run lookup is `RUBRIC_V1_1[\`${discipline}:${tool}:${field}\`]`.
- `BPR_ELIGIBLE_DISCIPLINES` array — exact 7-discipline list for BPR computation. Don't hardcode the list in `bpr.ts`.
- `getBenchmarkRunsForProducts(productIds)` in `src/lib/tech/queries.ts` — already returns at most one row per `(product, test, mode)` with `superseded=false` filter. Use this directly from `computeBprScore` rather than re-querying.
- `db.transaction(async (tx) => { ... })` from Drizzle — proven pattern in `src/actions/admin-tech-products.ts` and `admin-tech-categories.ts` (Phase 7.5 baseline).
- shadcn/ui form components, sonner toast, AlertDialog — all already in the admin dashboard.

### Established Patterns
- Server Actions in `src/actions/admin-*.ts` files; admin pages co-locate server-only code via `import "server-only"`.
- Zod schemas live next to the action that validates with them (no central `schemas/` directory yet).
- Admin route group is at `/admin/*`, all server-rendered, auth-gated by Better Auth middleware.
- Playwright tests in `tests/` directory; run via `pnpm playwright test`.
- Dotenv-loaded standalone scripts (Phase 15 pattern in `src/db/seeds/rubric-v1.1.ts`) — useful template for any data-tooling scripts.

### Integration Points
- `src/app/admin/tech/reviews/[id]/edit/page.tsx` gets a new "Import Benchmark Data" link → routes to new `/admin/tech/reviews/[id]/ingest`.
- Post-commit `revalidatePath` targets the existing `/tech/reviews/[slug]` page — verify the slug is queryable from `reviewId` in the action.
- `tech_reviews.bpr_score` + `bpr_tier` columns exist (Phase 15) but no UI consumes them yet (Phase 17). Phase 16 just writes; consumers come later. No coordination risk.

</code_context>

<specifics>
## Specific Ideas

- The "ambient temp >26°C" threshold and the override-with-reason flow come straight from PITFALLS B-5 — Josh's mental model is that thermally-throttled runs should never silently land in published scores. Whole-file override, never per-line.
- The discipline accordion mirrors how the Mac bench harness produces the JSONL (one tool block per discipline, e.g. cpu.sh produces all CPU rows in one block). Visual structure echoes the data structure.
- "I confirm superseding N previous runs" copy intentionally requires admin to read the count — single-character checkboxes are too easy to muscle-memory through.
- Header line first decision was driven by the Mac harness already being structured this way (see `_lib/logging.sh` reference in PITFALLS B-5 — "wraps each tool invocation with hostname, macOS build, and timestamp").

</specifics>

<deferred>
## Deferred Ideas

- **Discipline exclusion editor UI** on `/admin/tech/reviews/[id]/edit` — Phase 17 deliverable (coupled to medal UI that consumes exclusions). Phase 16 only needs `bpr.ts` to *read* the table; it does not write to it.
- **Run-flagged auto-detection** (outlier detection vs baseline corpus) — needs a baseline corpus that won't exist until ~5+ reviews are ingested. Revisit after Phase 19 (flagship review ships).
- **`permalink_url` per-line capture** — admin can edit the field via existing run edit UI for now. Add to JSONL schema if Mac harness pack v1.2 starts emitting it.
- **Ingest history view** — Plan 03 hint mentions "duplicate history view" within the wizard; the editor's "view all runs for this product" detail panel is sufficient and lives elsewhere. Surface in Phase 17 alongside the medal.
- **Sidecar manifest file format** — rejected in favor of header-line. If the Mac harness ever needs to ship binary attachments (screenshots of thermal traces?), revisit then.

### Reviewed Todos (not folded)
None — `gsd-tools todo match-phase 16` returned 0 matches.

</deferred>

---

*Phase: 16-jsonl-ingest-pipeline*
*Context gathered: 2026-04-21*
