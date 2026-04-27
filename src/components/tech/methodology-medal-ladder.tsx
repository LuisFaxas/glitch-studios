// src/components/tech/methodology-medal-ladder.tsx
// Phase 29.2-04 — Replaces MethodologyMedalTable on /tech/about.
// Vertical timeline ladder: 4 medal tiers + "No medal" entry.
// Uses TIER_CHIP color system from Phase 17 (copied here — not imported).
// Section id="thresholds" preserved for jump nav anchor.
// No hover animations — static display only.
import type { BprTier } from "@/lib/tech/bpr"

const TIER_CHIP: Record<BprTier, { bg: string; border: string; text: string }> = {
  platinum: { bg: "bg-[#f5f5f0]", border: "border border-[#f5f5f0]", text: "text-[#000]" },
  gold:     { bg: "bg-[#888]",    border: "border border-[#888]",    text: "text-[#000]" },
  silver:   { bg: "bg-transparent", border: "border border-[#555]",  text: "text-[#f5f5f0]" },
  bronze:   { bg: "bg-transparent", border: "border border-dashed border-[#444]", text: "text-[#888]" },
}

const TIER_LABEL: Record<BprTier, string> = {
  platinum: "PLATINUM",
  gold: "GOLD",
  silver: "SILVER",
  bronze: "BRONZE",
}

interface MedalThreshold {
  tier: BprTier
  minScore: number
  maxScore: number | null
  description: string
}

interface MethodologyMedalLadderProps {
  thresholds: MedalThreshold[]
}

export function MethodologyMedalLadder({ thresholds }: MethodologyMedalLadderProps) {
  return (
    <section id="thresholds" className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="font-mono text-[28px] font-bold uppercase text-[#f5f5f0]">
        Medal Thresholds
      </h2>
      <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#888]">
        BPR scores map to four medal tiers. A device earns a medal only when
        five or more of the seven BPR-eligible disciplines are measured.
      </p>

      <div className="relative mt-8 pl-6">
        <div
          className="absolute left-[10px] top-0 bottom-0 w-px border-l-2 border-[#222]"
          aria-hidden="true"
        />

        {thresholds.map((t, i) => {
          const chip = TIER_CHIP[t.tier]
          const scoreText =
            t.maxScore === null
              ? `${t.minScore}–100`
              : `${t.minScore}–${t.maxScore}`

          return (
            <div
              key={t.tier}
              className={`relative flex items-start gap-6 ${i > 0 ? "mt-6" : ""}`}
            >
              <div
                className="absolute -left-[17px] top-[10px] h-3 w-3 rounded-full bg-[#333]"
                aria-hidden="true"
              />

              <div className="w-[100px] shrink-0">
                <span
                  className={`inline-flex items-center px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] ${chip.bg} ${chip.border} ${chip.text}`}
                >
                  {TIER_LABEL[t.tier]}
                </span>
              </div>

              <div className="w-[100px] shrink-0">
                <p className="font-mono text-[20px] font-bold text-[#f5f5f0]">
                  {scoreText}
                </p>
              </div>

              <div className="flex-1">
                <p className="font-sans text-[13px] text-[#888]">{t.description}</p>
              </div>
            </div>
          )
        })}

        <div className="relative mt-6 flex items-start gap-6">
          <div
            className="absolute -left-[17px] top-[10px] h-3 w-3 rounded-full bg-[#222]"
            aria-hidden="true"
          />
          <div className="w-[100px] shrink-0">
            <span className="inline-flex items-center border border-dashed border-[#333] px-3 py-1 font-mono text-[11px] font-bold uppercase text-[#888]">
              No medal
            </span>
          </div>
          <div className="w-[100px] shrink-0">
            <p className="font-mono text-[20px] font-bold text-[#f5f5f0]">&lt; 60</p>
          </div>
          <div className="flex-1">
            <p className="font-sans text-[13px] text-[#888]">
              Below 60% or fewer than 5 of 7 BPR-eligible disciplines measured.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
