---
phase: 16-jsonl-ingest-pipeline
verified: 2026-04-22T10:55:00Z
status: human_needed
score: 5/5 success criteria structurally verified
human_verification:
  - test: "Run Playwright spec against live dev server"
    expected: "Test 1 (happy) commits 11 CPU rows; Test 2 (duplicate) shows supersede banner; Test 3 (hot) gates commit behind override+reason; Test 4 (malformed) shows red rows with inline errors"
    why_human: "Playwright spec requires running dev server + TEST_REVIEW_ID + ADMIN_EMAIL/PASSWORD env vars per spec comments (lines 10-23); cannot exercise without real DB + auth"
  - test: "Induce a deliberate mid-commit error and confirm full rollback"
    expected: "Success Criterion 2: syntax error mid-JSONL causes db.transaction() to throw, zero rows persist in tech_benchmark_runs"
    why_human: "Rollback atomicity is a runtime transaction property; grep confirms the db.transaction() wrapper structure but cannot prove rollback behavior without a live DB"
  - test: "Ingest happy fixture twice; verify superseded=true on first batch rows"
    expected: "Success Criterion 3: second ingest with same (productId, testId, mode) marks previous row superseded=true; query tech_benchmark_runs shows only latest batch with superseded=false"
    why_human: "Requires live DB to observe row state across two ingests"
  - test: "Verify revalidatePath actually invalidates ISR cache"
    expected: "After commit, /tech/reviews/[slug] page shows updated BPR score without manual refresh"
    why_human: "Next.js cache invalidation is a runtime behavior; grep confirms revalidatePath is called with correct paths but not that cache actually clears"
---

# Phase 16: JSONL Ingest Pipeline Verification Report

**Phase Goal:** Admin can upload a JSONL file from the Mac bench harness, preview exactly which rows will be inserted or skipped, and commit the ingest atomically — with BPR score recomputed and stored immediately after commit.

**Verified:** 2026-04-22T10:55:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Success Criteria from ROADMAP)

| # | Truth (Success Criterion) | Status | Evidence |
|---|--------------------------|--------|----------|
| 1 | Uploading CPU §3.1 JSONL through 3-step wizard produces dry-run preview with matched=green / duplicate=yellow / unknown=red; no partial writes until step 3 | ✓ VERIFIED | `IngestWizard.tsx` implements 3 states (`step: "upload" | "preview" | "done"`); `statusIcon()` maps matched→green ✓, duplicate→yellow ⟳, unknown→red ✗ (lines 210-228); `ingestBenchmarkRunsDryRun` performs zero writes — only `db.select` + `db.query.techReviews.findFirst` (no INSERT/UPDATE calls before commit) |
| 2 | Commit wraps all inserts in single `db.transaction()`; mid-JSONL syntax error causes full rollback | ? UNCERTAIN → HUMAN | `commitBenchmarkIngest` at `admin-tech-ingest.ts:439` opens `await db.transaction(async (tx) => { … })` wrapping supersede UPDATEs + INSERTs + BPR UPDATE; grep confirms structure but rollback behavior needs live DB test |
| 3 | Second ingest of same file marks previous run superseded=true | ✓ VERIFIED (structural) / HUMAN (runtime) | Dry-run duplicate detection at `admin-tech-ingest.ts:284-298` (existingRun query with `superseded=false` filter). Commit path at line 441-448 sets `superseded: true` on each duplicate's `existingRunId` inside the tx. |
| 4 | ambient_temp_c > 26 blocks commit until override checkbox checked AND reason entered | ✓ VERIFIED | Server-side gate: `admin-tech-ingest.ts:323` (`ambientBlocked = header.ambient_temp_c > 26`), `:388` (commit rejects without `opts.ambientOverride?.reason`), `:399` (rejects reason < 10 chars). Client gate: `IngestWizard.tsx:189-195` (`ambientGateOk` derived state); `:381-415` (amber banner with checkbox + textarea + char counter) |
| 5 | After commit, `tech_reviews.bpr_score` and `bpr_tier` are updated and `revalidatePath` fires | ✓ VERIFIED | Within tx at `admin-tech-ingest.ts:478-491`: `computeBprScore(productId, opts, tx)` called with `tx`, then `tx.update(techReviews).set({ bprScore, bprTier })`. After tx commits, `revalidatePath` fires for 6 paths: `/tech/reviews/{slug}`, `/tech/reviews`, `/tech`, `/admin/tech/reviews`, `/admin/tech/reviews/{id}/edit`, `/tech/categories/laptops/rankings` (lines 501-509) |

