"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { ReviewCard } from "@/components/tech/review-card"
import type { PublicReviewCard } from "@/lib/tech/queries"

interface TechFeaturedReviewsCarouselProps {
  reviews: PublicReviewCard[]
}

export function TechFeaturedReviewsCarousel({ reviews }: TechFeaturedReviewsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: reviews.length > 1, align: "start" },
    reviews.length > 1 ? [autoplay({ delay: 5000, stopOnInteraction: true })] : [],
  )
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-4xl">
              <GlitchHeading text="Featured Reviews">Featured Reviews</GlitchHeading>
            </h2>
            <p className="mt-1 font-sans text-sm text-[#888]">
              In-depth reviews of the latest tech — refreshed weekly
            </p>
          </div>
          {reviews.length > 1 && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous review"
                className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next review"
                className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="border border-[#222] bg-[#111] p-10 text-center">
            <h3 className="font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
              No reviews yet
            </h3>
            <p className="mt-2 font-sans text-[13px] text-[#888]">
              We&apos;re writing the first reviews right now. Check back soon.
            </p>
          </div>
        ) : (
          <div className="select-none overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  className="w-[80vw] flex-shrink-0 md:w-[360px]"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollSection>
  )
}
