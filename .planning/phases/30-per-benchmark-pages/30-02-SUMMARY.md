---
phase: 30-per-benchmark-pages
plan: 02
status: complete
completed: 2026-04-27
---

# Plan 30-02 — Landing Page Rebuild

## Files Modified

- `src/app/(tech)/tech/benchmarks/page.tsx` — replaced honest-empty-state stub with discipline-grouped tile index (159 insertions, 15 deletions)
- `tests/30-02-benchmarks-landing.spec.ts` — created, 10 tests

## Verification

- `pnpm tsc --noEmit` — clean for new files (only pre-existing `tests/forensics-overlay-leak.spec.ts` error remains)
- `pnpm lint` — clean for new files (no new lint errors introduced)
- `pnpm exec playwright test tests/30-02-benchmarks-landing.spec.ts --project=desktop` — 10/10 passed (17.6s)
- `pnpm exec playwright test tests/30-02-benchmarks-landing.spec.ts --project=mobile` — 10/10 passed (17.0s)
- Manual smoke: `curl http://localhost:3004/tech/benchmarks` returns 200; methodology blurb + Geekbench 6 Multi-Core tile both render
- Brand sweep — 0 `GlitchTek` typos in page.tsx

## What Was Built

- TechHero unchanged (locked 29.2-09 copy: BENCHMARKS / Benchmarks / methodology CTA)
- Methodology blurb panel with inline link to `/tech/about#methodology`
- Jump-nav with 13 uppercase discipline labels in sortOrder (CPU first, DISPLAY last)
- 13 discipline sections, each with:
  - GlitchHeading-wrapped section heading
  - BPR ELIGIBLE badge for the 7 BPR-eligible disciplines (CPU, GPU, LLM, Video, Dev, Python, Games)
  - Test-count + mode summary (e.g., "5 tests · AC + Battery")
  - 1/2/3-column responsive tile grid
- 43 tile cards, each with:
  - GlitchHeading-wrapped test name
  - tool · unit · direction sub-line
  - BPR ELIGIBLE badge for tiles in BPR-eligible sections (23 tiles total)
  - Link to `/tech/benchmarks/{slug}` (detail route ships in 30-03)
- `dynamic = "force-static"` and `revalidate = 60` per UI-SPEC

## Deviations

None. UI-SPEC + plan template implemented faithfully.

## Notes for Plan 30-03

- 43 tile links currently 404 — Plan 30-03 ships the detail route at `/tech/benchmarks/[slug]`
- All slugs come from `slugFromRubricKey()` from Plan 30-01
- `DISCIPLINE_ORDER` constant in page.tsx is the canonical render order — Plan 30-03's detail page can reference it to derive "back to disciplines" navigation if needed
- TechHero on detail page should use eyebrow=`BENCHMARK` (singular) per UI-SPEC; landing page already uses `BENCHMARKS` (plural)

## Coverage

- SC-1 (43 tests, 13 sections, empty-state stub removed) — landed
- SC-6 (force-static + revalidate=60) — landed
- SC-7 (cross-link contract: tile → detail; methodology link) — landed (links resolve once 30-03 ships)
- SC-9 (GlitchTech spelling) — landed (negative grep gate in spec)
- SC-10 (sidebar one-screen) — landed (asserted by sidebar fit test)
