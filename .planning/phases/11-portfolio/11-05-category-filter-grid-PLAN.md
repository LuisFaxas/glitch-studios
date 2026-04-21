---
phase: 11-portfolio
plan: 05
type: execute
wave: 3
depends_on: [11-04]
files_modified:
  - src/components/portfolio/portfolio-grid.tsx
autonomous: true
requirements: [PORT-07]
must_haves:
  truths:
    - "PortfolioGrid renders a horizontal row of category chips above a responsive card grid"
    - "First chip is ALL (no category selected); active chip uses inverse palette bg-[#f5f5f0] text-[#000000]"
    - "Chips render in a horizontal-scroll container on mobile (overflow-x-auto, no visible scrollbar)"
    - "Categories are derived client-side from the items prop — only categories actually present render as chips (ALL + unique(items.category))"
    - "When a category is active, only items with item.category === active render in the grid; otherwise all items render"
    - "Grid uses grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 (Metro tile density, matches Phase 10 blog grid)"
    - "Each grid cell renders VideoCard (from Plan 04)"
    - "Filter state is client-only useState (no URL param) per D-14 default"
  artifacts:
    - path: "src/components/portfolio/portfolio-grid.tsx"
      provides: "Client wrapper composing category chip filter + filtered VideoCard grid"
      exports: ["PortfolioGrid"]
  key_links:
    - from: "src/components/portfolio/portfolio-grid.tsx"
      to: "src/components/portfolio/video-card.tsx"
      via: "Renders <VideoCard> in every filtered grid cell"
      pattern: "VideoCard"
---

<objective>
Build `PortfolioGrid` — a single client component that composes the category chip filter (matching Phase 10 D-07 chip styling exactly) and the filtered responsive card grid on `/portfolio`. This consolidates the filter + grid into one client boundary so the server component (`page.tsx`, Plan 06) stays purely a data-fetch + composition layer.

Purpose: PORT-07 refinement — replaces the legacy `PortfolioCarousel` chip styling (which used differently-sized buttons in a flex-wrap row) with the blog-consistent chip pattern (D-14). Mobile gets a horizontal-scroll chip row consistent with the blog.

Output: One new client component that takes `items: PortfolioItem[]` and renders chips + grid together.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/11-portfolio/11-CONTEXT.md
@.planning/phases/11-portfolio/11-RESEARCH.md
@.planning/phases/11-portfolio/11-UI-SPEC.md
@.planning/phases/11-portfolio/11-04-SUMMARY.md

@src/components/portfolio/video-card.tsx
@src/components/blog/category-filter.tsx
@src/app/(public)/blog/page.tsx
@src/components/portfolio/portfolio-carousel.tsx

<interfaces>
<!-- Plan 04 output -->

From src/components/portfolio/video-card.tsx (Plan 04):
```typescript
export function VideoCard({ item }: { item: PortfolioItem }): JSX.Element
```

<!-- Phase 10 twin chip pattern (D-14 "Match Phase 10 D-07 exactly") -->

From src/components/blog/category-filter.tsx:
```typescript
// Chip container: "flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
// Active chip classes:   "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
// Inactive chip classes: "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"
// Base chip classes:     "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200"
```

<!-- Blog grid composition (D-08 grid pattern reference) -->

From src/app/(public)/blog/page.tsx:
```typescript
// Grid: <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8">
```

<!-- Types -->

