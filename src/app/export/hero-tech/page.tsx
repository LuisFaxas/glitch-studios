// Bare render of the GlitchTech wordmark + dual heartbeat ECG pulse lines on
// a transparent body. Driven by the brand-engine asset registry — see
// brand-engine/assets/hero-tech.mjs and brand-engine/README.md.
//
// Not linked from anywhere; noindex keeps crawlers out if accidentally deployed.
import type { Metadata } from "next"
import { ExportHeroTechClient } from "./client"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Export — Hero Tech Loop",
}

export default async function ExportHeroTechPage({
  searchParams,
}: {
  searchParams: Promise<{ size?: string; bg?: string }>
}) {
  const { size = "600", bg = "transparent" } = await searchParams
  const logoSize = Number.parseInt(size, 10) || 600
  return <ExportHeroTechClient logoSize={logoSize} bg={bg} />
}
