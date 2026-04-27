import type { Metadata } from "next"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import {
  listPublishedReviews,
  listTopLevelCategoriesWithCounts,
} from "@/lib/tech/queries"
import { ReviewsFilterBar } from "@/components/tech/reviews-filter-bar"
import { ReviewsGrid } from "@/components/tech/reviews-grid"
import { ReviewsLoadMore } from "@/components/tech/reviews-load-more"
import { TechHero } from "@/components/tech/tech-hero"
import { TechNewsletter } from "@/components/home/tech-newsletter"

export const metadata: Metadata = {
  title: "Reviews — Glitch Tech",
  description:
    "In-depth product reviews from Glitch Tech. Computers, audio, peripherals, and more.",
}

export const revalidate = 60

const PAGE_SIZE = 12

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function parseSort(v: unknown): "latest" | "rating" | "name" {
  if (v === "rating") return "rating"
  if (v === "name") return "name"
  return "latest"
}

function decodeCursor(v: unknown): { publishedAt: Date; id: string } | undefined {
  if (typeof v !== "string" || v.length === 0) return undefined
  try {
    const decoded = Buffer.from(v, "base64url").toString("utf-8")
    const parsed = JSON.parse(decoded) as { publishedAt: string; id: string }
    return { publishedAt: new Date(parsed.publishedAt), id: parsed.id }
  } catch {
    return undefined
  }
}

export default async function TechReviewsPage({ searchParams }: Props) {
  const sp = await searchParams
  const category = typeof sp.category === "string" ? sp.category : undefined
  const sort = parseSort(sp.sort)
  const q = typeof sp.q === "string" && sp.q.trim().length > 0 ? sp.q : undefined
  const cursor = decodeCursor(sp.cursor)

  const [categories, { reviews, nextCursor }] = await Promise.all([
    listTopLevelCategoriesWithCounts(),
    listPublishedReviews({
      categorySlug: category,
      sort,
      q,
      cursor,
      limit: PAGE_SIZE,
    }),
  ])

  const hasActiveFilter = Boolean(category || q)

  return (
    <NuqsAdapter>
      <main className="min-h-screen bg-black">
        <TechHero
          eyebrow="ALL REVIEWS"
          title="Reviews"
          subhead="Every laptop, phone, and PC we've tested — honest, data-driven, no sponsored rankings."
          ctaLabel="Browse latest"
          ctaHref="#latest"
          tone="cyan"
        />

        <section className="mx-auto max-w-7xl px-4 md:px-6">
          <ReviewsFilterBar
            categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
          />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <span id="latest" />
          <ReviewsGrid reviews={reviews} hasActiveFilter={hasActiveFilter} />
          {nextCursor && <ReviewsLoadMore cursor={nextCursor} />}
          <span id="reviews-end" />
        </section>

        <TechNewsletter />
      </main>
    </NuqsAdapter>
  )
}