PortfolioItem from @/types (InferSelectModel<typeof portfolioItems>):
```typescript
// item.category: string | null
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create PortfolioGrid client wrapper (chips + filtered grid)</name>
  <files>src/components/portfolio/portfolio-grid.tsx</files>
  <read_first>
    - src/components/blog/category-filter.tsx (chip styling reference — copy the exact class strings; Phase 10 blog uses URL-based state but per D-14 portfolio uses client-only useState)
    - src/components/portfolio/portfolio-carousel.tsx (legacy filter button code — note the existing `["All", ...new Set(items.map(i => i.category).filter(Boolean))]` derivation pattern to reuse)
    - src/components/portfolio/video-card.tsx (Plan 04 output — consume VideoCard)
    - src/app/(public)/blog/page.tsx (grid composition: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8`)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-08 grid layout, D-14 chip matching rule — client-only useState is the default)
    - .planning/phases/11-portfolio/11-UI-SPEC.md (Interaction Contract "Tap a category chip")
    - .planning/phases/11-portfolio/11-RESEARCH.md (Example 3 "Deriving category list client-side for the filter")
  </read_first>
  <action>
    Create `src/components/portfolio/portfolio-grid.tsx` with this exact content:

    ```typescript
    "use client"

    import { useMemo, useState } from "react"
    import clsx from "clsx"
    import { VideoCard } from "./video-card"
    import type { PortfolioItem } from "@/types"

    interface PortfolioGridProps {
      items: PortfolioItem[]
    }

    /**
     * Category chip filter + filtered VideoCard grid (D-08, D-14).
     *
     * - Category list derived client-side from items.category (unique, non-null)
     * - Filter state is client-only useState (D-14 default; no URL param)
     * - Active chip uses inverse palette (bg-[#f5f5f0] text-[#000000])
     * - Chips scroll horizontally on mobile (overflow-x-auto, hidden scrollbar)
     * - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 (matches Phase 10)
     */
    export function PortfolioGrid({ items }: PortfolioGridProps) {
      const [active, setActive] = useState<string | null>(null)

      const categories = useMemo(
        () =>
          Array.from(
            new Set(
              items
                .map((i) => i.category)
                .filter((c): c is string => typeof c === "string" && c.length > 0)
            )
          ),
        [items]
      )

      const filtered = useMemo(
        () => (active ? items.filter((i) => i.category === active) : items),
        [items, active]
      )

      const chipBase =
        "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200"
      const chipActive = "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
      const chipInactive =
        "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"

      return (
        <div>
          {/* Chip row: mobile horizontal scroll, no visible scrollbar */}
          <div className="flex gap-1 overflow-x-auto pb-2 mt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActive(null)}
              className={clsx(chipBase, !active ? chipActive : chipInactive)}
              aria-pressed={!active}
            >
              ALL
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={clsx(chipBase, active === c ? chipActive : chipInactive)}
                aria-pressed={active === c}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8">
              {filtered.map((item) => (
                <VideoCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <h2 className="font-mono font-bold text-2xl uppercase text-[#f5f5f0] mb-4">
                NO ITEMS IN THIS CATEGORY
              </h2>
              <p className="text-[#888888] font-sans">
                Try a different category or tap ALL to see every item.
              </p>
            </div>
          )}
        </div>
      )
    }
    ```

    Non-negotiable concrete values:
    - `"use client"` on line 1 — component owns useState.
    - Chip container classes: `flex gap-1 overflow-x-auto pb-2 mt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden` — copied from Phase 10 CategoryFilter with added `mt-8` (D-14 says "not sticky"; Phase 10 uses URL state, we use client state, but the visuals MUST match).
    - Chip base classes (shared): `px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200`.
    - Chip active classes: `bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]` (inverse palette per D-14).
    - Chip inactive classes: `bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]`.
    - ALL button is always first (before the map over `categories`).
    - Category list derivation: `Array.from(new Set(items.map(i => i.category).filter(nonEmptyString)))` — only categories actually present in data are offered.
    - Grid classes: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8` (exact Phase 10 blog grid).
    - When filtering returns zero results, show a "NO ITEMS IN THIS CATEGORY" fallback (mirrors Phase 10 blog empty-category copy) so the chip is still recoverable.
    - `aria-pressed` on each chip button for accessibility.
    - `clsx` already used elsewhere in the portfolio codebase (`video-card` pre-refactor imported it); if it's removed from VideoCard it's still installed in package.json.
  </action>
  <verify>
    <automated>test -f src/components/portfolio/portfolio-grid.tsx &amp;&amp; head -1 src/components/portfolio/portfolio-grid.tsx | grep -q '^"use client"' &amp;&amp; grep -q 'export function PortfolioGrid' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'import { VideoCard }' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'useState&lt;string | null&gt;(null)' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'overflow-x-auto' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'scrollbar-width:none' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'bg-\[#f5f5f0\] text-\[#000000\] border-\[#f5f5f0\]' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'bg-\[#111111\] text-\[#888888\] border-\[#222222\]' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'ALL' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'aria-pressed' src/components/portfolio/portfolio-grid.tsx &amp;&amp; grep -q 'NO ITEMS IN THIS CATEGORY' src/components/portfolio/portfolio-grid.tsx &amp;&amp; pnpm tsc --noEmit &amp;&amp; pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `src/components/portfolio/portfolio-grid.tsx`
    - Line 1 is `"use client"`
    - Named export `PortfolioGrid` accepting `{ items: PortfolioItem[] }`
    - Imports `VideoCard` from `./video-card`
    - Uses `useState<string | null>(null)` for filter state
    - Uses `useMemo` for both categories and filtered items derivation
    - Chip container has class tokens `flex gap-1 overflow-x-auto pb-2` AND `[scrollbar-width:none]` AND `[&::-webkit-scrollbar]:hidden`
    - ALL button rendered BEFORE the categories.map (grep order: "ALL" appears before "categories.map")
    - Active chip includes tokens `bg-[#f5f5f0]` AND `text-[#000000]` AND `border-[#f5f5f0]`
    - Inactive chip includes tokens `bg-[#111111]` AND `text-[#888888]` AND `border-[#222222]`
    - Grid classes literal: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8`
    - Each chip has `aria-pressed` attribute
    - Empty-category fallback renders literal heading `NO ITEMS IN THIS CATEGORY`
    - Renders `<VideoCard key={item.id} item={item} />` in the grid
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0 (or warnings-only)
  </acceptance_criteria>
  <done>PortfolioGrid composes chip filter + responsive grid, matches Phase 10 CategoryFilter styling exactly, uses client-only useState per D-14, and renders VideoCard in every cell.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- Once Plan 06 wires this, `/portfolio` shows: h1 PORTFOLIO → chip row (ALL + dynamic categories) → hero → grid
- Clicking any non-ALL chip filters the grid to that category; clicking ALL restores the full list
- Filter state is in-memory (refreshing the page returns to ALL — D-14 explicit choice)
</verification>

<success_criteria>
- Chip styling is pixel-identical to Phase 10 blog CategoryFilter (D-14)
- Grid matches Phase 10 blog grid composition (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1`)
- Mobile chip row horizontally scrolls with no visible scrollbar
- Filter state is client-only (no URL param, no server round-trip)
- Empty-category state has a recoverable message, not a blank page
- Ready for Plan 06 (page integration)
</success_criteria>

<output>
After completion, create `.planning/phases/11-portfolio/11-05-SUMMARY.md` documenting:
- Exact prop signature
- Confirmation that chip classes match Phase 10 category-filter.tsx
- Note on client-only filter state (no URL param) per D-14
- Note on empty-category fallback copy chosen
</output>
