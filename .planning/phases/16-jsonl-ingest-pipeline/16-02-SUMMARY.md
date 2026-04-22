---
phase: 16-jsonl-ingest-pipeline
plan: 02
subsystem: tech/ingest
tags: [ingest, jsonl, zod, drizzle, transaction, bpr, server-action]
requires:
  - src/lib/tech/bpr.ts (computeBprScore accepts optional tx parameter)
  - src/lib/tech/rubric-map.ts (RUBRIC_V1_1)
  - src/db/schema.ts (techBenchmarkRuns, techBenchmarkTests, techReviews)
  - src/lib/permissions.ts (requirePermission)
provides:
  - "ingestBenchmarkRunsDryRun(reviewId, jsonlText) → DryRunResult"
  - "commitBenchmarkIngest(reviewId, validatedSession, opts) → CommitResult"
  - "DryRunResult, ValidatedSession, CommitResult, PreviewRow, PreviewRowStatus types"
affects:
  - "Plan 03 (wizard UI): consumes both server actions + DryRunResult/CommitResult shapes"
  - "Plan 04 (E2E): exercises the full dry-run → commit → BPR update → revalidate path end-to-end"
  - "Phase 17 (BPR medal UI): reads tech_reviews.bpr_score + bpr_tier populated by commit"
tech-stack:
  added: []
  patterns:
    - "Parse-then-commit (B-2): Zod validation + DB lookup in dry-run, transactional INSERT/UPDATE in commit"
    - "Transaction-scoped BPR recompute: computeBprScore(tx) sees uncommitted rows via same connection"
    - "Whole-file ambient override (D-09): run_flagged set on every inserted row, not per-line"
    - "Server-side re-validation of validatedSession (defense against client tampering)"
key-files:
  created:
    - "src/actions/admin-tech-ingest.ts (523 lines — dry-run + commit server actions + types)"
    - ".planning/phases/16-jsonl-ingest-pipeline/deferred-items.md (20 lines — pre-existing lint triage log)"
  modified: []
decisions:
  - "Zod v4 .issues (not .errors): installed zod is 4.3.6; plan's verbatim snippet used legacy .errors, adjusted during coding (silent compat fix, not a design deviation)"
  - "Mode-aware duplicate lookup in dry-run: matches the Phase 15 partial UNIQUE index (productId, testId, mode, runUuid) WHERE superseded=false — duplicate means an existing non-superseded row exists for (product, test, mode)"
  - "Test lookup by (name, discipline) not just name: techBenchmarkTests.naturalKey is (templateId, discipline, mode, name); adding discipline filter in dry-run avoids cross-discipline name collisions without needing to resolve templateId"
  - "db.transaction wraps supersede + insert + BPR update + tech_reviews update — one atomic unit per B-2. BPR is computed inside the transaction with tx so the recompute sees uncommitted inserted rows via the same connection"
  - "revalidatePath on a non-existent leaderboard route (/tech/categories/laptops/rankings) is safe — Next.js no-ops. Placeholder lands now per D-15 step 6 so Phase 18 just wires the page without touching this action"
  - "node:crypto randomUUID() used for ingest_batch_id — matches the existing createRun pattern (src/actions/admin-tech-benchmarks.ts) which uses global crypto.randomUUID()"
  - "Pre-existing lint errors (60 errors in unrelated files: tech-cross-link-tile.tsx, dither.jsx, test files, etc.) logged to deferred-items.md per scope-boundary rule. src/actions/admin-tech-ingest.ts itself is lint-clean"
metrics:
  duration_min: 4
  completed: 2026-04-22T13:34:12Z
---

# Phase 16 Plan 02: JSONL Ingest Server Actions Summary

Dry-run + transactional commit server actions for JSONL benchmark ingest — Zod header/line validation, mode-aware duplicate detection against Phase 15 partial UNIQUE, supersede + insert + BPR recompute + tech_reviews.bpr_* update inside a single `db.transaction()`.

## What Shipped