**Score:** 4/5 truths fully verified structurally; Criterion 2 (rollback) requires human runtime test.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/tech/bpr.ts` | `computeBprScore` + `bprMedal` + `computeBprFromPairs` exports; tx parameter; innerJoin | ✓ VERIFIED | 178 lines; exports all three functions + `BprTier` type + `DbClient` type; `client = tx ?? db` (line 76); `innerJoin(techBenchmarkTests, ...)` (line 111-114); imports `BPR_ELIGIBLE_DISCIPLINES` from rubric-map (line 12) |
| `src/lib/tech/bpr.spec.ts` | ≥60 lines of unit tests for bprMedal + formula | ✓ VERIFIED | 63 lines; 11 bprMedal boundary tests + 7 computeBprFromPairs tests; vitest run: 18/18 passed |
| `src/actions/admin-tech-ingest.ts` | `ingestBenchmarkRunsDryRun` + `commitBenchmarkIngest` + DryRunResult/ValidatedSession/CommitResult types | ✓ VERIFIED | 524 lines; "use server" directive (line 1); both async functions exported; all 3 interfaces exported; HeaderSchema + ResultLineSchema (verbatim per D-01/D-02) at lines 79-113; `db.transaction` at 439; `computeBprScore(..., tx)` at 478-482; 6 `revalidatePath` calls at 501-509 |
| `src/app/admin/tech/reviews/[id]/ingest/page.tsx` | Server component wrapper with review lookup | ✓ VERIFIED | 52 lines; server component (`dynamic = "force-dynamic"`); validates review exists via `db.query.techReviews.findFirst`; passes reviewId/productId/reviewSlug to IngestWizard |
| `src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx` | ≥200 lines; "use client"; calls both server actions; discipline accordion | ✓ VERIFIED | 631 lines; `"use client"` directive (line 1); imports both server actions; 13 DISCIPLINES accordion; both D-07 supersede banner and D-09 ambient banner implemented |
| `src/app/admin/tech/reviews/[id]/edit/page.tsx` (modified) | Import Benchmark Data link pointing to ingest route | ✓ VERIFIED | Line 50-55: Next.js Link with `href={`/admin/tech/reviews/${id}/ingest`}` and text "Import Benchmark Data"; `import Link from "next/link"` at line 5 |
| `tests/16-ingest-wizard.spec.ts` | ≥80 lines; 4 test cases; references all 4 fixtures | ✓ VERIFIED | 299 lines; 4 `test(...)` blocks; references `cpu-31-happy.jsonl`, `cpu-31-with-duplicate.jsonl`, `cpu-31-hot.jsonl`, `cpu-31-malformed.jsonl`; skip-guard for missing env vars |
| `tests/fixtures/phase16-ingest/cpu-31-happy.jsonl` | ≥12 lines, valid header + CPU result rows | ✓ VERIFIED | 12 lines; header (ambient 22.4°C) + 10 CPU AC/Battery pairs + 1 memory row |
| `tests/fixtures/phase16-ingest/cpu-31-with-duplicate.jsonl` | Different run_uuid, same test rows | ✓ VERIFIED | 12 lines; run_uuid `22222222-…` (differs from happy); bumped scores for supersede test |
| `tests/fixtures/phase16-ingest/cpu-31-hot.jsonl` | ambient_temp_c: 28 | ✓ VERIFIED | 12 lines; `"ambient_temp_c": 28.0` on line 1 |
| `tests/fixtures/phase16-ingest/cpu-31-malformed.jsonl` | Has invalid discipline AND Infinity score | ✓ VERIFIED | 12 lines; `"discipline": "neuralengine"` (line 3) + `"score": "Infinity"` (line 6) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/lib/tech/bpr.ts` | `src/db/schema.ts` | `innerJoin` | ✓ WIRED | Line 111-114: `db.select(...).from(techBenchmarkRuns).innerJoin(techBenchmarkTests, eq(...))` |
| `src/lib/tech/bpr.ts` | `src/db/schema.ts` | `techReviewDisciplineExclusions` query | ✓ WIRED | Line 91: `client.select({discipline: techReviewDisciplineExclusions.discipline}).from(techReviewDisciplineExclusions).where(eq(...reviewId, review.id))` |
| `src/lib/tech/bpr.ts` | `src/lib/tech/rubric-map.ts` | `BPR_ELIGIBLE_DISCIPLINES` import | ✓ WIRED | Line 12: `import { BPR_ELIGIBLE_DISCIPLINES, type BenchmarkDiscipline } from "@/lib/tech/rubric-map"`; used in filters (lines 133, 151) |
| `src/actions/admin-tech-ingest.ts` | `src/lib/tech/rubric-map.ts` | `RUBRIC_V1_1[...]` lookup | ✓ WIRED | Line 12 import; line 231 lookup `RUBRIC_V1_1[rubricKey]` where `rubricKey = ${discipline}:${tool}:${field}` |
| `src/actions/admin-tech-ingest.ts` | `src/lib/tech/bpr.ts` | `computeBprScore(productId, opts, tx)` inside transaction | ✓ WIRED | Line 13 import; line 478-482 call inside `db.transaction(async (tx) => { … computeBprScore(..., tx) … })` |
| `src/actions/admin-tech-ingest.ts` | `src/db/schema.ts` | `db.transaction` — INSERT/UPDATE techBenchmarkRuns + techReviews | ✓ WIRED | Line 439 `db.transaction`; tx.update(techBenchmarkRuns) at 443; tx.insert(techBenchmarkRuns) at 453; tx.update(techReviews) at 485 |
| `src/app/admin/tech/reviews/[id]/ingest/page.tsx` | `src/actions/admin-tech-ingest.ts` | `ingestBenchmarkRunsDryRun` + `commitBenchmarkIngest` calls | ✓ WIRED | Actions imported in IngestWizard.tsx (lines 18-20); invoked at line 110 (`ingestBenchmarkRunsDryRun(reviewId, text)`) and line 160 (`commitBenchmarkIngest(reviewId, validatedSession, …)`) |
| `src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx` | `src/components/ui/accordion.tsx` | Accordion + AccordionItem + AccordionTrigger | ✓ WIRED | Lines 11-15 imports; `<Accordion multiple …>` at line 468; iterates disciplinesWithRows |
| `src/app/admin/tech/reviews/[id]/edit/page.tsx` | `src/app/admin/tech/reviews/[id]/ingest/page.tsx` | Link href | ✓ WIRED | Line 51: `href={`/admin/tech/reviews/${id}/ingest`}` |
| `tests/16-ingest-wizard.spec.ts` | `src/app/admin/tech/reviews/[id]/ingest/page.tsx` | `page.goto('/admin/tech/reviews/{id}/ingest')` | ✓ WIRED | Lines 75, 139, 190, 254: `page.goto(\`${BASE_URL}/admin/tech/reviews/${TEST_REVIEW_ID}/ingest\`, …)` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| IngestWizard.tsx | `dryRun` state | `ingestBenchmarkRunsDryRun(reviewId, text)` server action return | YES — action queries techReviews, techBenchmarkTests, techBenchmarkRuns and returns real preview rows | ✓ FLOWING |
| IngestWizard.tsx | `commitResult` state | `commitBenchmarkIngest(…)` server action return | YES — action performs real transactional INSERT and BPR update, returns `{inserted, superseded, bprScore, bprTier}` | ✓ FLOWING |
| admin-tech-ingest.ts `ingestBenchmarkRunsDryRun` | `existingRun` | `db.select(…).from(techBenchmarkRuns).where(…superseded=false)` | YES — real DB query, not a mock | ✓ FLOWING |
| admin-tech-ingest.ts `commitBenchmarkIngest` | `bprResult` | `computeBprScore(productId, opts, tx)` inside tx | YES — real DB query via tx client; sees uncommitted rows from same tx (verified structurally) | ✓ FLOWING |
| bpr.ts `computeBprScore` | `runs` | `client.select(…).from(techBenchmarkRuns).innerJoin(techBenchmarkTests, …)` | YES — real DB query with mode + discipline + bprEligible | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript type-checks across all Phase 16 files | `pnpm tsc --noEmit` | Exit code 0 | ✓ PASS |
| bpr.spec.ts unit tests pass | `pnpm vitest run src/lib/tech/bpr.spec.ts` | 18/18 passed in 917ms | ✓ PASS |
| ingestBenchmarkRunsDryRun has no DB writes | `grep -E "(tx\\.insert\\|tx\\.update)" — before line 439 (transaction open)` | Zero matches in dry-run function body (lines 137-340); writes only appear inside commit transaction | ✓ PASS |
| Playwright spec covers 4 test cases | `grep -c 'test(' tests/16-ingest-wizard.spec.ts` | 4 | ✓ PASS |
| All 4 JSONL fixtures present | `ls tests/fixtures/phase16-ingest/*.jsonl | wc -l` | 4 | ✓ PASS |
| Playwright E2E against live server | `pnpm playwright test tests/16-ingest-wizard.spec.ts` | Requires dev server + TEST_REVIEW_ID env + ADMIN_EMAIL/PASSWORD | ? SKIP → HUMAN |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|----------------|-------------|--------|----------|
| ING-01 | 02, 03, 04 | Admin JSONL upload 3-step wizard at `/admin/tech/reviews/[id]/ingest` | ✓ SATISFIED | page.tsx + IngestWizard.tsx implement 3 steps (upload/preview/done); Step 1 has file input + AC/Battery selector + rubric version badge (v1.1); wraps commit in single db.transaction |
| ING-02 | 02, 04 | Zod validation per JSONL line (discipline, tool, score, unit, timestamp required); malformed blocks upload with line-number error | ✓ SATISFIED | `ResultLineSchema` (admin-tech-ingest.ts:105-113) validates every required field; per-line failures appear as red "unknown" rows with `errorReason` including line index; `HeaderSchema` (D-03) hard-blocks on header failure |
| ING-03 | 02, 03, 04 | ambient_temp_c, macos_build, run_uuid captured; ambient > 26°C blocks with override + reason | ✓ SATISFIED | HeaderSchema requires all three fields; `ambientBlocked` flag (line 323); commit rejects without override+reason (lines 388-411); run_uuid stored on every run; macos_build stored on every run (line 466); run_flagged set on every row when override (D-09) |
| ING-04 | 02, 03, 04 | Duplicate run marks old row superseded=true; new row inserted | ✓ SATISFIED (insert path) | Dry-run detects existing non-superseded run per (productId, testId, mode) at line 284; commit sets `superseded: true` on each duplicate's existingRunId inside tx (line 443-447); new row inserted (line 453). Note: "Surfaces the history on the admin detail page" — deferred to Phase 17 per CHECK-REPORT.md; not a Phase 16 failure |
| ING-05 | 01, 02, 04 | Rubric map in `src/lib/tech/rubric-map.ts` defines (discipline, tool, field) → test.id translation | ✓ SATISFIED | RUBRIC_V1_1 is keyed `${discipline}:${tool}:${field}`; ingest action looks up entry at line 231; unknown keys appear as red rows with "Unknown rubric key" message (line 245) |
| ING-06 | 01, 02, 04 | BPR score + tier computed post-commit; revalidatePath fires for review detail + leaderboards + tech homepage | ✓ SATISFIED | computeBprScore(productId, opts, tx) called inside tx (line 478); tx.update(techReviews).set({bprScore, bprTier}) at 485; revalidatePath fires for 6 paths after tx (lines 501-509) — covers review detail slug, /tech/reviews list, /tech homepage, admin list, admin edit, and leaderboard placeholder |

