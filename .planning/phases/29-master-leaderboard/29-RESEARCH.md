# Phase 29: Master Leaderboard - Research

**Researched:** 2026-04-25
**Domain:** Sortable + filterable data tables; Drizzle aggregation queries; Postgres enum migration; placeholder-data seeding
**Confidence:** HIGH (codebase findings verified by direct read; library versions verified against npm registry)

## Summary

Phase 29 ships `/tech/categories/[slug]/rankings` — a TanStack Table v8 + nuqs leaderboard with sticky `#`/`Product` columns, mobile card fallback, and 4–6 placeholder review rows so the surface looks alive at v4.0 launch. The technical scope is mostly **plumbing on top of a stack the codebase already uses**: Drizzle 0.45, Next.js 16.2 App Router, nuqs 2.8 (already at 2.8.9 in package.json), shadcn `<Sheet>`, Base UI `<Slider>`, and the existing `<BPRMedal>`. Two pieces are net-new: `@tanstack/react-table` (verified latest 8.21.3 — install via `pnpm add @tanstack/react-table`) and a Postgres enum migration adding `'placeholder'` to `tech_review_status`.

The biggest **non-obvious risks** are (a) every existing query that filters `WHERE techReviews.status = 'published'` will need a deliberate decision — leave it as-is so placeholders stay leaderboard-only — and (b) Drizzle's `selectDistinctOn` requires a specific `ORDER BY` shape that already trips up `getBenchmarkRunsForProducts` (Phase 15 D-16). The leaderboard query will follow the same shape, then re-sort/pivot in memory.

**Primary recommendation:** Treat this as a 4-plan phase: (1) migration + status enum + placeholder seed; (2) `getLeaderboardRows` + `getLeaderboardBenchmarkColumns` Drizzle module with `unstable_cache`; (3) `<LeaderboardTable>` TanStack + nuqs client component + filter sidebar/sheet + mobile card fallback; (4) route page + CTA wiring + Playwright verification. Land the migration first so all downstream work has a stable schema and the seed can be written once and reused.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Columns & layout**
- **D-01:** Default column set + order (left → right): `# | Product (image + name + sub-category chip + CPU/RAM/storage chips) | BPR medal | BPR score | GlitchMark | <key benchmarks> | Year | Price | Buy`. Sticky `#` + `Product` columns on horizontal scroll on desktop.
- **D-02:** "Key benchmarks" column set is **researcher-determined** (this doc, see §"Recommended Default Benchmark Columns" below). Planner locks the final list.
- **D-03:** Sub-category chip rendered under product name (small mono-font, alongside CPU/RAM/storage chips).
- **D-04:** Default sort = **GlitchMark descending**. NULLS LAST always.

**Filters**
- **D-05:** Filter set in this order: Price (range slider), Year, CPU kind, RAM, Storage, Medal tier, Sub-category. All multi-select chips except price.
- **D-06:** Zero-results empty state with "Reset filters" button that clears all `nuqs` params.

**Sub-category scope**
- **D-07:** Show all descendants flattened.
- **D-08:** Reuse `getCategoryDescendantIds(slug)` from `src/lib/tech/queries.ts`.

**Sparse-data + placeholders**
- **D-09:** Seed 4–6 plausible placeholder reviews via `status='placeholder'`. Extend the enum if needed (CONFIRMED NEEDED — see §"Status Enum Investigation").
- **D-10:** Real reviews + placeholders coexist; operator flips status to `draft` when a real review supersedes a placeholder.
- **D-11:** Placeholder set spans all filter axes. No trademarked benchmark scores — plausible-but-fake numbers only.
- **D-12:** No "Preview" banner. Placeholders ship live without disclosure.

**Affiliate column**
- **D-13:** Last column "Buy" renders styled placeholder button per row with tooltip "Affiliate links coming soon".
- **D-14:** `<BuyButton productId>` component swappable by Phase 41 without touching table layout.

**Compare**
- **D-15:** No row-pinning, no checkboxes, no "Compare selected" button.

**Table tech + interaction**
- **D-16:** `@tanstack/react-table` v8.x. Install via `pnpm add @tanstack/react-table`. Client component.
- **D-17:** Sticky header on vertical scroll; `#` + `Product` sticky on horizontal scroll on desktop only.
- **D-18:** Whole-row click navigates to review.
- **D-19:** Buy button click stops propagation.

**Mobile**
- **D-20:** At `<768px`, switch to per-product cards. Filters in `<Sheet>`. No horizontal scroll.

**Surfacing**
- **D-21:** ONE surface link only — "View Rankings" CTA on `/tech/categories/[slug]`.
- **D-22:** All other cross-links deferred (Phase 38 / Phase 45).

**Methodology**
- **D-23:** Column header → methodology anchor in new tab.

### Claude's Discretion

- Mobile card visual layout (information hierarchy within the card) — UI-SPEC step.
- Desktop hover/focus row treatment — UI-SPEC step (subtle tint vs glitch-line vs left-edge accent).
- Filter sidebar collapsed-by-default vs expanded-by-default behavior on desktop.
- Whether "Reset filters" appears in the empty state AND inside the filter sidebar header (or just the empty state).
- TanStack Table v8 ColumnDef shape — typed columns + reusable cell renderers.
- Whether the placeholder Buy button is a `<button disabled>` styled like a primary CTA, or a passive `<span>` with hover tooltip.

### Deferred Ideas (OUT OF SCOPE)

- Tech-homepage leaderboard preview teaser → Phase 38 / Phase 40
- Categories index tile cross-link to /rankings → Phase 31 / Phase 38
- Review-detail "See in rankings" cross-link → Phase 38 / Phase 45
- Methodology-page "See current rankings" cross-link → Phase 38 / Phase 45
- Compare integration: row-pinning + "Compare selected" → its own future phase
- Real affiliate links + /go/ cloaking + tracking → Phase 41
- Per-benchmark cross-category leaderboard pages → Phase 30
- Editorial reframe of /tech/categories/[slug] hub → Phase 31
- Mobile-device categories beyond laptops → implicit-future
- Replace placeholder reviews with real ingested reviews → Phase 36 + later
- Faceted filter counts ("Apple Silicon (3)") → revisit if discoverability is a UAT issue
- Leaderboard server-side sort → flip later if corpus exceeds ~500 rows
- Auto-relax filter on zero results → chose explicit "Reset filters"
- "Preview" banner / public route gate for placeholder rows → ship live without disclosure

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RANK-01 | `/tech/categories/[slug]/rankings` server-rendered route with default columns + sort | §Standard Stack (Drizzle queries), §Code Examples (page.tsx skeleton), §Recommended Default Benchmark Columns |
| RANK-02 | Sort on every column via `nuqs` URL state | §Architecture Patterns (Pattern 1: TanStack + nuqs), §Code Examples |
| RANK-03 | Filter sidebar — price (slider), year/CPU/RAM/storage/medal/sub-cat (chips); mobile `<Sheet>` | §Standard Stack (Sheet, Slider both already installed), §Code Examples |
| RANK-04 | "Not tested" cells render `—` with tooltip from `tech_review_discipline_exclusions` | §Code Examples (NULLS LAST + cell renderer), §Common Pitfalls (Pitfall 4) |
| RANK-05 | Mobile `<768px` card layout | §Architecture Patterns (Pattern 2: viewport-driven render switch) |
| RANK-06 | Empty state with methodology CTA + "Reset filters" | §Code Examples |
| RANK-07 | Column header → methodology anchor in new tab | §Methodology Anchors (existing + needed) |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-table` | **8.21.3** (verified npm 2026-04-25) | Headless sortable/filterable table primitives | Industry-standard headless table; CONTEXT D-16 locked; pairs cleanly with nuqs URL state. NOT YET INSTALLED — `pnpm add @tanstack/react-table`. |
| `nuqs` | **2.8.9** (already in package.json) | URL-state-as-React-state | Sitewide convention (used on /tech/reviews list). `parseAsString`, `parseAsArrayOf`, `parseAsInteger` all available. App Router compatible. |
| `drizzle-orm` | 0.45.1 (already installed) | DB query builder | All existing tech queries use Drizzle. Phase 29 extends `src/lib/tech/queries.ts` patterns into a new `src/lib/tech/leaderboard.ts` module. |
| `next` | 16.2.1 (already installed) | App Router server components + `unstable_cache` | Server component fetches → client TanStack Table. `unstable_cache` keyed by category slug. |

### Supporting (all already installed — verify don't reinstall)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@base-ui/react` | 1.4.1 | Slider primitive (Base UI, NOT Radix) | Existing `src/components/ui/slider.tsx` wraps it. Use for price range slider. Note: project standardized on Base UI Slider, not shadcn's Radix slider. |
| `lucide-react` | 1.6.0 | Icons (`ArrowUpDown`, `Filter`, `X`, `ExternalLink`, `Info`) | Already used throughout. |
| `date-fns` | 4.1.0 | Date manipulation if release_date string parsing is needed | `tech_products.releaseDate` is `text` (e.g. "2026-03-15"); `date-fns/parseISO` handles it. |
| `sonner` | 2.0.7 | Toast for "Filters reset" feedback if desired | Already installed. |

