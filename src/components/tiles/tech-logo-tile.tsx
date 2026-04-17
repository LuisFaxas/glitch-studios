"use client"

import Link from "next/link"
import { GlitchLogo } from "@/components/layout/glitch-logo"

export function TechLogoTile() {
  return (
    <Link
      href="/tech"
      aria-label="Glitch Tech — Home"
      className="group mb-2 flex w-full items-center justify-center rounded-none bg-transparent px-3 py-4 transition-opacity duration-200 hover:opacity-90"
    >
      <GlitchLogo text="GLITCH TECH" size="md" animate={false} />
    </Link>
  )
}
