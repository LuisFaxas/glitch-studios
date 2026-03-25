"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { GlitchLogo } from "@/components/layout/glitch-logo"

export function HeroSection() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Video background placeholder with scanline texture */}
      <div
        className="absolute inset-0 bg-[#0a0a0a]"
        data-video-placeholder="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
        }}
      >
        {/* Replace with R2-hosted showreel URL */}
        {/* <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 object-cover w-full h-full"
          src=""
        /> */}
      </div>

      {/* Light bottom-only scrim for future video readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#000000]/30" />

      {/* Content overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 flex flex-col items-center justify-center gap-8 px-4 text-center"
      >
        <GlitchLogo size="lg" />

        <p className="font-mono text-2xl md:text-4xl text-[#f5f5f0] tracking-tight">
          Music. Video. Vision.
        </p>

        <div className="flex gap-4">
          <Link
            href="/services"
            className="bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] px-8 py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-sm hover:bg-[#000000] hover:text-[#f5f5f0] hover:border-[#f5f5f0] transition-colors duration-200"
          >
            Book a Session
          </Link>
          <Link
            href="/beats"
            className="bg-[#111111] text-[#f5f5f0] border border-[#222222] px-8 py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-sm hover:bg-[#1a1a1a] hover:border-[#444444] transition-colors duration-200"
          >
            Browse Beats
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
