export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { portfolioItems } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { CaseStudyContent } from "@/components/portfolio/case-study-content"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [item] = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.slug, slug))
    .limit(1)

  if (!item) {
    return { title: "Not Found" }
  }

  return {
    title: item.title,
    description: item.description || `${item.title} - Glitch Studios portfolio`,
  }
}

export async function generateStaticParams() {
  try {
    const items = await db
      .select({ slug: portfolioItems.slug })
      .from(portfolioItems)
      .where(eq(portfolioItems.isActive, true))

    return items.map((item) => ({ slug: item.slug }))
  } catch {
    // Database not available at build time -- use dynamic rendering
    return []
  }
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params
  const [item] = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.slug, slug))
    .limit(1)

  if (!item) {
    notFound()
  }

  return <CaseStudyContent item={item} />
}
