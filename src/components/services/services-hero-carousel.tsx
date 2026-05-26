"use client"

import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link"

type SlideAction =
  | { kind: "scroll"; target: string }
  | { kind: "link"; href: string }

type Slide = {
  eyebrow: string
  headline: string
  sub: string
  cta: string
  action: SlideAction
  bg: { rgb: string; mid: string }
}

const SLIDES: readonly Slide[] = [
  {
    eyebrow: "SERVICES",
    headline: "WE BUILD WHAT YOU HEAR.",
    sub: "Sessions, mixes, masters, video, design — under one roof.",
    cta: "BROWSE SERVICES",
    action: { kind: "scroll", target: "service-grid" },
    bg: { rgb: "0,255,65", mid: "#0a0f0a" },
  },
  {
    eyebrow: "STUDIO",
    headline: "RECORDING FROM $50/HR.",
    sub: "Pro-tooled rooms. Real engineer. No padded-room demo loops.",
    cta: "BOOK A SESSION",
    action: { kind: "link", href: "/book?service=recording-session" },
    bg: { rgb: "139,92,246", mid: "#0d0a14" },
  },
  {
    eyebrow: "POST",
    headline: "MIXING & MASTERING — $75/TRACK.",
    sub: "One-track turnaround. Stems delivered. Industry chain.",
    cta: "START A MIX",
    action: { kind: "link", href: "/book?service=mixing-mastering" },
    bg: { rgb: "245,158,11", mid: "#140d0a" },
  },
  {
    eyebrow: "VISUAL",
    headline: "VIDEO. SFX. GRAPHICS.",
    sub: "Music videos, sound design, cover art — for the artists we record.",
    cta: "BROWSE SERVICES",
    action: { kind: "scroll", target: "service-grid" },
    bg: { rgb: "34,211,238", mid: "#0a1014" },
  },
] as const

export function ServicesHeroCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }),
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

  // Reduced-motion gate (UI-SVC-12 / RESEARCH §Pattern 2): when the user has
  // OS-level reduced-motion enabled, stop autoplay; resume if they toggle it off.
  useEffect(() => {
    if (!emblaApi) return
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")

    function applyMotionPreference() {
      if (!emblaApi) return
      const autoplay = emblaApi.plugins().autoplay
      if (!autoplay) return
      if (mql.matches) {
        autoplay.stop()
      } else {
        autoplay.play()
      }
    }

    applyMotionPreference()
    mql.addEventListener("change", applyMotionPreference)
    return () => {
      mql.removeEventListener("change", applyMotionPreference)
    }
  }, [emblaApi])

  return (
    <section
      aria-label="Service highlights"
      className="relative h-[260px] w-full overflow-hidden md:h-[320px]"
    >
      <div className="h-full select-none" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide, idx) => {
            const { rgb, mid } = slide.bg
            return (
              <div
                key={idx}
                className="h-full w-full flex-shrink-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 70% 50%, rgba(${rgb},0.08) 0%, transparent 60%),
                    repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(${rgb},0.03) 3px, rgba(${rgb},0.03) 4px),
                    repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(${rgb},0.02) 8px, rgba(${rgb},0.02) 9px),
                    linear-gradient(to right, #0a0a0a 0%, ${mid} 50%, #0a0a0a 100%)
                  `,
                }}
              >
                <div className="flex h-full flex-col items-center justify-center text-center px-6 md:px-10">
                  <span className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#555]">
                    {slide.eyebrow}
                  </span>
                  <h2 className="font-mono font-bold uppercase tracking-[0.05em] text-[#f5f5f0] text-[24px] md:text-[32px] leading-[1.15]">
                    {slide.headline}
                  </h2>
                  <p className="mt-2 font-sans text-[#888] text-[13px] md:text-[15px]">
                    {slide.sub}
                  </p>
                  {slide.action.kind === "scroll" ? (
                    (() => {
                      const target = slide.action.target
                      return (
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById(target)
                              ?.scrollIntoView({ behavior: "smooth" })
                          }
                          className="mt-4 w-fit border border-[#f5f5f0] px-5 py-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors duration-150 hover:bg-[#f5f5f0] hover:text-[#000] md:px-6"
                        >
                          {slide.cta}
                        </button>
                      )
                    })()
                  ) : (
                    <Link
                      href={slide.action.href}
                      className="mt-4 w-fit border border-[#f5f5f0] px-5 py-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors duration-150 hover:bg-[#f5f5f0] hover:text-[#000] md:px-6"
                    >
                      {slide.cta}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-colors duration-150 ${
              i === selectedIndex ? "bg-[#f5f5f0]" : "bg-[#444]"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
