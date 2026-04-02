"use client"

import { useMemo, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
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

      {/* All hero content in a single centered flex column */}
      <div
        className={clsx(
          "absolute inset-0 z-10 flex flex-col items-center justify-center pb-20 md:pb-0 px-6 pointer-events-none",
          collapsed ? "md:-translate-x-8" : ""
        )}
      >
        {/* Subtitle */}
        <p className="font-mono text-[11px] md:text-4xl text-[#f5f5f0]/70 tracking-[0.15em] md:tracking-tight uppercase md:normal-case mb-3 md:mb-8 text-center">
          {subtitle}
        </p>

        {/* Logo */}
        <div className="w-[70vw] max-w-[300px] md:w-[80vw] md:max-w-[600px] mb-8 md:mb-12">
          <div className={styles.glitchWrapper}>
            <div className={styles.glitchImg} />
            <div className={styles.glitchLayer1} aria-hidden="true" />
            <div className={styles.glitchLayer2} aria-hidden="true" />
          </div>
        </div>

        {/* CTAs — 2-column grid on mobile, row on desktop */}
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

        {/* Studio tagline */}
        <p className="font-mono text-[9px] md:text-xs text-[#555] uppercase tracking-[0.15em] mt-4 md:mt-6">
          Music &amp; Video Production Studio
        </p>
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        className={clsx(
          "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
          collapsed ? "md:ml-[-32px]" : ""
        )}
        style={{ opacity: indicatorOpacity }}
        animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <ChevronDown className="size-8 text-[#555]" />
      </motion.div>
    </section>
  )
}
