"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
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
          <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-white">
            Featured Beats
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              aria-label="Previous beat"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              aria-label="Next beat"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {placeholderBeats.map((beat) => (
              <div
                key={beat.id}
                className="flex-shrink-0 w-[280px] bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center gap-4 min-h-[200px]"
              >
                <Music className="size-10 text-gray-600" />
                <p className="font-mono font-bold text-white text-sm">
                  {beat.title}
                </p>
                <p className="text-gray-400 text-sm">Coming Soon</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
