"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function StudiosCrossLinkTile() {
  const pathname = usePathname()
  const isActive = pathname === "/" || (!pathname.startsWith("/tech") && !pathname.startsWith("/login"))

  return (
    <Link
      href="/"
      aria-label="Glitch Studios — sister site"
      className={`group relative col-span-2 flex items-center justify-center overflow-hidden border px-4 py-5 font-mono font-bold uppercase tracking-[0.05em] outline-none transition-colors duration-200 focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2 ${
        isActive
          ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#000000] shadow-[0_0_20px_rgba(255,255,255,0.12)]"
          : "border-[#222222] bg-[#111111] text-[#f5f5f0] hover:border-[#444444] hover:bg-[#1a1a1a] active:bg-[#0a0a0a]"
      }`}
    >
      {!isActive && (
        <span
          className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:animate-glitch-hover group-hover:opacity-100 motion-reduce:hidden"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 text-xl">GLITCH STUDIOS</span>
    </Link>
  )
}
