// BPR Medal score reveal — parameterized callout for video overlays.
// Driven by the brand-engine asset registry (see brand-engine/assets/bpr-medal.mjs).
import type { Metadata } from "next"
import type { BprTier } from "@/lib/tech/bpr"
import { ExportBprMedalClient } from "./client"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Export — BPR Medal",
}

const VALID_TIERS = new Set<BprTier>(["platinum", "gold", "silver", "bronze"])

function parseTier(raw: string | undefined): BprTier {
  const v = (raw ?? "platinum").toLowerCase() as BprTier
  return VALID_TIERS.has(v) ? v : "platinum"
}

export default async function ExportBprMedalPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; score?: string; disciplineCount?: string }>
}) {
  const sp = await searchParams
  const tier = parseTier(sp.tier)
  const score = Math.max(1, Math.min(100, Number.parseFloat(sp.score ?? "87") || 87))
  const disciplineCount = Math.max(1, Math.min(7, Number.parseInt(sp.disciplineCount ?? "7", 10) || 7))
  return <ExportBprMedalClient tier={tier} score={score} disciplineCount={disciplineCount} />
}
