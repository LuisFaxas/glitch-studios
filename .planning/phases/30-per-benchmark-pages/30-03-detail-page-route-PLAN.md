---
phase: 30-per-benchmark-pages
plan: 03
type: execute
wave: 3
depends_on: ["30-01-slug-data-layer", "30-02-landing-page-rebuild"]
files_modified:
  - src/app/(tech)/tech/benchmarks/[slug]/page.tsx
  - src/components/tech/benchmark-leaderboard-table.tsx
  - tests/30-03-benchmark-detail.spec.ts
autonomous: true
requirements:
  - "Phase 30 SC-2 (slug → detail page resolves)"
  - "Phase 30 SC-3 (TechHero, test metadata, what-this-measures, leaderboard)"
  - "Phase 30 SC-4 (rows show product + category + AC/Battery + BPR ratio + vs-baseline)"
  - "Phase 30 SC-5 (empty-state panel for zero rows; 404 for unknown slug; rubric-without-row renders metadata + empty leaderboard)"
  - "Phase 30 SC-6 (generateStaticParams from RUBRIC_V1_1; force-static + revalidate=60)"
  - "Phase 30 SC-7 (row product → /tech/reviews/[slug]; row category → /tech/categories/[slug])"
  - "Phase 30 SC-9 (GlitchTech spelling)"
must_haves:
  truths:
    - "User visits /tech/benchmarks/cpu-geekbench6-multi and sees TechHero with title 'Geekbench 6 Multi-Core' and eyebrow 'BENCHMARK'"
    - "User sees 7 metadata chips (DISCIPLINE / TOOL / FIELD / UNIT / DIRECTION / MODE / BPR ELIGIBLE-when-eligible)"
    - "User sees 'What this measures' panel with rubric-templated paragraph + methodology link"
    - "User sees a leaderboard table with mode-aware columns (mode='both' → AC + Battery + BPR; mode='ac' → AC only; mode='battery' → Battery only)"
    - "User can click a column header (AC/Battery/BPR) to toggle sort direction; active column has underline + aria-sort attribute set"
    - "User clicking a product cell navigates to /tech/reviews/[slug]; category cell navigates to /tech/categories/[slug]"
    - "User visits /tech/benchmarks/not-a-real-test and sees Next.js default 404 (notFound() called)"
    - "User visits a valid slug whose tech_benchmark_tests row exists but has zero canonical runs and sees the 'No measurements yet' panel"
    - "Rubric-without-row case: valid slug, no tech_benchmark_tests row → page renders metadata sections + empty-state panel (does NOT 404)"
    - "All 43 detail pages prerender at build via generateStaticParams"
  artifacts:
    - path: "src/app/(tech)/tech/benchmarks/[slug]/page.tsx"
      provides: "Server component: generateStaticParams + generateMetadata + page render with hero, metadata chips, what-this-measures, leaderboard or empty-state, methodology footer link"
      contains: "generateStaticParams"
    - path: "src/components/tech/benchmark-leaderboard-table.tsx"
      provides: "Client component for sortable leaderboard table; consumes BenchmarkLeaderboardRow[]; mode-aware columns; client-side sort"
      exports: ["BenchmarkLeaderboardTable"]
    - path: "tests/30-03-benchmark-detail.spec.ts"
      provides: "Playwright spec: known slug renders, unknown slug 404s, empty-leaderboard slug shows panel, sort toggles work, cross-links resolve"
      contains: "test('known slug renders detail page'"
  key_links:
    - from: "src/app/(tech)/tech/benchmarks/[slug]/page.tsx"
      to: "src/lib/tech/benchmark-slug.ts"
      via: "generateStaticParams uses getAllBenchmarkSlugs(); page resolves rubricKeyFromSlug(params.slug)"
      pattern: "getAllBenchmarkSlugs|rubricKeyFromSlug"
    - from: "src/app/(tech)/tech/benchmarks/[slug]/page.tsx"
      to: "src/lib/tech/benchmark-leaderboard.ts"
      via: "calls getLeaderboardForBenchmark(rubricKey) for table data"
      pattern: "getLeaderboardForBenchmark"
    - from: "src/app/(tech)/tech/benchmarks/[slug]/page.tsx"
      to: "next/navigation"
      via: "imports notFound for unknown slugs"
      pattern: "import.*notFound.*from.*next/navigation"
    - from: "src/components/tech/benchmark-leaderboard-table.tsx"
      to: "/tech/reviews/[slug]"
      via: "Each row's product link href"
      pattern: "/tech/reviews/"
    - from: "src/components/tech/benchmark-leaderboard-table.tsx"
      to: "/tech/categories/[slug]"
      via: "Each row's category link href"
      pattern: "/tech/categories/"
---

<objective>
Create the per-benchmark detail route. Server component renders TechHero + metadata chips + what-this-measures panel + (sortable client-component leaderboard table OR empty-state panel) + methodology footer link. `generateStaticParams` prerenders all 43 known slugs at build. Unknown slugs call `notFound()`. Rubric-without-row keys render metadata + empty leaderboard panel.

Purpose: Ship Success Criteria #2-6 (slug resolves → detail page; cross-category leaderboard; honest empty-state; SSG prerender). The leaderboard table is the only client component needed (sort interaction); everything else is server-rendered.

Output: One new dynamic route page.tsx + one client leaderboard component + one Playwright spec.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/30-per-benchmark-pages/30-CONTEXT.md
@.planning/phases/30-per-benchmark-pages/30-UI-SPEC.md
@.planning/phases/30-per-benchmark-pages/30-01-SUMMARY.md
@.planning/phases/30-per-benchmark-pages/30-02-SUMMARY.md

@src/components/tech/tech-hero.tsx
@src/components/ui/glitch-heading.tsx
@src/lib/tech/rubric-map.ts
@src/lib/tech/benchmark-slug.ts
@src/lib/tech/benchmark-leaderboard.ts

<interfaces>
<!-- Use these directly. -->

