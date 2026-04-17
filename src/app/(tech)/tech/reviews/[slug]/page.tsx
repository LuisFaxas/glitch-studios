import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"
import {
  getAllPublishedReviewSlugs,
  getPublishedReviewBySlug,
  getRelatedReviews,
  getCategoryBreadcrumb,
  getBenchmarkRunsForProducts,
} from "@/lib/tech/queries"
import { db } from "@/lib/db"
import { techProductSpecs, techSpecFields } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { sanitizeReviewBody } from "@/lib/tech/sanitize"
import { ReviewHero } from "@/components/tech/review-hero"
import { ReviewVerdict } from "@/components/tech/review-verdict"
import { ReviewBody } from "@/components/tech/review-body"
import { ReviewRatingCard } from "@/components/tech/review-rating-card"
import { ReviewProsCons } from "@/components/tech/review-pros-cons"
import { ReviewGallery } from "@/components/tech/review-gallery"
import { ReviewVideoEmbed } from "@/components/tech/review-video-embed"
import { ProductSpecsTable } from "@/components/tech/product-specs-table"
import { ProductBenchmarksTable } from "@/components/tech/product-benchmarks-table"
import { ReviewAudience } from "@/components/tech/review-audience"
import { RelatedReviewsCarousel } from "@/components/tech/related-reviews-carousel"
import { TechNewsletter } from "@/components/home/tech-newsletter"
import type { PublicProductSpec } from "@/lib/tech/queries"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    return await getAllPublishedReviewSlugs()
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const review = await getPublishedReviewBySlug(slug)
  if (!review) return { title: "Review Not Found" }

  const description = review.verdict.slice(0, 160)

  return {
    title: `${review.title} — Glitch Tech`,
    description,
    openGraph: {
      title: review.title,
      description,
      images: [{ url: review.heroImage.url }],
      type: "article",
    },
  }
}

async function getProductSpecs(productId: string): Promise<PublicProductSpec[]> {
  const rows = await db
    .select({
      fieldId: techSpecFields.id,
      fieldName: techSpecFields.name,
      fieldType: techSpecFields.type,
      unit: techSpecFields.unit,
      sortOrder: techSpecFields.sortOrder,
      valueText: techProductSpecs.valueText,
      valueNumber: techProductSpecs.valueNumber,
      valueBoolean: techProductSpecs.valueBoolean,
    })
    .from(techProductSpecs)
    .innerJoin(techSpecFields, eq(techProductSpecs.fieldId, techSpecFields.id))
    .where(eq(techProductSpecs.productId, productId))
    .orderBy(asc(techSpecFields.sortOrder), asc(techSpecFields.name))

  return rows.map((r) => ({
    fieldId: r.fieldId,
    fieldName: r.fieldName,
    fieldType: r.fieldType,
    unit: r.unit,
    sortOrder: r.sortOrder,
    valueText: r.valueText,
    valueNumber: r.valueNumber !== null ? Number(r.valueNumber) : null,
    valueBoolean: r.valueBoolean,
  }))
}

export default async function ReviewDetailPage({ params }: Props) {
  const { slug } = await params
  const review = await getPublishedReviewBySlug(slug)
  if (!review) notFound()

  const [breadcrumbs, related, specs, benchmarks] = await Promise.all([
    getCategoryBreadcrumb(review.product.categoryId),
    getRelatedReviews(review.id, review.product.categoryId, review.product.parentCategoryId),
    getProductSpecs(review.product.id),
    getBenchmarkRunsForProducts([review.product.id]),
  ])

  const cleanBody = sanitizeReviewBody(review.bodyHtml)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: review.product.name,
      image: review.heroImage.url,
      brand: review.product.manufacturer ?? undefined,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.overallRating,
      bestRating: 10,
      worstRating: 1,
    },
    author: { "@type": "Person", name: review.reviewerName },
    datePublished: review.publishedAt.toISOString(),
    reviewBody: review.verdict,
    name: review.title,
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- JSON-serialized structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-black text-[#f5f5f0]">
        <ReviewHero review={review} breadcrumbs={breadcrumbs} />
        <ReviewVerdict text={review.verdict} />
        <ReviewBody sanitizedHtml={cleanBody} />
        <ReviewRatingCard ratings={review.ratings} overall={review.overallRating} />
        <ReviewProsCons pros={review.pros} cons={review.cons} />
        <ReviewGallery images={review.gallery} />
        <ReviewVideoEmbed videoUrl={review.videoUrl} reviewTitle={review.title} />
        <ProductSpecsTable specs={specs} />
        <ProductBenchmarksTable runs={benchmarks} />
        <ReviewAudience audienceFor={review.audienceFor} audienceNotFor={review.audienceNotFor} />
        <RelatedReviewsCarousel reviews={related} />

        <section className="mx-auto max-w-7xl px-4 py-12 text-center md:px-6 md:py-16">
          <Link
            href={`/tech/compare?products=${review.product.slug}`}
            className="group inline-flex items-center gap-3 border border-[#f5f5f0] bg-[#f5f5f0] px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.05em] text-black transition-colors hover:bg-transparent hover:text-[#f5f5f0]"
          >
            <span>Compare to another product</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>

        <TechNewsletter />
      </main>
    </>
  )
}
