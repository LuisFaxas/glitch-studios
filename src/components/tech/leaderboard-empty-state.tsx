"use client"
import Link from "next/link"

interface EmptyStateProps {
  mode: "no-results-filtered" | "no-reviews-yet"
  onResetFilters?: () => void
}

/**
 * Phase 29 RANK-06: empty state for leaderboard.
 * - "no-results-filtered": filters returned 0 — show Reset filters button.
 * - "no-reviews-yet": category has no published or placeholder reviews — methodology CTA.
 */
export function LeaderboardEmptyState({ mode, onResetFilters }: EmptyStateProps) {
  return (
    <div className="border border-[#222] bg-[#0a0a0a] p-12 text-center">
      {mode === "no-results-filtered" ? (
        <>
          <h2 className="mb-3 font-mono text-lg uppercase tracking-wider text-[#f5f5f0]">
            No reviews match these filters
          </h2>
          <p className="mb-6 text-sm text-[#888]">
            Try widening the filter ranges or reset to see every laptop in this category.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center border border-[#f5f5f0] bg-transparent px-5 py-2 text-xs font-mono uppercase tracking-wider text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#0a0a0a]"
          >
            Reset filters
          </button>
        </>
      ) : (
        <>
          <h2 className="mb-3 font-mono text-lg uppercase tracking-wider text-[#f5f5f0]">
            No reviews ranked yet
          </h2>
          <p className="mb-6 text-sm text-[#888]">
            We&apos;re still benchmarking this category. Read how we score in the meantime.
          </p>
          <Link
            href="/tech/methodology"
            className="inline-flex items-center border border-[#f5f5f0] bg-transparent px-5 py-2 text-xs font-mono uppercase tracking-wider text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#0a0a0a]"
          >
            Read the methodology
          </Link>
        </>
      )}
    </div>
  )
}
