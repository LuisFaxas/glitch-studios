"use client"

import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link"
import { useCart } from "@/components/cart/cart-provider"
import { toast } from "sonner"
import type { getPublishedBundles } from "@/actions/bundles"

type BundleData = Awaited<ReturnType<typeof getPublishedBundles>>

export function BeatsHeroCarousel({ bundles }: { bundles: BundleData }) {
  const { addItem } = useCart()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  function handleAddBundle(bundle: BundleData[number]) {
    for (const beat of bundle.beats) {
      addItem({
        beatId: beat.id,
        beatTitle: beat.title,
        beatSlug: "",
        coverArtUrl: beat.coverArtUrl,
        licenseTier: "mp3_lease",
        licenseTierDisplay: "MP3 Lease",
        price: 0,
      })
    }
    toast.success(`Added ${bundle.title} (${bundle.beats.length} beats) to cart`)
  }

  function scrollToSlide(index: number) {
    emblaApi?.scrollTo(index)
  }

  const slideCount = 3

  return (
    <div>
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.15em] text-[#555]">
        BEATS
      </span>

      <div className="relative h-[280px] w-full overflow-hidden">
        <div className="h-full" ref={emblaRef}>
          <div className="flex h-full">
            {/* Slide 1 - Bundle Promo */}
            <div
              className="h-full w-full flex-shrink-0"
              style={{
                background: `
                  radial-gradient(ellipse at 70% 50%, rgba(0,255,65,0.08) 0%, transparent 60%),
                  repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,0.03) 3px, rgba(0,255,65,0.03) 4px),
                  repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,255,65,0.02) 8px, rgba(0,255,65,0.02) 9px),
                  linear-gradient(to right, #0a0a0a 0%, #0a0f0a 50%, #0a0a0a 100%)
                `,
              }}
            >
              <div className="flex h-full flex-col items-center justify-center text-center px-6 md:px-10">
                {bundles.length > 0 ? (
                  <>
                    <h2 className="font-mono text-[24px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[28px]">
                      {bundles[0].title}
                    </h2>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="font-sans text-[13px] text-[#555] line-through">
                        ${bundles[0].originalTotal.toFixed(2)}
                      </span>
                      <span className="font-mono text-[18px] font-bold text-[#f5f5f0]">
                        ${bundles[0].discountedTotal.toFixed(2)}
                      </span>
                      <span className="bg-[#333] px-2 py-0.5 font-mono text-[11px] uppercase text-[#f5f5f0]">
                        {bundles[0].discountPercent}% OFF
                      </span>
                    </div>
                    <p className="mt-1 font-sans text-[13px] text-[#888] md:text-[15px]">
                      {bundles[0].beats.length} beats included
                    </p>
                    <button
                      onClick={() => handleAddBundle(bundles[0])}
                      className="mt-4 w-fit border border-[#f5f5f0] px-6 py-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#000]"
                    >
                      Add Bundle to Cart
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="font-mono text-[24px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[28px]">
                      Beat Packs Coming Soon
                    </h2>
                    <p className="mt-2 font-sans text-[13px] text-[#888] md:text-[15px]">
                      Curated bundles at discounted prices.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Slide 2 - Licensing Pitch */}
            <div
              className="h-full w-full flex-shrink-0"
              style={{
                background: `
                  radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.08) 0%, transparent 60%),
                  repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,92,246,0.03) 3px, rgba(139,92,246,0.03) 4px),
                  repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(139,92,246,0.02) 8px, rgba(139,92,246,0.02) 9px),
                  linear-gradient(to right, #0a0a0a 0%, #0d0a14 50%, #0a0a0a 100%)
                `,
              }}
            >
              <div className="flex h-full flex-col items-center justify-center text-center px-6 md:px-10">
                <h2 className="font-mono text-[24px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[28px]">
                  License Beats from $29
                </h2>
                <p className="mt-2 font-sans text-[13px] text-[#888] md:text-[15px]">
                  Instant delivery. Commercial rights. All genres.
                </p>
                <button
                  onClick={() =>
                    document
                      .getElementById("beat-catalog")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="mt-4 w-fit border border-[#f5f5f0] px-6 py-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#000]"
                >
                  Browse Catalog
                </button>
              </div>
            </div>

            {/* Slide 3 - Studio Booking CTA */}
            <div
              className="h-full w-full flex-shrink-0"
              style={{
                background: `
                  radial-gradient(ellipse at 70% 50%, rgba(245,158,11,0.08) 0%, transparent 60%),
                  repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(245,158,11,0.03) 3px, rgba(245,158,11,0.03) 4px),
                  repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(245,158,11,0.02) 8px, rgba(245,158,11,0.02) 9px),
                  linear-gradient(to right, #0a0a0a 0%, #140d0a 50%, #0a0a0a 100%)
                `,
              }}
            >
              <div className="flex h-full flex-col items-center justify-center text-center px-6 md:px-10">
                <h2 className="font-mono text-[24px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[28px]">
                  Book a Session at Glitch
                </h2>
                <p className="mt-2 font-sans text-[13px] text-[#888] md:text-[15px]">
                  Recording. Mixing. Mastering. Video production.
                </p>
                <Link
                  href="/booking"
                  className="mt-4 w-fit border border-[#f5f5f0] px-6 py-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#000]"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === selectedIndex ? "bg-[#f5f5f0]" : "bg-[#444]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
