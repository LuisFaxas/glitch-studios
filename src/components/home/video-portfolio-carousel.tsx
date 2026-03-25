"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
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
          <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-white mb-8">
            Our Work
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <h3 className="font-mono font-bold text-xl text-white mb-2">
              Portfolio coming soon
            </h3>
            <p className="text-gray-400">
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
          <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-white">
            Our Work
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              aria-label="Previous project"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              aria-label="Next project"
            >
              <ChevronRight className="size-5" />
            </Button>
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
                  className="flex-shrink-0 w-[320px] bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-800">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="size-10 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-bold text-white text-sm truncate">
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full shrink-0">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
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
