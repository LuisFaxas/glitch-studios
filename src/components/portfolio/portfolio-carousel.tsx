"use client"

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { VideoCard } from "@/components/portfolio/video-card"
import type { PortfolioItem } from "@/types"

export function PortfolioCarousel({ items }: { items: PortfolioItem[] }) {
  const [activeFilter, setActiveFilter] = useState("All")

  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
  ] as string[]

  const filteredItems =
    activeFilter === "All"
      ? items
      : items.filter((i) => i.category === activeFilter)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  // Reset carousel when filter changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit()
      setScrollSnaps(emblaApi.scrollSnapList())
    }
  }, [activeFilter, emblaApi])

  return (
    <div className="space-y-6">
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 text-sm font-mono rounded-full border transition-colors ${
              activeFilter === cat
                ? "bg-white text-black border-white"
                : "bg-transparent text-gray-400 border-gray-800 hover:text-white hover:border-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="min-w-[320px] md:min-w-[400px] flex-[0_0_auto]"
              >
                <VideoCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {filteredItems.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700 disabled:opacity-30 rounded-full p-2 transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700 disabled:opacity-30 rounded-full p-2 transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? "bg-white" : "bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