### Drizzle ecosystem
| Tool | Version | Purpose |
|------|---------|---------|
| `drizzle-kit` | 0.31.10 | Schema → migration; **NOT used here** — Phase 29 follows the manual `0009_*.sql` + `scripts/run-phase29-migration.ts` pattern (Phase 15/26/27/28 precedent). drizzle-kit hits interactive prompts on enum changes. |
| `postgres` (postgres-js) | already installed | Standalone migration runner |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@tanstack/react-table` | Hand-rolled `<table>` + `useState({sortKey, dir})` | Table is < 50 rows at v4.0; manual sort would work. **But** TanStack scales to filters, server-sort flip, column visibility, and the v3.0 Phase 18 hint specifically named TanStack — staying with it preserves the migration path. CONTEXT D-16 locks. |
| `nuqs` | Manual `useSearchParams` + `router.replace` | nuqs gives type-safe parsers + batched updates. Site-wide convention; don't deviate. |
| Postgres enum extension | `text` column with `CHECK (status IN (...))` | Would require a much larger refactor of every existing query. Enum extension is a 1-line `ALTER TYPE ADD VALUE`; trivially safer. |
| Slider for price | Two `<input type=number>` for min/max | Range slider is standard UX for price in faceted filters. Slider already installed. |

**Installation (one new dep only):**
```bash
pnpm add @tanstack/react-table
```

**Version verification (run before plan freezes):**
```bash
pnpm view @tanstack/react-table version   # confirm 8.21.x at planning time
```

## Architecture Patterns

### Recommended File Structure
```
src/
├── app/(tech)/tech/categories/[slug]/
│   ├── page.tsx                             # existing — gets "View Rankings" CTA
│   └── rankings/
│       └── page.tsx                         # NEW — server component, fetches + renders
├── lib/tech/
│   ├── queries.ts                           # existing — DO NOT touch published-only filters here
│   └── leaderboard.ts                       # NEW — getLeaderboardRows, getLeaderboardBenchmarkColumns
├── components/tech/
│   ├── leaderboard-table.tsx                # NEW — client; TanStack Table + nuqs
│   ├── leaderboard-filter-sidebar.tsx       # NEW — desktop sidebar
│   ├── leaderboard-filter-sheet.tsx         # NEW — mobile <Sheet> wrapper around the same controls
│   ├── leaderboard-card.tsx                 # NEW — mobile <768px card fallback
│   ├── leaderboard-row-renderer.tsx         # NEW — shared row content (image/name/chips) used by table + card
│   ├── buy-button.tsx                       # NEW — placeholder; Phase 41 swap target
│   └── leaderboard-empty-state.tsx          # NEW — empty + zero-filter-match states
├── db/
│   ├── schema.ts                            # MODIFY — add 'placeholder' to techReviewStatusEnum literal
│   ├── migrations/
│   │   └── 0009_phase29_placeholder_status.sql   # NEW — ALTER TYPE + (optional) CHECK
│   └── seeds/
│       └── placeholder-laptops.ts           # NEW — 4–6 reviews + benchmark runs
└── (root)
    └── scripts/run-phase29-migration.ts     # NEW — postgres-js runner, mirrors Phase 28
```

### Pattern 1: TanStack Table v8 + nuqs URL state (App Router)

**What:** TanStack reads sort/filter state via controlled `state` props; nuqs writes them to the URL. Single source of truth: the URL.

**When to use:** Anywhere user-controlled sort/filter must survive refresh, deep-link, browser-back. Site convention on `/tech/reviews`, `/beats`.

**Wiring:**
```tsx
// src/components/tech/leaderboard-table.tsx
"use client"
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, type SortingState, type ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table"
import { useQueryStates, parseAsString, parseAsArrayOf, parseAsInteger } from "nuqs"
import { useMemo } from "react"

export function LeaderboardTable({ rows, columns, benchmarkTests }: Props) {
  const [filters, setFilters] = useQueryStates({
    sort: parseAsString.withDefault("glitchmark"),
    dir: parseAsString.withDefault("desc"),
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
    year: parseAsArrayOf(parseAsInteger).withDefault([]),
    cpu: parseAsArrayOf(parseAsString).withDefault([]),
    ram: parseAsArrayOf(parseAsString).withDefault([]),
    storage: parseAsArrayOf(parseAsString).withDefault([]),
    medal: parseAsArrayOf(parseAsString).withDefault([]),
    subcat: parseAsArrayOf(parseAsString).withDefault([]),
  })

  const sorting: SortingState = useMemo(
    () => [{ id: filters.sort, desc: filters.dir === "desc" }],
    [filters.sort, filters.dir],
  )

  // Apply filters in memory before TanStack sees rows.
  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters])

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      const first = next[0]
      if (!first) return
      void setFilters({ sort: first.id, dir: first.desc ? "desc" : "asc" })
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortDescFirst: true,           // GlitchMark sort starts desc
    enableMultiSort: false,        // single-column sort per CONTEXT D-04
  })
  // ...render
}
```

**Why this shape:** `state.sorting` is controlled by nuqs. Filters live entirely outside TanStack (TanStack's column filters are awkward with multi-select chips + a price slider) — applied in memory pre-pass via `applyFilters(rows, filters)`. This keeps the TanStack surface minimal and the filter logic explicit/testable.

### Pattern 2: NULLS LAST sort (in memory, with stable string-coerced order)

**What:** Drizzle SQL `ORDER BY ... NULLS LAST` works for the initial server fetch, but sort happens client-side once columns are dynamic. The TanStack `sortingFn` for every nullable numeric column must coerce nulls to the bottom regardless of direction.

**Why:** CONTEXT D-04 — products without GlitchMark must always sort to the bottom. CONTEXT RANK-04 — null benchmark cells sort to bottom regardless of direction.

```ts
// Reusable sortingFn for nullable numeric columns
const nullsLastNumericSort: SortingFn<Row> = (a, b, colId) => {
  const av = a.getValue<number | null>(colId)
  const bv = b.getValue<number | null>(colId)
  if (av === null && bv === null) return 0
  if (av === null) return 1   // a comes after — NULLS LAST
  if (bv === null) return -1  // b comes after
  return av - bv
}
```

TanStack flips the sign for `desc:true` automatically — but only on the comparison *result*, which means `null → 1` stays `1` and nulls correctly sink to the bottom in BOTH directions. **Verify this in Playwright**: change `dir=asc` and confirm nulls still sink.

### Pattern 3: Mobile card fallback via CSS-only render switch

**What:** Render BOTH `<LeaderboardTable>` (hidden on mobile via `hidden md:block`) and `<LeaderboardCardList>` (hidden on desktop via `block md:hidden`). Same `rows` data, two presentations.

**When to use:** RANK-05 explicitly requires it; rendering both is fine because TanStack creates virtualization-ready data structures cheaply, and the mobile breakpoint hides the unused tree (no layout cost on mobile).

**Why not container queries / `useMediaQuery`:** SSR mismatch — we don't know viewport on the server. CSS-only switch renders both, hides one. No flash, no JS gate.

### Pattern 4: Sticky `#` + `Product` columns

**What:** Two left-most columns get `position: sticky; left: 0` with explicit `z-index` and a background that matches the row hover state.

**Why:** CSS-only. TanStack doesn't need to know about stickiness — it's pure render concern.

