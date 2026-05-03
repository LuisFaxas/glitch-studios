"use client"

import { memo, useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { BPRMedal } from "./bpr-medal"
import { BuyButton } from "./buy-button"
import { LeaderboardEmptyState } from "./leaderboard-empty-state"
import {
  LeaderboardFilters,
  type FilterCorpusBounds,
  type FilterState,
} from "./leaderboard-filter-sidebar"
import { LeaderboardFilterSheet } from "./leaderboard-filter-sheet"
import { formatGlitchmarkDisplay } from "@/lib/tech/glitchmark-display"
import type {
  LeaderboardBenchmarkColumn,
  LeaderboardRow,
} from "@/lib/tech/leaderboard"

interface Props {
  rows: LeaderboardRow[]
  benchmarkColumns: LeaderboardBenchmarkColumn[]
}

function createEmptyFilterState(): FilterState {
  return {
    minPrice: null,
    maxPrice: null,
    year: [],
    cpu: [],
    ram: [],
    storage: [],
    medal: [],
    subcat: [],
  }
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
    new Set(
      rows.map((r) => r.releaseYear).filter((y): y is number => y !== null),
    ),
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

function deriveDisciplineFromRubricKey(key: string): string {
  return key.split(":")[0] ?? ""
}

function formatPrice(priceUsd: number | null): string {
  return priceUsd !== null ? `$${priceUsd.toLocaleString()}` : "-"
}

function formatStorage(gb: number): string {
  return gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`
}

function ProductInitial({ row }: { row: LeaderboardRow }) {
  return (
    <div
      className="flex h-11 w-11 flex-none items-center justify-center border border-[#222] bg-[#111] font-mono text-sm text-[#666]"
      aria-label={row.heroImageAlt ?? row.productName}
    >
      {(row.manufacturer ?? row.productName).charAt(0)}
    </div>
  )
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-[#222] bg-[#111] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#888]">
      {children}
    </span>
  )
}

function DashCell({ tooltip }: { tooltip: string }) {
  return (
    <span className="cursor-help text-[#666]" title={tooltip}>
      -
    </span>
  )
}

function ScoreBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[10px] uppercase text-[#666]">{label}</div>
      <div className="mt-1 font-mono text-xs text-[#f5f5f0]">{children}</div>
    </div>
  )
}

function BenchmarkValue({
  row,
  column,
}: {
  row: LeaderboardRow
  column: LeaderboardBenchmarkColumn
}) {
  const value = row.benchmarkScores[column.rubricKey]
  if (!value) {
    const reason =
      row.exclusionReasons[deriveDisciplineFromRubricKey(column.rubricKey)] ??
      "Not included in this review"
    return <DashCell tooltip={reason} />
  }

  return (
    <span>
      {value.score.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </span>
  )
}

function RankingRow({
  row,
  rank,
  benchmarkColumns,
}: {
  row: LeaderboardRow
  rank: number
  benchmarkColumns: LeaderboardBenchmarkColumn[]
}) {
  return (
    <article
      data-leaderboard-row
      className="grid gap-4 border-t border-[#222] bg-[#0a0a0a] px-3 py-4 first:border-t-0 md:grid-cols-[3rem_minmax(15rem,1.45fr)_minmax(24rem,2fr)_auto] md:items-center md:px-4"
    >
      <div className="font-mono text-sm text-[#666] tabular-nums">#{rank}</div>

      <div className="flex min-w-0 items-start gap-3">
        <ProductInitial row={row} />
        <div className="min-w-0">
          <Link
            href={`/tech/reviews/${row.reviewSlug}`}
            prefetch={false}
            className="block truncate font-mono text-sm text-[#f5f5f0] hover:text-white hover:underline"
          >
            {row.productName}
          </Link>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {row.subCategoryName && <MetaChip>{row.subCategoryName}</MetaChip>}
            {row.cpuKind && <MetaChip>{row.cpuKind}</MetaChip>}
            {row.ramGb && <MetaChip>{row.ramGb} GB</MetaChip>}
            {row.storageGb && <MetaChip>{formatStorage(row.storageGb)}</MetaChip>}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_repeat(4,minmax(5.5rem,1fr))]">
        <ScoreBlock label="BPR">
          {row.bprTier && row.bprScore !== null ? (
            <div className="flex flex-wrap items-center gap-2">
              <BPRMedal
                tier={row.bprTier}
                score={row.bprScore}
                disciplineCount={row.bprDisciplineCount}
                variant="compact"
              />
              <span className="text-[#888] tabular-nums">
                {row.bprScore.toFixed(4)}
              </span>
            </div>
          ) : (
            <DashCell tooltip="No BPR - sparse discipline coverage" />
          )}
        </ScoreBlock>

        <ScoreBlock label="GlitchMark">
          {row.glitchmarkScore !== null ? (
            <span className="tabular-nums">
              {formatGlitchmarkDisplay(row.glitchmarkScore)}
              {row.glitchmarkIsPartial && (
                <span className="ml-1 text-[10px] uppercase text-[#888]">
                  partial
                </span>
              )}
            </span>
          ) : (
            <DashCell tooltip="GlitchMark not computed - insufficient benchmark coverage" />
          )}
        </ScoreBlock>

        {benchmarkColumns.map((column) => (
          <ScoreBlock key={column.rubricKey} label={column.displayName}>
            <BenchmarkValue row={row} column={column} />
          </ScoreBlock>
        ))}
      </div>

      <div className="grid grid-cols-3 items-end gap-3 md:min-w-[12rem] md:grid-cols-[4rem_5rem_auto]">
        <ScoreBlock label="Year">
          <span className="tabular-nums">{row.releaseYear ?? "-"}</span>
        </ScoreBlock>
        <ScoreBlock label="Price">
          <span className="tabular-nums">{formatPrice(row.priceUsd)}</span>
        </ScoreBlock>
        <div className="justify-self-end">
          <BuyButton productId={row.productId} />
        </div>
      </div>
    </article>
  )
}

function LeaderboardTableInner({ rows, benchmarkColumns }: Props) {
  const [filters, setFiltersState] = useState<FilterState>(() =>
    createEmptyFilterState(),
  )

  const setFilters = useCallback((patch: Partial<FilterState>) => {
    // Keep filter mutations outside the native input event task. This mirrors
    // the diagnostic path that passed real macOS Safari/Firefox testing.
    window.setTimeout(() => {
      setFiltersState((prev) => ({ ...prev, ...patch }))
    }, 0)
  }, [])

  const bounds = useMemo(() => deriveBounds(rows), [rows])
  const filteredRows = useMemo(
    () => applyFilters(rows, filters),
    [rows, filters],
  )

  const onResetFilters = useCallback(() => {
    setFilters(createEmptyFilterState())
  }, [setFilters])

  const onFilterChange = useCallback(
    (next: Partial<FilterState>) => {
      setFilters(next)
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

  if (rows.length === 0) {
    return <LeaderboardEmptyState mode="no-reviews-yet" />
  }

  if (filteredRows.length === 0) {
    return (
      <div>
        <div className="hidden md:block">
          <LeaderboardFilters
            state={filters}
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
          state={filters}
          onChange={onFilterChange}
          onReset={onResetFilters}
          bounds={bounds}
          activeCount={activeFilterCount}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="hidden md:block">
        <LeaderboardFilters
          state={filters}
          onChange={onFilterChange}
          onReset={onResetFilters}
          bounds={bounds}
          layout="bar"
        />
      </div>

      <section
        data-leaderboard-display
        aria-label="Ranked products"
        className="border border-[#222] bg-[#0a0a0a]"
      >
        <div className="hidden border-b border-[#222] bg-[#050505] px-4 py-2 font-mono text-[10px] uppercase text-[#666] md:grid md:grid-cols-[3rem_minmax(15rem,1.45fr)_minmax(24rem,2fr)_auto] md:gap-4">
          <span>#</span>
          <span>Product</span>
          <span>Scores</span>
          <span>Details</span>
        </div>
        {filteredRows.map((row, index) => (
          <RankingRow
            key={row.reviewId}
            row={row}
            rank={index + 1}
            benchmarkColumns={benchmarkColumns}
          />
        ))}
      </section>

      <LeaderboardFilterSheet
        state={filters}
        onChange={onFilterChange}
        onReset={onResetFilters}
        bounds={bounds}
        activeCount={activeFilterCount}
      />
    </div>
  )
}

export const LeaderboardTable = memo(LeaderboardTableInner)
