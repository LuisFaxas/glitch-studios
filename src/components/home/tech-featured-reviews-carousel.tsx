"use client"

import { useCallback } from "react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"

const FEATURED_REVIEWS = [
  {
    id: 1,
    title: 'MacBook Pro 14" (M4 Max)',
    rating: 4.8,
    excerpt:
      "Best-in-class performance for creative work. Exceptional GPU for rendering.",
    href: "/tech/reviews/macbook-pro-m4",
  },
  {
    id: 2,
    title: "ASUS ROG Zephyrus G14",
    rating: 4.5,
    excerpt:
      "Compact gaming powerhouse with standout GPU performance.",
    href: "/tech/reviews/asus-rog-g14",
  },
  {
    id: 3,
    title: "Framework Laptop 16",
    rating: 4.3,
    excerpt:
      "Modular, repairable, and surprisingly capable for creative work.",
    href: "/tech/reviews/framework-16",
  },
] as const

export function TechFeaturedReviewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [autoplay({ delay: 5000, stopOnInteraction: true })],
  )
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-4xl">
              Featured Reviews
            </h2>
            <p className="mt-1 font-sans text-sm text-[#888]">
              In-depth reviews of the latest tech — refreshed weekly
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={scrollPrev}
              aria-label="Previous review"
              className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next review"
              className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="select-none overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {FEATURED_REVIEWS.map((review) => (
              <Link
                key={review.id}
                href={review.href}
                className="group relative flex w-[80vw] flex-shrink-0 flex-col overflow-hidden border border-[#222] bg-[#111] transition-colors hover:border-[#444] hover:bg-[#1a1a1a] md:w-[360px]"
              >
                <div
                  className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/10 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
                  aria-hidden="true"
                />
                <div className="relative aspect-video bg-[#0a0a0a]">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)",
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#444]">
                      Review
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <h3 className="font-mono text-base font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
                    {review.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-[#f5f5f0] text-[#f5f5f0]" />
                    <span className="font-mono text-xs text-[#888]">
                      {review.rating} / 5
                    </span>
                  </div>
                  <p className="font-sans text-[13px] leading-relaxed text-[#888]">
                    {review.excerpt}
                  </p>
                  <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#f5f5f0] underline-offset-2 group-hover:underline">
                    Read review →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