```tsx
<table className="w-full border-collapse">
  <thead className="sticky top-0 z-30 bg-[#0a0a0a]">
    <tr>
      <th className="sticky left-0 z-40 bg-[#0a0a0a] px-3 py-2 text-left">#</th>
      <th className="sticky left-12 z-40 bg-[#0a0a0a] px-3 py-2 text-left">Product</th>
      {/* ...rest scroll */}
    </tr>
  </thead>
  <tbody>
    {table.getRowModel().rows.map((row, i) => (
      <tr
        key={row.id}
        onClick={() => router.push(`/tech/reviews/${row.original.reviewSlug}`)}
        className="group cursor-pointer border-t border-[#222] hover:bg-[#1a1a1a]"
      >
        <td className="sticky left-0 z-20 bg-[#0a0a0a] px-3 py-3 group-hover:bg-[#1a1a1a]">
          {i + 1}
        </td>
        <td className="sticky left-12 z-20 bg-[#0a0a0a] px-3 py-3 group-hover:bg-[#1a1a1a]">
          <ProductCell row={row.original} />
        </td>
        {/* scrolling cells */}
      </tr>
    ))}
  </tbody>
</table>
```

**Critical**: the sticky cells **must paint a background** (`bg-[#0a0a0a]`) so scrolling content doesn't bleed through. The `group-hover:` matches the row hover state so the sticky columns don't visually detach. Wrap the table in `<div className="hidden md:block overflow-x-auto">`.

### Pattern 5: `unstable_cache` for the leaderboard fetch

**What:** Cache the assembled leaderboard rows by category slug; revalidate when reviews are published or status changes.

**Note:** No existing `unstable_cache` usage in the codebase (verified via grep) — this would be the **first** Next.js cache wrapper in the project. Stick to a minimal wrapper to avoid setting a complex precedent.

```ts
// src/lib/tech/leaderboard.ts
import "server-only"
import { unstable_cache } from "next/cache"

export const getLeaderboardRows = unstable_cache(
  async (categorySlug: string): Promise<LeaderboardRow[]> => {
    // ... query implementation
  },
  ["leaderboard-rows"],                                  // cache key prefix
  { tags: (slug) => ["leaderboard", `leaderboard:${slug}`], revalidate: 300 },
)
```

**Revalidation hooks (call from `src/actions/admin-tech-reviews.ts` publish/unpublish actions):**
```ts
import { revalidateTag } from "next/cache"
revalidateTag("leaderboard")   // brute force: invalidate all categories on any review state change
```

Surgical per-category invalidation requires knowing the category at publish time — easy lookup, but planner can choose between brute-force ("leaderboard") and surgical (`leaderboard:${slug}`). Recommend brute-force for simplicity; corpus is small.

### Anti-Patterns to Avoid

- **DO NOT pass server-component `cookies()` / `headers()` into the cached function** — `unstable_cache` will throw. The leaderboard fetch is anonymous (no per-user data), so no risk here unless someone later adds personalization.
- **DO NOT call `revalidatePath('/tech/categories/...')`** from the publish action — wildcard paths are unreliable in App Router. Use `revalidateTag` instead.
- **DO NOT use TanStack Table's built-in `getFilteredRowModel`** for the chip filters — it expects a single string-match filter per column. Multi-select chips + range sliders are easier as a pre-pass over `data` before TanStack sees it.
- **DO NOT add a `WHERE status IN ('published', 'placeholder')` filter to existing queries in `queries.ts`** — that leaks placeholders to /tech/reviews, homepage carousels, sitemap. The leaderboard is the **only** surface that sees placeholders; its query lives in the new `leaderboard.ts` module.
- **DO NOT rebuild glitch headings inline** — reuse `<GlitchHeading>` (per memory `feedback_glitch_headers.md`). Hover-only animation; no auto-running effects on row hover either.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sortable headers + sort-state machine | Custom `useState` + click handler matrix | `@tanstack/react-table` `useReactTable` with `getSortedRowModel()` | Multi-key tie-breakers, ascending/descending toggle, accessible sort indicators all already solved. |
| URL-state serialization | Custom `useSearchParams` + `router.replace` calls | `nuqs` `useQueryStates` with typed parsers | Type safety, batched updates, default values, array serialization (`?cpu=apple,intel`). |
| Range slider + dual-handle interaction | Custom `<input type=range>` pair | Existing `src/components/ui/slider.tsx` (Base UI) | Already in the codebase. Multi-value slider supported via `value={[min, max]}`. |
| Mobile filter overlay | Custom modal + body-scroll-lock | Existing `src/components/ui/sheet.tsx` (shadcn) | Already in the codebase, used elsewhere. |
| Tooltip for "—" cells | Custom hover popover | Existing `src/components/ui/tooltip.tsx` | shadcn tooltip handles a11y + positioning. |
| Postgres enum extension | Drop+recreate enum + table rewrites | `ALTER TYPE techReviewStatusEnum ADD VALUE 'placeholder'` | Atomic, no rewrite, idempotent with `IF NOT EXISTS`. |
| BPR medal rendering | Custom badge | Existing `<BPRMedal>` | Phase 17 component; drop-in cell. |
| h1 styling | Custom heading | Existing `<GlitchHeading>` | Site convention; hover-only glitch. |

**Key insight:** Phase 29 is mostly composition. The codebase already supplies medal, sheet, slider, tooltip, glitch heading, and the category-tree query. The two new things are TanStack Table and the placeholder seed. Resist building parallel implementations of any of the above.

## Status Enum Investigation

**FINDING (HIGH confidence — verified by direct read of `src/db/schema.ts` line 678):**

```ts
export const techReviewStatusEnum = pgEnum("tech_review_status", [
  "draft",
  "published",
])
```

**`'placeholder'` is NOT a current value.** Phase 29 MUST add it via migration.

### All existing status filters (HIGH confidence — full grep across `src/`)

These are the queries that filter by `techReviews.status` or `'published'` literal. **Every one of them is correct as-is** — the leaderboard is the ONLY surface that should see placeholders. **Do not modify any of these:**

| File | Line | Query | Action |
|------|------|-------|--------|
| `src/lib/tech/queries.ts` | 137 | `getAllPublishedReviewSlugs` (sitemap, generateStaticParams) | LEAVE — placeholders should NOT appear in sitemap |
| `src/lib/tech/queries.ts` | 161 | `getPublishedReviewBySlug` (review detail) | LEAVE — placeholder rows have no detail page |
| `src/lib/tech/queries.ts` | 281 | `queryCardsByCategoryIds` (related reviews) | LEAVE |
| `src/lib/tech/queries.ts` | 304 | `listPublishedReviews` (/tech/reviews list) | LEAVE — list excludes placeholders |
| `src/lib/tech/queries.ts` | 418 | `getLatestPublishedReviews` (homepage carousel) | LEAVE |
| `src/lib/tech/queries.ts` | 479 | `listTopLevelCategoriesWithCounts` (category review counts) | LEAVE — category counts shouldn't inflate from placeholders |
| `src/lib/tech/queries.ts` | 580 | `listProductsForCategory` (category detail page) | LEAVE — placeholders show on rankings only, not category landing |
| `src/lib/tech/queries.ts` | 841 | `getBenchmarkSpotlight` (homepage hero spotlight) | LEAVE — must be a real review |
| `src/actions/admin-tech-reviews.ts` | 221 | publish action | LEAVE — admin still sees draft/placeholder differently |
| `src/app/admin/tech/page.tsx` | 57 | `publishedCount` admin metric | LEAVE — placeholders excluded from "published" count |
| `src/app/admin/tech/reviews/page.tsx` | 63 | admin status badge | OK — will show "placeholder" badge once enum is extended |
| `src/components/admin/tech/review-editor.tsx` | 269, 520 | publish toggle button | OK — current toggle is published↔draft; placeholder is set via seed/SQL only |

### Migration: `0009_phase29_placeholder_status.sql`

```sql
-- Phase 29 — Master Leaderboard
-- Adds 'placeholder' to tech_review_status enum so seed reviews can render
-- on the leaderboard without leaking to /tech/reviews, sitemap, or homepage.
--
-- Idempotent: ALTER TYPE ... ADD VALUE IF NOT EXISTS is supported in
-- Postgres 12+ and is transactional-safe in 12+.

ALTER TYPE "tech_review_status" ADD VALUE IF NOT EXISTS 'placeholder';

-- Optional: phase29_migration_meta for parity with Phase 27/28 idempotency pattern.
CREATE TABLE IF NOT EXISTS "phase29_migration_meta" (
  "key" text PRIMARY KEY,
  "value" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
```

