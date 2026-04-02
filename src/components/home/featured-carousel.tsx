"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Music } from "lucide-react"
import Link from "next/link"
import { ScrollSection } from "@/components/home/scroll-section"

type Beat = {
  id: string
  title: string
  slug: string
  bpm: number
  key: string
  genre: string
  coverArtKey: string | null
}

interface FeaturedCarouselProps {
  beats: Beat[]
}

export function FeaturedCarousel({ beats }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", containScroll: false })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-[#f5f5f0]">
            Featured Beats
          </h2>
          {beats.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                aria-label="Previous beat"
                className="w-10 h-10 flex items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] rounded-none hover:border-[#444] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next beat"
                className="w-10 h-10 flex items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] rounded-none hover:border-[#444] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </div>

        {beats.length === 0 ? (
          <div className="bg-[#111] border border-[#222] rounded-none p-8 flex items-center justify-center">
            <p className="font-mono text-[#555] text-sm">No beats available yet</p>
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {beats.map((beat) => (
                <Link
                  key={beat.id}
                  href={"/beats/" + beat.slug}
                  className="flex-shrink-0 w-[42vw] md:w-[220px] bg-[#111] border border-[#222] rounded-none overflow-hidden hover:border-[#444] hover:bg-[#1a1a1a] transition-colors group"
                >
                  <div className="relative aspect-square bg-[#0a0a0a]">
                    {beat.coverArtKey ? (
                      <img
                        src={"/api/media/" + beat.coverArtKey}
                        alt={beat.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="size-10 text-[#333]" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <p className="font-mono font-bold text-[#f5f5f0] text-sm truncate">
                      {beat.title}
                    </p>
                    <span className="text-xs bg-[#1a1a1a] text-[#888] px-2 py-0.5 rounded-none w-fit">
                      {beat.genre}
                    </span>
                    <p className="text-[#555] text-xs font-mono">
                      {beat.bpm} BPM // {beat.key}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollSection>
  )
}
