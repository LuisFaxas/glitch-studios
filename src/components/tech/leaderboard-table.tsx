"use client"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingFn,
} from "@tanstack/react-table"
import {
  useQueryStates,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  sortId,
  methodologyAnchor,
  currentSort,
  currentDir,
  onSort,
}: SortHeaderProps) {
  const active = currentSort === sortId
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSort(sortId)
        }}
        className={`inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider ${
          active ? "text-[#f5f5f0]" : "text-[#888]"
        } hover:text-[#f5f5f0]`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" aria-hidden />
        {active && (
          <span className="text-[10px] text-[#f5f5f0]">
            {currentDir === "desc" ? "▼" : "▲"}
          </span>
        )}
      </button>
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

function DashCell({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className="cursor-help text-[#666]">—</span>}
      />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function deriveDisciplineFromRubricKey(key: string): string {
  return key.split(":")[0] ?? ""
}

export function LeaderboardTable({ rows, benchmarkColumns }: Props) {
  const router = useRouter()

  const [filters, setFilters] = useQueryStates({
    sort: parseAsString.withDefault("glitchmark").withOptions({ clearOnDefault: true }),
    dir: parseAsString.withDefault("desc").withOptions({ clearOnDefault: true }),
    minPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
    maxPrice: parseAsInteger.withOptions({ clearOnDefault: true }),
    year: parseAsArrayOf(parseAsInteger).withDefault([]).withOptions({ clearOnDefault: true }),
    cpu: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    ram: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    storage: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    medal: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    subcat: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
  })

  const filterState: FilterState = {
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    year: filters.year,
    cpu: filters.cpu,
    ram: filters.ram,
    storage: filters.storage,
    medal: filters.medal,
    subcat: filters.subcat,
  }

  const bounds = useMemo(() => deriveBounds(rows), [rows])
  const filteredRows = useMemo(
    () => applyFilters(rows, filterState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, filters],
  )

  const onSort = (id: string) => {
    if (filters.sort === id) {
      void setFilters({ dir: filters.dir === "desc" ? "asc" : "desc" })
    } else {
      void setFilters({ sort: id, dir: "desc" })
    }
  }

  const onResetFilters = () => {
    void setFilters({
      sort: null,
      dir: null,
      minPrice: null,
      maxPrice: null,
      year: [],
      cpu: [],
      ram: [],
      storage: [],
      medal: [],
      subcat: [],
    })
  }

  const onFilterChange = (next: Partial<FilterState>) => {
    void setFilters(next as Parameters<typeof setFilters>[0])
  }

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
            {row.original.heroImageUrl ? (
              <Image
                src={row.original.heroImageUrl}
                alt={row.original.heroImageAlt ?? row.original.productName}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 flex-none border border-[#222] object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 flex-none items-center justify-center border border-[#222] bg-[#111] font-mono text-sm text-[#666]">
                {(
                  row.original.manufacturer ?? row.original.productName
                ).charAt(0)}
              </div>
            )}
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
              {row.original.glitchmarkScore.toFixed(2)}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [benchmarkColumns, filters.sort, filters.dir],
  )

  const table = useReactTable({
    data: filteredRows,
    columns,
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
      {/* Desktop top filter bar (D-12) — replaces left sidebar */}
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
        {/* Desktop table */}
        <div data-leaderboard-table className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-30 bg-[#0a0a0a]">
              <tr>
                <th className="sticky left-0 z-40 w-12 bg-[#0a0a0a] px-3 py-3 text-left">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#888]">
                    #
                  </span>
                </th>
                <th className="sticky left-12 z-40 min-w-[280px] bg-[#0a0a0a] px-3 py-3 text-left">
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
                    className="group cursor-pointer border-t border-[#222] transition-[background,box-shadow] duration-150 hover:bg-[#1a1a1a] hover:[box-shadow:inset_2px_0_0_0_#f5f5f0]"
                  >
                    <td className="sticky left-0 z-20 bg-[#0a0a0a] px-3 py-3 font-mono text-[#666] group-hover:bg-[#1a1a1a]">
                      {i + 1}
                    </td>
                    <td className="sticky left-12 z-20 bg-[#0a0a0a] px-3 py-3 group-hover:bg-[#1a1a1a]">
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
        </div>

        {/* Mobile cards */}
        <div className="block space-y-3 md:hidden">
          {sortedRows.map((row, i) => (
            <LeaderboardCard
              key={row.original.reviewId}
              row={row.original}
              rank={i + 1}
              benchmarkColumns={benchmarkColumns}
            />
          ))}
        </div>

        {/* Mobile filter sheet */}
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
