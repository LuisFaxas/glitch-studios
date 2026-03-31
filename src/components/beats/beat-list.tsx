"use client"

import { useState } from "react"
import { BeatRow } from "@/components/beats/beat-row"
import type { BeatSummary } from "@/types/beats"

interface BeatListProps {
  beats: BeatSummary[]
  hasActiveFilters: boolean
}

export function BeatList({ beats }: BeatListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (beats.length === 0) return null

  return (
    <div className="flex flex-col" data-testid="beat-list">
      {/* Column headers - desktop only */}
      <div
        className="hidden items-center gap-3 border-b border-[#222] px-3 py-2 md:flex md:gap-4 md:px-4"
        data-testid="list-headers"
      >
        <div className="h-14 w-14 shrink-0" /> {/* Spacer for cover art column */}
        <span className="flex-1 font-mono text-[11px] uppercase text-[#555]">Title</span>
        <div className="hidden w-[120px] shrink-0 lg:block">
          <span className="font-mono text-[11px] uppercase text-[#555]">Waveform</span>
        </div>
        <span className="hidden w-16 shrink-0 font-mono text-[11px] uppercase text-[#555] md:block">BPM</span>
        <span className="hidden w-12 shrink-0 font-mono text-[11px] uppercase text-[#555] md:block">Key</span>
        <span className="w-16 shrink-0 font-mono text-[11px] uppercase text-[#555]">Price</span>
        <div className="h-9 w-9 shrink-0" /> {/* Spacer for play button column */}
      </div>

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
