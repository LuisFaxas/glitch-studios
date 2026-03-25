"use client"

import Link from "next/link"

export function LogoTile() {
  return (
    <Link
      href="/"
      className="w-full flex items-center justify-center py-5 px-4 rounded-none bg-[#f5f5f0] mb-1 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(255,250,240,0.5),0_0_80px_rgba(255,250,240,0.2)] shadow-[0_0_30px_rgba(255,250,240,0.35),0_0_60px_rgba(255,250,240,0.12)]"
      aria-label="Glitch Studios — Home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Untitled-2.png"
        alt="GLITCH"
        className="h-12 w-auto object-contain select-none"
        draggable={false}
      />
    </Link>
  )
}
