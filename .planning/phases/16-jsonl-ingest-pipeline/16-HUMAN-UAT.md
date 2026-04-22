---
status: partial
phase: 16-jsonl-ingest-pipeline
source: [16-VERIFICATION.md]
started: 2026-04-22T10:55:00Z
updated: 2026-04-22T10:55:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Run Playwright spec end-to-end against live dev server
expected: All 4 tests pass. `PLAYWRIGHT_BASE_URL=http://localhost:3004 ADMIN_EMAIL=… ADMIN_PASSWORD=… TEST_REVIEW_ID=<id> pnpm playwright test tests/16-ingest-wizard.spec.ts` — Test 1 commits happy fixture; Test 2 shows supersede banner; Test 3 gates commit behind ambient override; Test 4 shows red rows with inline errors. Spec auto-skips when env vars are missing.
result: [pending]

### 2. Induced-failure rollback test (Success Criterion 2)
expected: Ingest a JSONL where one mid-file line causes an INSERT failure (e.g. invalid testId or a NOT NULL violation). `db.transaction()` throws, Postgres rolls back all prior INSERTs in the tx, and `tech_reviews.bpr_score` is unchanged. Zero rows land in `tech_benchmark_runs` for that batch.
result: [pending]

### 3. Duplicate/supersede DB-state check (Success Criterion 3)
expected: Ingest `cpu-31-happy.jsonl`, then ingest `cpu-31-with-duplicate.jsonl` against the same review. Query confirms first batch's 11 rows are now `superseded=true`; second batch's 11 rows are `superseded=false`; total table rows for that product = 22.
result: [pending]

### 4. revalidatePath actually invalidates ISR cache
expected: Note current `tech_reviews.bpr_score`, visit `/tech/reviews/{slug}` (cache the page), commit a new ingest that changes BPR, reload the public page without a hard refresh or query-string bust — new BPR is visible.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
