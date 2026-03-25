"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Video background placeholder */}
      <div className="absolute inset-0 bg-black" data-video-placeholder="true">
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

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />

      {/* Content overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 flex flex-col items-center justify-center gap-8 px-4 text-center"
      >
        <GlitchLogo size="lg" />

        <p className="font-mono text-2xl md:text-4xl text-white tracking-tight">
          Music. Video. Vision.
        </p>

        <div className="flex gap-4">
          <Button
            className="bg-gray-800 text-white border border-gray-600 px-8 py-3 hover:bg-gray-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200"
            render={<Link href="/services" />}
          >
            Book a Session
          </Button>
          <Button
            className="bg-gray-800 text-white border border-gray-600 px-8 py-3 hover:bg-gray-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200"
            render={<Link href="/beats" />}
          >
            Browse Beats
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
