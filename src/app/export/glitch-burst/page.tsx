// 500ms RGB-split flicker on the GlitchTech wordmark — transition stinger.
// Driven by the brand-engine asset registry (see brand-engine/assets/glitch-burst.mjs).
import type { Metadata } from "next"
import { ExportGlitchBurstClient } from "./client"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Export — Glitch Burst",
}

export default async function ExportGlitchBurstPage({
  searchParams,
}: {
  searchParams: Promise<{ size?: string }>
}) {
  const { size = "600" } = await searchParams
  const logoSize = Number.parseInt(size, 10) || 600
  return <ExportGlitchBurstClient logoSize={logoSize} />
}
