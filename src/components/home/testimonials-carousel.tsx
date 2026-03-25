"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: true }),
  ])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (testimonials.length === 0) {
    return null
  }

  return (
    <ScrollSection className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-white">
            What They Say
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              aria-label="Next testimonial"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-[350px] md:w-[400px] bg-gray-900 border border-gray-800 rounded-lg p-8 relative"
              >
                {/* Decorative quotation mark */}
                <span className="absolute top-4 left-4 text-6xl text-gray-800 font-serif leading-none select-none" aria-hidden="true">
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
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Quote */}
                  <p className="text-white italic leading-relaxed">
                    {testimonial.quote}
                  </p>

                  {/* Client info */}
                  <div className="flex items-center gap-3 mt-2">
                    {testimonial.avatarUrl && (
                      <img
                        src={testimonial.avatarUrl}
                        alt={testimonial.clientName}
                        className="size-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-white text-sm">
                        {testimonial.clientName}
                      </p>
                      {testimonial.clientTitle && (
                        <p className="text-gray-400 text-sm">
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
