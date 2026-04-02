"use client"

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import clsx from "clsx"
import styles from "@/components/tiles/logo-tile.module.css"
import { useSidebar } from "@/components/layout/sidebar-context"

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

  return (
    <section className="relative h-[70vh] md:h-[90vh] overflow-hidden">
      {/* Video background placeholder with scanline texture */}
      <div
        className="absolute inset-0 bg-[#0a0a0a]"
        data-video-placeholder="true"
        style={{
          backgroundImage: backgroundMediaUrl
            ? `url(${backgroundMediaUrl})`
            : "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
          backgroundSize: backgroundMediaUrl ? "cover" : undefined,
          backgroundPosition: backgroundMediaUrl ? "center" : undefined,
        }}
      />

      {/* Light bottom-only scrim for future video readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#000000]/30" />

      {/* Subtitle + Logo — centered within the hero section (container-relative).
           top-1/2 -translate-y-1/2 centers vertically within the section, not the viewport.
           Sidebar offset gated to md+ only so mobile is unaffected. */}
      <div
        className={clsx(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center",
          collapsed ? "md:-translate-x-8" : ""
        )}
      >
        <p className="font-mono text-sm md:text-4xl text-[#f5f5f0] tracking-tight mb-4 md:mb-8 px-4 text-center">
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

      {/* CTAs — anchored to bottom of hero section with container-relative positioning.
           bottom-16 (mobile) / bottom-24 (desktop) instead of viewport-relative bottom-[12vh]. */}
      <div
        className={clsx(
          "absolute z-10 inset-x-0 bottom-16 md:bottom-24 flex flex-col items-center gap-6 px-4 text-center",
          collapsed ? "md:-translate-x-8" : ""
        )}
      >

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-[280px] sm:max-w-none sm:w-auto">
          <Link
            href={ctaLink}
            className="w-full sm:w-auto bg-[#f5f5f0] text-[#000] border border-[#f5f5f0] px-5 py-2.5 md:px-8 md:py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-xs md:text-sm hover:bg-[#000] hover:text-[#f5f5f0] hover:border-[#f5f5f0] transition-colors duration-200 text-center"
          >
            {ctaText}
          </Link>
          <Link
            href="/beats"
            className="w-full sm:w-auto bg-transparent text-[#f5f5f0] border border-[#444] px-5 py-2.5 md:px-8 md:py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-xs md:text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors duration-200 text-center"
          >
            Browse Beats
          </Link>
          <Link
            href="/portfolio"
            className="w-full sm:w-auto bg-transparent text-[#f5f5f0] border border-[#444] px-5 py-2.5 md:px-8 md:py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-xs md:text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors duration-200 text-center"
          >
            View Portfolio
          </Link>
        </div>

        <p className="font-mono text-[10px] md:text-xs text-[#555] uppercase tracking-[0.1em]">
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
