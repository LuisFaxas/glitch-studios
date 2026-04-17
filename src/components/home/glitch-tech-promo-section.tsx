"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"
import { GlitchLogo } from "@/components/layout/glitch-logo"

export function GlitchTechPromoSection() {
  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden border border-[#222222] bg-[#111111] p-8 md:p-16">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col gap-4 text-left">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888888]">
                Introducing
              </span>

              <div>
                <GlitchLogo text="GLITCH TECH" size="lg" animate={false} />
              </div>

              <p className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#f5f5f0]">
                Advanced product reviews &amp; benchmarks
              </p>
              <p className="font-sans text-[15px] leading-relaxed text-[#888888]">
                Discover in-depth tech reviews, benchmarks, and comparisons.
                From gaming rigs to creative workstations.
              </p>

              <Link
                href="/tech"
                className="group mt-2 inline-flex w-fit items-center gap-2 border border-[#f5f5f0] bg-transparent px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors duration-200 hover:bg-[#f5f5f0] hover:text-[#000000]"
                aria-label="Explore Glitch Tech Reviews"
              >
                <span>Explore Tech Reviews</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#222222] bg-[#0a0a0a]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#444444]">
                  Reviews // Benchmarks // Compare
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
