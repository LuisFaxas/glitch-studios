"use client"

import Link from "next/link"
import { HeroSection } from "@/components/home/hero-section"
import { GlitchLogo } from "@/components/layout/glitch-logo"

export function TechHeroSection() {
  return (
    <HeroSection
      subtitle="Product Reviews & Benchmarks"
      ctaText="Explore Reviews"
      ctaLink="/tech/reviews"
      wordmark={<GlitchLogo text="GLITCH TECH" size="lg" animate={true} />}
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