- **`src/actions/admin-tech-ingest.ts`** (523 lines) — two server actions:

  1. **`ingestBenchmarkRunsDryRun(reviewId, jsonlText)`** — parse-only (no DB writes):
     - Splits JSONL, filters blank lines
     - Validates header against `HeaderSchema` (D-01): hard-block + specific missing-fields message if malformed (D-03)
     - Resolves `productId` from `techReviews` (hard-block if review not found)
     - Per-result-line: `ResultLineSchema.safeParse()` (D-02) — malformed lines become red "unknown" rows with inline `errorReason` (D-06), NOT a global abort
     - Rubric lookup: `RUBRIC_V1_1[\`${discipline}:${tool}:${field}\`]` — missing key → red "unknown" row
     - DB test resolution: `(name, discipline)` match on `techBenchmarkTests`
     - DB duplicate check: existing non-superseded run for `(productId, testId, mode)` → row becomes yellow "duplicate" with `existingRunId` + `existingScore` populated
     - Returns `DryRunResult` with `matchedCount`, `duplicateCount`, `unknownCount`, `ambientBlocked` (= `ambient_temp_c > 26`)

  2. **`commitBenchmarkIngest(reviewId, validatedSession, opts)`** — transactional commit:
     - Re-validates session server-side (D-15 step 1: missing reviewId/productId/runUuid → error)
     - Gates supersede via `opts.confirmSupersede` when any duplicate rows present (D-07)
     - Gates ambient override: if `ambientTempC > 26` requires `opts.ambientOverride.reason` of ≥10 chars (D-09)
     - Opens `db.transaction(async (tx) => { ... })` for atomic: supersede UPDATEs → INSERTs → BPR recompute → tech_reviews UPDATE (D-08/D-15)
     - Inside tx: calls `computeBprScore(productId, { rubricVersion }, tx)` so the BPR recompute SEES the just-inserted rows on the same connection (critical — without `tx`, a new pool connection under READ COMMITTED would miss uncommitted rows)
     - `run_flagged` reason applied to EVERY inserted row when ambient override (D-09 whole-file flag)
     - After commit: `revalidatePath` for review detail `/tech/reviews/{slug}`, `/tech/reviews`, `/tech` homepage, `/admin/tech/reviews`, `/admin/tech/reviews/{id}/edit`, and a leaderboard placeholder `/tech/categories/laptops/rankings` (Phase 18 plug-in safe per D-15 note)

- **Exported types:** `DryRunResult`, `ValidatedSession`, `CommitResult`, `PreviewRow`, `PreviewRowStatus` — the wizard UI (Plan 03) consumes these directly, no client-side recompute of preview state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocker] Zod v4 API: `.issues` not `.errors`**

- **Found during:** Task 1 initial `pnpm tsc --noEmit` run
- **Issue:** Plan's verbatim Zod snippet used `headerResult.error.errors` / `lineResult.error.errors`, which does not exist on `ZodError` in Zod v4 (the installed version is `zod@4.3.6`). TypeScript reported `TS2339 Property 'errors' does not exist`.
- **Fix:** Replaced both references with `.issues`. Behavior identical — same array of issue objects with `path` and `message` fields.
- **Files modified:** `src/actions/admin-tech-ingest.ts` (two occurrences)
- **Commit:** `3968397` (landed with Task 1 GREEN)

### Out-of-Scope Discoveries

**Pre-existing lint errors logged to `deferred-items.md`:**

- `pnpm lint` across the whole repo reports 60 errors + 65 warnings, none of which originate in Phase 16 code.
- Sample: `react-hooks/set-state-in-effect` in `src/components/tiles/tech-cross-link-tile.tsx`, `react-hooks/refs` in `src/components/ui/dither.jsx`, `@typescript-eslint/no-explicit-any` in test files.
- `pnpm exec eslint src/actions/admin-tech-ingest.ts` returns clean — this plan contributes zero new lint issues.
- Triage deferred to a future `/gsd:quick` pass; not in scope for Phase 16.

### Architectural Decisions

None — plan called for a single new file with two exported server actions and that is what shipped.

## Known Stubs

None. Both server actions are fully wired to real DB schema, real BPR library (Plan 01), and real `revalidatePath` cache targets.

