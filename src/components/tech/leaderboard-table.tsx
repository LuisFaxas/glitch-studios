"use client"
import { memo, useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingFn,
} from "@tanstack/react-table"
import { ExternalLink } from "lucide-react"
import { BPRMedal } from "./bpr-medal"
import { BuyButton } from "./buy-button"
import { LeaderboardCard } from "./leaderboard-card"
import { LeaderboardEmptyState } from "./leaderboard-empty-state"
import {
  LeaderboardFilters,
  type FilterState,
  type FilterCorpusBounds,
} from "./leaderboard-filter-sidebar"
import { LeaderboardFilterSheet } from "./leaderboard-filter-sheet"
import { LeaderboardViewToggle } from "./leaderboard-view-toggle"
import { formatGlitchmarkDisplay } from "@/lib/tech/glitchmark-display"
import type {
  LeaderboardRow,
  LeaderboardBenchmarkColumn,
} from "@/lib/tech/leaderboard"

interface Props {
  rows: LeaderboardRow[]
  benchmarkColumns: LeaderboardBenchmarkColumn[]
}

// NULLS LAST sort that holds in BOTH directions.
const nullsLastNumeric: SortingFn<LeaderboardRow> = (a, b, colId) => {
  const av = a.getValue<number | null>(colId)
  const bv = b.getValue<number | null>(colId)
  if (av === null && bv === null) return 0
  if (av === null) return 1
  if (bv === null) return -1
  return (av as number) - (bv as number)
}

function ramBucket(gb: number | null): string | null {
  if (gb === null) return null
  if (gb >= 64) return "64"
  if (gb >= 32) return "32"
  if (gb >= 16) return "16"
  return "8"
}

function storageBucket(gb: number | null): string | null {
  if (gb === null) return null
  if (gb >= 2048) return "2048"
  if (gb >= 1024) return "1024"
  return "512"
}

function applyFilters(rows: LeaderboardRow[], f: FilterState): LeaderboardRow[] {
  return rows.filter((r) => {
    if (
      f.minPrice !== null &&
      (r.priceUsd === null || r.priceUsd < f.minPrice)
    )
      return false
    if (
      f.maxPrice !== null &&
      (r.priceUsd === null || r.priceUsd > f.maxPrice)
    )
      return false
    if (
      f.year.length > 0 &&
      (r.releaseYear === null || !f.year.includes(r.releaseYear))
    )
      return false
    if (
      f.cpu.length > 0 &&
      (r.cpuKind === null || !f.cpu.includes(r.cpuKind))
    )
      return false
    if (f.ram.length > 0) {
      const b = ramBucket(r.ramGb)
      if (!b || !f.ram.includes(b)) return false
    }
    if (f.storage.length > 0) {
      const b = storageBucket(r.storageGb)
      if (!b || !f.storage.includes(b)) return false
    }
    if (f.medal.length > 0 && (!r.bprTier || !f.medal.includes(r.bprTier)))
      return false
    if (
      f.subcat.length > 0 &&
      (!r.subCategorySlug || !f.subcat.includes(r.subCategorySlug))
    )
      return false
    return true
  })
}

