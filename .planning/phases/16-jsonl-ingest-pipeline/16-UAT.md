---
status: testing
phase: 16-jsonl-ingest-pipeline
source: [16-01-SUMMARY.md, 16-02-SUMMARY.md, 16-03-SUMMARY.md, 16-04-SUMMARY.md]
started: 2026-04-22T11:30:00Z
updated: 2026-04-22T11:30:00Z
---

## Current Test

number: 2
name: Happy path — upload + dry-run preview
expected: |
  On the ingest page (Step 1), choose cpu-31-happy.jsonl, select mode=AC, submit. Advances to Step 2. Discipline accordion shows a "cpu" section with a count pill like "10 matched · 0 duplicate · 0 unknown". Expanding it reveals rows with test names (Geekbench, Cinebench, ripgrep), scores, and green ✓ status icons. No yellow or red rows.
awaiting: user response

## Tests

### 1. Import Benchmark Data link on Edit page
expected: Log in as admin, visit /admin/tech/reviews/{id}/edit. Somewhere in the review editor there's an "Import Benchmark Data" button/link that navigates to /admin/tech/reviews/{id}/ingest.
result: pass
note: Button confirmed at top-right of edit page. User flagged two out-of-scope issues during this test — both captured to backlog (see Out-of-Scope Findings below).

### 2. Happy path — upload + dry-run preview
expected: On the ingest page (Step 1), choose cpu-31-happy.jsonl, select mode=AC, submit. Advances to Step 2. Discipline accordion shows a "cpu" section with a count pill like "10 matched · 0 duplicate · 0 unknown". Expanding it reveals rows with test names (Geekbench, Cinebench, ripgrep), scores, and green ✓ status icons. No yellow or red rows.
result: [pending]

### 3. Commit happy path — result screen with BPR
expected: From Step 2 of the happy-path preview, click the commit button. Advances to Step 3. A success card shows inserted count (10), BPR score (numeric or null with "fewer than 5 disciplines" reason), and BPR tier (platinum/gold/silver/bronze or null). The review detail page / edit page now shows the updated BPR.
result: [pending]

### 4. Supersede flow (yellow banner + confirmation)
expected: Upload cpu-31-with-duplicate.jsonl against the SAME review, mode=AC. Step 2 shows a yellow banner at top with text like "N duplicates will be superseded" and a checkbox "I confirm superseding N previous runs". The commit button is disabled until the checkbox is ticked. Rows in the accordion show ⟳ yellow duplicate icons.
result: [pending]

### 5. Ambient block (amber banner + override reason)
expected: Upload cpu-31-hot.jsonl (ambient_temp_c: 28). Step 2 shows an amber blocking banner. The commit button is disabled. A checkbox "Override and ingest anyway" + a textarea for the reason appear. Commit stays disabled until the checkbox is ticked AND the reason text is ≥10 characters (live char counter).
result: [pending]

### 6. Malformed rows (red + inline errors)
expected: Upload cpu-31-malformed.jsonl. Step 2 shows red ✗ rows in the accordion. Each red row has an inline error message directly below it (not just a tooltip) — e.g. "invalid discipline" or "score must be finite".
result: [pending]

### 7. Header validation hard-block
expected: Manually craft or edit a JSONL file to remove a required header field (e.g. delete the ambient_temp_c field from the header line). Upload it. Step 1 shows an error message and does NOT advance to Step 2.
result: [pending]

## Summary

total: 7
passed: 1
issues: 0
pending: 6
skipped: 0
blocked: 0

## Out-of-Scope Findings

Surfaced during Phase 16 UAT but belong to other phases — captured to backlog instead of Phase 16 gaps:

- **Site-wide performance: admin tab switch (STUDIOS ⇄ TECH) takes 3–4 seconds** — user reports this is site-wide, not isolated to admin. Flagged as CRITICAL. → Backlog phase 999.4
- **Admin Details overlay: content cramped against edges** — no side padding/margin on the drawer, `DETAILS` title and `X` close button flush with border, rating rows too. → Backlog phase 999.5 (or merge into 999.2 admin UX)

## Gaps
