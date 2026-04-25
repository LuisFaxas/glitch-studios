"use client"
import Link from "next/link"
import Image from "next/image"
import { BPRMedal } from "./bpr-medal"
import { BuyButton } from "./buy-button"
import type {
  LeaderboardRow,
  LeaderboardBenchmarkColumn,
} from "@/lib/tech/leaderboard"

interface Props {
  row: LeaderboardRow
  rank: number
  benchmarkColumns: LeaderboardBenchmarkColumn[]
}

/**
 * D-20 mobile card. Top: rank | medal | product name + sub-cat chip.
 * Middle: GlitchMark large + 3 benchmark rows (battery dropped on mobile).
 * Bottom: year · price · Buy button.
 */
export function LeaderboardCard({ row, rank, benchmarkColumns }: Props) {
  const mobileColumns = benchmarkColumns
    .filter((c) => c.rubricKey !== "battery_life:video_loop:hours")
    .slice(0, 3)
  return (
    <Link
      href={`/tech/reviews/${row.reviewSlug}`}
      className="block border border-[#222] bg-[#0a0a0a] p-4 transition-colors hover:border-[#f5f5f0]"
    >
      <div className="flex items-start gap-3">
        <span className="font-mono text-xl text-[#666]">#{rank}</span>
        {row.bprTier && row.bprScore !== null && (
          <BPRMedal
            tier={row.bprTier}
            score={row.bprScore}
            disciplineCount={row.bprDisciplineCount}
            variant="compact"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-mono text-sm uppercase tracking-wide text-[#f5f5f0]">
            {row.productName}
          </h3>
          <p className="mt-1 text-xs text-[#888]">
            {row.manufacturer ?? ""}
            {row.subCategoryName ? ` · ${row.subCategoryName}` : ""}
          </p>
        </div>
        {row.heroImageUrl && (
          <Image
            src={row.heroImageUrl}
            alt={row.heroImageAlt ?? row.productName}
            width={48}
            height={48}
            className="h-12 w-12 flex-none border border-[#222] object-cover"
          />
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-3xl text-[#f5f5f0]">
          {row.glitchmarkScore !== null ? row.glitchmarkScore.toFixed(2) : "—"}
        </span>
        <span className="text-xs text-[#666]">
          GlitchMark
          {row.glitchmarkIsPartial ? " · partial" : ""}
        </span>
      </div>
      <dl className="mt-4 space-y-1 text-xs">
        {mobileColumns.map((col) => {
          const v = row.benchmarkScores[col.rubricKey]
          return (
            <div key={col.rubricKey} className="flex justify-between">
              <dt className="text-[#888]">{col.displayName}</dt>
              <dd className="font-mono text-[#ccc]">
                {v ? v.score.toLocaleString() : "—"}
              </dd>
            </div>
          )
        })}
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-[#222] pt-3">
        <div className="text-xs text-[#888]">
          {row.releaseYear ?? "—"} ·{" "}
          {row.priceUsd ? `$${row.priceUsd.toLocaleString()}` : "—"}
        </div>
        <BuyButton productId={row.productId} />
      </div>
    </Link>
  )
}