**Note on leaderboard revalidation:** `revalidatePath("/tech/categories/laptops/rankings")` is a placeholder — the target route doesn't exist until Phase 18. Next.js no-ops revalidation of non-existent routes, so this is safe per CONTEXT.md D-15 note and Claude's Discretion bullet on placeholder paths. Not a stub (the call is intentional and future-safe), just documented.

## Verification

- `pnpm tsc --noEmit` → exit 0
- `pnpm exec eslint src/actions/admin-tech-ingest.ts` → clean (0 errors, 0 warnings)
- `test -f src/actions/admin-tech-ingest.ts` → FOUND
- `grep -c 'export async function' src/actions/admin-tech-ingest.ts` → 2 (ingestBenchmarkRunsDryRun + commitBenchmarkIngest)
- Dry-run path contains no `tx.insert|update|delete` or `db.insert|update|delete` calls → 0 matches (parse-only confirmed)
- `grep` acceptance criteria (all pass):
  - `"use server"` ✓
  - `export async function ingestBenchmarkRunsDryRun` ✓
  - `export async function commitBenchmarkIngest` ✓
  - `export interface DryRunResult / ValidatedSession / CommitResult` ✓
  - `HeaderSchema`, `ResultLineSchema` ✓
  - `RUBRIC_V1_1[` lookup ✓
  - `ambientBlocked` + `ambient_temp_c > 26` present ✓
  - `db.transaction` + `superseded: true` + `runFlagged` ✓
  - `computeBprScore(...tx...)` called with tx parameter (multiline; verified via `rg -U`) ✓
  - 6 `revalidatePath` calls present ✓
  - `Override reason must be at least 10` ✓

## Commits

| Task | Type | Hash | Message |
| ---- | ---- | ---- | ------- |
| 1 | feat | 3968397 | feat(16-02): add ingestBenchmarkRunsDryRun + ingest types |
| 2 | feat | f36b447 | feat(16-02): add commitBenchmarkIngest with tx-scoped BPR recompute |

## Requirements Closed

- **ING-01** — JSONL parse layer shipped (Zod header + per-line + RUBRIC lookup)
- **ING-02** — Dry-run preview data model (matched/duplicate/unknown with inline errors)
- **ING-03** — Supersede logic (batch confirm + atomic supersede inside transaction)
- **ING-04** — Ambient hard-block with override + whole-file `run_flagged` flag
- **ING-06** — BPR recompute inside commit transaction wired to `computeBprScore(tx)` (Plan 01 supplied the library)

**Partially progressed:** ING-05 (wizard UI) — consumed by Plan 03.

## Hand-off Notes to Downstream Plans

- **Plan 03 (wizard):** `import { ingestBenchmarkRunsDryRun, commitBenchmarkIngest, type DryRunResult, type ValidatedSession, type CommitResult } from "@/actions/admin-tech-ingest"`. Step 1 uploads JSONL → calls dry-run → renders `rows` grouped by discipline. Step 2 surfaces `ambientBlocked` + `duplicateCount` gates. Step 3 posts a `ValidatedSession` (build by filtering dry-run rows to `matched`/`duplicate` only + adding `reviewId`, `productId`, `rubricVersion`, `sourceFile`) back to `commitBenchmarkIngest(reviewId, session, { confirmSupersede, ambientOverride, sourceFile })`.
- **Plan 04 (E2E):** After wizard commit, assert `tech_benchmark_runs` has N new rows with matching `ingest_batch_id`, `techReviews.bpr_score` + `bpr_tier` are populated, and any superseded duplicates from the re-issue fixture have `superseded=true`. Use the Plan-01 fixture files (`cpu-31-happy.jsonl`, `cpu-31-with-duplicate.jsonl`, `cpu-31-hot.jsonl`).
- **Phase 17 (medal UI):** No new ingest code needed. Reads the `bpr_score` + `bpr_tier` columns this plan writes.

## Self-Check: PASSED

- `src/actions/admin-tech-ingest.ts` exists: FOUND
- `.planning/phases/16-jsonl-ingest-pipeline/deferred-items.md` exists: FOUND
- Commit `3968397` in git log: FOUND
- Commit `f36b447` in git log: FOUND
- `pnpm tsc --noEmit` exit 0: VERIFIED
- `pnpm exec eslint src/actions/admin-tech-ingest.ts` clean: VERIFIED
