"use client"

import { Tile } from "@/components/tiles/tile"
import { socialLinks } from "@/components/icons/social-icons"

// D-11/D-12 (Phase 16.1): Tech brand uses the SAME social set as Studios
// (handles are shared — both brands point at the same IG/TikTok/YT/X accounts).
// Both widgets render from the same `socialLinks` config so they cannot drift.
export function WidgetSocialTech() {
  return (
    <div className="col-span-2 flex gap-1">
      {socialLinks.map((link) => {
        const iconEl = <link.Icon className="h-5 w-5" />
        const tile = (
          <Tile
            size="small"
            icon={iconEl}
            className={`col-span-1 aspect-square items-center justify-center ${
              link.href ? "" : "text-[#444444]"
            }`}
          />
        )
        if (link.href) {
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="flex-1"
            >
              {tile}
            </a>
          )
        }
        return (
          <div
            key={link.label}
            aria-label={`${link.label} — coming soon`}
            className="flex-1"
          >
            {tile}
          </div>
        )
      })}
    </div>
  )
}
