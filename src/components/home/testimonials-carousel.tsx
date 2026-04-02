"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"

type Testimonial = {
  id: string
  clientName: string
  clientTitle: string | null
  quote: string
  avatarUrl: string | null
  rating: number | null
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, containScroll: false }, [
    Autoplay({ delay: 3000, stopOnInteraction: true }),
  ])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (testimonials.length === 0) {
    return null
  }

  return (
    <ScrollSection className="py-16 md:py-24 border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-start justify-between gap-4 mb-8">
          <h2 className="font-mono font-bold uppercase text-2xl md:text-4xl tracking-tight text-[#f5f5f0]">
            What They Say
          </h2>
          <div className="flex gap-2 shrink-0 mt-1">
            <button
              onClick={scrollPrev}
              aria-label="Previous testimonial"
              className="w-10 h-10 flex items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] rounded-none hover:border-[#444444] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next testimonial"
              className="w-10 h-10 flex items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] rounded-none hover:border-[#444444] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden select-none" ref={emblaRef}>
          <div className="flex gap-[2px]">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-[85vw] md:w-[400px] bg-[#111111] border border-[#222222] rounded-none p-8 relative"
              >
                {/* Decorative quotation mark */}
                <span className="absolute top-4 left-4 text-6xl text-[#222222] font-serif leading-none select-none" aria-hidden="true">
                  &ldquo;
                </span>

                <div className="relative z-10 flex flex-col gap-4 pt-8">
                  {/* Star rating */}
                  {testimonial.rating && testimonial.rating > 0 && (
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < testimonial.rating!
                              ? "fill-white text-white"
                              : "text-[#333333]"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Quote */}
                  <p className="text-[#f5f5f0] italic leading-relaxed">
                    {testimonial.quote}
                  </p>

                  {/* Client info */}
                  <div className="flex items-center gap-3 mt-2">
                    {testimonial.avatarUrl && (
                      <img
                        src={testimonial.avatarUrl}
                        alt={testimonial.clientName}
                        className="size-10 rounded-none object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-[#f5f5f0] text-sm">
                        {testimonial.clientName}
                      </p>
                      {testimonial.clientTitle && (
                        <p className="text-[#888888] text-sm">
                          {testimonial.clientTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
