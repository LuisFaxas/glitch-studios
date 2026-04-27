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
  const initialSortKey: SortKey = spec.mode === "battery" ? "battery" : "ac"
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
        sortKey === "ac"
          ? a.acScore
          : sortKey === "battery"
            ? a.batteryScore
            : a.bprRatio
      const bVal =
        sortKey === "ac"
          ? b.acScore
          : sortKey === "battery"
            ? b.batteryScore
            : b.bprRatio
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
    <div className="mx-auto max-w-5xl overflow-x-auto px-6 pt-12">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#222]">
            <th className="w-12 border-b border-[#222] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#888]">
              #
            </th>
            <th className="w-auto min-w-[180px] border-b border-[#222] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#888]">
              PRODUCT
            </th>
            <th className="w-32 border-b border-[#222] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#888]">
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
              <th className="w-24 border-b border-[#222] px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.1em] text-[#888]">
                VS BASELINE
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <tr
              key={row.reviewId}
              className="border-b border-[#222] transition-colors even:bg-[#0d0d0d] hover:bg-[#1a1a1a]"
            >
              <td className="px-4 py-3 font-mono text-[13px] tabular-nums text-[#888]">
                {i + 1}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/tech/reviews/${row.reviewSlug}`}
                  className="group font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[15px]"
                >
                  <span className="after:block after:h-px after:origin-left after:scale-x-0 after:bg-[#f5f5f0] after:transition-transform after:duration-200 group-hover:after:scale-x-100">
                    <GlitchHeading text={row.productName}>
                      {row.productName}
                    </GlitchHeading>
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3">
                {row.categorySlug && row.categoryName ? (
                  <Link
                    href={`/tech/categories/${row.categorySlug}`}
                    className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#888] transition-colors hover:text-[#f5f5f0]"
                  >
                    {row.categoryName}
                  </Link>
                ) : (
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#444]">
                    —
                  </span>
                )}
              </td>
              {showAc && (
                <td className="w-24 px-4 py-3 text-right font-mono text-[14px] font-bold tabular-nums text-[#f5f5f0] md:text-[16px]">
                  {row.acScore === null ? (
                    <span className="text-[#444]">—</span>
                  ) : (
                    formatScore(row.acScore, spec.unit)
                  )}
                </td>
              )}
              {showBattery && (
                <td className="w-24 px-4 py-3 text-right font-mono text-[14px] font-bold tabular-nums text-[#f5f5f0] md:text-[16px]">
                  {row.batteryScore === null ? (
                    <span className="text-[#444]">—</span>
                  ) : (
                    formatScore(row.batteryScore, spec.unit)
                  )}
                </td>
              )}
              {showBpr && (
                <td
                  className="w-20 px-4 py-3 text-right font-mono text-[14px] font-bold tabular-nums text-[#f5f5f0] md:text-[16px]"
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
                    <span className="border border-[#222] bg-[#1a1a1a] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] text-[#888]">
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
