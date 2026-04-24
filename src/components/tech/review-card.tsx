import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import type { PublicReviewCard } from "@/lib/tech/queries"
import { BPRMedal } from "./bpr-medal"

interface ReviewCardProps {
  review: PublicReviewCard
  className?: string
  /** When true (default), renders the glitch hover overlay. Set false for reduced-motion contexts. */
  glitchHover?: boolean
}

export function ReviewCard({ review, className, glitchHover = true }: ReviewCardProps) {
  return (
    <Link
      href={`/tech/reviews/${review.slug}`}
      className={[
        "group relative flex flex-col overflow-hidden border border-[#222] bg-[#111] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {glitchHover && (
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/10 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
          aria-hidden="true"
        />
      )}
      <div className="relative aspect-video bg-[#0a0a0a]">
        <Image
          src={review.heroImageUrl}
          alt={review.heroImageAlt ?? review.title}
          fill
          sizes="(max-width: 768px) 80vw, 360px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-mono text-base font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
          {review.title}
        </h3>
        {review.bprScore !== null && review.bprTier !== null ? (
          <div className="flex items-center gap-2">
            <BPRMedal
              tier={review.bprTier}
              score={review.bprScore}
              disciplineCount={review.bprDisciplineCount}
              variant="compact"
              showTooltip={false}
              asLink={false}
            />
            {review.categoryName && (
              <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#888]">
                {review.categoryName}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#f5f5f0] text-[#f5f5f0]" aria-hidden="true" />
            <span className="font-mono text-xs text-[#888]">
              {review.overallRating.toFixed(1)} / 10
            </span>
            {review.categoryName && (
              <>
                <span className="mx-1 font-mono text-[10px] text-[#444]">·</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#888]">
                  {review.categoryName}
                </span>
              </>
            )}
          </div>
        )}
        <p className="line-clamp-2 font-sans text-[13px] leading-relaxed text-[#888]">
          {review.excerpt}
        </p>
        <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#f5f5f0] underline-offset-2 group-hover:underline">
          Read review →
        </span>
      </div>
    </Link>
  )
}
