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

      {/* Logo — fixed at exact viewport center, matches splash logo position exactly.
           Uses full viewport height (not 90vh) so vertical center matches the splash overlay. */}
      <div
        className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[80vw] max-w-[600px] pointer-events-auto">
          <div className={styles.glitchWrapper}>
            <div className={styles.glitchImg} />
            <div className={styles.glitchLayer1} aria-hidden="true" />
            <div className={styles.glitchLayer2} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Subtitle + CTAs — positioned below the centered logo */}
      <div
        className="fixed inset-0 z-10 flex flex-col items-center justify-end pointer-events-none px-4 text-center"
        style={{ height: "90vh", paddingBottom: "12vh" }}
      >
        <div className="flex flex-col items-center gap-6 pointer-events-auto">
          <p className="font-mono text-2xl md:text-4xl text-[#f5f5f0] tracking-tight">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
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

          <p className="font-mono text-xs text-[#555] uppercase tracking-[0.1em]">
            Music &amp; Video Production Studio
          </p>
        </div>
      </div>

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
