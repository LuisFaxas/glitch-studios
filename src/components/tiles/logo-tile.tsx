"use client"

import Link from "next/link"

export function LogoTile() {
  return (
    <Link
      href="/"
      className="w-full flex items-center justify-center py-7 px-4 border border-[#333333] rounded-none bg-[#0a0a0a] shadow-[0_0_30px_rgba(255,250,240,0.3),0_0_60px_rgba(255,250,240,0.1)] mb-1 transition-colors duration-200 hover:border-[#555555]"
      aria-label="Glitch Studios — Home"
    >
      <span
        className="font-mono font-bold text-[36px] uppercase tracking-[0.1em] text-[#f5f5f0] leading-none select-none"
        style={{ textShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)" }}
      >
        GLITCH
      </span>
    </Link>
  )
}
