"use client"

import Link from "next/link"

export function LogoTile() {
  return (
    <Link
      href="/"
      className="group w-full flex items-center justify-center py-6 rounded-none bg-transparent mb-1"
      aria-label="Glitch Studios — Home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-transparent.png"
        alt="GLITCH"
        className="w-full px-2 object-contain select-none drop-shadow-[0_0_12px_rgba(255,255,255,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-[filter] duration-300"
        draggable={false}
      />
    </Link>
  )
}
