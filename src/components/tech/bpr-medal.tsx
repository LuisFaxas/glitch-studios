import Link from "next/link"

import type { BprTier } from "@/lib/tech/bpr"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const TIER_CLASSES: Record<
  BprTier,
  { bg: string; border: string; text: string; labelText: string }
> = {
  platinum: {
    bg: "bg-[#f5f5f0]",
    border: "border border-[#f5f5f0]",
    text: "text-[#000]",
    labelText: "text-[#000]",
  },
  gold: {
    bg: "bg-[#888]",
    border: "border border-[#888]",
    text: "text-[#000]",
    labelText: "text-[#000]",
  },
  silver: {
    bg: "bg-transparent",
    border: "border border-[#555]",
    text: "text-[#f5f5f0]",
    labelText: "text-[#888]",
  },
  // Bronze label contrast exception (3.1:1) accepted per UI-SPEC §Accessibility.
  bronze: {
    bg: "bg-transparent",
    border: "border border-dashed border-[#444]",
    text: "text-[#888]",
    labelText: "text-[#555]",
  },
}

const TIER_LABEL: Record<BprTier, string> = {
  platinum: "PLATINUM",
  gold: "GOLD",
  silver: "SILVER",
  bronze: "BRONZE",
}

interface BPRMedalProps {
  tier: BprTier
  score: number
  disciplineCount?: number
  variant?: "compact" | "full"
  showTooltip?: boolean
  asLink?: boolean
}

export function BPRMedal({
  tier,
  score,
  disciplineCount = 7,
  variant = "full",
  showTooltip = true,
  asLink = true,
}: BPRMedalProps) {
  const t = TIER_CLASSES[tier]
  const rounded = Math.round(score)
  const tooltipText =
    disciplineCount === 7
      ? "Based on all 7 eligible disciplines. Click for methodology."
      : `Based on ${disciplineCount} of 7 eligible disciplines. Click for methodology.`
  const ariaLabel = `${TIER_LABEL[tier]} medal: ${rounded} percent. Based on ${disciplineCount} of 7 eligible disciplines. See methodology.`

  const inner =
    variant === "compact" ? (
      <>
        <span
          className={`text-[11px] font-bold uppercase tracking-[0.1em] ${t.labelText}`}
        >
          {TIER_LABEL[tier]}
        </span>
        <span className="text-xs font-bold">
          {rounded}
          <span className="opacity-80">%</span>
        </span>
      </>
    ) : (
      <>
        <span className="text-2xl font-bold">
          {rounded}
          <span className="text-xs opacity-80">%</span>
        </span>
        <span
          className={`mt-2 text-[11px] font-bold uppercase tracking-[0.1em] ${t.labelText}`}
        >
          {TIER_LABEL[tier]}
        </span>
      </>
    )

  const outerClass =
    variant === "compact"
      ? `relative inline-flex h-6 items-center gap-2 px-2 py-1 font-mono ${t.bg} ${t.border} ${t.text}`
      : `relative inline-flex min-w-[120px] flex-col items-center px-4 py-3 font-mono ${t.bg} ${t.border} ${t.text} before:absolute before:inset-[-8px] before:content-['']`

  const wrapped = asLink ? (
    <Link
      href="/tech/methodology#bpr"
      aria-label={ariaLabel}
      className={`${outerClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]`}
    >
      {inner}
    </Link>
  ) : (
    <span aria-label={ariaLabel} className={outerClass}>
      {inner}
    </span>
  )

  if (!showTooltip) {
    return wrapped
  }

  return (
    <Tooltip>
      <TooltipTrigger render={wrapped} />
      <TooltipContent className="border border-[#222] bg-[#111] px-3 py-2 font-sans text-[13px] text-[#f5f5f0]">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
}

interface BPRMedalPlaceholderProps {
  disciplineCount: number
  asLink?: boolean
}

export function BPRMedalPlaceholder({
  disciplineCount,
  asLink = true,
}: BPRMedalPlaceholderProps) {
  const ariaLabel = `Not enough data for a BPR medal. ${disciplineCount} of 7 eligible disciplines scored. See methodology for details.`
  const outerClass =
    "inline-flex min-w-[120px] flex-col items-center border border-dashed border-[#333] bg-transparent px-4 py-3 text-[#888]"

  const inner = (
    <>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]">
        NOT ENOUGH DATA
      </span>
      <span className="font-sans text-[13px] text-[#888]">
        {disciplineCount} of 7 disciplines scored
      </span>
    </>
  )

  if (asLink) {
    return (
      <Link
        href="/tech/methodology#exclusion-policy"
        aria-label={ariaLabel}
        className={`${outerClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]`}
      >
        {inner}
      </Link>
    )
  }

  return (
    <span aria-label={ariaLabel} className={outerClass}>
      {inner}
    </span>
  )
}
