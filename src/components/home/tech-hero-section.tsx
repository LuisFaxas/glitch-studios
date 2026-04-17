"use client"

import Link from "next/link"
import { HeroSection } from "@/components/home/hero-section"
import styles from "@/components/tiles/logo-tile.module.css"

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
          </div>
          <span
            className="font-mono text-lg md:text-3xl font-bold uppercase tracking-[0.5em] text-[#f5f5f0]"
            aria-label="Tech"
          >
            TECH
          </span>
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
