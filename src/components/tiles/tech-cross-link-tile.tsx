"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

// Renders inside the Studios (public) layout as a jump to the Tech sister
// site. On the live studios host (glitchstudios.io) the href needs to be
// the absolute Tech URL so the click actually crosses domains. Locally
// and in Vercel previews the same deployment serves both brands, so a
// relative "/tech" works there.
export function TechCrossLinkTile() {
  const [href, setHref] = useState("/tech")

  useEffect(() => {
    const h = window.location.hostname.toLowerCase()
    if (h === "glitchstudios.io" || h === "www.glitchstudios.io") {
      setHref("https://glitchtech.io/")
    } else {
      setHref("/tech")
    }
  }, [])

  // Cross-link tile is by definition "not where you are" — never show
  // active state.
  const isActive = false

  return (
    <Link
      href={href}
      aria-label="Glitch Tech — sister site"
      className={`group relative col-span-2 flex items-center justify-center overflow-hidden border px-4 py-5 font-mono font-bold uppercase tracking-[0.05em] outline-none transition-colors duration-200 focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2 ${
        isActive
          ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#000000] shadow-[0_0_20px_rgba(255,255,255,0.12)]"
          : "border-[#222222] bg-[#111111] text-[#f5f5f0] hover:border-[#444444] hover:bg-[#1a1a1a] active:bg-[#0a0a0a]"
      }`}
    >
      <span
        className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:animate-glitch-hover group-hover:opacity-100 motion-reduce:hidden"
        aria-hidden="true"
      />
      <span className="relative z-10 text-xl">GLITCH TECH</span>
    </Link>
  )
}
