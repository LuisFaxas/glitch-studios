"use client"

import Link from "next/link"

export function LogoTile() {
  return (
    <Link
      href="/"
      className="group w-full flex items-center justify-center py-8 px-4 rounded-none bg-[#0a0a0a] border border-[#222222] mb-1 transition-all duration-300"
      aria-label="Glitch Studios — Home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-white.png"
        alt="GLITCH"
        className="h-16 w-auto object-contain select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-[filter] duration-300"
        draggable={false}
      />
    </Link>
  )
}
