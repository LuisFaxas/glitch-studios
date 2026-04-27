// src/components/tech/methodology-discipline-cards.tsx
// Phase 29.2-03 — Replaces MethodologyDisciplineTable on /tech/about.
// 13-card grid (1 col mobile / 2 col sm / 3 col lg).
// BPR-eligible disciplines (7) carry "BPR ELIGIBLE" badge.
// Hover: border #444, bg #1a1a1a, animated underline on discipline name.
// Discipline name wraps GlitchHeading for hover-only RGB split.
// No auto-running animations.
import { GlitchHeading } from "@/components/ui/glitch-heading"

interface DisciplineCardProps {
  slug: string
  name: string
  description: string
  bprEligible: boolean
}

interface MethodologyDisciplineCardsProps {
  disciplines: DisciplineCardProps[]
}

export function MethodologyDisciplineCards({
  disciplines,
}: MethodologyDisciplineCardsProps) {
  return (
    <section id="disciplines" className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="font-mono text-[28px] font-bold uppercase text-[#f5f5f0]">
        Disciplines
      </h2>
      <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#888]">
        GlitchTech scores 13 disciplines per device. Seven are BPR-eligible —
        workloads where battery mode materially changes performance. The remaining
        six are measured AC-only and feed GlitchMark, not BPR.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {disciplines.map((d) => (
          <div
            key={d.slug}
            className="group relative border border-[#222] bg-[#111] p-4 transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
          >
            {d.bprEligible && (
              <span className="absolute right-3 top-3 bg-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#000]">
                BPR ELIGIBLE
              </span>
            )}
            <p className="relative inline-block pr-4 font-mono text-[15px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] after:block after:h-px after:origin-left after:scale-x-0 after:bg-[#f5f5f0] after:transition-transform after:duration-200 group-hover:after:scale-x-100">
              <GlitchHeading text={d.name}>{d.name}</GlitchHeading>
            </p>
            <p className="mt-2 font-sans text-[13px] leading-relaxed text-[#888]">
              {d.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
