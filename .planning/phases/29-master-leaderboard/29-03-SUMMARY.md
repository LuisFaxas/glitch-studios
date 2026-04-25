# Phase 29 Plan 03 — SUMMARY

**Status:** complete
**Commit:** f396532
**Date:** 2026-04-25

## What was built

Seven new client components + 1 dependency:

- `@tanstack/react-table` v8.21.3 installed
- `src/components/tech/buy-button.tsx` — `<BuyButton productId>` placeholder with stopPropagation + tooltip "Affiliate links coming soon" (D-13/14/19; Phase 41 swap target)
- `src/components/tech/leaderboard-empty-state.tsx` — two modes: `no-results-filtered` (Reset filters button, RANK-06/D-06) and `no-reviews-yet` (methodology CTA, RANK-06)
- `src/components/tech/leaderboard-filter-sidebar.tsx` — `LeaderboardFilters` with concrete TSX for ALL 7 filter sections in D-05 order: Price (Slider) → Year (chips) → CPU (chips) → RAM (4 buckets) → Storage (3 buckets, D-05 amendment dropping <512) → Medal (4 tiers) → Sub-category (conditional). Exports `STORAGE_BUCKETS`, `RAM_BUCKETS`, `MEDAL_TIERS`, `FilterState`, `FilterCorpusBounds`.
- `src/components/tech/leaderboard-filter-sheet.tsx` — mobile Sheet wrapper reusing `LeaderboardFilters` (single source of truth)
- `src/components/tech/leaderboard-card.tsx` — D-20 mobile card: rank | medal | name + sub-cat | GlitchMark large | 3 benchmark rows (battery dropped on mobile) | year · price · BuyButton
- `src/components/tech/leaderboard-table.tsx` — TanStack Table v8 + nuqs + sticky `#`/Product cells + cyberpunk row hover (`inset_2px_0_0_0_#f5f5f0`) + whole-row click (`router.push`) + null-cell tooltips. Column order matches D-01 exactly: `# | Product | BPR medal | BPR score | GlitchMark | <4 benchmarks> | Year | Price | Buy` — BPR medal AND BPR score are TWO separate sortable columns. All header methodology links use `target="_blank" rel="noopener noreferrer"`.

## Key decisions

- **base-ui Tooltip / Sheet trigger pattern:** `asChild` is not part of base-ui — used the `render={<button .../>}` prop instead.
- **Filter URL state:** all 10 nuqs query keys with `clearOnDefault: true` (no garbage params on default load). Pre-filter in memory before TanStack — TanStack only sees rows that passed the filter pass.
- **NULLS LAST in BOTH directions:** `nullsLastNumeric` returns 1/-1 for null comparisons; TanStack's desc flip preserves placement.
- **Mobile/desktop split:** Tailwind `hidden md:block` (table) + `block md:hidden` (cards) — no JS viewport detection needed.
- **D-05 storage amendment honored:** `STORAGE_BUCKETS = [512, 1024, 2048]` only — no `<512` entry. Comment in source references the amendment.

## Verification

- `pnpm tsc --noEmit` exits 0
- All 7 component files compile and type-check
- Acceptance grep checks pass: `useReactTable`, `useQueryStates`, `clearOnDefault: true`, `nullsLastNumeric`, `router.push`, `target="_blank"`, `sticky left-0`, `sticky left-12`, `hidden md:block`, `block md:hidden`, `id: "bpr"`, `id: "bprScore"`, `sortId="bprScore"`
- Plan 04 can mount `<LeaderboardTable rows={...} benchmarkColumns={...} />` directly with no further component work.
