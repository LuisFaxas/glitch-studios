"use client"

import { NuqsAdapter } from "nuqs/adapters/next/app"
import { BeatSearch } from "@/components/beats/beat-search"
import { BeatFilters } from "@/components/beats/beat-filters"
import { BeatList } from "@/components/beats/beat-list"
import type { BeatSummary } from "@/types/beats"

interface BeatCatalogProps {
  beats: BeatSummary[]
  filterOptions: { genres: string[]; keys: string[]; moods: string[] }
  hasActiveFilters: boolean
}

export function BeatCatalog({
  beats,
  filterOptions,
  hasActiveFilters,
}: BeatCatalogProps) {
  return (
    <NuqsAdapter>
      <div className="flex flex-col gap-4">
        <BeatSearch />
        <BeatFilters options={filterOptions} />
      </div>
      <div className="mt-8">
        <BeatList beats={beats} hasActiveFilters={hasActiveFilters} />
      </div>
    </NuqsAdapter>
  )
}
