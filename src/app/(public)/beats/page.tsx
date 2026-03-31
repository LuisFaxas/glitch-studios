export const dynamic = "force-dynamic"

import { getPublishedBeats, getBeatFilterOptions } from "@/actions/beats"
import { getPublishedBundles } from "@/actions/bundles"
import { BeatCatalog } from "@/components/beats/beat-catalog"
import { BundleSection } from "@/components/beats/bundle-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beats",
  description: "Browse and license beats from Glitch Studios.",
}

export default async function BeatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const filters = {
    genre: params.genre || undefined,
    bpmMin: params.bpmMin ? Number(params.bpmMin) : undefined,
    bpmMax: params.bpmMax ? Number(params.bpmMax) : undefined,
    key: params.key || undefined,
    mood: params.mood || undefined,
    search: params.q || undefined,
  }

  const [beats, filterOptions, bundles] = await Promise.all([
    getPublishedBeats(filters),
    getBeatFilterOptions(),
    getPublishedBundles(),
  ])

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-4 font-mono text-[40px] font-bold uppercase leading-[1.1] tracking-[0.05em] text-[#f5f5f0]">
          BEATS
        </h1>
        {bundles.length > 0 && <BundleSection bundles={bundles} />}
        <BeatCatalog
          beats={beats}
          filterOptions={filterOptions}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  )
}
