"use client"

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import styles from "@/components/tiles/logo-tile.module.css"

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

  return (
    <section className="relative h-[90vh] overflow-hidden">
      {/* Use absolute positioning to center content on the full viewport,
          not just the content area. The collapsed sidebar (64px) offsets
          the content area, but the hero should match the splash logo position. */}
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

      {/* Content overlay — centered on full viewport via fixed positioning
           so it aligns exactly with the splash logo regardless of sidebar width */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-8 px-4 text-center pointer-events-none"
        style={{ height: "90vh" }}
      >
        {/* Real logo image — same max-w as splash (600px) for seamless handoff */}
        <div className="w-[80vw] max-w-[600px] pointer-events-auto">
          <div className={styles.glitchWrapper}>
            <div className={styles.glitchImg} />
            <div className={styles.glitchLayer1} aria-hidden="true" />
            <div className={styles.glitchLayer2} aria-hidden="true" />
          </div>
        </div>

        <p className="font-mono text-2xl md:text-4xl text-[#f5f5f0] tracking-tight pointer-events-auto">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
          <Link
            href={ctaLink}
            className="w-full sm:w-auto bg-[#f5f5f0] text-[#000] border border-[#f5f5f0] px-8 py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-sm hover:bg-[#000] hover:text-[#f5f5f0] hover:border-[#f5f5f0] transition-colors duration-200 text-center"
          >
            {ctaText}
          </Link>
          <Link
            href="/beats"
            className="w-full sm:w-auto bg-transparent text-[#f5f5f0] border border-[#444] px-8 py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors duration-200 text-center"
          >
            Browse Beats
          </Link>
          <Link
            href="/portfolio"
            className="w-full sm:w-auto bg-transparent text-[#f5f5f0] border border-[#444] px-8 py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors duration-200 text-center"
          >
            View Portfolio
          </Link>
        </div>

        <p className="font-mono text-xs text-[#555] uppercase tracking-[0.1em] pointer-events-auto">
          Music &amp; Video Production Studio
        </p>
      </motion.div>

      {/* Animated scroll indicator — also viewport-centered */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10"
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
