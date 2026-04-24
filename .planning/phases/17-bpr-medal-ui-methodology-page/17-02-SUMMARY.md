---
phase: 17-bpr-medal-ui-methodology-page
plan: 02
subsystem: ui
tags: [next, isr, methodology, bpr, base-ui, accordion]

requires:
  - phase: 15-methodology-lock-schema
    provides: RUBRIC_V1_1, BPR_ELIGIBLE_DISCIPLINES, BenchmarkDiscipline
  - phase: 16-jsonl-ingest-pipeline
    provides: BprTier type

provides:
  - getMethodologyData() pure function + MethodologyData shape
  - 5 methodology section components (formula, discipline-table, medal-table, exclusion-policy, changelog)
  - /tech/methodology force-static ISR page (revalidate=3600)

affects: [17-03, 18-leaderboard]

tech-stack:
  added: []
  patterns:
    - "Force-static ISR routes for canonical reference pages — revalidate=3600"
    - "Section components consume pure-function data; no DB reads"

key-files:
  created:
    - src/lib/tech/methodology.ts
    - src/components/tech/methodology-formula.tsx
    - src/components/tech/methodology-discipline-table.tsx
    - src/components/tech/methodology-medal-table.tsx
    - src/components/tech/methodology-exclusion-policy.tsx
    - src/components/tech/methodology-changelog.tsx
    - src/app/(tech)/tech/methodology/page.tsx
  modified: []

key-decisions:
  - "Auto-mode D-3: rubric v1.1 publishedAt hard-coded to 2026-04-23 (no tech_rubric_versions DB table)"
  - "Auto-mode D-4: getMethodologyData() is a synchronous pure function — UI-SPEC Drizzle-read wording was stale; no server-only directive"
  - "Medal threshold table renders chips inline (not via BPRMedal import) so Plans 01 and 02 could run in parallel"
  - "Auto-mode D-6: Back-to-Reviews CTA copies bordered-ghost classnames from review detail page verbatim"

patterns-established:
  - "Jump-to chip nav for anchor sections on long reference pages"
  - "base-ui Accordion with boolean `multiple` prop (NOT type='multiple')"

requirements-completed:
  - METH-05

duration: 15min
completed: 2026-04-23
---

# Phase 17 Plan 02: /tech/methodology Page

**Public methodology page — force-static ISR route rendering BPR formula, 7 eligible disciplines table, medal threshold table, exclusion policy, and rubric changelog accordion. All data comes from the synchronous getMethodologyData() pure function — no DB read.**

## Accomplishments
- `getMethodologyData()` returns 13 disciplines (7 BPR-eligible), medal thresholds, rubric changelog (v1.1), and the BPR geomean formula — all from static constants.
- 5 section components render each anchor target (`#bpr`, `#disciplines`, `#thresholds`, `#exclusion-policy`, `#rubric-changelog`) with verbatim UI-SPEC copy.
- `/tech/methodology` page composes hero + jump chips + 5 sections + back-to-reviews CTA + TechNewsletter. Force-static with `revalidate=3600`.
- Accordion wired with base-ui boolean `multiple` prop per Phase 16 lesson.

## Task Commits

1. **Task 1: getMethodologyData() pure function** — `425690b` (feat)
2. **Task 2: 4 methodology section components** — `2dbde04` (feat)
3. **Task 3: Medal table + page route** — `51595a3` (feat)

## Files Created/Modified
- `src/lib/tech/methodology.ts` — pure function, DISCIPLINE_COPY, MEDAL_THRESHOLDS, RUBRIC_CHANGELOG, BPR_FORMULA constants
- `src/components/tech/methodology-formula.tsx` — bordered code block + geomean prose
- `src/components/tech/methodology-discipline-table.tsx` — 7 BPR-eligible disciplines table
- `src/components/tech/methodology-medal-table.tsx` — medal threshold table with inline chip previews
- `src/components/tech/methodology-exclusion-policy.tsx` — exclusion + 5-of-7 prose
- `src/components/tech/methodology-changelog.tsx` — accordion v1.1 entry
- `src/app/(tech)/tech/methodology/page.tsx` — force-static ISR page

## Decisions Made
- **Auto-mode D-3:** rubric v1.1 publishedAt hard-coded to 2026-04-23 in RUBRIC_CHANGELOG. No tech_rubric_versions DB table per RESEARCH Pitfall #2.
- **Auto-mode D-4:** getMethodologyData() is a synchronous pure function, NOT a Drizzle read — UI-SPEC wording was stale. No `server-only` directive.
- **Medal table decoupling:** methodology-medal-table renders chips INLINE without importing BPRMedal so Plans 01 and 02 could run in parallel. Styling stack copied from bpr-medal.tsx tier palette.
- **Auto-mode D-6:** Back-to-Reviews CTA copies the bordered-ghost classname stack from `/tech/reviews/[slug]/page.tsx:158` verbatim so all CTAs match.

## Deviations from Plan
Minor: BreadcrumbLink component uses base-ui `render` prop (not `asChild`) — matched the existing `src/components/ui/breadcrumb.tsx` API rather than the plan's `asChild` snippet.

## Issues Encountered
None. Initial `asChild` typing error on BreadcrumbLink resolved by switching to base-ui `render={<Link …/>}`.

## Next Phase Readiness
- Plan 03 Playwright tests can target `/tech/methodology` threshold chips for medal-tier visual baselines.
- METH-05 satisfied.

---
*Phase: 17-bpr-medal-ui-methodology-page*
*Completed: 2026-04-23*