function deriveBounds(rows: LeaderboardRow[]): FilterCorpusBounds {
  const prices = rows
    .map((r) => r.priceUsd)
    .filter((p): p is number => p !== null)
  const years = Array.from(
    new Set(rows.map((r) => r.releaseYear).filter((y): y is number => y !== null)),
  ).sort((a, b) => b - a)
  const cpuKinds = Array.from(
    new Set(rows.map((r) => r.cpuKind).filter((c): c is string => c !== null)),
  ).sort()
  const subCatMap = new Map<string, { slug: string; name: string }>()
  for (const r of rows) {
    if (r.subCategorySlug && r.subCategoryName) {
      subCatMap.set(r.subCategorySlug, {
        slug: r.subCategorySlug,
        name: r.subCategoryName,
      })
    }
  }
  return {
    priceMin:
      prices.length > 0 ? Math.floor(Math.min(...prices) / 100) * 100 : 0,
    priceMax:
      prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 5000,
    years,
    cpuKinds,
    subCategories: Array.from(subCatMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  }
}

interface SortHeaderProps {
  label: string
  sortId: string
  methodologyAnchor?: string
  currentSort: string
  currentDir: string
  onSort: (id: string) => void
}

function SortHeader({
  label,
  methodologyAnchor,
}: SortHeaderProps) {
  // ATOMIC FIX (2026-04-26): sort interaction disabled. User reports that ANY
  // table state change — sort included, not just filter — crashes macOS Safari
  // + Firefox. So the bug is in the table re-render cycle itself, not filter-
  // specific. Until Phase 29.3 rebuild, the header is a static label only.
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#888]"
      >
        {label}
      </span>
      {methodologyAnchor && (
        <a
          href={`/tech/about${methodologyAnchor}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#666] hover:text-[#f5f5f0]"
          aria-label={`${label} methodology (opens in new tab)`}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      )}
    </div>
  )
}

// Native title attribute instead of a Base UI Tooltip — a typical leaderboard
// row has 5-10 empty benchmark cells, and 7 rows × ~7 dashes = ~50 tooltips
// per page. Each Base UI Tooltip mounts a FloatingPortal with resize/scroll/
// pointer listeners (~5 per tooltip = 250+ listeners just for dashes). On
// every chip click, the table re-renders and Floating UI reconciles all of
// them — Firefox runs out of resources within a few clicks. The title attr
// gives the same hover-explanation UX with zero listeners.
function DashCell({ tooltip }: { tooltip: string }) {
  return (
    <span className="cursor-help text-[#666]" title={tooltip}>
      —
    </span>
  )
}

function deriveDisciplineFromRubricKey(key: string): string {
  return key.split(":")[0] ?? ""
}

// PHASE-48 IDLE FREEZE FIX (2026-05-01):
// Removed `useDesktopLayout` (matchMedia + setTimeout(0) + setState) and the
// renderDesktop/renderMobile JS gates. Desktop vs. mobile rendering is now
// controlled entirely by Tailwind responsive utilities (`hidden md:block` /
// `block md:hidden`). The hidden subtree is `display: none` so the browser
// does not paint or composite it. Both subtrees mount once on hydration and
// stay there.
//
// Why: real macOS Safari/Firefox can fire spurious `change` events on tab
// wake/refocus, system sleep recovery, external monitor DPR changes, or near-
// breakpoint resize/zoom. Each spurious change ran setTimeout(0) → setState →
// re-rendered the entire table tree. Headless Linux Chromium does not engage
// these macOS lifecycle paths, which is why the freeze was invisible to the
// Playwright harness in `tests/debug-rankings-idle-freeze.spec.ts`.
// Investigation: `.planning/debug/rankings-laptops-idle-freeze.md`.
//
// Trade-off: both desktop and mobile DOM subtrees render on every page load.
// They share the same upstream filter/sort state, so the duplicate is purely
// presentational. The desktop one is `display: none` on small viewports, the
// mobile one is `display: none` on md+ viewports — neither paints when hidden.

function LeaderboardTableInner({ rows, benchmarkColumns }: Props) {
  const router = useRouter()

  // Filter state is LOCAL React state, not URL state. Codex forensic review
  // identified the chip-click crash as: nuqs URL update → shallow URL replace
  // → (tech) client layout (which uses usePathname) re-renders → cascade
  // through TileNav / BottomTabBar / MobileContentWrapper → macOS Safari +
  // Firefox can't keep up with the app-shell churn. By keeping filters local,
  // a chip click only re-renders LeaderboardTable. The rest of the shell
  // never knows the filter changed.
  // Trade-off: filtered views are no longer shareable via URL. Acceptable
  // until we lift TileNav out of being router-sensitive (Codex fix #2).
  type AllFilters = {
    sort: string
    dir: string
    minPrice: number | null
    maxPrice: number | null
    year: number[]
    cpu: string[]
    ram: string[]
    storage: string[]
    medal: string[]
    subcat: string[]
    view: "cards" | "table"
  }
  const [filters, setFiltersState] = useState<AllFilters>({
    sort: "glitchmark",
    dir: "desc",
    minPrice: null,
    maxPrice: null,
    year: [],
    cpu: [],
    ram: [],
    storage: [],
    medal: [],
    subcat: [],
    view: "cards",
  })
  const setFilters = useCallback(
    (patch: Partial<AllFilters>) => {
      // Defer out of the native click task. Synchronous filter/dropdown updates
      // can trigger a browser pointer/style feedback loop on macOS Safari/Firefox.
      window.setTimeout(() => {
        setFiltersState((prev) => ({ ...prev, ...patch }))
      }, 0)
    },
    [],
  )

  const filterState: FilterState = useMemo(
    () => ({
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      year: filters.year,
      cpu: filters.cpu,
      ram: filters.ram,
      storage: filters.storage,
      medal: filters.medal,
      subcat: filters.subcat,
    }),
    [
      filters.minPrice,
      filters.maxPrice,
      filters.year,
      filters.cpu,
      filters.ram,
      filters.storage,
      filters.medal,
      filters.subcat,
    ],
  )

  const bounds = useMemo(() => deriveBounds(rows), [rows])
  const filteredRows = useMemo(
    () => applyFilters(rows, filterState),
    [rows, filterState],
  )

  const onSort = useCallback(
    (id: string) => {
      if (filters.sort === id) {
        setFilters({ dir: filters.dir === "desc" ? "asc" : "desc" })
      } else {
        setFilters({ sort: id, dir: "desc" })
      }
    },
    [filters.sort, filters.dir, setFilters],
  )

  const onResetFilters = useCallback(() => {
    setFilters({
      sort: "glitchmark",
      dir: "desc",
      minPrice: null,
      maxPrice: null,
      year: [],
      cpu: [],
      ram: [],
      storage: [],
      medal: [],
      subcat: [],
    })
  }, [setFilters])

  const onFilterChange = useCallback(
    (next: Partial<FilterState>) => {
      setFilters(next)
    },
    [setFilters],
  )

  const onViewChange = useCallback(
    (v: "cards" | "table") => {
      void setFilters({ view: v })
    },
    [setFilters],
  )

  const activeFilterCount =
    (filters.minPrice !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    filters.year.length +
    filters.cpu.length +
    filters.ram.length +
    filters.storage.length +
    filters.medal.length +
    filters.subcat.length

  // Build TanStack columns array.
  // ORDER (D-01): Product | BPR medal | BPR score | GlitchMark | <benchmarkColumns…> | Year | Price | Buy
  const columns: ColumnDef<LeaderboardRow>[] = useMemo(
    () => [
      {
        id: "product",
        header: () => (
          <span className="font-mono text-xs uppercase tracking-wider text-[#888]">
            Product
          </span>
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {/* Phase 29.1 chip-crash forensic fix: replaced `next/image` with
                a CSS-color tile. Every placeholder row was loading the SAME
                1200x800 PNG from placehold.co (via `unoptimized`), then
                downscaling 7 copies to 48x48 in the GPU. On macOS Safari +
                Firefox, chip click → table re-flow → ImageIO re-decode of
                the same large PNG 7 times. Headless Playwright tests cache
                the image and don't see this cost.
                Once real product imagery ships, swap this back to `<Image>`
                with width/height matching the served file (NOT 1200x800). */}
            <div
              className="flex h-12 w-12 flex-none items-center justify-center border border-[#222] bg-[#111] font-mono text-sm text-[#666]"
              aria-label={row.original.heroImageAlt ?? row.original.productName}
            >
              {(
                row.original.manufacturer ?? row.original.productName
              ).charAt(0)}
            </div>
            {/* heroImageUrl intentionally not rendered while placeholder URLs
                are in use. Restore an <img> or <Image> here when real product
                images ship. */}
            <div className="min-w-0">
              <div className="truncate font-mono text-sm text-[#f5f5f0]">
                {row.original.productName}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] text-[#888]">
                {row.original.subCategoryName && (
                  <span className="border border-[#222] bg-[#111] px-1.5 py-0.5 font-mono uppercase">
                    {row.original.subCategoryName}
                  </span>
                )}
                {row.original.cpuKind && (
                  <span className="border border-[#222] bg-[#111] px-1.5 py-0.5 font-mono uppercase">
                    {row.original.cpuKind}
                  </span>
                )}
                {row.original.ramGb && (
                  <span className="border border-[#222] bg-[#111] px-1.5 py-0.5 font-mono uppercase">
                    {row.original.ramGb} GB
                  </span>
                )}
                {row.original.storageGb && (
                  <span className="border border-[#222] bg-[#111] px-1.5 py-0.5 font-mono uppercase">
                    {row.original.storageGb >= 1024
                      ? `${row.original.storageGb / 1024} TB`
                      : `${row.original.storageGb} GB`}
                  </span>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "bpr",
        header: () => (
          <SortHeader
            label="BPR"
            sortId="bpr"
            methodologyAnchor="#bpr"
            currentSort={filters.sort}
            currentDir={filters.dir}
            onSort={onSort}
          />
        ),
        accessorFn: (row) => row.bprScore,
        sortingFn: nullsLastNumeric,
        enableSorting: true,
        cell: ({ row }) =>
          row.original.bprTier && row.original.bprScore !== null ? (
            <BPRMedal
              tier={row.original.bprTier}
              score={row.original.bprScore}
              disciplineCount={row.original.bprDisciplineCount}
              variant="compact"
            />
          ) : (
            <DashCell tooltip="No BPR — sparse discipline coverage" />
          ),
      },
      {
        id: "bprScore",
        header: () => (
          <SortHeader
            label="BPR score"
            sortId="bprScore"
            methodologyAnchor="#bpr"
            currentSort={filters.sort}
            currentDir={filters.dir}
            onSort={onSort}
          />
        ),
        accessorFn: (row) => row.bprScore,
        sortingFn: nullsLastNumeric,
        enableSorting: true,
        cell: ({ row }) =>
          row.original.bprScore !== null ? (
            <span className="font-mono text-[#ccc]">
              {row.original.bprScore.toFixed(4)}
            </span>
          ) : (
            <DashCell tooltip="No BPR score — sparse discipline coverage" />
          ),
      },
      {
        id: "glitchmark",
        header: () => (
          <SortHeader
            label="GlitchMark"
            sortId="glitchmark"
            methodologyAnchor="#glitchmark"
            currentSort={filters.sort}
            currentDir={filters.dir}
            onSort={onSort}
          />
        ),
        accessorFn: (row) => row.glitchmarkScore,
        sortingFn: nullsLastNumeric,
        enableSorting: true,
        cell: ({ row }) =>
          row.original.glitchmarkScore !== null ? (
            <span className="font-mono text-[#f5f5f0]">
              {formatGlitchmarkDisplay(row.original.glitchmarkScore)}
              {row.original.glitchmarkIsPartial && (
                <span className="ml-1 text-xs text-[#888]">· partial</span>
              )}
            </span>
          ) : (
            <DashCell tooltip="GlitchMark not computed — insufficient benchmark coverage" />
          ),
      },
      ...benchmarkColumns.map<ColumnDef<LeaderboardRow>>((bc) => ({
        id: bc.rubricKey,
        header: () => (
          <SortHeader
            label={bc.displayName}
            sortId={bc.rubricKey}
            methodologyAnchor={bc.methodologyAnchor}
            currentSort={filters.sort}
            currentDir={filters.dir}
            onSort={onSort}
          />
        ),
        accessorFn: (row) => row.benchmarkScores[bc.rubricKey]?.score ?? null,
        sortingFn: nullsLastNumeric,
        cell: ({ row }) => {
          const v = row.original.benchmarkScores[bc.rubricKey]
          if (!v) {
            const reason =
              row.original.exclusionReasons[
                deriveDisciplineFromRubricKey(bc.rubricKey)
              ] ?? "Not included in this review"
            return <DashCell tooltip={reason} />
          }
          return (
            <span className="font-mono text-[#ccc]">
              {v.score.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          )
        },
      })),
      {
        id: "year",
        header: () => (
          <SortHeader
            label="Year"
            sortId="year"
            currentSort={filters.sort}
            currentDir={filters.dir}
            onSort={onSort}
          />
        ),
        accessorFn: (row) => row.releaseYear,
        sortingFn: nullsLastNumeric,
        cell: ({ row }) => (
          <span className="font-mono text-[#ccc]">
            {row.original.releaseYear ?? "—"}
          </span>
        ),
      },
      {
        id: "price",
        header: () => (
          <SortHeader
            label="Price"
            sortId="price"
            currentSort={filters.sort}
            currentDir={filters.dir}
            onSort={onSort}
          />
        ),
        accessorFn: (row) => row.priceUsd,
        sortingFn: nullsLastNumeric,
        cell: ({ row }) => (
          <span className="font-mono text-[#ccc]">
            {row.original.priceUsd !== null
              ? `$${row.original.priceUsd.toLocaleString()}`
              : "—"}
          </span>
        ),
      },
      {
        id: "buy",
        header: () => (
          <span className="font-mono text-xs uppercase tracking-wider text-[#888]">
            Buy
          </span>
        ),
        enableSorting: false,
        cell: ({ row }) => <BuyButton productId={row.original.productId} />,
      },
    ],
    // Phase 29.3 Suspect #2 fix: filters.sort/filters.dir/onSort intentionally
    // excluded from deps — SortHeader (lines 142-171) is a no-op visual after
    // the atomic fix and does NOT read currentSort/currentDir/onSort from
    // props (it destructures only label + methodologyAnchor). The values are
    // still passed in JSX so ESLint sees them; the disable below silences
    // that false positive. TanStack reads sort state from `state.sorting`
    // (line 554), not from columns. This change prevents a full ~14-column
    // rebuild on every sort/filter click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [benchmarkColumns],
  )

  const table = useReactTable({
    data: filteredRows,
    columns,
    // Stable row ID — without this TanStack uses array-index identity, so any
    // filter/sort change rebuilds every row's React key and forces every row
    // (and every <img>) to remount. Codex called this out as the second
    // load-bearing churn source on the rankings page.
    getRowId: (row) => row.reviewId,
    state: {
      sorting: [{ id: filters.sort, desc: filters.dir === "desc" }],
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: false,
    sortDescFirst: true,
  })

  if (rows.length === 0) {
    return <LeaderboardEmptyState mode="no-reviews-yet" />
  }
  if (filteredRows.length === 0) {
    return (
      <div>
        <div className="hidden md:block">
          <LeaderboardFilters
            state={filterState}
            onChange={onFilterChange}
            onReset={onResetFilters}
            bounds={bounds}
            layout="bar"
          />
        </div>
        <LeaderboardEmptyState
          mode="no-results-filtered"
          onResetFilters={onResetFilters}
        />
        <LeaderboardFilterSheet
          state={filterState}
          onChange={onFilterChange}
          onReset={onResetFilters}
          bounds={bounds}
          activeCount={activeFilterCount}
        />
      </div>
    )
  }

  const headerGroup = table.getHeaderGroups()[0]
  const productHeader = headerGroup.headers[0]
  const sortedRows = table.getRowModel().rows

  return (
    <div>
      {/* Phase 29.3: filter re-mounted after baseline GPU/render fixes
          (Plan 29.3-01) and macOS Safari/Firefox sort-header verification
          (Plan 29.3-02) confirmed the chip-bar is safe to render.
          Phase 48 idle-freeze fix (2026-05-01): visibility now controlled
          purely by CSS responsive utilities; no JS matchMedia gate. */}
      <div className="hidden md:block">
        <LeaderboardFilters
          state={filterState}
          onChange={onFilterChange}
          onReset={onResetFilters}
          bounds={bounds}
          layout="bar"
        />
      </div>

      <div>
        {/* Phase 29.1 D-17 — table markup is rendered both on desktop (always)
            and on mobile (when view=table). Single source of truth, no drift. */}
        {(() => {
          const tableMarkup = (
            // Sticky positioning removed from <thead>, rank <th>, product <th>,
            // and the matching per-row <td>s. Three sticky layers inside an
            // `overflow-x: auto` wrapper × 7 rows = 14 sticky cells that
            // macOS Firefox + WebRender corrupts on rapid DOM mutation (chip
            // click → table re-renders → all sticky cells recompute their
            // anchor positions while the GPU compositor is still flushing the
            // previous frame). The user's tab pegs at 90% CPU and dies.
            // Trade-off: scrolling horizontally no longer pins the # / Product
            // columns. Acceptable because the table's min-width:1600px rarely
            // requires horizontal scroll on desktop, and the page works.
            // Phase 29.3 Suspect #3 fix: 1600px → 1280px reduces the GPU
            // rasterization surface from a viewport-wide tile to a content-sized
            // one on common laptop viewports. The product column already enforces
            // 200/280px min-width (line 632); other columns size to content.
            // Conservative choice over `min-width: 100%` because the dev
            // environment (Codebox VM) cannot easily verify column legibility on
            // real macOS browsers — 1280px preserves laptop-standard column
            // widths. Plan 29.3-02 will validate on real macOS Safari + Firefox.
            <table className="w-full border-collapse" style={{ minWidth: "1280px" }}>
              <thead className="bg-[#0a0a0a]">
                <tr>
                  <th className="w-12 bg-[#0a0a0a] px-3 py-3 text-left">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#888]">
                      #
                    </span>
                  </th>
                  <th className="min-w-[200px] lg:min-w-[280px] bg-[#0a0a0a] px-3 py-3 text-left">
                    {flexRender(
                      productHeader.column.columnDef.header,
                      productHeader.getContext(),
                    )}
                  </th>
                  {headerGroup.headers.slice(1).map((h) => (
                    <th key={h.id} className="px-3 py-3 text-left">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => {
                  const cells = row.getVisibleCells()
                  const productCell = cells[0]
                  return (
                    <tr
                      key={row.id}
                      onClick={() =>
                        router.push(`/tech/reviews/${row.original.reviewSlug}`)
                      }
                      className="group cursor-pointer border-t border-[#222] hover:bg-[#1a1a1a]"
                    >
                      <td className="bg-[#0a0a0a] px-3 py-3 font-mono text-[#666] group-hover:bg-[#1a1a1a]">
                        {i + 1}
                      </td>
                      <td className="bg-[#0a0a0a] px-3 py-3 group-hover:bg-[#1a1a1a]">
                        {flexRender(
                          productCell.column.columnDef.cell,
                          productCell.getContext(),
                        )}
                      </td>
                      {cells.slice(1).map((cell) => (
                        <td key={cell.id} className="px-3 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )

          return (
            <>
              {/* Desktop table — visible at md+. `display: none` on mobile
                  via Tailwind `hidden`; the browser does not paint or
                  composite the hidden subtree. */}
              <div
                data-leaderboard-table
                className="hidden overflow-x-auto md:block"
                style={{ contain: "layout paint style" }}
              >
                {tableMarkup}
              </div>

              {/* Mobile — Cards/Table toggle. `display: none` on md+. */}
              <div
                data-leaderboard-table-mobile-wrapper
                className="block md:hidden"
                style={{ contain: "layout paint style" }}
              >
                <div className="mb-3 flex items-center justify-end">
                  <LeaderboardViewToggle
                    value={filters.view}
                    onChange={onViewChange}
                  />
                </div>
                {filters.view === "cards" ? (
                  <div className="space-y-3">
                    {sortedRows.map((row, i) => (
                      <LeaderboardCard
                        key={row.original.reviewId}
                        row={row.original}
                        rank={i + 1}
                        benchmarkColumns={benchmarkColumns}
                      />
                    ))}
                  </div>
                ) : (
                  <div data-leaderboard-table-mobile className="overflow-x-auto">
                    {tableMarkup}
                  </div>
                )}
              </div>
            </>
          )
        })()}

        {/* Phase 29.3: mobile filter sheet — its trigger button is
            `md:hidden`, so the entire Sheet stays display-hidden on
            desktop. No JS gate needed. */}
        <LeaderboardFilterSheet
          state={filterState}
          onChange={onFilterChange}
          onReset={onResetFilters}
          bounds={bounds}
          activeCount={activeFilterCount}
        />
      </div>
    </div>
  )
}

// SIMPLE-MODE diagnostic implementation, gated behind `?simple=1`.
// Same filter state setup as the full version, but renders a flat <ul> of
// products instead of going through tanstack's `useReactTable`. The point is
// to isolate whether tanstack's internal state churn (build/teardown of row
// models on every filter-driven `data` prop change) is the wedge cause for
// the rankings-categories-filter-crash on real macOS Safari/Firefox. If
// `?simple=1` does NOT freeze on filter+reset+nav, tanstack is the wedge and
// we permanently swap to this simple variant. If it still freezes, tanstack
// is innocent and the wedge is elsewhere.
//
// Filter state is duplicated (not extracted to a hook) on purpose — to keep
// the diagnostic change minimal and the existing tanstack path completely
// untouched.
//
// Investigation: .planning/debug/rankings-categories-filter-crash.md
function LeaderboardTableSimpleInner({ rows }: Props) {
  type AllFilters = {
    minPrice: number | null
    maxPrice: number | null
    year: number[]
    cpu: string[]
    ram: string[]
    storage: string[]
    medal: string[]
    subcat: string[]
  }
  const [filters, setFiltersState] = useState<AllFilters>({
    minPrice: null,
    maxPrice: null,
    year: [],
    cpu: [],
    ram: [],
    storage: [],
    medal: [],
    subcat: [],
  })
  const setFilters = useCallback((patch: Partial<AllFilters>) => {
    window.setTimeout(() => {
      setFiltersState((prev) => ({ ...prev, ...patch }))
    }, 0)
  }, [])

  const filterState: FilterState = useMemo(
    () => ({
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      year: filters.year,
      cpu: filters.cpu,
      ram: filters.ram,
      storage: filters.storage,
      medal: filters.medal,
      subcat: filters.subcat,
    }),
    [
      filters.minPrice,
      filters.maxPrice,
      filters.year,
      filters.cpu,
      filters.ram,
      filters.storage,
      filters.medal,
      filters.subcat,
    ],
  )

  const bounds = useMemo<FilterCorpusBounds>(() => deriveBounds(rows), [rows])
  const filteredRows = useMemo(
    () => applyFilters(rows, filterState),
    [rows, filterState],
  )

  const onFilterChange = useCallback(
    (patch: Partial<FilterState>) => setFilters(patch as Partial<AllFilters>),
    [setFilters],
  )
  const onResetFilters = useCallback(() => {
    setFilters({
      minPrice: null,
      maxPrice: null,
      year: [],
      cpu: [],
      ram: [],
      storage: [],
      medal: [],
      subcat: [],
    })
  }, [setFilters])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (filterState.minPrice !== null || filterState.maxPrice !== null) n++
    n += filterState.year.length > 0 ? 1 : 0
    n += filterState.cpu.length > 0 ? 1 : 0
    n += filterState.ram.length > 0 ? 1 : 0
    n += filterState.storage.length > 0 ? 1 : 0
    n += filterState.medal.length > 0 ? 1 : 0
    n += filterState.subcat.length > 0 ? 1 : 0
    return n
  }, [filterState])

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4">
      {/* Banner so the user can see they're in simple mode */}
      <div className="mb-3 border border-[#0f0]/30 bg-[#001a00] px-3 py-2 font-mono text-[11px] text-[#0f0]">
        SIMPLE-MODE DIAGNOSTIC — tanstack-table replaced with flat list. Same filter
        state, same sidebar. Strip-down test for rankings-categories-filter-crash.
      </div>

      <div className="hidden md:block">
        <LeaderboardFilters
          state={filterState}
          onChange={onFilterChange}
          onReset={onResetFilters}
          bounds={bounds}
          layout="bar"
        />
      </div>

      {filteredRows.length === 0 ? (
        <div className="border border-[#222] bg-[#0a0a0a] p-6 text-center font-mono text-sm text-[#888]">
          No products match the current filters.
        </div>
      ) : (
        <ul
          role="list"
          className="border border-[#222] bg-[#0a0a0a] divide-y divide-[#222]"
        >
          {filteredRows.map((row, i) => (
            <li
              key={row.reviewId}
              className="flex items-center gap-3 px-3 py-2 font-mono text-[13px] text-[#f5f5f0]"
            >
              <span className="w-8 shrink-0 text-[#666] tabular-nums">
                #{i + 1}
              </span>
              <Link
                href={`/tech/reviews/${row.reviewSlug}`}
                prefetch={false}
                className="flex-1 truncate text-[#f5f5f0] hover:text-[#fff] hover:underline"
              >
                {row.productName}
              </Link>
              <span className="w-16 shrink-0 text-right text-[#888] uppercase">
                {row.bprTier ?? "—"}
              </span>
              <span className="w-16 shrink-0 text-right text-[#888] tabular-nums">
                {row.glitchmarkScore !== null
                  ? formatGlitchmarkDisplay(row.glitchmarkScore)
                  : "—"}
              </span>
              <span className="w-20 shrink-0 text-right text-[#888] tabular-nums">
                {row.priceUsd !== null
                  ? `$${row.priceUsd.toLocaleString()}`
                  : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <LeaderboardFilterSheet
        state={filterState}
        onChange={onFilterChange}
        onReset={onResetFilters}
        bounds={bounds}
        activeCount={activeFilterCount}
      />
    </div>
  )
}

// Dispatcher — checks `?simple=1` and renders one of the two impls. memo()
// prevents the dispatcher from re-rendering on TechLayout re-renders for
// unrelated route transitions. Both inner components are self-contained.
function LeaderboardTableDispatcher(props: Props) {
  const searchParams = useSearchParams()
  const isSimple = searchParams?.get("simple") === "1"
  return isSimple ? (
    <LeaderboardTableSimpleInner {...props} />
  ) : (
    <LeaderboardTableInner {...props} />
  )
}

export const LeaderboardTable = memo(LeaderboardTableDispatcher)
