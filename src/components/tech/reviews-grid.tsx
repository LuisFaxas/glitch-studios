import Link from "next/link"
import { ReviewCard } from "@/components/tech/review-card"
import type { PublicReviewCard } from "@/lib/tech/queries"

interface ReviewsGridProps {
  reviews: PublicReviewCard[]
  hasActiveFilter: boolean
}

export function ReviewsGrid({ reviews, hasActiveFilter }: ReviewsGridProps) {
  if (reviews.length === 0) {
    if (hasActiveFilter) {
      return (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <h2 className="font-mono text-xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            No reviews match your filter
          </h2>
          <p className="font-sans text-[15px] leading-relaxed text-[#888]">
            Try a different category or clear your search.
          </p>
          <Link
            href="/tech/reviews"
            className="mt-2 inline-flex items-center gap-2 border border-[#f5f5f0] bg-transparent px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-black"
          >
            Clear filters
          </Link>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h2 className="font-mono text-xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          No reviews yet
        </h2>
        <p className="max-w-md font-sans text-[15px] leading-relaxed text-[#888]">
          We&apos;re writing the first reviews right now. Check back soon — or subscribe to get notified.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  )
}
