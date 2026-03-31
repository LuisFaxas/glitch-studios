"use client"

import { Tile } from "@/components/tiles/tile"
import {
  InstagramIcon,
  YouTubeIcon,
  SoundCloudIcon,
  XIcon,
} from "@/components/icons/social-icons"

const socialLinks = [
  {
    label: "Instagram",
    icon: InstagramIcon,
    href: "https://instagram.com/glitchstudios",
  },
  {
    label: "YouTube",
    icon: YouTubeIcon,
    href: "https://youtube.com/@glitchstudios",
  },
  {
    label: "SoundCloud",
    icon: SoundCloudIcon,
    href: "https://soundcloud.com/glitchstudios",
  },
  {
    label: "X",
    icon: XIcon,
    href: "https://x.com/glitchstudios",
  },
] as const

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
