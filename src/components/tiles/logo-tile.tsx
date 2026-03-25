"use client"

import Link from "next/link"

export function LogoTile() {
  return (
    <Link
      href="/"
      className="group w-full flex items-center justify-center py-6 rounded-none bg-[#f5f5f0] mb-1"
      aria-label="Glitch Studios — Home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Untitled-2.png"
        alt="GLITCH"
        className="w-full px-2 object-contain select-none drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,1)] transition-[filter] duration-300"
        draggable={false}
      />
    </Link>
  )
}
