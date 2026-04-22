---
phase: 16-jsonl-ingest-pipeline
plan: 03
subsystem: tech/ingest/ui
tags: [wizard, ui, shadcn, accordion, ingest, admin, client-component]
requires:
  - src/actions/admin-tech-ingest.ts (ingestBenchmarkRunsDryRun, commitBenchmarkIngest, DryRunResult, ValidatedSession, CommitResult, PreviewRow types)
  - src/components/ui/accordion.tsx (@base-ui accordion wrapper)
  - src/components/ui/button.tsx (Button + buttonVariants)
  - src/components/ui/card.tsx, badge.tsx, checkbox.tsx, textarea.tsx
  - src/db/schema.ts (techReviews for server-side review lookup)
provides:
  - "/admin/tech/reviews/[id]/ingest route — 3-step JSONL ingest wizard"
  - "IngestWizard client component (upload → preview → done step machine)"
  - "Full D-03/D-04/D-05/D-06/D-07/D-09 UX in the admin flow"
affects:
  - "Plan 04 (E2E): Playwright tests target this route and exercise the three gates (header hard-block, supersede confirm, ambient override)"
  - "Phase 17 (BPR medal UI): the wizard is the source that populates tech_reviews.bpr_score + bpr_tier that the medal UI consumes"
tech-stack:
  added: []
  patterns:
    - "Server component wrapper → client wizard split: server validates review exists (notFound on miss); client owns all step/gate state"
    - "Upload step returns dry-run text via File.text() and posts jsonlText to the server action — no multipart upload, no UploadThing (D-02 line size is tiny)"
    - "Client builds ValidatedSession from DryRunResult by filtering to matched+duplicate rows; server re-validates in commitBenchmarkIngest (defense in depth per Plan 02 commit)"
    - "buttonVariants() + Link/anchor instead of Button asChild — this project's Button wraps @base-ui/react Button which has no slot/asChild support"
key-files:
  created:
    - "src/app/admin/tech/reviews/[id]/ingest/page.tsx (52 lines — server component)"
    - "src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx (631 lines — client wizard)"
  modified: []
decisions:
  - "Accordion prop: @base-ui Root uses `multiple` boolean (not `type=\"multiple\"`). Fixed during tsc pass — plan snippet used Radix/shadcn-legacy syntax"
  - "Button asChild not supported in this project's Button wrapper — replaced with Link/anchor + buttonVariants() for styled links (Back to Review, View Published)"
  - "Wizard filters out unknown rows when building ValidatedSession — only matched+duplicate rows are committed; server re-validates and accepts the filtered shape (matches Plan 02 rowsToProcess logic)"
  - "Rubric version is a display-only v1.1 Badge on Step 1 — client hardcodes '1.1' when building ValidatedSession; upgrading to v1.2 is a single-string change when Mac harness pack ships"
  - "Header validation error is surfaced inline on Step 1 (red alert div) AND via toast; admin cannot advance to Step 2 when !result.ok — satisfies D-03 hard-block requirement"
  - "Mode radio is informational-only on Step 1 (per-row mode is authoritative from JSONL). Kept per plan spec — gives admin a mental anchor about what session they're uploading"
metrics:
  duration_min: 14
  completed: 2026-04-22T13:56:17Z
---

# Phase 16 Plan 03: JSONL Ingest Wizard UI Summary

3-step admin wizard at `/admin/tech/reviews/[id]/ingest` — upload JSONL, preview dry-run with discipline accordion + supersede/ambient gates, commit and view BPR result. Consumes the two server actions from Plan 02.

## What Shipped

### `src/app/admin/tech/reviews/[id]/ingest/page.tsx` (52 lines — server component)

- Awaits route params, looks up `techReviews` by id (`columns: { id, productId, title, slug }`)
- `notFound()` if review missing
- Renders page chrome (back link, title, review name) and hands IDs to `<IngestWizard reviewId productId reviewSlug />`

### `src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx` (631 lines — client component)

Step machine: `"upload" | "preview" | "done"`.