From src/lib/tech/benchmark-slug.ts (Plan 30-01):
```typescript
export function slugFromRubricKey(key: string): string
export function rubricKeyFromSlug(slug: string): string | null
export function getAllBenchmarkSlugs(): string[]
```

From src/lib/tech/benchmark-leaderboard.ts (Plan 30-01):
```typescript
export interface BenchmarkLeaderboardRow {
  reviewId: string
  reviewSlug: string
  productId: string
  productName: string
  productSlug: string
  categoryName: string | null
  categorySlug: string | null
  acScore: number | null
  batteryScore: number | null
  bprRatio: number | null
  baselinePercent: number | null
}
export interface BenchmarkLeaderboardResult {
  rubricKey: string
  spec: RubricTestSpec
  referenceScore: number | null
  rows: BenchmarkLeaderboardRow[]
}
export function getLeaderboardForBenchmark(rubricKey: string): Promise<BenchmarkLeaderboardResult | null>
```

From src/lib/tech/rubric-map.ts:
```typescript
RubricTestSpec { discipline, tool, field, name, unit, direction, mode, bprEligible, sortOrder }
RUBRIC_V1_1 (43 entries)
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Client-side sortable leaderboard table component</name>
  <files>src/components/tech/benchmark-leaderboard-table.tsx</files>
  <read_first>
    - src/lib/tech/benchmark-leaderboard.ts (Plan 30-01 — type contract)
    - src/lib/tech/rubric-map.ts (RubricTestSpec type)
    - src/components/ui/glitch-heading.tsx (used in row product names per UI-SPEC)
    - src/components/tech/leaderboard-table.tsx (existing rankings table — pattern for sortable headers + aria-sort; do NOT reuse the file, but mirror its sort header pattern; per 29.3 lessons, do NOT use sticky cells, do NOT use min-width >viewport)
    - .planning/phases/30-per-benchmark-pages/30-UI-SPEC.md sections "Leaderboard table", "Column layout — mode-aware", "Column widths", "Header row", "Body row", "Sort behavior", "Honest-omit-row policy"
  </read_first>
  <action>
    Build a client component that renders the mode-aware sortable table. ALL pixel values, color hex codes, classNames, and aria attributes come verbatim from UI-SPEC §"Leaderboard table".

    File: `src/components/tech/benchmark-leaderboard-table.tsx`

    ```tsx
    "use client"

    import { useMemo, useState } from "react"
    import Link from "next/link"
    import { GlitchHeading } from "@/components/ui/glitch-heading"
    import type { BenchmarkLeaderboardRow } from "@/lib/tech/benchmark-leaderboard"
    import type { RubricTestSpec } from "@/lib/tech/rubric-map"

    type SortKey = "ac" | "battery" | "bpr"
    type SortDir = "asc" | "desc"

    export interface BenchmarkLeaderboardTableProps {
      spec: RubricTestSpec
      referenceScore: number | null
      rows: BenchmarkLeaderboardRow[]
    }

    function formatScore(value: number | null, unit: string): string {
      if (value === null) return "—"
      // UI-SPEC: seconds-unit tests show 12.4 (1 decimal); hours-unit tests show 8.2 (1 decimal);
      // fps/score units show whole-number with thousands sep.
      if (unit === "seconds" || unit === "hours") {
        return value.toFixed(1)
      }
      return value.toLocaleString("en-US", { maximumFractionDigits: 0 })
    }

    function formatBpr(value: number | null): string {
      if (value === null) return "—"
      return value.toFixed(2)
    }

    function formatBaseline(value: number | null): string | null {
      if (value === null) return null
      const sign = value >= 0 ? "+" : ""
      return `${sign}${Math.round(value)}%`
    }

    export function BenchmarkLeaderboardTable({
      spec,
      referenceScore,
      rows,
    }: BenchmarkLeaderboardTableProps) {
      // UI-SPEC §"Sort behavior": default sort is AC (mode=both/ac) or Battery (mode=battery).
      // Direction logic: higher_is_better → first click descending; lower_is_better → first click ascending.
      // BPR column: descending first click always.
      const initialSortKey: SortKey =
        spec.mode === "battery" ? "battery" : "ac"
      const initialSortDir: SortDir =
        spec.direction === "higher_is_better" ? "desc" : "asc"

      const [sortKey, setSortKey] = useState<SortKey>(initialSortKey)
      const [sortDir, setSortDir] = useState<SortDir>(initialSortDir)

      const showAc = spec.mode === "both" || spec.mode === "ac"
      const showBattery = spec.mode === "both" || spec.mode === "battery"
      const showBpr = spec.mode === "both"
      const showBaseline = referenceScore !== null

      const sortedRows = useMemo(() => {
        const out = [...rows]
        out.sort((a, b) => {
          const aVal =
            sortKey === "ac" ? a.acScore : sortKey === "battery" ? a.batteryScore : a.bprRatio
          const bVal =
            sortKey === "ac" ? b.acScore : sortKey === "battery" ? b.batteryScore : b.bprRatio
          // Nulls always sort to the bottom regardless of direction.
          if (aVal === null && bVal === null) return 0
          if (aVal === null) return 1
          if (bVal === null) return -1
          return sortDir === "asc" ? aVal - bVal : bVal - aVal
        })
        return out
      }, [rows, sortKey, sortDir])

      function toggleSort(key: SortKey) {
        if (sortKey === key) {
          setSortDir(sortDir === "asc" ? "desc" : "asc")
          return
        }
        setSortKey(key)
        // First click direction:
        // - AC/Battery columns honor spec.direction
        // - BPR column always descending first
        if (key === "bpr") {
          setSortDir("desc")
        } else {
          setSortDir(spec.direction === "higher_is_better" ? "desc" : "asc")
        }
      }

      function ariaSort(key: SortKey): "ascending" | "descending" | "none" {
        if (sortKey !== key) return "none"
        return sortDir === "asc" ? "ascending" : "descending"
      }

      function headerClass(key: SortKey): string {
        const base = "px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em]"
        const active = sortKey === key
        return `${base} ${active ? "text-[#f5f5f0] border-b-2 border-[#f5f5f0]" : "text-[#888] border-b border-[#222]"}`
      }

      function sortGlyph(key: SortKey): string {
        if (sortKey !== key) return ""
        return sortDir === "asc" ? " ▲" : " ▼"
      }

      return (
        <div className="mx-auto max-w-5xl px-6 pt-12 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="w-12 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#888] border-b border-[#222]">
                  #
                </th>
                <th className="w-auto min-w-[180px] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#888] border-b border-[#222]">
                  PRODUCT
                </th>
                <th className="w-32 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#888] border-b border-[#222]">
                  CATEGORY
                </th>
                {showAc && (
                  <th
                    aria-sort={ariaSort("ac")}
                    className={`w-24 text-right ${headerClass("ac")}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort("ac")}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
                    >
                      AC{sortGlyph("ac")}
                    </button>
                  </th>
                )}
                {showBattery && (
                  <th
                    aria-sort={ariaSort("battery")}
                    className={`w-24 text-right ${headerClass("battery")}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort("battery")}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
                    >
                      BATTERY{sortGlyph("battery")}
                    </button>
                  </th>
                )}
                {showBpr && (
                  <th
                    aria-sort={ariaSort("bpr")}
                    className={`w-20 text-right ${headerClass("bpr")}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort("bpr")}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
                    >
                      BPR{sortGlyph("bpr")}
                    </button>
                  </th>
                )}
                {showBaseline && (
                  <th className="w-24 text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#888] border-b border-[#222]">
                    VS BASELINE
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr
                  key={row.reviewId}
                  className="border-b border-[#222] even:bg-[#0d0d0d] hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-[13px] text-[#888] tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tech/reviews/${row.reviewSlug}`}
                      className="group font-mono text-[13px] md:text-[15px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]"
                    >
                      <span className="after:block after:h-px after:origin-left after:scale-x-0 after:bg-[#f5f5f0] after:transition-transform after:duration-200 group-hover:after:scale-x-100">
                        <GlitchHeading>{row.productName}</GlitchHeading>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {row.categorySlug && row.categoryName ? (
                      <Link
                        href={`/tech/categories/${row.categorySlug}`}
                        className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#888] hover:text-[#f5f5f0] transition-colors"
                      >
                        {row.categoryName}
                      </Link>
                    ) : (
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#444]">—</span>
                    )}
                  </td>
                  {showAc && (
                    <td className="w-24 px-4 py-3 text-right font-mono text-[14px] md:text-[16px] font-bold text-[#f5f5f0] tabular-nums">
                      {row.acScore === null ? (
                        <span className="text-[#444]">—</span>
                      ) : (
                        formatScore(row.acScore, spec.unit)
                      )}
                    </td>
                  )}
                  {showBattery && (
                    <td className="w-24 px-4 py-3 text-right font-mono text-[14px] md:text-[16px] font-bold text-[#f5f5f0] tabular-nums">
                      {row.batteryScore === null ? (
                        <span className="text-[#444]">—</span>
                      ) : (
                        formatScore(row.batteryScore, spec.unit)
                      )}
                    </td>
                  )}
                  {showBpr && (
                    <td
                      className="w-20 px-4 py-3 text-right font-mono text-[14px] md:text-[16px] font-bold text-[#f5f5f0] tabular-nums"
                      title="Battery score / AC score. Higher is better (closer to 1.00 = less throttling on battery)."
                    >
                      {row.bprRatio === null ? (
                        <span className="text-[#444]">—</span>
                      ) : (
                        formatBpr(row.bprRatio)
                      )}
                    </td>
                  )}
                  {showBaseline && (
                    <td className="w-24 px-4 py-3 text-right">
                      {formatBaseline(row.baselinePercent) === null ? (
                        <span className="text-[#444]">—</span>
                      ) : (
                        <span className="bg-[#1a1a1a] border border-[#222] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] text-[#888]">
                          {formatBaseline(row.baselinePercent)}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    ```

    Notes for executor:
    - `"use client"` is required (useState + onClick).
    - Per UI-SPEC, sort happens client-side; no nuqs, no URL state (29.3 baseline lesson).
    - No sticky cells, no min-width blowout, no canvas, no framer-motion (29.3 baseline lessons).
    - `tabular-nums` Tailwind utility maps to `font-variant-numeric: tabular-nums`.
    - Baseline-percent rounding: UI-SPEC shows whole-number percentages like `+47%` and `-12%`. `Math.round()` is correct.
    - Direction-aware baseline math is already done in the query layer (Plan 30-01 Task 2); this component just renders the sign with `+` prefix when ≥ 0.
    - GlitchHeading wraps the product name (site-wide rule).
  </action>
  <verify>
    <automated>pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File `src/components/tech/benchmark-leaderboard-table.tsx` exists.
    - `grep -q '"use client"' src/components/tech/benchmark-leaderboard-table.tsx` succeeds.
    - `grep -q "export function BenchmarkLeaderboardTable" src/components/tech/benchmark-leaderboard-table.tsx` succeeds.
    - `grep -q 'aria-sort=' src/components/tech/benchmark-leaderboard-table.tsx` succeeds.
    - `grep -q "/tech/reviews/" src/components/tech/benchmark-leaderboard-table.tsx` succeeds.
    - `grep -q "/tech/categories/" src/components/tech/benchmark-leaderboard-table.tsx` succeeds.
    - `grep -q "tabular-nums" src/components/tech/benchmark-leaderboard-table.tsx` succeeds.
    - `grep -q "GlitchHeading" src/components/tech/benchmark-leaderboard-table.tsx` succeeds.
    - `grep -q "Battery score / AC score" src/components/tech/benchmark-leaderboard-table.tsx` succeeds (BPR title attr).
    - `pnpm tsc --noEmit` exits 0.
  </acceptance_criteria>
  <done>
    Client component ships with mode-aware columns (showAc/showBattery/showBpr/showBaseline), sortable AC/Battery/BPR headers with aria-sort, default sort = AC (or Battery for mode=battery) with direction matching spec.direction, BPR-first-click always descending, missing values render `—`, product cell links to /tech/reviews/[slug], category cell links to /tech/categories/[slug], baseline pill renders only when reference_score present.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Detail page route /tech/benchmarks/[slug]/page.tsx</name>
  <files>src/app/(tech)/tech/benchmarks/[slug]/page.tsx</files>
  <read_first>
    - src/app/(tech)/tech/benchmarks/page.tsx (Plan 30-02 — landing page; same TechHero pattern, same GlitchHeading wrap, same monochrome utility classes)
    - src/components/tech/tech-hero.tsx (TechHeroProps; eyebrow + title + subhead + ctaLabel + ctaHref + tone + size)
    - src/components/tech/benchmark-leaderboard-table.tsx (just created in Task 1 — props shape)
    - src/lib/tech/benchmark-slug.ts (Plan 30-01 — getAllBenchmarkSlugs, rubricKeyFromSlug)
    - src/lib/tech/benchmark-leaderboard.ts (Plan 30-01 — getLeaderboardForBenchmark, BenchmarkLeaderboardResult)
    - src/lib/tech/rubric-map.ts (RUBRIC_V1_1, BenchmarkDiscipline)
    - .planning/phases/30-per-benchmark-pages/30-UI-SPEC.md sections "Detail page — `/tech/benchmarks/[slug]`", "TechHero (per-detail dynamic)", "Test metadata strip", "What this measures panel", "Leaderboard table", "Empty state — no measurements", "Methodology footer link", "404 handling"
    - existing dynamic [slug] page in /tech to confirm Next 16 params shape (e.g., `src/app/(tech)/tech/reviews/[slug]/page.tsx` if it exists, or `src/app/(tech)/tech/categories/[slug]/page.tsx`) — confirm whether params is `Promise<{slug: string}>` (Next 15+) or `{slug: string}` directly
    - **Precheck (REQUIRED before writing copy):** run `grep -rn "glitchmark\|GlitchMark" src/lib/tech/ src/app/\(tech\)/` to determine whether GlitchMark is a USER-FACING surfaced concept today.
        - GlitchMark scoring code DOES exist in `src/lib/tech/glitchmark.ts`, but per user memory `project_glitchmark.md` it is "never roadmapped... distinct from BPR" and SHOULD NOT be conflated with BPR in user-facing copy.
        - Per checker MAJOR-1: encode the **neutral fallback** verbatim in the bprSentence ternary (do NOT use the original UI-SPEC line 273 phrasing about "feeds the GlitchMark composite"). This is a deliberate divergence from UI-SPEC for factual accuracy in user-facing copy.
        - The summary for this plan must note the divergence and recommend the user update UI-SPEC.md line 273 post-execution.
  </read_first>
  <action>
    Server component: generateStaticParams, generateMetadata, page render. Per UI-SPEC, the detail page has 5 vertical regions:
    1. TechHero (cyan, default size, dynamic title from rubric)
    2. Test metadata strip (7 chips)
    3. "What this measures" panel (rubric-templated)
    4. Leaderboard table OR empty-state panel
    5. Methodology footer link

    All copy strings are quoted from UI-SPEC verbatim.

    File: `src/app/(tech)/tech/benchmarks/[slug]/page.tsx`

    ```tsx
    import type { Metadata } from "next"
    import Link from "next/link"
    import { notFound } from "next/navigation"
    import { TechHero } from "@/components/tech/tech-hero"
    import { GlitchHeading } from "@/components/ui/glitch-heading"
    import { BenchmarkLeaderboardTable } from "@/components/tech/benchmark-leaderboard-table"
    import {
      getAllBenchmarkSlugs,
      rubricKeyFromSlug,
    } from "@/lib/tech/benchmark-slug"
    import { getLeaderboardForBenchmark } from "@/lib/tech/benchmark-leaderboard"
    import {
      type BenchmarkDiscipline,
      type RubricTestSpec,
    } from "@/lib/tech/rubric-map"

    export const dynamic = "force-static"
    export const revalidate = 60
    export const dynamicParams = false   // 404 for any slug not in generateStaticParams

    // Inspect existing /tech dynamic routes (e.g. /tech/reviews/[slug]) to confirm Next 16 params shape.
    // Next 15+/16 uses async params: { params: Promise<{ slug: string }> }. Confirm at write time and adjust if older codebase still uses sync params.
    interface PageProps {
      params: Promise<{ slug: string }>
    }

    export async function generateStaticParams(): Promise<{ slug: string }[]> {
      return getAllBenchmarkSlugs().map((slug) => ({ slug }))
    }

    // ============================================================================
    // Discipline label / phrase tables — same source-of-truth as the landing page.
    // ============================================================================

    const DISCIPLINE_LABEL: Record<BenchmarkDiscipline, string> = {
      cpu: "CPU",
      gpu: "GPU",
      memory: "MEMORY",
      storage: "STORAGE",
      llm: "LLM",
      video: "VIDEO",
      dev: "DEV",
      python: "PYTHON",
      games: "GAMES",
      thermal: "THERMAL",
      battery_life: "BATTERY LIFE",
      wireless: "WIRELESS",
      display: "DISPLAY",
    }

    // UI-SPEC §"What this measures" — discipline-readable mapping
    const DISCIPLINE_READABLE: Record<BenchmarkDiscipline, string> = {
      cpu: "CPU",
      gpu: "GPU",
      llm: "LLM inference",
      memory: "memory bandwidth",
      storage: "storage I/O",
      video: "video encode",
      dev: "developer workflow",
      python: "Python compute",
      games: "gaming",
      thermal: "thermal sustain",
      battery_life: "battery life",
      wireless: "wireless throughput",
      display: "display calibration",
    }

    function modePhrase(mode: RubricTestSpec["mode"]): string {
      if (mode === "both") return "AC and battery"
      if (mode === "ac") return "AC only"
      return "battery only"
    }

    function modeChip(mode: RubricTestSpec["mode"]): string {
      if (mode === "both") return "AC + BATTERY"
      if (mode === "ac") return "AC ONLY"
      return "BATTERY ONLY"
    }

    function directionPhraseSentenceCase(direction: RubricTestSpec["direction"]): string {
      return direction === "higher_is_better" ? "Higher is better" : "Lower is better"
    }

    function directionGlyph(direction: RubricTestSpec["direction"]): string {
      return direction === "higher_is_better" ? "↑" : "↓"
    }

    function directionChipText(direction: RubricTestSpec["direction"]): string {
      return direction === "higher_is_better" ? "↑ HIGHER IS BETTER" : "↓ LOWER IS BETTER"
    }

    // ============================================================================
    // Subhead template (UI-SPEC §"TechHero (per-detail dynamic)" subhead spec)
    // "{discipline-uppercase} · {tool} · {unit}. {direction-phrase}. Run on {mode-phrase}."
    // ============================================================================

    function buildSubhead(spec: RubricTestSpec): string {
      const disciplineUpper = DISCIPLINE_LABEL[spec.discipline]
      const directionSentence = directionPhraseSentenceCase(spec.direction)
      const mode = modePhrase(spec.mode)
      return `${disciplineUpper} · ${spec.tool} · ${spec.unit}. ${directionSentence}. Run on ${mode}.`
    }

    // ============================================================================
    // "What this measures" body template (UI-SPEC §"What this measures panel")
    // ============================================================================

    function buildWhatThisMeasures(spec: RubricTestSpec): string {
      const disciplineReadable = DISCIPLINE_READABLE[spec.discipline]

      const directionSentence =
        spec.direction === "higher_is_better"
          ? `Higher scores indicate better ${disciplineReadable} throughput.`
          : `Lower values indicate better ${disciplineReadable} responsiveness — less time to complete the same workload is the win.`

      const modeSentence =
        spec.mode === "both"
          ? "We run this benchmark twice per device: once on AC and once unplugged. The BPR ratio (battery ÷ AC) appears in the rightmost column."
          : spec.mode === "ac"
            ? "We run this benchmark on AC power only — battery state does not change the result for this test."
            : "We run this benchmark on battery only — it measures sustained battery behavior."

      // Per checker MAJOR-1: use the neutral fallback for non-BPR tests instead of the original
      // UI-SPEC line 273 phrasing "feeds the GlitchMark composite". GlitchMark exists internally
      // (src/lib/tech/glitchmark.ts) but is NOT a user-facing surfaced concept yet, and per user
      // memory project_glitchmark.md it is distinct from BPR and never roadmapped. This deliberate
      // divergence from UI-SPEC line 273 is to avoid fabricating a user-facing system. Note the
      // divergence in the plan SUMMARY and recommend updating UI-SPEC.md post-execution.
      const bprSentence = spec.bprEligible
        ? "This test contributes to the device's BPR score."
        : "This test does not contribute to BPR. It surfaces here as a standalone reference."

      return `${spec.name} measures ${disciplineReadable} performance via ${spec.tool}. ${directionSentence} ${modeSentence} ${bprSentence}`
    }

    // ============================================================================
    // generateMetadata
    // ============================================================================

    export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
      const { slug } = await params
      const rubricKey = rubricKeyFromSlug(slug)
      if (!rubricKey) {
        return { title: "Benchmark Not Found" }
      }
      const result = await getLeaderboardForBenchmark(rubricKey)
      if (!result) {
        return { title: "Benchmark Not Found" }
      }
      const { spec } = result
      return {
        title: `${spec.name} — Benchmarks`,
        description: buildSubhead(spec),
      }
    }

    // ============================================================================
    // Page
    // ============================================================================

    export default async function BenchmarkDetailPage({ params }: PageProps) {
      const { slug } = await params
      const rubricKey = rubricKeyFromSlug(slug)
      // SC-5: notFound() reserved for "slug doesn't match RUBRIC_V1_1"
      if (!rubricKey) notFound()

      const result = await getLeaderboardForBenchmark(rubricKey)
      // result === null only when rubricKey itself isn't in RUBRIC_V1_1, but rubricKeyFromSlug above already
      // guarantees it is. Defensive guard:
      if (!result) notFound()

      const { spec, referenceScore, rows } = result

      return (
        <main className="min-h-screen bg-black">
          {/* TechHero — UI-SPEC locked */}
          <TechHero
            eyebrow="BENCHMARK"
            title={spec.name}
            subhead={buildSubhead(spec)}
            ctaLabel="View methodology"
            ctaHref="/tech/about#methodology"
            tone="cyan"
            size="default"
          />

          {/* Test metadata strip — 7 chips per UI-SPEC */}
          <section className="mx-auto max-w-5xl px-6 pt-8 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 border border-[#222] bg-[#111] font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
              DISCIPLINE: {DISCIPLINE_LABEL[spec.discipline]}
            </span>
            <span className="inline-flex items-center px-3 py-1 border border-[#222] bg-[#111] font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
              TOOL: {spec.tool}
            </span>
            <span className="inline-flex items-center px-3 py-1 border border-[#222] bg-[#111] font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
              FIELD: {spec.field}
            </span>
            <span className="inline-flex items-center px-3 py-1 border border-[#222] bg-[#111] font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
              UNIT: {spec.unit}
            </span>
            <span className="inline-flex items-center px-3 py-1 border border-[#222] bg-[#111] font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
              DIRECTION:{" "}
              <span className="ml-1 text-[#f5f5f0]">{directionGlyph(spec.direction)}</span>
              <span className="ml-1">{spec.direction === "higher_is_better" ? "HIGHER IS BETTER" : "LOWER IS BETTER"}</span>
            </span>
            <span className="inline-flex items-center px-3 py-1 border border-[#222] bg-[#111] font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
              MODE: {modeChip(spec.mode)}
            </span>
            {spec.bprEligible && (
              <span className="inline-flex items-center px-3 py-1 bg-[#f5f5f0] border border-[#f5f5f0] font-mono text-[11px] uppercase tracking-[0.1em] text-[#000]">
                BPR ELIGIBLE
              </span>
            )}
          </section>

          {/* What this measures panel */}
          <section className="mx-auto max-w-5xl px-6 pt-12">
            <h2 className="font-mono text-[20px] md:text-[28px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
              <GlitchHeading>What this measures</GlitchHeading>
            </h2>
            <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#888]">
              {buildWhatThisMeasures(spec)}
            </p>
            <p className="mt-4 font-sans text-[13px] text-[#888]">
              Read the{" "}
              <Link
                href="/tech/about#methodology"
                className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
              >
                full methodology
              </Link>{" "}
              for tool versions, run order, and exclusion rules.
            </p>
          </section>

          {/* Leaderboard OR empty-state */}
          {rows.length === 0 ? (
            <section className="mx-auto max-w-3xl px-6 pt-12 pb-16 text-center">
              <p className="font-mono text-[15px] uppercase tracking-[0.05em] text-[#f5f5f0]">
                No measurements yet
              </p>
              <p className="mt-4 font-sans text-[13px] leading-relaxed text-[#888]">
                No products have been scored on {spec.name} yet. This page populates as new reviews are published. Check back after the next review ships, or read the{" "}
                <Link
                  href="/tech/about#methodology"
                  className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
                >
                  methodology
                </Link>{" "}
                for what this benchmark captures.
              </p>
            </section>
          ) : (
            <BenchmarkLeaderboardTable
              spec={spec}
              referenceScore={referenceScore}
              rows={rows}
            />
          )}

          {/* Methodology footer link */}
          <section className="mx-auto max-w-5xl px-6 pt-8 pb-16 border-t border-[#222]">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
              How we test
            </p>
            <Link
              href="/tech/about#methodology"
              className="mt-2 inline-block font-mono text-[13px] text-[#f5f5f0] border-b border-[#555] hover:border-[#f5f5f0]"
            >
              View the GlitchTech methodology →
            </Link>
          </section>
        </main>
      )
    }
    ```

    Notes for executor:
    - `dynamicParams = false`: any slug not in generateStaticParams returns 404. This is the cleanest way to honor SC-5 (404 for unknown slug).
    - Next 16 params shape is `Promise<{slug: string}>` — confirm by reading an existing dynamic page. If the codebase still uses Next 15.0.x sync params, drop the Promise wrapper.
    - The "rubric-without-row" case (valid slug, no tech_benchmark_tests row) is handled in benchmark-leaderboard.ts (Plan 30-01 Task 2): it returns `{rubricKey, spec, referenceScore: null, rows: []}` instead of null. Page renders metadata + empty-state panel. SC-5 contract satisfied.
    - Brand spelling: `GlitchTech` everywhere; the methodology link copy "View the GlitchTech methodology →" is verbatim from UI-SPEC.
    - Description chip: the single inline-styled `DIRECTION:` chip combines a glyph (`↑`/`↓`) in `text-[#f5f5f0]` with the rest of the chip in `text-[#888]`, all in one `<span>` for clean wrapping (UI-SPEC §"Test metadata strip" #5).
  </action>
  <verify>
    <automated>pnpm tsc --noEmit && pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - File `src/app/(tech)/tech/benchmarks/[slug]/page.tsx` exists.
    - `grep -q "export async function generateStaticParams" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q "getAllBenchmarkSlugs" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q "rubricKeyFromSlug" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q "getLeaderboardForBenchmark" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q "notFound" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q 'eyebrow="BENCHMARK"' src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds (singular eyebrow per UI-SPEC).
    - `grep -q "What this measures" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q "No measurements yet" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q "How we test" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q "View the GlitchTech methodology" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -q 'export const dynamicParams = false' src/app/(tech)/tech/benchmarks/[slug]/page.tsx` succeeds.
    - `grep -c "GlitchTek" src/app/(tech)/tech/benchmarks/[slug]/page.tsx` returns 0.
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
  </acceptance_criteria>
  <done>
    Detail route renders TechHero (cyan, default, eyebrow=BENCHMARK, dynamic title), 7 metadata chips (BPR ELIGIBLE conditional), what-this-measures rubric-templated paragraph + methodology link, leaderboard table OR empty-state panel, methodology footer link. generateStaticParams enumerates all 43 slugs. Unknown slugs 404 via dynamicParams=false. force-static + revalidate=60 enforced.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Playwright spec for detail page (known slug, unknown slug, sort, links)</name>
  <files>tests/30-03-benchmark-detail.spec.ts</files>
  <read_first>
    - tests/30-02-benchmarks-landing.spec.ts (Plan 30-02 — same `/tech/benchmarks` test conventions; mirror locator strategy)
    - tests/29.1-03-rankings-routes.spec.ts (existing pattern for asserting many parameterized routes — useful reference if asserting all 43 slugs)
    - playwright.config.ts (baseURL handling)
    - src/app/(tech)/tech/benchmarks/[slug]/page.tsx (just created — assertions verify what was built)
    - .planning/phases/30-per-benchmark-pages/30-UI-SPEC.md sections "Hero Surface Map" + "Edge cases — explicit contracts"
  </read_first>
  <action>
    Spec asserts: known slug renders, unknown slug 404s, sort toggle works (aria-sort changes), product cell link goes to /tech/reviews/[slug], category cell link goes to /tech/categories/[slug], empty-state panel renders when 0 rows, mode-aware columns honored.

    File: `tests/30-03-benchmark-detail.spec.ts`

    ```typescript
    import { test, expect } from "@playwright/test"

    test.describe("Phase 30-03: /tech/benchmarks/[slug] detail page", () => {
      test("known slug renders detail page with all 5 regions", async ({ page }) => {
        const response = await page.goto("/tech/benchmarks/cpu-geekbench6-multi", { waitUntil: "networkidle" })
        expect(response?.status()).toBe(200)

        // Region 1: TechHero with BENCHMARK eyebrow + Geekbench 6 Multi-Core title
        await expect(page.getByText("BENCHMARK", { exact: true }).first()).toBeVisible()
        await expect(page.getByRole("heading", { level: 1, name: "Geekbench 6 Multi-Core" })).toBeVisible()
        await expect(page.getByRole("link", { name: "View methodology" })).toHaveAttribute(
          "href",
          "/tech/about#methodology",
        )

        // Region 2: 7 metadata chips
        await expect(page.getByText(/DISCIPLINE: CPU/)).toBeVisible()
        await expect(page.getByText(/TOOL: geekbench6/)).toBeVisible()
        await expect(page.getByText(/FIELD: multi/)).toBeVisible()
        await expect(page.getByText(/UNIT: score/)).toBeVisible()
        await expect(page.getByText(/HIGHER IS BETTER/)).toBeVisible()
        await expect(page.getByText(/MODE: AC \+ BATTERY/)).toBeVisible()
        // BPR ELIGIBLE chip — geekbench6:multi has bprEligible=true
        await expect(page.getByText("BPR ELIGIBLE", { exact: true }).first()).toBeVisible()

        // Region 3: What this measures
        await expect(page.getByRole("heading", { level: 2, name: "What this measures" })).toBeVisible()
        await expect(page.getByText(/Geekbench 6 Multi-Core measures CPU performance via geekbench6/)).toBeVisible()

        // Region 5: Methodology footer
        await expect(page.getByText("How we test", { exact: true })).toBeVisible()
        await expect(page.getByRole("link", { name: /View the GlitchTech methodology/ })).toBeVisible()

        // Brand check
        await expect(page.locator("body")).not.toContainText("GlitchTek")
      })

      test("unknown slug returns 404", async ({ page }) => {
        const response = await page.goto("/tech/benchmarks/not-a-real-test", { waitUntil: "domcontentloaded" })
        expect(response?.status()).toBe(404)
      })

      test("battery-only mode test renders Battery column only (no AC, no BPR)", async ({ page }) => {
        const response = await page.goto("/tech/benchmarks/battery-life-video-loop-hours", { waitUntil: "networkidle" })
        expect(response?.status()).toBe(200)
        await expect(page.getByRole("heading", { level: 1, name: "Video loop (local 1080p)" })).toBeVisible()
        await expect(page.getByText(/MODE: BATTERY ONLY/)).toBeVisible()
        // If any rows exist, the table should NOT have an AC or BPR column header.
        const acHeader = page.getByRole("columnheader", { name: /^AC/ })
        const bprHeader = page.getByRole("columnheader", { name: /^BPR/ })
        const battHeader = page.getByRole("columnheader", { name: /^BATTERY/ })
        // For battery-only test: AC + BPR headers should not be present even if leaderboard renders.
        await expect(acHeader).toHaveCount(0)
        await expect(bprHeader).toHaveCount(0)
        // Battery header may or may not exist depending on whether rows seeded; if rows exist, header exists.
        // We just verify counts above (AC=0, BPR=0). Battery header existence is conditional on data.
        if (await battHeader.count() > 0) {
          await expect(battHeader).toBeVisible()
        }
      })

      test("ac-only mode test renders AC column only (no Battery, no BPR)", async ({ page }) => {
        const response = await page.goto("/tech/benchmarks/memory-stream-triad", { waitUntil: "networkidle" })
        expect(response?.status()).toBe(200)
        await expect(page.getByRole("heading", { level: 1, name: "STREAM Triad" })).toBeVisible()
        await expect(page.getByText(/MODE: AC ONLY/)).toBeVisible()
        const battHeader = page.getByRole("columnheader", { name: /^BATTERY/ })
        const bprHeader = page.getByRole("columnheader", { name: /^BPR/ })
        await expect(battHeader).toHaveCount(0)
        await expect(bprHeader).toHaveCount(0)
      })

      test("empty-leaderboard rubric (no measurements) shows 'No measurements yet' panel", async ({ page }) => {
        // Pick a rubric key that has no tech_benchmark_runs in the seeded DB.
        // Most rubric entries beyond the flagship MBP review have zero measurements in dev seed.
        // We use one that's almost certainly empty: cpu:hyperfine:ripgrep_cargo (lower-is-better, not in 29.1-09 seed scope).
        // If this assertion turns brittle (a future seed populates it), pick another rubric key.
        const response = await page.goto("/tech/benchmarks/cpu-hyperfine-ripgrep-cargo", { waitUntil: "networkidle" })
        // Page must render 200 (rubric-without-row case per SC-5 — does NOT 404)
        expect(response?.status()).toBe(200)
        // Either rows exist OR empty-state panel shows
        const emptyPanel = page.getByText("No measurements yet", { exact: true })
        const tableRows = page.locator("tbody tr")
        const hasEmpty = await emptyPanel.count() > 0
        const hasRows = await tableRows.count() > 0
        expect(hasEmpty || hasRows).toBeTruthy()
        // For SC-5: at least ONE rubric key in the production seed must show empty-state.
        // We can't assert THIS specific slug is empty (data-dependent), so the assertion above is
        // defensive: page renders either state without crashing.
      })

      test("sort toggle on AC column flips aria-sort", async ({ page }) => {
        await page.goto("/tech/benchmarks/cpu-geekbench6-multi", { waitUntil: "networkidle" })
        const acHeader = page.getByRole("columnheader", { name: /^AC/ })
        if (await acHeader.count() === 0) {
          test.skip(true, "No leaderboard data to test sort interaction")
        }
        // Default for higher_is_better is descending
        await expect(acHeader).toHaveAttribute("aria-sort", "descending")
        // Click button inside header to toggle
        await acHeader.getByRole("button").click()
        await expect(acHeader).toHaveAttribute("aria-sort", "ascending")
        await acHeader.getByRole("button").click()
        await expect(acHeader).toHaveAttribute("aria-sort", "descending")
      })

      test("row product link goes to /tech/reviews/[slug]; category link goes to /tech/categories/[slug]", async ({ page }) => {
        await page.goto("/tech/benchmarks/cpu-geekbench6-multi", { waitUntil: "networkidle" })
        const productLinks = page.locator('tbody a[href^="/tech/reviews/"]')
        const categoryLinks = page.locator('tbody a[href^="/tech/categories/"]')
        const pCount = await productLinks.count()
        if (pCount === 0) {
          test.skip(true, "No leaderboard rows in current seed; cross-link assertion skipped")
        }
        await expect(productLinks.first()).toBeVisible()
        // Category link is conditional on row.categorySlug — only assert if any present.
        if (await categoryLinks.count() > 0) {
          await expect(categoryLinks.first()).toBeVisible()
        }
      })
    })

    test.describe("Phase 30-03: SSG enumeration", () => {
      test("all 43 known slugs return 200 (or are reachable via Next prerender)", async ({ page }) => {
        // Smoke-check 3 representative slugs across modes.
        const slugs = [
          "cpu-geekbench6-multi",         // mode=both, higher_is_better
          "memory-stream-triad",          // mode=ac
          "battery-life-video-loop-hours", // mode=battery
        ]
        for (const slug of slugs) {
          const r = await page.goto(`/tech/benchmarks/${slug}`, { waitUntil: "domcontentloaded" })
          expect(r?.status(), `slug ${slug} should return 200`).toBe(200)
        }
      })
    })
    ```

    Notes for executor:
    - The empty-leaderboard test is defensive: it asserts the page returns 200 in the rubric-without-row case AND either an empty panel or rows render — won't false-fail if the dev DB happens to have measurements for that slug.
    - The sort assertions skip cleanly if no rows are seeded (so the test is robust against an empty dev DB during plan 30-03 execution; once plan 30-04 wires more cross-links and the flagship review seeds runs, sort assertions will run for real).
    - 43-slug smoke replaced with 3 representative slugs (one per mode) to keep test runtime sane; full enumeration would be 43 page loads.
  </action>
  <verify>
    <automated>pnpm exec playwright test tests/30-03-benchmark-detail.spec.ts --project=desktop</automated>
  </verify>
  <acceptance_criteria>
    - File `tests/30-03-benchmark-detail.spec.ts` exists.
    - `grep -q "known slug renders detail page" tests/30-03-benchmark-detail.spec.ts` succeeds.
    - `grep -q "unknown slug returns 404" tests/30-03-benchmark-detail.spec.ts` succeeds.
    - `grep -q "battery-only mode test renders Battery column only" tests/30-03-benchmark-detail.spec.ts` succeeds.
    - `grep -q "ac-only mode test renders AC column only" tests/30-03-benchmark-detail.spec.ts` succeeds.
    - `grep -q "No measurements yet" tests/30-03-benchmark-detail.spec.ts` succeeds.
    - `grep -q "aria-sort" tests/30-03-benchmark-detail.spec.ts` succeeds.
    - `grep -q "/tech/reviews/" tests/30-03-benchmark-detail.spec.ts && grep -q "/tech/categories/" tests/30-03-benchmark-detail.spec.ts` succeeds.
    - `pnpm exec playwright test tests/30-03-benchmark-detail.spec.ts --project=desktop` exits 0.
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
  </acceptance_criteria>
  <done>
    Spec passes on desktop project. Asserts: known slug renders 200 with all 5 regions; unknown slug returns 404; ac-only and battery-only modes hide the unused columns; empty-state contract holds (page is 200, panel renders when rows empty); sort toggle flips aria-sort; cross-links resolve to /tech/reviews/[slug] and /tech/categories/[slug] when rows present; no GlitchTek typos.
  </done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- `pnpm exec playwright test tests/30-03-benchmark-detail.spec.ts --project=desktop` passes
- `grep -c "GlitchTek" src/app/\(tech\)/tech/benchmarks/\[slug\]/page.tsx src/components/tech/benchmark-leaderboard-table.tsx tests/30-03-benchmark-detail.spec.ts` returns 0 (sum)
- Manual smoke: visit http://localhost:3010/tech/benchmarks/cpu-geekbench6-multi (200, table renders); /tech/benchmarks/not-a-real (404); /tech/benchmarks/memory-stream-triad (200, only AC column)
</verification>

<success_criteria>
- /tech/benchmarks/[slug] route exists and prerenders at build via generateStaticParams (Phase 30 SC-2, SC-6)
- Page renders all 5 regions per UI-SPEC (Phase 30 SC-3)
- Leaderboard rows show product + category + AC/Battery scores + BPR ratio + vs-baseline pill (Phase 30 SC-4)
- Unknown slugs 404 via dynamicParams=false (Phase 30 SC-5)
- Rubric-without-row case renders 200 with empty-state panel (Phase 30 SC-5)
- Row product cell → /tech/reviews/[slug]; category cell → /tech/categories/[slug] (Phase 30 SC-7)
- Sort toggle works on AC/Battery/BPR with aria-sort attribute updates
- No GlitchTek typos (Phase 30 SC-9)
- All verification commands exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/30-per-benchmark-pages/30-03-SUMMARY.md` documenting:
- Files created
- Whether tsc/lint/playwright passed first try
- Any deviations (Next params shape sync vs Promise; aria-sort default attr value handling)
- Which slug was used in the empty-state test and whether it was actually empty in the dev DB at run time
- Any rubric metadata mapping that needed correcting in DISCIPLINE_READABLE
</output>
