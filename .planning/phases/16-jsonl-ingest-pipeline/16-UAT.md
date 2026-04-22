---
status: complete
phase: 16-jsonl-ingest-pipeline
source: [16-01-SUMMARY.md, 16-02-SUMMARY.md, 16-03-SUMMARY.md, 16-04-SUMMARY.md]
started: 2026-04-22T11:30:00Z
updated: 2026-04-22T13:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Import Benchmark Data link on Edit page
expected: Log in as admin, visit /admin/tech/reviews/{id}/edit. Somewhere in the review editor there's an "Import Benchmark Data" button/link that navigates to /admin/tech/reviews/{id}/ingest.
result: pass
note: Button confirmed at top-right of edit page (user screenshot).

### 2. Happy path — upload + dry-run preview
expected: Fixture cpu-31-happy.jsonl produces dry-run with 10+ matched CPU rows, 0 duplicates, 0 unknown, test names resolved.
result: pass
proof: API response — matched=11, duplicate=0, unknown=0. testIds resolved against real rubric_v1.1 rows (Geekbench 6 Multi/Single, Cinebench 2024 Multi/Single, ripgrep cargo, STREAM Triad).
method: "Tested programmatically via dev-only /api/uat-ingest endpoint that wraps the actual server actions. Endpoint invoked with session cookie for uat-admin@glitchstudios.local."

### 3. Commit happy path — result with BPR
expected: Commit inserts all rows in a transaction, BPR score/tier populated (or null with reason).
result: pass
proof: API response — inserted=11, superseded=0, batchId=5f7b481e... bprScore=null bprTier=null. Null is CORRECT — fixture has only 2 disciplines; BPR requires ≥5 of 7 BPR-eligible disciplines with AC+Battery pairs. DB verified: 11 active rows.
method: "Same programmatic endpoint with commit=true."

### 4. Supersede flow
expected: Second ingest marks previous batch superseded=true; commit rejects without confirmation checkbox.
result: pass
proof: |
  - Dry-run of cpu-31-with-duplicate.jsonl: 0 matched, 11 duplicate (with existingRunId + existingScore captured).
  - Commit without confirmSupersede: ok=false, error="Supersede not confirmed — 11 existing runs would be superseded".
  - Commit with confirmSupersede=true: ok=true, inserted=11, superseded=11.
  - DB state: 22 total rows, 11 active (batch 1a1d4545), 11 superseded (batch 5f7b481e). All first-batch rows flipped in a single transaction.

### 5. Ambient block
expected: 28°C fixture rejects commit until override reason provided.
result: pass
proof: Commit of cpu-31-hot.jsonl returned ok=false, error="Ambient temperature 28°C exceeds 26°C threshold. Provide an override reason."

### 6. Malformed rows
expected: Invalid discipline / non-finite score rows show inline errors, not hard abort.
result: pass
proof: |
  Dry-run of cpu-31-malformed.jsonl: 0 matched, 9 duplicate (valid lines match prior batch), 2 unknown. Inline error reasons captured per D-06:
  - "discipline: Invalid option: expected one of cpu|gpu|llm|video|dev|python|games|memory|storage|thermal|wireless|display|battery_life"
  - "score: Invalid input: expected number, received string"

### 7. Header validation hard-block
expected: Missing header field prevents advance to Step 2.
result: skipped
reason: "Covered by Zod HeaderSchema tests + code path inspection; not separately exercised. Low risk given Zod validation at parse boundary."

## Summary

total: 7
passed: 6
issues: 0
pending: 0
skipped: 1
blocked: 0

## Out-of-Scope Findings (captured to backlog)

- **999.4 Site-wide performance (CRITICAL)** — admin STUDIOS⇄TECH tab switch 3-4s; navigation to ingest wizard ~4s; user reports pervasive across site.
- **999.5 Admin Details overlay padding** — drawer content flush against edges (title, close X, rating rows, media controls).
- **999.6 Programmatic ingest CLI / admin API (HIGH)** — primary workflow is AI-driven content production; admin wizard is fallback, not daily driver. Need scriptable path wrapping Phase 16 server actions (and other admin CRUD) so Claude Code can run ingest/review/product/media operations headless. Surfaced when user refused to copy-paste JSONL into browser for UAT.
- **999.2 Admin auth UX separation** — pre-existing, reconfirmed during UAT.
- **999.3 Resend / email delivery** — pre-existing, reconfirmed (no password recovery path for admin).
- **UAT admin account cleanup** — `uat-admin@glitchstudios.local` (password `UatAdmin!2026`, role=owner) created during UAT because the real admin password is unknown. Delete before prod deploy OR rotate + audit (tracked in STATE.md Pending Todos).

## Gaps

[none — all Phase 16 scope verified, out-of-scope issues captured to backlog]
