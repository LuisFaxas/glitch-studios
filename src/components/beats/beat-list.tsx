"use client"

import { useState } from "react"
import { BeatRow } from "@/components/beats/beat-row"
import type { BeatSummary } from "@/types/beats"

interface BeatListProps {
  beats: BeatSummary[]
  hasActiveFilters: boolean
}

export function BeatList({ beats, hasActiveFilters }: BeatListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (beats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <h2 className="mb-2 font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          {hasActiveFilters
            ? "No matches for those filters"
            : "Catalog coming soon"}
        </h2>
        <p className="max-w-md font-sans text-[15px] text-[#888]">
          {hasActiveFilters
            ? "Try adjusting your filters or clearing them to see all available beats."
            : "New beats are on the way. Check back soon for fresh releases."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {beats.map((beat) => (
        <BeatRow
          key={beat.id}
          beat={beat}
          isExpanded={expandedId === beat.id}
          onToggleExpand={() =>
            setExpandedId(expandedId === beat.id ? null : beat.id)
          }
        />
      ))}
    </div>
  )
}
