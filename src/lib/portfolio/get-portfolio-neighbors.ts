import "server-only"
import { cache } from "react"
import { db } from "@/lib/db"
import { portfolioItems } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

export type PortfolioNeighbor = {
  slug: string
  title: string
}

export const getActivePortfolioSlugList = cache(
  async (): Promise<PortfolioNeighbor[]> => {
    return db
      .select({
        slug: portfolioItems.slug,
        title: portfolioItems.title,
      })
      .from(portfolioItems)
      .where(eq(portfolioItems.isActive, true))
      .orderBy(asc(portfolioItems.sortOrder))
  }
)

export async function getPortfolioNeighbors(
  currentSlug: string
): Promise<{ prev: PortfolioNeighbor; next: PortfolioNeighbor } | null> {
  const list = await getActivePortfolioSlugList()
  if (list.length < 2) return null

  const idx = list.findIndex((item) => item.slug === currentSlug)
  if (idx === -1) return null

  const prev = list[(idx - 1 + list.length) % list.length]
  const next = list[(idx + 1) % list.length]
  return { prev, next }
}