No orphaned requirements. REQUIREMENTS.md Phase-mapping shows ING-01..ING-06 all assigned to "Phase 2" (the second dev phase after Phase 15 methodology-lock, = Phase 16 ordinal in roadmap); all six are covered across plans 01-04 per CHECK-REPORT.md.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| IngestWizard.tsx | 72 | `const [mode, setMode] = useState<"ac" | "battery">("ac")` — mode state exists but is not passed to server actions or referenced in commit | ℹ️ Info | D-17 comment acknowledges: "Per-row mode is read from each JSONL entry. This selector is informational." — intended behavior; documented in UI copy (line 306-309). No blocker. |
| admin-tech-ingest.ts | — | No TODO/FIXME/PLACEHOLDER strings found | — | Clean |
| bpr.ts | — | No placeholder comments | — | Clean |
| IngestWizard.tsx | 468 | `<Accordion multiple …>` uses base-ui prop API (not radix `type="multiple"`) | ℹ️ Info | Confirmed via accordion.tsx which wraps `@base-ui/react/accordion`. tsc passes, so prop is valid. |
| tests/fixtures/phase16-ingest/*.jsonl | — | Rubric field uses short form `ripgrep_cargo` instead of spec'd `ripgrep_cargo_mean_s` | ⚠️ Warning (documented) | Deferred per `deferred-items.md` — known rubric-map object-key vs. field property inconsistency; fixtures match the actual lookup convention used by the ingest action (`${discipline}:${tool}:${field}` where field is the object-key suffix, not the RubricTestSpec.field property). Not a Phase 16 failure; requires rubric v1.2 decision before 2026-04-25. |

### Human Verification Required

1. **Run Playwright spec end-to-end**
   - **Test:** `PLAYWRIGHT_BASE_URL=http://localhost:3004 ADMIN_EMAIL=… ADMIN_PASSWORD=… TEST_REVIEW_ID=<id> pnpm playwright test tests/16-ingest-wizard.spec.ts`
   - **Expected:** All 4 tests pass against a live dev server. Test 1 seeds matched state, Test 2 exercises supersede, Test 3 exercises ambient override, Test 4 shows red rows with inline errors.
   - **Why human:** Spec file explicitly skips when auth/env vars are missing (`test.skip(!ok, ...)` at lines 61, 137, 188, 252); CodeBox verifier cannot safely start a dev server with real DB + auth.

2. **Verify rollback atomicity with induced failure**
   - **Test:** Ingest a JSONL where one mid-file line produces a schema constraint violation at INSERT time (e.g. mutate tech_benchmark_runs to have NOT NULL that fixture omits, or pass an invalid testId). Confirm zero rows land in tech_benchmark_runs.
   - **Expected:** Transaction throws; Postgres rolls back all prior INSERTs in the tx; tech_reviews.bpr_score unchanged.
   - **Why human:** Transaction isolation behavior is a runtime property of Postgres + drizzle-orm — grep confirms `db.transaction(async (tx) => { … })` wrapping but cannot prove rollback.

3. **Verify duplicate flow (Success Criterion 3) with second ingest**
   - **Test:** Ingest cpu-31-happy.jsonl, then ingest cpu-31-with-duplicate.jsonl against the same review. Query `select count(*) from tech_benchmark_runs where product_id = … and superseded = false;`
   - **Expected:** First 11 rows remain but with `superseded=true`; second batch's 11 rows are `superseded=false`; total rows in table = 22 for that product.
   - **Why human:** Requires live DB state inspection; Playwright Test 2 checks UI banner but not DB truth.

4. **Verify revalidatePath actually invalidates ISR**
   - **Test:** Note current `tech_reviews.bpr_score` for a review; visit `/tech/reviews/{slug}` (note cached page); commit a new ingest that changes BPR; reload the public page without query-string bust.
   - **Expected:** Public page shows new BPR without requiring a hard refresh or redeploy.
   - **Why human:** Next.js cache behavior depends on build mode and adapter config.

### Gaps Summary

No structural gaps found. All 5 ROADMAP success criteria have concrete code paths that satisfy them. All 6 ING-0x requirements are implemented. All 11 artifacts exist at expected paths with expected content. All 10 key links are wired. tsc passes. Vitest passes 18/18. Playwright spec has 4 test cases covering D-16 scenarios.

The phase is structurally complete and ready for:
- Human runtime verification against a live dev server + DB (items above)
- The documented deferred rubric-map field-naming inconsistency (tracked in `deferred-items.md`; does not block Phase 16 sign-off but must be resolved before 2026-04-25 Mac harness use)

One truth (Success Criterion 2 — rollback) is verified structurally (db.transaction wraps all writes; thrown error from any tx step aborts the transaction) but cannot be proven without induced runtime failure. This is a standard limitation of static verification for transactional behavior — not a Phase 16 gap.

---

_Verified: 2026-04-22T10:55:00Z_
_Verifier: Claude (gsd-verifier)_
