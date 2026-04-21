export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { portfolioItems } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { PortfolioHeroBanner } from "@/components/portfolio/portfolio-hero-banner"
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Video production, music videos, and creative work from Glitch Studios.",
}

export default async function PortfolioPage() {
  const [items, featuredRows] = await Promise.all([
    db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.isActive, true))
      .orderBy(asc(portfolioItems.sortOrder)),
    db
      .select()
      .from(portfolioItems)
      .where(
        and(
          eq(portfolioItems.isActive, true),
          eq(portfolioItems.isFeatured, true)
        )
      )
      .limit(1),
  ])

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-mono font-bold text-4xl uppercase mb-4 text-[#f5f5f0]">
          Portfolio coming soon
        </h1>
        <p className="text-[#888888] text-lg">
          We are curating our best work. Check back shortly.
        </p>
      </div>
    )
  }

  const featured = featuredRows[0] ?? null

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]">
        <GlitchHeading text="PORTFOLIO">PORTFOLIO</GlitchHeading>
      </h1>
      {featured && (
        <div className="mt-8">
          <PortfolioHeroBanner item={featured} />
        </div>
      )}
      <PortfolioGrid items={items} />
    </div>
  )
}
