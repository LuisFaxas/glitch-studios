"use client"

import { useCallback, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Music, Play, Pause, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAudioPlayer } from "@/components/player/audio-player-provider"
import { LicenseModal } from "@/components/beats/license-modal"
import { ScrollSection } from "@/components/home/scroll-section"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { BeatSummary } from "@/types/beats"

interface FeaturedCarouselProps {
  beats: BeatSummary[]
}

export function FeaturedCarousel({ beats }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: false,
  })
  const { currentBeat, isPlaying, play, pause } = useAudioPlayer()
  const [licenseModalBeat, setLicenseModalBeat] = useState<BeatSummary | null>(
    null,
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (beats.length === 0) return null

  function handlePlay(beat: BeatSummary, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!beat.previewAudioUrl) return

    const isCurrentBeat = currentBeat?.id === beat.id
    if (isCurrentBeat && isPlaying) {
      pause()
    } else {
      play({
        id: beat.id,
        slug: beat.slug,
        title: beat.title,
        artist: beat.producers[0]?.name ?? "Glitch Studios",
        previewAudioUrl: beat.previewAudioUrl,
        coverArtUrl: beat.coverArtUrl,
        waveformPeaks: beat.waveformPeaks,
      })
    }
  }

  function getLowestPrice(beat: BeatSummary) {
    const active = beat.pricing.filter((p) => p.isActive)
    if (active.length === 0) return null
    return active.sort((a, b) => Number(a.price) - Number(b.price))[0]
  }

  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-4xl">
              <GlitchHeading text="Featured Beats">Featured Beats</GlitchHeading>
            </h2>
            <p className="mt-1 font-sans text-sm text-[#888]">
              Preview, license, and download — ready for your next project
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/beats"
              className="hidden font-mono text-xs font-bold uppercase tracking-[0.05em] text-[#888] transition-colors hover:text-[#f5f5f0] md:block"
            >
              View All →
            </Link>
            <div className="flex gap-1">
              <button
                onClick={scrollPrev}
                aria-label="Previous beat"
                className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next beat"
                className="flex h-10 w-10 cursor-pointer items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="select-none overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {beats.map((beat) => {
              const isCurrentBeat = currentBeat?.id === beat.id
              const isActivePlaying = isCurrentBeat && isPlaying
              const lowestPrice = getLowestPrice(beat)

              return (
                <div
                  key={beat.id}
                  className="group relative overflow-hidden w-[46vw] flex-shrink-0 border border-[#222] bg-[#111] transition-colors hover:border-[#444] hover:bg-[#1a1a1a] md:w-[240px]"
                >
                  {/* Glitch hover overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/10 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
                    aria-hidden="true"
                  />
                  {/* Cover art with play overlay */}
                  <div className="relative aspect-square bg-[#0a0a0a]">
                    {beat.coverArtUrl ? (
                      <Image
                        src={beat.coverArtUrl}
                        alt={beat.title}
                        fill
                        className="object-cover"
                        sizes="(min-width:768px) 240px, 46vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a]">
                        <Music className="size-12 text-[#333]" />
                      </div>
                    )}

                    {/* Play button overlay */}
                    {beat.previewAudioUrl && (
                      <button
                        type="button"
                        onClick={(e) => handlePlay(beat, e)}
                        aria-label={
                          isActivePlaying
                            ? `Pause ${beat.title}`
                            : `Play ${beat.title}`
                        }
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                      >
                        {isActivePlaying ? (
                          <Pause className="size-12 text-white drop-shadow-lg" />
                        ) : (
                          <Play className="size-12 text-white drop-shadow-lg" />
                        )}
                      </button>
                    )}

                    {/* Now playing indicator */}
                    {isActivePlaying && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/80 px-2 py-1">
                        <div className="flex items-end gap-[2px]">
                          <span className="inline-block h-2 w-[3px] animate-pulse bg-[#f5f5f0]" />
                          <span className="inline-block h-3 w-[3px] animate-pulse bg-[#f5f5f0] [animation-delay:0.15s]" />
                          <span className="inline-block h-1.5 w-[3px] animate-pulse bg-[#f5f5f0] [animation-delay:0.3s]" />
                        </div>
                        <span className="font-mono text-[9px] uppercase text-[#f5f5f0]">
                          Playing
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Beat info */}
                  <div className="p-3">
                    {/* Title — links to beats page */}
                    <Link
                      href="/beats"
                      className="block truncate font-mono text-[13px] font-bold text-[#f5f5f0] hover:underline"
                    >
                      {beat.title}
                    </Link>
                    <span className="block truncate font-sans text-[11px] text-[#888]">
                      {beat.producers[0]?.name ?? "Glitch Studios"}
                    </span>

                    {/* Metadata */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="border border-[#333] bg-[#222] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#aaa]">
                        {beat.genre}
                      </span>
                      <span className="border border-[#333] bg-[#222] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#aaa]">
                        {beat.bpm} BPM
                      </span>
                    </div>

                    {/* Price + License CTA */}
                    {lowestPrice && (
                      <button
                        type="button"
                        onClick={() => setLicenseModalBeat(beat)}
                        className="mt-3 flex w-full cursor-pointer items-center justify-between border border-[#f5f5f0] bg-transparent px-3 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.03em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#000]"
                      >
                        <span>
                          From ${Number(lowestPrice.price).toFixed(0)}
                        </span>
                        <ShoppingCart className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile "View All" link */}
        <div className="mt-6 text-center md:hidden">
          <Link
            href="/beats"
            className="inline-block border border-[#444] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#1a1a1a]"
          >
            Browse All Beats →
          </Link>
        </div>
      </div>

      {/* License modal */}
      {licenseModalBeat && (
        <LicenseModal
          beat={licenseModalBeat}
          isOpen={!!licenseModalBeat}
          onClose={() => setLicenseModalBeat(null)}
        />
      )}
    </ScrollSection>
  )
}