- **Step 1 (Upload):**
  - File input accepting `.jsonl`, `application/jsonl`, `application/x-ndjson`, `text/plain`
  - Mode radios (AC / Battery) — informational, per-row mode is authoritative from JSONL payload
  - Rubric version badge (v1.1)
  - On submit: reads file as text, calls `ingestBenchmarkRunsDryRun(reviewId, text)`
  - **D-03:** if `result.ok === false`, renders inline red alert with error message AND toasts — does not advance to Step 2

- **Step 2 (Preview):**
  - Session metadata card (Run UUID, macOS build, ambient temp with `ABOVE THRESHOLD` badge when blocked, LPM, hostname, started_at, totals)
  - **D-09 ambient banner** (amber, only when `ambientBlocked`): warning copy, `Checkbox` "Override and ingest anyway", `Textarea` for reason with live character counter, 10-char minimum validation
  - **D-07 supersede banner** (yellow, only when `duplicateCount > 0`): count copy, `<details>` expander listing each (testName, mode, old score → new score), `Checkbox` "I confirm superseding N previous runs"
  - **D-04 discipline accordion** (`Accordion multiple`): renders only disciplines with rows; per section shows label + count pill ("N matched · N dup · N unknown")
    - **D-05 row:** status icon (✓ green / ⟳ yellow / ✗ red), clickable button `{testName} ({mode}) — {score} {unit}` toggles raw-payload `<pre>` detail view
    - **D-06:** inline red error text directly under unknown rows (pl-6 aligned under the icon column)
  - Back + Commit buttons. Commit disabled when any gate fails; helper text shows which gate is missing
  - `commitEnabled` = `result.ok && totalCommittable > 0 && ambientGateOk && supersedeGateOk`

