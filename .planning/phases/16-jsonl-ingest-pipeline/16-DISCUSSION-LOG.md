# Phase 16: JSONL Ingest Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 16-jsonl-ingest-pipeline
**Areas discussed:** JSONL line schema, Dry-run preview UX, Supersede + ambient-override flow, Exclusions + test coverage

---

## JSONL Line Schema

### Q1: How is run-level metadata carried in the JSONL file?

| Option | Description | Selected |
|--------|-------------|----------|
| Header line + result lines | First line = header object with run_uuid/ambient/macos_build/etc.; result lines carry only test data | ✓ |
| Repeated on every line | Every result line carries full metadata bundle inline | |
| Sidecar manifest + JSONL | Two-file upload: results.jsonl + manifest.json | |

**User's choice:** Header line + result lines (recommended)
**Notes:** Single source of truth, ~10× smaller payload, header-state machine is trivial.

### Q2: What's the per-result-line key set?

| Option | Description | Selected |
|--------|-------------|----------|
| discipline+tool+field+mode+score+unit+timestamp | Minimal keys driving the rubric-map lookup + run row | ✓ |
| Above + per-line run_flagged + notes | Adds optional self-flag fields per line | |
| Above + permalink_url | Adds Geekbench Browser URL etc. per line | |

**User's choice:** Minimal key set (recommended)
**Notes:** run_flagged becomes admin-set only. permalink_url deferred to a future schema version (passthrough-safe).

### Q3: What happens when run-level metadata fails validation?

| Option | Description | Selected |
|--------|-------------|----------|
| Block at step 1 with field list | Hard reject upload before dry-run if header is invalid | ✓ |
| Allow dry-run, block commit | Dry-run renders, commit disabled with explanation | |
| Allow inline edit in wizard | Admin manually fills missing header fields | |

**User's choice:** Block at step 1 (recommended)
**Notes:** Keeps Mac harness contract strict; rejects the ROADMAP's softer "website compensates" allowance.

---

## Dry-Run Preview UX

### Q1: How is the dry-run preview organized?

| Option | Description | Selected |
|--------|-------------|----------|
| Grouped by discipline accordion | Top-level accordion per discipline with status pills | ✓ |
| Flat sortable table | Single table of all lines, sortable by status | |
| Tabbed by status | Three tabs: Matched / Duplicates / Unknown | |

**User's choice:** Discipline accordion (recommended)
**Notes:** Mirrors mental model of a benchmark session; Mac harness produces one tool block per discipline.

### Q2: What metadata shows per row?

| Option | Description | Selected |
|--------|-------------|----------|
| Test name + score + unit + status | Compact row; raw JSONL on click expander | ✓ |
| Above + previous score for duplicates | Side-by-side old/new score for supersede rows | |
| Above + raw JSONL line always visible | Verbose; max transparency | |

**User's choice:** Compact row + click-to-expand raw (recommended)
**Notes:** Old/new score comparison was tempting but adds a column; click-expand on duplicates can reach the same data.

### Q3: How are validation errors surfaced?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline error message under each red row | One-liner reason directly below the row | ✓ |
| Summary banner at top + row highlights | Errors aggregated, link to scroll to first | |
| Tooltip on hover | Hover-only error reason | |

**User's choice:** Inline reasons (recommended)
**Notes:** Admin shouldn't have to hover or scroll to understand why a row is red.

---

## Supersede + Ambient-Override Flow

### Q1: How are duplicates confirmed before supersede?

| Option | Description | Selected |
|--------|-------------|----------|
| Banner + single confirm checkbox | One batch decision, "I confirm superseding N previous runs" | ✓ |
| Per-row checkbox in accordion | Individual supersede toggles per row | |
| Auto-supersede silently | Newer always wins, no admin gate | |

**User's choice:** Single batch confirm (recommended)
**Notes:** Forces admin to read N count; protects against accidental re-uploads. 40-row sets would be friction-heavy with per-row checkboxes.

### Q2: How does ambient_temp_c >26°C get handled?

| Option | Description | Selected |
|--------|-------------|----------|
| Hard-block file + override checkbox + reason text | Whole-file gate with required reason ≥10 chars | ✓ |
| Per-line block instead | Only thermally-affected lines blocked | |
| Soft warning, no block | Banner warns, commit still allowed | |

**User's choice:** Hard-block + override (recommended)
**Notes:** Mixing throttled and clean rows in one session would silently corrupt provenance. All-or-nothing override.

### Q3: What other anomalies set run_flagged automatically?

| Option | Description | Selected |
|--------|-------------|----------|
| Mac harness sets per-line; ingest preserves | No Phase 16 auto-detection | ✓ |
| Add run_flagged to per-line schema now | Reverses Q2 of JSONL schema area | |
| Ingest computes anomalies in-process | Server-side outlier detection vs baseline | |

**User's choice:** No Phase 16 auto-detection (recommended)
**Notes:** Outlier detection needs a baseline corpus that doesn't exist yet (Mac returns 2026-04-25). Defer to post-flagship-review phase.

---

## Exclusions + Test Coverage

### Q1: Where can admin set tech_review_discipline_exclusions?

| Option | Description | Selected |
|--------|-------------|----------|
| Separate edit page — not in ingest wizard | Wizard untouched; exclusions on review edit page (Phase 17) | ✓ |
| Inline in step 2 of wizard | Set exclusions during dry-run alongside missing-discipline rows | |
| Both — inline + edit page | Same UI in two places | |

**User's choice:** Separate edit page (recommended)
**Notes:** Keeps wizard focused; exclusions UI ships in Phase 17 alongside medal. Phase 16 only needs `bpr.ts` to read the table.

### Q2: What test coverage ships with Phase 16?

| Option | Description | Selected |
|--------|-------------|----------|
| Unit tests for bpr.ts + Playwright E2E | Math layer + flow layer separately tested | ✓ |
| Playwright E2E only | One test exercises everything indirectly | |
| Above + Zod schema unit tests | Adds explicit validator-contract tests | |

**User's choice:** Unit + E2E (recommended)
**Notes:** Two layers, each cheap to maintain; faster failure isolation when math breaks.

### Q3: Where does the deterministic JSONL fixture live?

| Option | Description | Selected |
|--------|-------------|----------|
| tests/fixtures/phase16-ingest/ | Dedicated directory with named .jsonl files | ✓ |
| Inline strings in test files | Template strings inside .spec.ts | |
| Generated at test runtime from RUBRIC_V1_1 | Synthetic JSONL via helper | |

**User's choice:** Dedicated fixtures directory (recommended)
**Notes:** ~40-line CPU §3.1 file is too big for inline strings; named files document the test scenarios (happy/duplicate/hot/malformed).

---

## Claude's Discretion

- File org of new server actions (single file vs split)
- Type names for `DryRunResult` / `ValidatedSession` / `CommitResult`
- Step 1 upload mechanism (useFormState vs file input vs shadcn pattern)
- `revalidatePath` route list (leaderboard route doesn't exist yet — placeholder safe)
- Whether `permalink_url` lands as optional passthrough now or later
- In-memory state management between Step 2 and Step 3 (nuqs vs React state vs server cache)
- Unit test file location (`src/lib/tech/bpr.spec.ts` vs `tests/unit/bpr.spec.ts`)

## Deferred Ideas

- Discipline exclusion editor UI (Phase 17)
- Run-flagged auto-detection (post-Phase 19)
- `permalink_url` per-line capture (future schema version)
- Ingest history view (Phase 17 edit page panel)
- Sidecar manifest file format (rejected unless future binary attachments needed)
