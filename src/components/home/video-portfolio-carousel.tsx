"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"

type PortfolioItem = {
  id: string
  title: string
  category: string | null
  description: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  isYouTubeEmbed: boolean | null
}

interface VideoPortfolioCarouselProps {
  portfolioItems: PortfolioItem[]
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export function VideoPortfolioCarousel({ portfolioItems }: VideoPortfolioCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (portfolioItems.length === 0) {
    return (
      <ScrollSection className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-[#f5f5f0] mb-8">
            Our Work
          </h2>
          <div className="bg-[#111111] border border-[#222222] rounded-none p-12 text-center">
            <h3 className="font-mono font-bold text-xl text-[#f5f5f0] mb-2">
              Portfolio coming soon
            </h3>
            <p className="text-[#888888]">
              We are curating our best work. Check back shortly.
            </p>
          </div>
        </div>
      </ScrollSection>
    )
  }

  return (
    <ScrollSection className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-[#f5f5f0]">
            Our Work
          </h2>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous project"
              className="w-10 h-10 flex items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] rounded-none hover:border-[#444444] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next project"
              className="w-10 h-10 flex items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] rounded-none hover:border-[#444444] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {portfolioItems.map((item) => {
              const youtubeId =
                item.isYouTubeEmbed && item.videoUrl
                  ? getYouTubeId(item.videoUrl)
                  : null
              const thumbnailSrc = youtubeId
                ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
                : item.thumbnailUrl

              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-[320px] bg-[#111111] border border-[#222222] rounded-none overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-[#0a0a0a]">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="size-10 text-[#333333]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-bold text-[#f5f5f0] text-sm truncate">
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="text-xs bg-[#1a1a1a] text-[#888888] px-2 py-0.5 rounded-none shrink-0">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[#888888] text-sm line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
