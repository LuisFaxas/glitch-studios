---
phase: 30-per-benchmark-pages
plan: 04
status: complete
completed: 2026-04-27
---

# Plan 30-04 — Cross-Links + Methodology

## Files Modified

- `src/components/tech/methodology-discipline-cards.tsx` — wrapped each discipline tile in `<Link>` to `/tech/benchmarks#discipline-{slug}` (10-line edit)
- `tests/30-04-cross-links.spec.ts` — created, 8 Playwright tests, all pass

## Verification

- `pnpm tsc --noEmit` — clean for modified files (only pre-existing `tests/forensics-overlay-leak.spec.ts` error remains)
- `pnpm exec playwright test tests/30-04-cross-links.spec.ts --project=desktop` — 8/8 passed (15.4s)
- Manual smoke: `curl http://localhost:3004/tech/about | grep "/tech/benchmarks#discipline-"` returned all 13 expected slugs (cpu, gpu, memory, storage, llm, video, dev, python, games, thermal, battery-life, wireless, display)

## Precheck Outcome

- `data.disciplines` (built in `src/lib/tech/methodology.ts:159`) already enumerates all 13 BenchmarkDiscipline values from `DISCIPLINE_COPY`
- No scope expansion needed — count was already 13. Only the wrap-in-Link change applied.
- The `slug` field on each tile is the BenchmarkDiscipline enum value (e.g., `"battery_life"` with underscore); the helper `disciplineAnchorHref()` collapses underscores to hyphens to match the landing-page anchor ids set in Plan 30-02.

## Deviations

None. The "if count < 13, expand parent" branch from the plan was not needed.

## Notes for Plan 30-05

- All Phase 30 cross-link wiring is complete:
  - Landing CTA + methodology blurb link → `/tech/about#methodology` ✓
  - Methodology discipline tiles → `/tech/benchmarks#discipline-{slug}` ✓ (all 13)
  - Detail page TechHero CTA + footer link → `/tech/about#methodology` ✓
  - Leaderboard table row product → `/tech/reviews/{slug}` ✓
  - Leaderboard table row category → `/tech/categories/{slug}` ✓
- Plan 30-05 should run `pnpm build`, brand sweep across all changed files, and a final integration smoke

## Coverage

- SC-7 (cross-link contract: methodology → benchmarks anchors; row product → reviews; row category → categories) — landed
