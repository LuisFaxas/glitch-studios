---
phase: 30-per-benchmark-pages
plan: 03
status: complete
completed: 2026-04-27
---

# Plan 30-03 — Detail Page Route

## Files Created

- `src/components/tech/benchmark-leaderboard-table.tsx` — client-side sortable mode-aware leaderboard table
- `src/app/(tech)/tech/benchmarks/[slug]/page.tsx` — server-rendered detail route with `generateStaticParams`, `generateMetadata`, all 5 UI regions
- `tests/30-03-benchmark-detail.spec.ts` — 8 Playwright tests, all pass on desktop

## Verification

- `pnpm tsc --noEmit` — clean for new files (only pre-existing `tests/forensics-overlay-leak.spec.ts` error remains)
- `pnpm exec playwright test tests/30-03-benchmark-detail.spec.ts --project=desktop` — 8/8 passed (14.1s)
- Manual smoke:
  - `curl http://localhost:3004/tech/benchmarks/cpu-geekbench6-multi` → 200, Geekbench 6 Multi-Core renders
  - `curl http://localhost:3004/tech/benchmarks/not-a-real-test` → 404
  - `curl http://localhost:3004/tech/benchmarks/memory-stream-triad` → 200 (AC-only)
  - `curl http://localhost:3004/tech/benchmarks/battery-life-video-loop-hours` → 200 (battery-only)

## Deviations

### MAJOR: bpr-sentence copy diverges from UI-SPEC line 273

UI-SPEC §"What this measures panel" instructs the bpr-sentence template for non-BPR tests to be:
> "This test does not contribute to BPR; it feeds the GlitchMark composite."

The plan revision (per checker MAJOR-1) replaced this with:
> "This test does not contribute to BPR. It surfaces here as a standalone reference."

**Reason:** Per memory `project_glitchmark.md`, GlitchMark is "never roadmapped... distinct from BPR" and is not a public-facing concept. Although `src/lib/tech/glitchmark.ts` exists internally, surfacing GlitchMark in user-facing detail-page copy would fabricate a system that has no public surface today.

**Recommendation:** Update `30-UI-SPEC.md` line 273 to match the neutral copy now shipped, OR add an explicit roadmap entry for GlitchMark public surfacing before reverting the copy.

### Minor: GlitchHeading API requires `text` prop in addition to children

The plan template wrote `<GlitchHeading>{text}</GlitchHeading>`. The actual API requires both `children` AND `text` (the latter is used for `aria-label` and the duplicated layered RGB-split text). Implementation uses `<GlitchHeading text={...}>{...}</GlitchHeading>` consistently.

## Notes for Plan 30-04

- Detail page is fully wired. Cross-links from leaderboard rows already resolve:
  - Row product cell → `/tech/reviews/[slug]`
  - Row category cell → `/tech/categories/[slug]`
- Plan 30-04's job is to wire the **other direction**: methodology page (`/tech/about`) → discipline-specific anchors on the new `/tech/benchmarks` landing page
- Look for `MethodologyDisciplineCards` in `src/components/tech/methodology-discipline-cards.tsx` (already discovered during 30-02 reading) and the parent that calls it (likely `src/app/(tech)/tech/about/page.tsx`)
- The discipline anchor IDs on the landing page are `discipline-cpu`, `discipline-gpu`, `discipline-memory`, `discipline-storage`, `discipline-llm`, `discipline-video`, `discipline-dev`, `discipline-python`, `discipline-games`, `discipline-thermal`, `discipline-battery-life` (note hyphen), `discipline-wireless`, `discipline-display`

## Coverage

- SC-2 (slug → detail page resolves) — landed via `generateStaticParams` + `rubricKeyFromSlug`
- SC-3 (TechHero, metadata, what-this-measures, leaderboard) — all 5 regions render
- SC-4 (rows show product + category + AC/Battery + BPR + vs-baseline) — table component honors all five
- SC-5 (404 for unknown slug; rubric-without-row → 200 + empty panel) — `dynamicParams = false` 404; query layer returns `{rows: []}` for valid-slug-no-test-row case
- SC-6 (`generateStaticParams` + `force-static` + `revalidate=60`) — all three set
- SC-7 (row product → /tech/reviews; row category → /tech/categories) — links wired in table component
- SC-9 (GlitchTech spelling) — negative grep gate in spec; 0 occurrences in new files
