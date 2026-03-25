"use client"

import { Camera, Video, Headphones, AtSign } from "lucide-react"
import { Tile } from "@/components/tiles/tile"

const socialLinks = [
  {
    label: "Instagram",
    icon: Camera,
    href: "https://instagram.com/glitchstudios",
  },
  {
    label: "YouTube",
    icon: Video,
    href: "https://youtube.com/@glitchstudios",
  },
  {
    label: "SoundCloud",
    icon: Headphones,
    href: "https://soundcloud.com/glitchstudios",
  },
  {
    label: "X",
    icon: AtSign,
    href: "https://x.com/glitchstudios",
  },
] as const

/**
 * Social Links widget -- 4 small tiles in a row (D-08).
 * Each tile has an independent glitch-hover animation.
 * Lucide v1.6+ removed brand icons, so we use generic equivalents.
 */
export function WidgetSocial() {
  return (
    <div className="col-span-2 flex gap-1">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="flex-1"
        >
          <Tile
            size="small"
            icon={<link.icon className="h-5 w-5" />}
            className="col-span-1 aspect-square items-center justify-center"
          />
        </a>
      ))}
    </div>
  )
}
