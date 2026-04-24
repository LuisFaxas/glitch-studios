import Link from "next/link"

import type { BprTier } from "@/lib/tech/bpr"
import { GlitchHeading } from "@/components/ui/glitch-heading"

const TIER_CHIP: Record<
  BprTier,
  { bg: string; border: string; text: string }
> = {
  platinum: {
    bg: "bg-[#f5f5f0]",
    border: "border border-[#f5f5f0]",
    text: "text-[#000]",
  },
  gold: {
    bg: "bg-[#888]",
    border: "border border-[#888]",
    text: "text-[#000]",
  },
  silver: {
    bg: "bg-transparent",
    border: "border border-[#555]",
    text: "text-[#f5f5f0]",
  },
  bronze: {
    bg: "bg-transparent",
    border: "border border-dashed border-[#444]",
    text: "text-[#888]",
  },
}

const TIER_LABEL: Record<BprTier, string> = {
  platinum: "PLATINUM",
  gold: "GOLD",
  silver: "SILVER",
  bronze: "BRONZE",
}

interface MethodologyMedalTableProps {
  thresholds: Array<{
    tier: BprTier
    minScore: number
    maxScore: number | null
    description: string
  }>
}

export function MethodologyMedalTable({
  thresholds,
}: MethodologyMedalTableProps) {
  return (
    <section id="thresholds" className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="font-mono text-[28px] font-bold uppercase text-[#f5f5f0]">
        <GlitchHeading text="Medal Thresholds">Medal Thresholds</GlitchHeading>
      </h2>
      <table className="mt-6 w-full border-collapse border border-[#222]">
        <thead>
          <tr>
            <th className="border-b border-[#222] px-4 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">
              Medal
            </th>
            <th className="border-b border-[#222] px-4 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">
              Score
            </th>
            <th className="border-b border-[#222] px-4 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">
              What it means
            </th>
          </tr>
        </thead>
        <tbody>
          {thresholds.map((t) => {
            const chip = TIER_CHIP[t.tier]
            const scoreText =
              t.maxScore === null
                ? `${t.minScore}% and up`
                : `${t.minScore}%–${t.maxScore}%`
            return (
              <tr key={t.tier} className="border-b border-[#222]">
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex items-center px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] ${chip.bg} ${chip.border} ${chip.text}`}
                  >
                    {TIER_LABEL[t.tier]}
                  </span>
                </td>
                <td className="px-4 py-3 align-top font-mono text-[13px] text-[#f5f5f0]">
                  {scoreText}
                </td>
                <td className="px-4 py-3 align-top font-sans text-[13px] text-[#f5f5f0]">
                  {t.description}
                </td>
              </tr>
            )
          })}
          <tr className="border-b border-[#222]">
            <td className="px-4 py-3 align-top">
              <span className="inline-flex items-center border border-dashed border-[#333] px-3 py-1 font-mono text-[11px] font-bold uppercase text-[#888]">
                No medal
              </span>
            </td>
            <td className="px-4 py-3 align-top font-mono text-[13px] text-[#f5f5f0]">
              Below 60% or &lt; 5 of 7
            </td>
            <td className="px-4 py-3 align-top font-sans text-[13px] text-[#f5f5f0]">
              <Link
                href="#exclusion-policy"
                className="text-[#f5f5f0] underline"
              >
                See exclusion policy →
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  )
}
