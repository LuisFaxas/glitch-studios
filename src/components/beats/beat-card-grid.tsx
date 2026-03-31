import { BeatCard } from "@/components/beats/beat-card"
import type { BeatSummary } from "@/types/beats"

export function BeatCardGrid({ beats }: { beats: BeatSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3" data-testid="beat-card-grid">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  )
}
