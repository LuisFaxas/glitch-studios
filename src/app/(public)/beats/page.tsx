export const dynamic = "force-dynamic"

import { getPublishedBeats, getBeatFilterOptions } from "@/actions/beats"
import { getPublishedBundles } from "@/actions/bundles"
import { BeatCatalog } from "@/components/beats/beat-catalog"
import { BeatsHeroCarousel } from "@/components/beats/beats-hero-carousel"
import { getBookingLive } from "@/lib/get-booking-live"
import { getMediaByBeatIds } from "@/lib/media/queries"
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

  const [beats, filterOptions, bundles, bookingLive] = await Promise.all([
    getPublishedBeats(filters),
    getBeatFilterOptions(),
    getPublishedBundles(),
    getBookingLive(),
  ])

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined
  )

  const mediaByBeatId = await getMediaByBeatIds(beats.map((b) => b.id))

  return (
    <div className="flex flex-col gap-6">
      <BeatsHeroCarousel bundles={bundles} bookingLive={bookingLive} />
      <div id="beat-catalog">
        <BeatCatalog
          beats={beats}
          filterOptions={filterOptions}
          hasActiveFilters={hasActiveFilters}
          mediaByBeatId={mediaByBeatId}
        />
      </div>
    </div>
  )
}
