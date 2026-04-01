import { BeatCard } from "@/components/beats/beat-card"
import type { BeatSummary } from "@/types/beats"

interface BeatCardGridProps {
  beats: BeatSummary[]
  variant?: "compact" | "large"
}

export function BeatCardGrid({ beats, variant = "compact" }: BeatCardGridProps) {
  const gridClass =
    variant === "large"
      ? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
      : "grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"

  return (
    <div className={gridClass} data-testid="beat-card-grid">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} variant={variant} />
      ))}
    </div>
  )
}
