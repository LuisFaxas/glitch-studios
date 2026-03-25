"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Music } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"

export function FeaturedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // Phase 2: Replace placeholder cards with real beat data
  const placeholderBeats = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    title: `Beat ${i + 1}`,
  }))

  return (
    <ScrollSection className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-[#f5f5f0]">
              Featured Beats
            </h2>
            <p className="text-[#888888] font-sans text-sm mt-1">Coming soon in the beat store</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous beat"
              className="w-10 h-10 flex items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] rounded-none hover:border-[#444444] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next beat"
              className="w-10 h-10 flex items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] rounded-none hover:border-[#444444] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {placeholderBeats.map((beat) => (
              <div
                key={beat.id}
                className="flex-shrink-0 w-[280px] bg-[#111111] border border-[#222222] rounded-none p-4 flex flex-col items-center justify-center gap-4 min-h-[200px]"
              >
                <Music className="size-10 text-[#333333]" />
                <p className="font-mono font-bold text-[#f5f5f0] text-sm">
                  {beat.title}
                </p>
                <p className="text-[#888888] text-sm">Coming Soon</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
