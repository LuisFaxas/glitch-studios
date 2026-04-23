"use client"

import Link from "next/link"
import { HeroSection } from "@/components/home/hero-section"
import { TechPulseLine } from "@/components/home/tech-pulse-line"
import styles from "@/components/tiles/logo-tile.module.css"

// D-06 (Phase 16.1): parity with Studios hero — the underlying HeroSection is
// shared, so heartbeat + motion timing + layout rhythm are identical between
// the two brands. Only the wordmark (GlitchTech + TECH beam glitch), subtitle,
// CTAs, and tagline are substituted for tech. Do not fork HeroSection — keep
// the shared component so future motion/layout changes ship to both brands
// simultaneously.
export function TechHeroSection() {
  return (
    <HeroSection
      subtitle="Product Reviews & Benchmarks"
      ctaText="Explore Reviews"
      ctaLink="/tech/reviews"
      tagline="Product Reviews & Benchmarks"
      wordmark={
        <div className="flex w-full flex-col items-center gap-3 md:gap-4">
          <div className={styles.glitchWrapper}>
            <div className={styles.glitchImg} />
            <div className={styles.glitchLayer1} aria-hidden="true" />
            <div className={styles.glitchLayer2} aria-hidden="true" />
            <div className={styles.beamLayer1} aria-hidden="true" />
            <div className={styles.beamLayer2} aria-hidden="true" />
          </div>
          <div className="flex w-full items-center gap-3 md:gap-4">
            <TechPulseLine delay={0} />
            <span
              className={`${styles.glitchTextWrapper} font-mono text-lg md:text-3xl font-bold uppercase tracking-[0.5em] text-[#f5f5f0]`}
              aria-label="Tech"
            >
              TECH
              <span
                className={`${styles.glitchTextLayer} ${styles.glitchTextLayer1}`}
                aria-hidden="true"
              >
                TECH
              </span>
              <span
                className={`${styles.glitchTextLayer} ${styles.glitchTextLayer2}`}
                aria-hidden="true"
              >
                TECH
              </span>
            </span>
            <TechPulseLine delay={1} />
          </div>
        </div>
      }
      secondaryCtas={
        <>
          <Link
            href="/tech/compare"
            className="bg-[#111] text-[#f5f5f0] border border-[#444] px-4 py-3 md:px-6 md:py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-xs md:text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors duration-200 text-center"
          >
            Compare
          </Link>
          <Link
            href="/tech/benchmarks"
            className="bg-[#111] text-[#f5f5f0] border border-[#444] px-4 py-3 md:px-6 md:py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-xs md:text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors duration-200 text-center"
          >
            Benchmarks
          </Link>
        </>
      }
    />
  )
}
