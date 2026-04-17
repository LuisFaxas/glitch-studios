"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ReviewCard } from "@/components/tech/review-card"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { PublicReviewCard } from "@/lib/tech/queries"

interface RelatedReviewsCarouselProps {
  reviews: PublicReviewCard[]
}

export function RelatedReviewsCarousel({ reviews }: RelatedReviewsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true })
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (reviews.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-3xl">
          <GlitchHeading text="Related Reviews">Related Reviews</GlitchHeading>
        </h2>
        {reviews.length > 1 && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous related review"
              className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next related review"
              className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <div className="select-none overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} className="w-[80vw] flex-shrink-0 md:w-[360px]" />
          ))}
        </div>
      </div>
    </section>
  )
}