- **Step 3 (Done):**
  - Green success line with inserted + superseded counts
  - BPR score (`.toFixed(1)%`) + tier badge, OR "needs ≥5 disciplines with both modes" fallback copy
  - Batch ID (monospace)
  - Nav: "Import Another File" (resets state), "Back to Review" (Link → edit page), "View Published →" (anchor target=_blank → `/tech/reviews/{slug}`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Accordion prop name: `multiple` not `type="multiple"`**

- **Found during:** Task 1 initial `pnpm tsc --noEmit` run
- **Issue:** Plan snippet used `<Accordion type="multiple">` — Radix/shadcn-legacy syntax. This project wraps `@base-ui/react/accordion` (see `src/components/ui/accordion.tsx`). Base-ui's `AccordionRoot.Props` has no `type` field; it exposes a boolean `multiple?: boolean` instead. TypeScript reported `TS2322 Property 'type' does not exist on type 'IntrinsicAttributes & Props<any>'`.
- **Fix:** Replaced `<Accordion type="multiple">` with `<Accordion multiple>`.
- **Files modified:** `src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx` (one occurrence)
- **Commit:** `4a43fda`

**2. [Rule 3 — Blocker] Button has no `asChild` prop**

- **Found during:** Task 1 tsc pass
- **Issue:** Plan snippet used `<Button asChild><a href="...">…</a></Button>` twice in Step 3 (Radix Slot pattern). This project's `Button` wraps `@base-ui/react/button`; `ButtonPrimitive.Props` has no `asChild`/slot support. TypeScript reported `TS2322 Property 'asChild' does not exist`.
- **Fix:** Replaced with `next/link` `<Link>` and plain `<a>` elements styled via `buttonVariants({ variant: "secondary" })` / `buttonVariants()`. Imported `buttonVariants` alongside `Button` from `@/components/ui/button` and added `import Link from "next/link"`.
- **Files modified:** `src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx` (two occurrences plus imports)
- **Commit:** `4a43fda`

### Architectural Decisions

None — plan called for a server-component page + client wizard pair and that is exactly what shipped. Both auto-fixes above were syntax-level adaptations to the project's component library, not structural changes.

### Out-of-Scope Discoveries

None surfaced during this plan. Pre-existing lint warnings in unrelated files were already logged to `deferred-items.md` by Plan 02.

## Known Stubs

None. Every piece of the UI consumes real data paths:

- `ingestBenchmarkRunsDryRun` and `commitBenchmarkIngest` are live server actions (Plan 02).
- Accordion, Checkbox, Textarea, Card, Badge, Button, buttonVariants are all real shadcn/base-ui components already wired into the admin dashboard (used by `admin-availability-editor.tsx`, `product-specs-table.tsx`, etc.).
- `reviewId`, `productId`, `reviewSlug` are resolved server-side from a real `techReviews` row.
- "View Published →" anchor targets the existing `/tech/reviews/[slug]` route.

The rubric version is hardcoded to `"1.1"` in the client — this is correct for the current rubric seed (Phase 15-02 shipped `RUBRIC_V1_1`). When the Mac harness pack v1.2 lands, this becomes a one-line change.

## Verification

- `test -f src/app/admin/tech/reviews/[id]/ingest/page.tsx` → exit 0
- `test -f src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx` → exit 0
- `grep -c '"use client"'` → 1 (in IngestWizard.tsx)
- `grep -c 'ingestBenchmarkRunsDryRun'` → 2
- `grep -c 'commitBenchmarkIngest'` → 2
- `grep -c 'ambientBlocked'` → 3 (state + derived gate + banner check)
- `grep -c 'I confirm superseding'` → 1 (D-07 exact copy)
- `grep -c 'errorReason'` → 2 (render + condition)
- `grep -c 'Accordion'` → 12 (Accordion/Item/Trigger/Content imports + usage)
- `pnpm tsc --noEmit` → exit 0
- `pnpm exec eslint 'src/app/admin/tech/reviews/[id]/ingest/page.tsx' 'src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx'` → clean (0 errors, 0 warnings)
- Line counts: page.tsx 52 lines, IngestWizard.tsx 631 lines (well over the 200-line minimum for the wizard artifact)

## Commits

| Task | Type | Hash | Message |
| ---- | ---- | ---- | ------- |
| 1 | feat | 4a43fda | feat(16-03): add 3-step JSONL ingest wizard UI |

## Requirements Closed

- **ING-01** — JSONL upload UI shipped (file input → dry-run → preview)
- **ING-03** — Supersede banner + confirm checkbox + details expander wired to `opts.confirmSupersede` in commit call
- **ING-04** — Ambient block banner + override checkbox + ≥10-char reason textarea wired to `opts.ambientOverride.reason` in commit call

(ING-02 preview data model and ING-06 BPR recompute were closed by Plan 02; ING-05 end-to-end coverage is the scope of Plan 04.)

## Hand-off Notes to Downstream Plans

- **Plan 04 (E2E):** Target URL is `/admin/tech/reviews/{id}/ingest`. Selectors: the file input has `id="jsonl-file"`; the commit button contains literal `"Commit"`; the supersede checkbox is adjacent to text `"I confirm superseding"`; the ambient override checkbox is adjacent to `"Override and ingest anyway"`; the override textarea placeholder starts with `"Override reason"`. Step 3 success line starts with a green `✓` and includes the literal strings `"inserted"` and `"superseded"`; BPR score appears when `≥5` eligible disciplines have both modes.
- **Plan 04 fixtures:** Upload `cpu-31-happy.jsonl` → expect matched-only, commit succeeds, tech_reviews.bpr_* populated (if enough disciplines). Upload `cpu-31-with-duplicate.jsonl` on top → expect supersede banner visible, commit button disabled until checkbox is checked. Upload `cpu-31-hot.jsonl` → expect amber banner, commit disabled until override checkbox checked AND ≥10 char reason entered.
- **Phase 17 (BPR medal UI):** No wizard changes needed. The medal UI consumes `tech_reviews.bpr_score` + `tech_reviews.bpr_tier` that this wizard triggers writes to (via Plan 02 commit action).

## Self-Check: PASSED

- `src/app/admin/tech/reviews/[id]/ingest/page.tsx` exists: FOUND
- `src/app/admin/tech/reviews/[id]/ingest/IngestWizard.tsx` exists: FOUND
- Commit `4a43fda` in git log: FOUND
- `pnpm tsc --noEmit` exit 0: VERIFIED
- `pnpm exec eslint` on new files clean: VERIFIED
- All acceptance-criteria grep patterns present: VERIFIED