**Note on Postgres `ALTER TYPE ... ADD VALUE`:**
- Postgres 12+ supports `IF NOT EXISTS` for enum values (idempotent re-runs).
- In some Postgres versions, this cannot run inside a transaction with subsequent statements that *use* the new value. The runner script (`scripts/run-phase29-migration.ts`) executes it in its own statement; the seed runs SEPARATELY via `pnpm db:seed:phase29-placeholders` (a new script) or as a follow-up step. Don't combine them in a single transaction.

### `src/db/schema.ts` change

```ts
export const techReviewStatusEnum = pgEnum("tech_review_status", [
  "draft",
  "published",
  "placeholder",   // Phase 29: shown only on /tech/categories/[slug]/rankings
])
```

Add a code comment explaining placeholder semantics so future contributors don't accidentally include it in `WHERE status = 'published'` filters.

## Recommended Default Benchmark Columns (D-02)

Researched: rubric (`src/lib/tech/rubric-map.ts`, 43 entries), audit B.6 column choice criteria, and industry benchmark-comparison sites (Tom's Hardware Bench, Notebookcheck, AnandTech archived).

**Recommendation: 4 default benchmark columns.** Balances density against horizontal scroll on a 1280px laptop screen with sticky `#`+`Product` taking ~280px and BPR/GlitchMark/Year/Price/Buy taking ~400px more.

| Column | Rubric key | Methodology anchor | Rationale |
|--------|-----------|--------------------|-----------|
| **Geekbench 6 Multi** | `cpu:geekbench6:multi` | `#disciplines` (or new `#cpu` anchor — see Methodology Anchors below) | Universal CPU recognition. Every laptop reader knows Geekbench. AC mode. Higher-is-better. |
| **3DMark Steel Nomad Light** | `gpu:3dmark:steel_nomad_light` | `#disciplines` | Cross-platform GPU score (works on Apple Silicon + Windows + macOS Game Porting Toolkit). Replaces old Wild Life Extreme bias toward mobile chips. AC mode. |
| **MLX-LM tg128** *(or `llama.cpp tg128`)* | `llm:mlx_lm:tg128` *(or `llm:llama_bench:tg128`)* | `#disciplines` | **Brand identity column** — GlitchTech voice is AI/LLM-forward. tg128 (token-generation) is the most readable LLM throughput metric. AC mode. **Pick `mlx_lm:tg128` for Apple Silicon parity; `llama_bench:tg128` for cross-platform consistency.** Recommend `llama_bench:tg128` since it runs on every machine. |
| **Battery (Video loop hours)** | `battery_life:video_loop:hours` | `#disciplines` | Use-case relevance — laptops are bought for portability. Video loop is the most universally legible battery metric. Battery mode. Higher-is-better. |

**Why these 4 and not the audit's "Cinebench" suggestion:** Cinebench 2024 multi is excellent but overlaps with Geekbench 6 multi in what it measures (CPU all-core throughput). Steel Nomad replaces a redundant CPU column with a GPU column. The 4 chosen columns each measure a **different** capability axis (general CPU / GPU / AI throughput / battery endurance) — maximizes the information density per column.

**What about HandBrake / Cinebench / 3DMark Wild Life?** Available via the "+ Show all benchmarks" expansion (researcher recommends adding a column-visibility toggle in a follow-up phase if requested; out-of-scope for v4.0 per CONTEXT). For Phase 29, the 4 default columns above are the locked set.

**Mobile card 3-column subset (per D-20):** Drop "Battery hours" on mobile; surface Geekbench 6 Multi + 3DMark Steel Nomad + LLM tg128. The card already shows year, price, BPR medal, and GlitchMark prominently — battery can move to an expand-to-see secondary tier if planner adds one.

## Methodology Anchors (existing + needed)

**Verified via grep on `src/app/(tech)/tech/methodology/page.tsx`:**

| Anchor | Exists? | Use |
|--------|---------|-----|
| `#bpr` | ✓ | BPR column header |
| `#glitchmark` | ✓ | GlitchMark column header |
| `#disciplines` | ✓ | Falls back here for any benchmark column without a specific anchor |
| `#thresholds` | ✓ | Not used by leaderboard |
| `#exclusion-policy` | ✓ | "—" cell tooltips can deep-link here |
| `#rubric-changelog` | ✓ | Not used by leaderboard |
| `#test-cpu-geekbench-6-multi` (and per-test) | ✗ | NOT IN SCOPE for Phase 29 — every benchmark header opens `#disciplines` |

**Decision:** All benchmark column headers point to `/tech/methodology#disciplines` (in new tab). Per-test anchors are Phase 30's territory (per-benchmark pages) and Phase 38's cross-link sweep. Document this in the plan so the link href is consistent.

## Placeholder Seed Design

**Goal:** 4–6 plausible laptop reviews + benchmark runs that exercise EVERY filter (≥2 distinct values per filter axis). Plausible-but-fake numbers — never copy actual published benchmark scores.

### Recommended placeholder set (6 rows)

| Slug | Manufacturer | Model | Sub-cat | CPU kind | RAM | Storage | Year | Price | Medal target | Notes |
|------|--------------|-------|---------|----------|-----|---------|------|-------|--------------|-------|
| `mbp-14-m3-ref` | Apple | MacBook Pro 14" M3 (8-core) | ultrabook | Apple Silicon | 16 | 512 | 2024 | $1599 | Gold | **Reference baseline** — GlitchMark = 100 anchor (Phase 28 D-05). Reuse if already seeded; else placeholder. |
| `rog-strix-g16-2026-placeholder` | ASUS | ROG Strix G16 (i9-14900HX / RTX 5070) | gaming | Intel | 32 | 1024 | 2026 | $2199 | Silver | Gaming-class. High GPU, lower battery. |
| `tp-x1-carbon-g13-placeholder` | Lenovo | ThinkPad X1 Carbon Gen 13 | ultrabook | Intel | 16 | 512 | 2025 | $1799 | Bronze | Business ultrabook. Mid-tier across the board. |
| `framework-16-r9-placeholder` | Framework | Framework Laptop 16 (Ryzen 9 7940HS / RX 7700S) | workstation | AMD | 64 | 2048 | 2025 | $2499 | Silver | AMD coverage; large RAM/storage tier. |
| `dell-xps-14-placeholder` | Dell | Dell XPS 14 (Core Ultra 7 / RTX 4050) | ultrabook | Intel | 32 | 1024 | 2025 | $1899 | Bronze | Mainstream Intel ultrabook with discrete GPU. |
| `acer-swift-go-14-placeholder` | Acer | Acer Swift Go 14 (Ryzen 7 8845HS) | budget | AMD | 8 | 512 | 2025 | $899 | (no medal — disciplines incomplete) | **Forces the "no medal" empty cell case.** Tests RANK-04 tooltip rendering for sparse data. |

**Real flagship row (FROM Phase 36, NOT seeded here):**
- `mbp-16-m5max-64gb` — Apple MBP 16 M5 Max — workstation/Apple/64GB/2TB+/2026/Platinum target. Will land via Phase 36 ingest; coexists with placeholders.

### Filter coverage matrix

| Filter | Distinct values present |
|--------|-------------------------|
| Sub-category | ultrabook (3), gaming (1), workstation (1), budget (1) ✓ |
| CPU kind | Apple Silicon (1), Intel (3), AMD (2) ✓ |
| RAM | 8 (1), 16 (2), 32 (2), 64+ (1) ✓ |
| Storage | <512 (0 — gap), 512 (3), 1024 (2), 2048+ (1) ⚠ |
| Year | 2024 (1), 2025 (4), 2026 (1) ✓ |
| Medal tier | Platinum (0 — flagship Phase 36 fills), Gold (1), Silver (2), Bronze (2), no-medal (1) ⚠ Platinum gap |
| Price | $899 — $2499 (range covers cheap/mid/premium) ✓ |

**Two minor gaps:**
- **Storage `<512`** — not covered by any placeholder. Either drop the `<512` filter bucket from D-05 or swap one row to a 256GB model. Recommend planner DROPS the `<512` bucket (no modern reviewable laptop ships <512GB at the price points we cover) — note as a CONTEXT amendment.
- **Platinum tier** — only the Phase 36 flagship will earn Platinum at v4.0 launch. Acceptable: the leaderboard filter shows "Platinum (0)" until Phase 36 publishes; consider hiding empty filter values OR letting them sit as a UX hint that the tier is rare.

### Plausible-but-fake numbers (sample for `dell-xps-14-placeholder`)

```ts
// Example — researcher uses these as a sanity range; planner's seed task picks final values.
const xps14Runs = [
  { test: "cpu:geekbench6:multi",         mode: "ac",      score: 14250 },
  { test: "cpu:geekbench6:multi",         mode: "battery", score: 11800 },
  { test: "cpu:geekbench6:single",        mode: "ac",      score: 2480  },
  { test: "gpu:3dmark:steel_nomad_light", mode: "ac",      score: 4100  },
  { test: "llm:llama_bench:tg128",        mode: "ac",      score: 18.4  },
  { test: "battery_life:video_loop:hours", mode: "battery", score: 12.5 },
  // ... ~12-14 runs total per row, spread across BPR-eligible disciplines + selected default columns
]
```

**Rule:** keep placeholder scores **within ±20%** of plausible class-typical numbers (e.g. an Intel Core Ultra 7 should not multi-core at 30000 like an M3 Max). The reference MBP M3 base is the only row that anchors to the Phase 28 `reference_score` in `tech_benchmark_tests` — so its scores must equal the reference values exactly to land at GlitchMark = 100. Other rows generate a GlitchMark in the 70–180 range organically.

### Seed mechanics

The placeholder seed must:
1. Insert `tech_products` row (with `priceUsd`, `releaseDate`, manufacturer, slug).
2. Insert `tech_product_specs` rows for the spec fields the leaderboard reads (CPU kind, RAM, Storage, sub-category) — these power the filter chips.
3. Insert `tech_reviews` row with `status='placeholder'`, BPR fields populated to a plausible value, GlitchMark fields populated.
4. Insert `tech_benchmark_runs` rows for ~12–14 tests per product (BPR-eligible AC + battery + a few non-BPR tests for the default columns).
5. Insert `tech_review_discipline_exclusions` rows for any discipline NOT covered (so RANK-04 tooltip renders correctly — "Not tested in this review" with reason).

**Hero image strategy:** Use placeholder hero images. Either (a) reuse one neutral cyberpunk hero across all 6 rows, (b) seed via the existing `mediaAssets` pipeline with simple solid-color placeholders, or (c) use Uploadthing-uploaded preset placeholders. Researcher recommends (a) — one shared neutral cyberpunk laptop silhouette — to keep the seed tight. Planner finalizes.

**Authorship:** All placeholder reviews use `reviewerId = uat-admin@glitchstudios.local` user (already exists per STATE.md cleanup todo) so they're easy to bulk-update or delete. Document this in the seed file header.

## Common Pitfalls

### Pitfall 1: Postgres `ALTER TYPE ADD VALUE` cannot be in same transaction as usage
**What goes wrong:** The migration runner runs the ALTER + a follow-up INSERT that uses 'placeholder' in one transaction → Postgres rejects with `unsafe use of new value 'placeholder'`.
**Why it happens:** Postgres requires the new enum value to be committed before it can be referenced.
**How to avoid:** Run migration script separately from seed script. Two `pnpm` commands: `pnpm db:migrate:phase29` then `pnpm db:seed:phase29-placeholders`. The runner script already uses `client.unsafe(sql)` for one statement; that's fine.
**Warning signs:** Migration runner errors with "unsafe use of new value of enum type" → split the operation.

### Pitfall 2: Sticky cells without explicit background bleed under scrolling content
**What goes wrong:** Sticky `#` and `Product` columns become semi-transparent during horizontal scroll; row contents from columns 4+ visibly slide UNDER them.
**Why it happens:** `position: sticky` doesn't inherit row background by default; CSS background must be explicitly painted on the sticky cell.
**How to avoid:** Every sticky `<td>` and `<th>` gets `bg-[#0a0a0a]` (or whatever the row bg is) AND a matching `group-hover:bg-[#1a1a1a]` so hover works. `z-index` of the sticky cell must beat the cells it's covering (z-20 vs z-10 typical).
**Warning signs:** Open DevTools → scroll horizontally → see column content visibly behind sticky columns. Fix immediately.

### Pitfall 3: nuqs default values in URL show up redundantly
**What goes wrong:** User opens `/rankings`, immediately sees `?sort=glitchmark&dir=desc` even though they didn't filter anything. Looks ugly, breaks "clean URL on first load."
**Why it happens:** `parseAsString.withDefault("glitchmark")` — when set, the URL is updated to reflect the state.
**How to avoid:** Use the `clearOnDefault: true` option on every nuqs parser. URLs stay clean until the user actually changes a value:
```ts
parseAsString.withDefault("glitchmark").withOptions({ clearOnDefault: true })
```
**Warning signs:** Fresh `/rankings` URL has a query string. Fix with `clearOnDefault: true`.

### Pitfall 4: Empty `tech_review_discipline_exclusions` produces unhelpful "—" tooltips
**What goes wrong:** Cell renders `—` but tooltip says "Not tested" — user has no idea WHY. RANK-04 spec calls for tooltip to show the exclusion reason.
**Why it happens:** Placeholder seed forgets to insert exclusion rows for disciplines not benchmarked.
**How to avoid:** For every placeholder review, insert one `tech_review_discipline_exclusions` row per missing discipline with a `reason_enum` value (`no_hardware`, `requires_license`, `device_class_exempt`, `test_failed`). The cell renderer joins runs+exclusions; presence of exclusion → tooltip shows reason; absence → tooltip shows generic "Not included".
**Warning signs:** Hover a `—` cell, tooltip says "Not tested" — should say "Not tested — device class exempt" or similar.

### Pitfall 5: TanStack Table re-renders on every filter change because `data` is a new array
**What goes wrong:** `applyFilters(rows, filters)` returns a fresh array every render; TanStack rebuilds row models; perceived lag on every chip click.
**Why it happens:** `useReactTable({ data: filteredRows })` when `filteredRows` is a new array reference triggers full row model reconstruction.
**How to avoid:** Wrap `filteredRows` in `useMemo([rows, filters])`. TanStack handles equal-reference data efficiently. With < 20 rows at v4.0, this is negligible — but the discipline matters when corpus grows.
**Warning signs:** React DevTools profiler shows long `useReactTable` updates on every filter chip click.

### Pitfall 6: Drizzle `selectDistinctOn` ORDER BY shape mismatch
**What goes wrong:** Query throws `SELECT DISTINCT ON expressions must match initial ORDER BY expressions`.
**Why it happens:** Postgres requires DISTINCT ON cols to lead ORDER BY in the same column order. Reordering for "natural display sort" breaks this.
**How to avoid:** Follow the Phase 15 D-16 pattern in `getBenchmarkRunsForProducts` (queries.ts line 689). DISTINCT ON `(productId, testId, mode)` → ORDER BY `productId asc, testId asc, mode asc, recordedAt desc`. Re-sort in memory afterwards for display.
**Warning signs:** Migration runs fine, query throws at runtime. Test with at least one product in the DB.

### Pitfall 7: Placeholder reviews leak into homepage carousel via `getBenchmarkSpotlight`
**What goes wrong:** Placeholder review with a high benchmark score wins the spotlight competition and shows up on /tech homepage hero.
**Why it happens:** The spotlight query joins `techReviews` with `eq(techReviews.status, "published")` — but if a future refactor accidentally widens that filter, placeholders bleed in.
**How to avoid:** **Don't widen the filter.** The leaderboard's status filter lives in its OWN module (`leaderboard.ts`); existing queries stay restrictive. Add a code comment near each existing `eq(techReviews.status, "published")` warning future contributors against expansion.
**Warning signs:** Open `/tech` homepage after seeding placeholders — if a placeholder appears anywhere, audit immediately.

### Pitfall 8: Whole-row click steals link clicks inside the row
**What goes wrong:** User clicks the "Buy" button or a column-header tooltip — `onClick={navigate}` on the `<tr>` fires first, navigates away.
**Why it happens:** Click events bubble; the `<tr>` handler catches them.
**How to avoid:** Per CONTEXT D-19: BuyButton calls `e.stopPropagation()` in its onClick. Any other interactive element inside the row does the same. Easier alternative: structure the row content so the only interactive element BESIDES the row click is the Buy button — and put the Buy button in its own column with explicit propagation stopping.
**Warning signs:** Click "Buy" → page navigates to review. Always test this in Playwright as a regression.

## Code Examples

Verified patterns from official sources + codebase precedents.

### `src/lib/tech/leaderboard.ts` — query module skeleton

```ts
// Source: extends Phase 15 patterns in src/lib/tech/queries.ts; verified against schema.ts lines 821-874
import "server-only"
import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"
import {
  techReviews, techProducts, techCategories, mediaAssets,
  techBenchmarkRuns, techBenchmarkTests, techProductSpecs,
  techSpecFields, techReviewDisciplineExclusions,
} from "@/db/schema"
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm"
import { getCategoryDescendantIds } from "./queries"
import type { BprTier } from "@/lib/tech/bpr"

export interface LeaderboardRow {
  reviewId: string
  reviewSlug: string
  productId: string
  productName: string
  productSlug: string
  manufacturer: string | null
  heroImageUrl: string | null
  heroImageAlt: string | null
  subCategorySlug: string | null
  subCategoryName: string | null
  bprScore: number | null
  bprTier: BprTier | null
  bprDisciplineCount: number
  glitchmarkScore: number | null
  glitchmarkIsPartial: boolean | null
  glitchmarkTestCount: number | null
  releaseYear: number | null         // parsed from techProducts.releaseDate
  priceUsd: number | null
  cpuKind: string | null             // from tech_product_specs (e.g. "Apple Silicon", "Intel", "AMD")
  ramGb: number | null               // from tech_product_specs
  storageGb: number | null           // from tech_product_specs
  benchmarkScores: Record<string, { score: number; mode: "ac" | "battery" } | null>
  // benchmarkScores key = test rubric key (e.g. "cpu:geekbench6:multi") → score
  // null value = test not run (cell shows —); exclusionReason populated separately
  exclusionReasons: Record<string, string>   // discipline → human reason
}

export interface LeaderboardBenchmarkColumn {
  rubricKey: string           // e.g. "cpu:geekbench6:multi"
  displayName: string         // e.g. "Geekbench 6 Multi"
  unit: string
  direction: "higher_is_better" | "lower_is_better"
  methodologyAnchor: string   // e.g. "#disciplines"
}

export const getLeaderboardRows = unstable_cache(
  async (categorySlug: string): Promise<LeaderboardRow[]> => {
    const descendantIds = await getCategoryDescendantIds(categorySlug)
    if (descendantIds.length === 0) return []

    // 1. Fetch reviews (status IN ('published', 'placeholder')) joined with products + category
    const reviewRows = await db
      .select({
        review: techReviews,
        product: techProducts,
        subCategory: techCategories,
        heroImage: mediaAssets,
      })
      .from(techReviews)
      .innerJoin(techProducts, eq(techReviews.productId, techProducts.id))
      .leftJoin(techCategories, eq(techProducts.categoryId, techCategories.id))
      .leftJoin(mediaAssets, eq(techReviews.heroImageId, mediaAssets.id))
      .where(and(
        inArray(techProducts.categoryId, descendantIds),
        or(
          eq(techReviews.status, "published"),
          eq(techReviews.status, "placeholder"),
        ),
      ))
      .orderBy(
        sql`${techReviews.glitchmarkScore} DESC NULLS LAST`,
        asc(techReviews.id),
      )

    if (reviewRows.length === 0) return []
    const reviewIds = reviewRows.map((r) => r.review.id)
    const productIds = reviewRows.map((r) => r.product.id)

    // 2. Fetch all canonical benchmark runs (DISTINCT ON pattern from Phase 15 D-16)
    const runRows = await db
      .selectDistinctOn(
        [techBenchmarkRuns.productId, techBenchmarkRuns.testId, techBenchmarkRuns.mode],
        {
          productId: techBenchmarkRuns.productId,
          testId: techBenchmarkTests.id,
          discipline: techBenchmarkTests.discipline,
          name: techBenchmarkTests.name,
          unit: techBenchmarkTests.unit,
          direction: techBenchmarkTests.direction,
          mode: techBenchmarkRuns.mode,
          score: techBenchmarkRuns.score,
        },
      )
      .from(techBenchmarkRuns)
      .innerJoin(techBenchmarkTests, eq(techBenchmarkRuns.testId, techBenchmarkTests.id))
      .where(and(
        inArray(techBenchmarkRuns.productId, productIds),
        eq(techBenchmarkRuns.superseded, false),
      ))
      .orderBy(
        asc(techBenchmarkRuns.productId),
        asc(techBenchmarkRuns.testId),
        asc(techBenchmarkRuns.mode),
        desc(techBenchmarkRuns.recordedAt),
      )

    // 3. Fetch product spec values needed for filter chips (CPU kind, RAM, Storage)
    //    Implementation depends on existing spec field naming convention — planner verifies
    //    by inspecting tech_spec_fields seed data.

    // 4. Fetch exclusions for "—" cell tooltips
    const exclusionRows = await db
      .select({
        reviewId: techReviewDisciplineExclusions.reviewId,
        discipline: techReviewDisciplineExclusions.discipline,
        reason: techReviewDisciplineExclusions.reason,
        notes: techReviewDisciplineExclusions.notes,
      })
      .from(techReviewDisciplineExclusions)
      .where(inArray(techReviewDisciplineExclusions.reviewId, reviewIds))

    // 5. Pivot benchmark runs into Record<rubricKey, score> per product
    //    + reduce specs into typed columns
    //    + build LeaderboardRow[]
    return assembleRows(reviewRows, runRows, /* specs, */ exclusionRows)
  },
  ["leaderboard-rows-v1"],
  { tags: ["leaderboard"], revalidate: 300 },
)

export const getLeaderboardBenchmarkColumns = unstable_cache(
  async (_categorySlug: string): Promise<LeaderboardBenchmarkColumn[]> => {
    // For Phase 29: return the locked 4-column default set (researcher pick).
    // Future: derive from category-specific column config table.
    return [
      { rubricKey: "cpu:geekbench6:multi",         displayName: "Geekbench 6 Multi",     unit: "score",   direction: "higher_is_better", methodologyAnchor: "#disciplines" },
      { rubricKey: "gpu:3dmark:steel_nomad_light", displayName: "3DMark Steel Nomad",    unit: "score",   direction: "higher_is_better", methodologyAnchor: "#disciplines" },
      { rubricKey: "llm:llama_bench:tg128",        displayName: "LLM tg128",             unit: "tok/s",   direction: "higher_is_better", methodologyAnchor: "#disciplines" },
      { rubricKey: "battery_life:video_loop:hours", displayName: "Battery (video, h)",   unit: "hours",   direction: "higher_is_better", methodologyAnchor: "#disciplines" },
    ]
  },
  ["leaderboard-cols-v1"],
  { tags: ["leaderboard"], revalidate: 3600 },
)
```

### `src/components/tech/leaderboard-table.tsx` — TanStack + nuqs (skeleton)

```tsx
// Source: TanStack Table v8 docs (tanstack.com/table/v8) + nuqs 2.x usage already in codebase
"use client"
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState, type SortingFn,
} from "@tanstack/react-table"
import { useQueryStates, parseAsString, parseAsArrayOf, parseAsInteger } from "nuqs"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { BPRMedal } from "./bpr-medal"
import { BuyButton } from "./buy-button"
import type { LeaderboardRow, LeaderboardBenchmarkColumn } from "@/lib/tech/leaderboard"

const nullsLastNumeric: SortingFn<LeaderboardRow> = (a, b, colId) => {
  const av = a.getValue<number | null>(colId)
  const bv = b.getValue<number | null>(colId)
  if (av === null && bv === null) return 0
  if (av === null) return 1
  if (bv === null) return -1
  return av - bv
}

interface Props {
  rows: LeaderboardRow[]
  benchmarkColumns: LeaderboardBenchmarkColumn[]
}

export function LeaderboardTable({ rows, benchmarkColumns }: Props) {
  const router = useRouter()
  const [filters, setFilters] = useQueryStates({
    sort:    parseAsString.withDefault("glitchmark").withOptions({ clearOnDefault: true }),
    dir:     parseAsString.withDefault("desc").withOptions({ clearOnDefault: true }),
    minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
    maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
    year:    parseAsArrayOf(parseAsInteger).withDefault([]).withOptions({ clearOnDefault: true }),
    cpu:     parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    ram:     parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    storage: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    medal:   parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    subcat:  parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
  })

  const columns: ColumnDef<LeaderboardRow>[] = useMemo(() => [
    // # column rendered outside TanStack (not sortable) — see note below
    {
      id: "product",
      header: "Product",
      enableSorting: false,
      cell: ({ row }) => <ProductCell row={row.original} />,
    },
    {
      id: "bpr",
      header: ({ column }) => <SortHeader column={column} label="BPR" anchor="#bpr" />,
      accessorFn: (row) => row.bprScore,
      sortingFn: nullsLastNumeric,
      cell: ({ row }) => row.original.bprTier ? (
        <BPRMedal tier={row.original.bprTier} score={row.original.bprScore!} disciplineCount={row.original.bprDisciplineCount} variant="compact" />
      ) : <span className="text-[#666]">—</span>,
    },
    {
      id: "glitchmark",
      header: ({ column }) => <SortHeader column={column} label="GlitchMark" anchor="#glitchmark" />,
      accessorFn: (row) => row.glitchmarkScore,
      sortingFn: nullsLastNumeric,
      cell: ({ row }) => row.original.glitchmarkScore !== null ? (
        <span className="font-mono">
          {row.original.glitchmarkScore}
          {row.original.glitchmarkIsPartial && <span className="text-[#888] text-xs"> · partial</span>}
        </span>
      ) : <span className="text-[#666]">—</span>,
    },
    ...benchmarkColumns.map<ColumnDef<LeaderboardRow>>((bc) => ({
      id: bc.rubricKey,
      header: ({ column }) => <SortHeader column={column} label={bc.displayName} anchor={bc.methodologyAnchor} />,
      accessorFn: (row) => row.benchmarkScores[bc.rubricKey]?.score ?? null,
      sortingFn: nullsLastNumeric,
      cell: ({ row }) => {
        const v = row.original.benchmarkScores[bc.rubricKey]
        if (!v) {
          // Find exclusion reason if any
          const reason = row.original.exclusionReasons[deriveDisciplineFromRubricKey(bc.rubricKey)] ?? "Not included in this review"
          return <DashCell tooltip={reason} />
        }
        return <span className="font-mono">{formatScore(v.score, bc.unit)}</span>
      },
    })),
    {
      id: "year",
      header: ({ column }) => <SortHeader column={column} label="Year" />,
      accessorFn: (row) => row.releaseYear,
      sortingFn: nullsLastNumeric,
      cell: ({ row }) => row.original.releaseYear ?? "—",
    },
    {
      id: "price",
      header: ({ column }) => <SortHeader column={column} label="Price" />,
      accessorFn: (row) => row.priceUsd,
      sortingFn: nullsLastNumeric,
      cell: ({ row }) => row.original.priceUsd !== null ? `$${row.original.priceUsd.toLocaleString()}` : "—",
    },
    {
      id: "buy",
      header: "Buy",
      enableSorting: false,
      cell: ({ row }) => <BuyButton productId={row.original.productId} />,
    },
  ], [benchmarkColumns])

  const filteredRows = useMemo(() => applyFilters(rows, filters), [rows, filters])

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      sorting: [{ id: filters.sort, desc: filters.dir === "desc" }],
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(table.getState().sorting) : updater
      const first = next[0]
      if (!first) return
      void setFilters({ sort: first.id, dir: first.desc ? "desc" : "asc" })
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: false,
    sortDescFirst: true,
  })

  if (filteredRows.length === 0) {
    return <LeaderboardEmptyState onResetFilters={() => setFilters(null)} />
  }

  return (
    <>
      {/* Desktop table (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          {/* sticky header + sticky # + Product cells (Pattern 4 above) */}
        </table>
      </div>
      {/* Mobile card list (<md) */}
      <div className="block md:hidden space-y-3">
        {filteredRows.map((row, i) => <LeaderboardCard key={row.reviewId} row={row} rank={i + 1} benchmarkColumns={benchmarkColumns} />)}
      </div>
    </>
  )
}
```

### Sticky column CSS recipe (from Pattern 4 above — distilled)

```tsx
<div className="hidden md:block overflow-x-auto">
  <table className="w-full border-collapse">
    <thead className="sticky top-0 z-30">
      <tr>
        <th className="sticky left-0 z-40 w-12 bg-[#0a0a0a] px-3 py-2 text-left">#</th>
        <th className="sticky left-12 z-40 min-w-[280px] bg-[#0a0a0a] px-3 py-2 text-left">Product</th>
        <th className="px-3 py-2 text-left">…rest…</th>
      </tr>
    </thead>
    <tbody>
      {table.getRowModel().rows.map((row, i) => (
        <tr
          key={row.id}
          onClick={() => router.push(`/tech/reviews/${row.original.reviewSlug}`)}
          className="group cursor-pointer border-t border-[#222] hover:bg-[#1a1a1a]"
        >
          <td className="sticky left-0 z-20 bg-[#0a0a0a] px-3 py-3 group-hover:bg-[#1a1a1a]">{i + 1}</td>
          <td className="sticky left-12 z-20 bg-[#0a0a0a] px-3 py-3 group-hover:bg-[#1a1a1a]">
            {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
          </td>
          {row.getVisibleCells().slice(1).map((cell) => (
            <td key={cell.id} className="px-3 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Cyberpunk row hover treatment (RECOMMENDED — for UI-SPEC step)

Per memory `feedback_glitch_headers.md` (hover-only, no auto-running animations) and the existing `<ReviewCard>` pattern:

**Recommendation: `Subtle tint + crisp left-edge accent`** (the option already mentioned in CONTEXT D-18). Two CSS rules:

```css
/* in row tr */
hover:bg-[#1a1a1a]                          /* subtle tint */
hover:[box-shadow:inset_2px_0_0_0_#f5f5f0]  /* 2px white left edge — matches cyberpunk crispness */
transition-[background,box-shadow] duration-150
```

**No glitch-line.** Auto-running motion is forbidden, and a one-shot glitch on hover competes for attention with the row click affordance. The `<GlitchHeading>` on the page h1 carries the brand voice; rows stay calm and scannable.

**Alternative (UI-SPEC may pick):** Increase border-left-color from `transparent` to `#f5f5f0` on hover — same visual but uses border instead of box-shadow. Either works.

## Runtime State Inventory

> Phase 29 is greenfield UI + a single additive enum migration + new placeholder data. The renames/migrations checklist mostly applies to the placeholder seed lifecycle.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | New placeholder rows in `tech_products`, `tech_reviews`, `tech_benchmark_runs`, `tech_review_discipline_exclusions`, `tech_product_specs`. ~6 products × ~12 runs = ~72 new run rows + 6 review rows. | Seed via `pnpm db:seed:phase29-placeholders` after migration. Operator can delete via `WHERE status = 'placeholder'` later. |
| Live service config | None — no n8n / external workflows touched. | None. |
| OS-registered state | None — no scheduled tasks, daemons, pm2 entries. | None. |
| Secrets/env vars | None — no new env vars required. Caddy already routes; Vercel deploy uses existing env. | None. |
| Build artifacts | Adds 1 new dependency (`@tanstack/react-table`) → `pnpm-lock.yaml` updates, `node_modules/.pnpm` populated. | `pnpm install` after `pnpm add @tanstack/react-table`. No stale artifacts. |

**Nothing found in the OS / live-service / secrets categories — verified by inspecting CONTEXT scope and STATE.md.**

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + dev | ✓ | v24 | — |
| pnpm | Package manager | ✓ | per workspace | — |
| Postgres (Neon dev) | DB queries + migration + seed | ✓ | (Neon-managed) | — |
| `postgres` (postgres-js) npm package | Migration runner script | ✓ | already installed (used by Phase 15/26/27/28 runners) | — |
| Playwright | E2E verification | ✓ | already installed | — |
| `@tanstack/react-table` | Sortable table | ✗ | — needs `pnpm add @tanstack/react-table` (latest 8.21.3) | None — must install |
| Caddy + dev server | Local route testing | ✓ | already configured for Glitch Studios | — |

**Missing dependencies with no fallback:** None — the only missing item is `@tanstack/react-table` and installation is straightforward.

**Missing dependencies with fallback:** None.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Auth.js v5 / NextAuth.js | Better Auth | Sept 2025 | Already adopted in the project; no Phase 29 impact. |
| Tailwind v3 | Tailwind v4 (CSS-first config) | Late 2024 | Already on v4 — Phase 29 uses arbitrary value classes (`bg-[#0a0a0a]`) per existing convention. |
| TanStack Table v7 | TanStack Table v8 (headless, framework-agnostic core) | 2022 | We're starting fresh on v8. Don't be misled by v7-era tutorials with different APIs (`useTable` hook signature changed). |
| Radix UI Slider in shadcn | Base UI Slider | Project-specific (decision made in earlier UI phase) | The project's `slider.tsx` wraps `@base-ui/react/slider`, NOT Radix. Reference Base UI docs (https://base-ui.com/react/components/slider) when extending. |
| Manual `useSearchParams` | nuqs `useQueryStates` | nuqs 2.x stable | Already adopted. Phase 29 follows the convention. |

**Deprecated / outdated:**
- TanStack Table v7 patterns (`useTable` hook signature) — superseded by v8 `useReactTable`.
- `unstable_cache` is still officially "unstable" as of Next 15+ but widely used in production. Next.js 16 has not deprecated it. Acceptable for v4.0; replace with `'use cache'` directive only after it stabilizes.

## Open Questions

1. **Should `<512` storage filter bucket be dropped from D-05?**
   - What we know: No placeholder review covers <512GB; no modern reviewable laptop ships <512GB.
   - What's unclear: Whether the user wants the bucket present-but-empty (UX hint) or hidden.
   - Recommendation: Drop the `<512` bucket from D-05. Document the change as a CONTEXT amendment in the planner's plan-phase deliverable.

2. **`mlx_lm:tg128` vs `llama_bench:tg128` for the LLM column?**
   - What we know: `llama_bench` runs cross-platform (Apple/Intel/AMD); `mlx_lm` is Apple-Silicon-only.
   - What's unclear: Whether brand identity ("we use the most modern Apple stack") outweighs cross-platform comparability.
   - Recommendation: Use `llama_bench:tg128` so a single column compares across all CPU kinds. Document `mlx_lm:tg128` as a future "Apple-only laptops" view.

3. **`unstable_cache` revalidation strategy: brute-force vs surgical?**
   - What we know: Brute-force `revalidateTag("leaderboard")` invalidates every category. Surgical `revalidateTag(\`leaderboard:${slug}\`)` requires looking up the category at publish time.
   - What's unclear: Whether the corpus growth path makes surgical worth the complexity.
   - Recommendation: Brute-force for v4.0 (small corpus). Document the surgical path for when more than ~5 categories ship reviews.

4. **Hero image strategy for placeholders?**
   - What we know: Real `<Image>` rendering requires a `mediaAssets` row.
   - What's unclear: Reuse one neutral image, generate solid-color placeholders, or a mix.
   - Recommendation: One neutral cyberpunk laptop silhouette reused across all 6 — let the product names + chips do the differentiation work. Planner finalizes during the seed task.

## Project Constraints (from CLAUDE.md + memories)

These are project-wide directives the planner MUST honor:

- **Package manager:** `pnpm` only — never `npm` or `yarn` (workspace CLAUDE.md).
- **Build commands:** `pnpm tsc --noEmit` and `pnpm lint` for verification — NEVER run `next build` in parallel agents (CodeBox 8c/19GB constraint, project CLAUDE.md).
- **Single build at a time:** If a full build is unavoidable, run sequentially, not concurrently.
- **No gsd-executor subagents:** Work inline; verify with Playwright (memory `feedback_no_executors.md`).
- **Hover-only glitch on headers:** Site-wide rule. h1 wraps `<GlitchHeading>` / `<HoverGlitchHeading>`. No auto-running animations on rows or cells (memory `feedback_glitch_headers.md`).
- **Brand naming:** "GlitchTech" (not "GlitchTek" — that's stale; CONTEXT.md and any methodology copy this phase touches must use "GlitchTech"). Memory `project_brand_name.md`.
- **Placeholder-first build philosophy:** Build the surface for ONE laptop (MBP 16 M5 Max in Phase 36) and 4–6 placeholders — don't seed a real fleet. Memory `project_placeholder_first_build.md`. Phase 29 specifically authorized to seed 4–6 placeholders for filter-axis coverage.
- **Playwright verification during dev:** Use `mcp__playwright` or a Playwright spec to verify visual output before declaring task done (memory `feedback_playwright_verification.md`).
- **No `.md` reports / summaries:** Do not write standalone analysis docs unless GSD plan requires them. (This research doc is one of the few exceptions — it's the planner's input.)
- **GSD workflow enforcement:** All file edits go through a GSD command (project CLAUDE.md "GSD Workflow Enforcement").
- **Don't commit secrets / .env files** (workspace CLAUDE.md hard constraint).
- **Push to GitHub regularly** — only backup (workspace CLAUDE.md).

## Sources

### Primary (HIGH confidence)
- **Codebase direct read** — `src/db/schema.ts` (lines 678–952 — enums, tech_reviews, benchmark tables verified)
- **Codebase direct read** — `src/lib/tech/queries.ts` (full file — DISTINCT ON pattern, status filters enumerated)
- **Codebase direct read** — `src/lib/tech/rubric-map.ts` (full file — 43 entries verified)
- **Codebase direct read** — `src/db/migrations/0008_phase28_glitchmark.sql` + `scripts/run-phase28-migration.ts` (migration pattern)
- **Codebase direct read** — `src/components/ui/slider.tsx`, `sheet.tsx` listing (verified slider, sheet, tooltip, table all installed)
- **Codebase direct read** — `src/app/(tech)/tech/categories/[slug]/page.tsx` (existing route — CTA target)
- **Codebase direct read** — `src/app/(tech)/tech/methodology/page.tsx` (anchor inventory)
- **`.planning/REQUIREMENTS.md`** — RANK-01..07 exact text
- **`.planning/phases/22-visual-audit-discovery/22-AUDIT.md`** §B.6, §B.9, §"Section I" (vision + GlitchMark coexistence)
- **`.planning/phases/28-glitchmark-system/28-CONTEXT.md`** D-16 (BPR + GlitchMark coexist on leaderboard)
- **npm registry** — `npm view @tanstack/react-table version` returned `8.21.3` (verified 2026-04-25)
- **npm registry** — `npm view nuqs version` returned `2.8.9` (matches package.json)
- **npm registry** — `npm view @base-ui/react version` returned `1.4.1` (matches package.json)

### Secondary (MEDIUM confidence)
- **TanStack Table v8 docs** (https://tanstack.com/table/v8) — controlled state pattern + `getSortedRowModel` API. Cross-verified by codebase grep: pattern matches the user-facing usage we're proposing.
- **nuqs docs** (https://nuqs.47ng.com) — `useQueryStates`, `clearOnDefault`, `parseAsArrayOf` API surfaces. Verified against existing project usage (`useQueryStates` is project convention).
- **Postgres docs — `ALTER TYPE ADD VALUE`** — `IF NOT EXISTS` clause, transaction restrictions on usage in same statement. Confirmed via Postgres 12+ release notes.

### Tertiary (LOW confidence — flag for validation)
- None — all Phase 29 claims verified against either the codebase or npm registry.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every recommended library either already installed or version-verified against npm
- Architecture: **HIGH** — patterns mirror existing codebase precedents (Phase 15 DISTINCT ON, Phase 17 component reuse, sitewide nuqs)
- Status enum migration: **HIGH** — direct read of schema confirms `'placeholder'` is missing; migration pattern cloned from Phase 28
- Placeholder seed: **MEDIUM** — set choices are researcher-reasoned but planner finalizes; benchmark numbers are illustrative only
- Methodology anchors: **HIGH** — directly enumerated from methodology page source
- Pitfalls: **HIGH** — items 1–4 verified in the codebase; items 5–8 are well-known Postgres / TanStack / a11y traps with mitigations cited
- TanStack + nuqs integration: **HIGH** — code skeleton uses publicly documented APIs that align with project's existing nuqs idioms

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (30 days — TanStack v8 is stable; Next.js 16.2 is current; no fast-moving dependencies)
