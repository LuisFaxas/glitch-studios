export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { portfolioItems } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { PortfolioCarousel } from "@/components/portfolio/portfolio-carousel"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Video production, music videos, and creative work from Glitch Studios.",
}

export default async function PortfolioPage() {
  const items = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.isActive, true))
    .orderBy(asc(portfolioItems.sortOrder))

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-mono font-bold text-4xl uppercase mb-4 text-white">
          Portfolio coming soon
        </h1>
        <p className="text-[#888888] text-lg">
          We are curating our best work. Check back shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight mb-12 text-white">
        Our Work
      </h1>
      <PortfolioCarousel items={items} />
    </div>
  )
}
