import Image from "next/image"
import Link from "next/link"
import type { PublicReviewDetail, BreadcrumbNode } from "@/lib/tech/queries"

interface ReviewHeroProps {
  review: PublicReviewDetail
  breadcrumbs: BreadcrumbNode[]
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function ReviewHero({ review, breadcrumbs }: ReviewHeroProps) {
  return (
    <section className="pt-16 md:pt-24">
      <nav aria-label="Breadcrumb" className="mx-auto mb-6 max-w-7xl px-4 md:px-6">
        <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[#555]">
          <li>
            <Link href="/tech/reviews" className="hover:text-[#f5f5f0]">Reviews</Link>
          </li>
          {breadcrumbs.map((node, idx) => (
            <li key={node.id} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {idx === breadcrumbs.length - 1 ? (
                <span aria-current="page" className="text-[#888]">{node.name}</span>
              ) : (
                <Link href={`/tech/categories/${node.slug}`} className="hover:text-[#f5f5f0]">{node.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative aspect-video w-full overflow-hidden border border-[#222] bg-[#0a0a0a]">
          <Image
            src={review.heroImage.url}
            alt={review.heroImage.alt ?? review.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
              <h1 className="font-mono text-3xl font-bold uppercase leading-tight tracking-tight text-[#f5f5f0] md:text-5xl lg:text-6xl">
                {review.title}
              </h1>
              <div className="flex-shrink-0">
                <div className="inline-flex items-baseline gap-2 border-2 border-[#f5f5f0] bg-black/80 px-4 py-2">
                  <span className="font-mono text-3xl font-bold text-[#f5f5f0] md:text-4xl">
                    {review.overallRating.toFixed(1)}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#888]">/ 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-7xl px-4 md:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#888]">
          Reviewed by <span className="text-[#f5f5f0]">{review.reviewerName}</span>
          {" · "}
          {formatDate(review.publishedAt)}
        </p>
      </div>
    </section>
  )
}
