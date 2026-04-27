// Review rating bar fill — parameterized score callout for video overlays.
// Driven by the brand-engine asset registry (see brand-engine/assets/rating-bar.mjs).
import type { Metadata } from "next"
import { ExportRatingBarClient } from "./client"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Export — Rating Bar",
}

export default async function ExportRatingBarPage({
  searchParams,
}: {
  searchParams: Promise<{ label?: string; value?: string }>
}) {
  const sp = await searchParams
  const label = (sp.label ?? "GAMING").trim() || "GAMING"
  const value = Math.max(1, Math.min(10, Number.parseFloat(sp.value ?? "9") || 9))
  return <ExportRatingBarClient label={label} value={value} />
}
