import "server-only"
import { cache } from "react"
import { and, or, eq, desc, asc } from "drizzle-orm"
import { db } from "@/lib/db"
import { portfolioItems } from "@/db/schema"

export const getPortfolioForService = cache(
  async (service: { slug: string; type: string }) => {
    return await db
      .select()
      .from(portfolioItems)
      .where(
        and(
          eq(portfolioItems.isActive, true),
          or(
            eq(portfolioItems.type, service.type),
            eq(portfolioItems.category, service.slug)
          )
        )
      )
      .orderBy(desc(portfolioItems.isFeatured), asc(portfolioItems.sortOrder))
      .limit(3)
  }
)
