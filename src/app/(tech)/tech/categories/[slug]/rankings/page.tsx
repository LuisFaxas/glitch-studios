// Phase 29.1 — replaces the original Phase 29 implementation with a permanent
// redirect. New canonical URL is /tech/rankings/[slug] (D-04/D-06).
import { permanentRedirect } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LegacyRankingsRedirect({ params }: PageProps) {
  const { slug } = await params
  permanentRedirect(`/tech/rankings/${slug}`)
}
