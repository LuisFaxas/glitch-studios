"use client"

import { useMemo, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react"
import Link from "next/link"
import { ScrollArrow } from "@/components/home/scroll-arrow"
import clsx from "clsx"
import styles from "@/components/tiles/logo-tile.module.css"
import { useSidebar } from "@/components/layout/sidebar-context"

const Dither = dynamic(() => import("@/components/ui/dither"), { ssr: false })

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  backgroundMediaUrl?: string
}

export function HeroSection({
  title,
  subtitle = "Music Production // Video // Creative Services",
  ctaText = "Book a Session",
  ctaLink = "/services",
  backgroundMediaUrl,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const indicatorOpacity = useTransform(scrollY, [0, 200], [1, 0])
  const { collapsed } = useSidebar()

  // Random color on each mount — picks from a curated set of moody/cyberpunk hues
  const randomColor = useMemo(() => {
    const palette: [number, number, number][] = [
      [0.4, 0.1, 0.6],   // deep purple
      [0.1, 0.3, 0.6],   // ocean blue
      [0.6, 0.1, 0.2],   // crimson
      [0.1, 0.5, 0.4],   // teal
      [0.5, 0.3, 0.1],   // amber
      [0.2, 0.1, 0.5],   // indigo
      [0.6, 0.05, 0.4],  // magenta
      [0.1, 0.4, 0.2],   // forest
      [0.5, 0.1, 0.5],   // violet
      [0.1, 0.2, 0.5],   // navy
    ]
    return palette[Math.floor(Math.random() * palette.length)]
  }, [])

  // Track when WebGL canvas has rendered its first frame
  const [canvasReady, setCanvasReady] = useState(false)
  const handleDitherReady = useCallback(() => setCanvasReady(true), [])

  return (
    <section className="relative h-[100svh] md:h-[90vh] overflow-hidden bg-[#000000]">
      {/* Dithered wave background — fades in once WebGL renders first frame */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: canvasReady ? 1 : 0 }}
      >
        <Dither
          waveSpeed={0.03}
          waveFrequency={3}
          waveAmplitude={0.3}
          waveColor={randomColor}
          colorNum={4}
          pixelSize={3}
          disableAnimation={shouldReduceMotion ?? false}
          enableMouseInteraction={true}
          mouseRadius={1}
          onReady={handleDitherReady}
        />
      </div>

      {/* Scrim for text readability over the dither — pointer-events-none so mouse reaches the canvas */}
      <div className="absolute inset-0 bg-[#000000]/40 pointer-events-none" />

      {/* Subtitle + Logo — centered vertically in the upper portion of hero.
           Uses top-[40%] instead of top-1/2 to sit slightly above true center,
           giving more breathing room for the CTAs below. */}
      <div
        className={clsx(
          "absolute inset-x-0 top-[38%] -translate-y-1/2 z-10 flex flex-col items-center justify-center pointer-events-none",
          collapsed ? "md:-translate-x-8" : ""
        )}
      >
        <p className="font-mono text-sm md:text-4xl text-[#f5f5f0] tracking-tight mb-6 md:mb-8 px-4 text-center">
          {subtitle}
        </p>
        <div className="w-[60vw] max-w-[280px] md:w-[80vw] md:max-w-[600px]">
          <div className={styles.glitchWrapper}>
            <div className={styles.glitchImg} />
            <div className={styles.glitchLayer1} aria-hidden="true" />
            <div className={styles.glitchLayer2} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* CTAs — anchored to bottom, well-spaced from logo above.
           2-column grid on mobile: primary CTA full-width, secondary pair side by side. */}
      <div
        className={clsx(
          "absolute z-10 inset-x-0 bottom-28 md:bottom-32 flex flex-col items-center gap-4 px-6 text-center pointer-events-none",
          collapsed ? "md:-translate-x-8" : ""
        )}
      >
        <div className="grid grid-cols-2 md:flex gap-2 md:gap-4 w-full max-w-[320px] md:max-w-none md:w-auto pointer-events-auto">
          <Link
            href={ctaLink}
            className="col-span-2 bg-[#f5f5f0] text-[#000] border border-[#f5f5f0] px-5 py-3 md:px-8 md:py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-xs md:text-sm hover:bg-[#000] hover:text-[#f5f5f0] hover:border-[#f5f5f0] transition-colors duration-200 text-center"
          >
            {ctaText}
          </Link>
          <Link
            href="/beats"
            className="bg-transparent text-[#f5f5f0] border border-[#444] px-4 py-2.5 md:px-8 md:py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-[10px] md:text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors duration-200 text-center"
          >
            Beats
          </Link>
          <Link
            href="/portfolio"
            className="bg-transparent text-[#f5f5f0] border border-[#444] px-4 py-2.5 md:px-8 md:py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-[10px] md:text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors duration-200 text-center"
          >
            Portfolio
          </Link>
        </div>

        <p className="font-mono text-[10px] md:text-xs text-[#555] uppercase tracking-[0.1em]">
          Music &amp; Video Production Studio
        </p>

        {/* Scroll indicator — big, glitchy, unmissable */}
        <motion.div
          className="mt-6 md:mt-8"
          style={{ opacity: indicatorOpacity }}
        >
          <ScrollArrow />
        </motion.div>
      </div>

      {/* Bottom lip — gradient fade + thin border creates a visual edge
           that hints at content below the hero */}
      <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
        <div className="h-24 md:h-32 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
        <div className="h-[1px] bg-[#222222]" />
      </div>
    </section>
  )
}
