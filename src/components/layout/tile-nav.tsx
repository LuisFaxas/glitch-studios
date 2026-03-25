"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Music,
  Wrench,
  Image,
  User,
  FileText,
  Mail,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { Tile } from "@/components/tiles/tile"
import { LogoTile } from "@/components/tiles/logo-tile"
import { WidgetNowPlaying } from "@/components/tiles/widget-now-playing"
import { WidgetStudioStatus } from "@/components/tiles/widget-studio-status"
import { WidgetSocial } from "@/components/tiles/widget-social"
import { signOut, useSession } from "@/lib/auth-client"
import type { ReactNode } from "react"

interface TileNavProps {
  /** Server-rendered WidgetLatestPost slot (async server component) */
  latestPostSlot?: ReactNode
}

const navItems = [
  { label: "Beats", href: "/beats", icon: Music, size: "medium" as const },
  { label: "Services", href: "/services", icon: Wrench, size: "medium" as const },
  { label: "Portfolio", href: "/portfolio", icon: Image, size: "wide" as const },
  { label: "Artists", href: "/artists", icon: User, size: "small" as const },
  { label: "Blog", href: "/blog", icon: FileText, size: "small" as const },
  { label: "Contact", href: "/contact", icon: Mail, size: "wide" as const },
] as const

export function TileNav({ latestPostSlot }: TileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isCompact, setIsCompact] = useState(false)

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#000000] p-3 overflow-y-auto h-screen sticky top-0 sidebar-scroll transition-[width,min-width] duration-200 ${
        isCompact
          ? "w-16 min-w-16"
          : "w-[280px] min-w-[280px]"
      }`}
    >
      {/* Compact mode toggle */}
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={() => setIsCompact((prev) => !prev)}
          aria-label={isCompact ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] rounded-none outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2 hover:bg-[#1a1a1a] hover:border-[#444444] transition-colors duration-200"
        >
          {isCompact ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Logo tile */}
      <LogoTile compact={isCompact} />

      {/* Navigation tiles */}
      <nav aria-label="Main navigation" className="mt-1">
        <div className={isCompact ? "flex flex-col gap-1" : "grid grid-cols-2 gap-1"}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Tile
                key={item.href}
                size={isCompact ? "small" : item.size}
                label={item.label}
                icon={<item.icon className="h-5 w-5" />}
                isActive={isActive}
                href={item.href}
                layout="horizontal"
                compact={isCompact}
              />
            )
          })}
        </div>
      </nav>

      {/* Separator */}
      <div className="border-t border-[#222222] my-4" />

      {/* Widgets section — hidden in compact mode */}
      {!isCompact && (
        <div className="grid grid-cols-2 gap-1">
          <WidgetNowPlaying />
          <WidgetStudioStatus />
          {latestPostSlot}
          <WidgetSocial />
        </div>
      )}

      {/* Auth section */}
      <div className="mt-4">
        {session?.user ? (
          <Tile
            size="wide"
            label="Sign Out"
            icon={<LogOut className="h-5 w-5" />}
            onClick={async () => {
              await signOut()
              router.push("/")
              router.refresh()
            }}
            layout="horizontal"
            compact={isCompact}
          />
        ) : (
          <Tile
            size="wide"
            label="Sign In"
            icon={<LogIn className="h-5 w-5" />}
            href="/login"
            layout="horizontal"
            compact={isCompact}
          />
        )}
      </div>

      {/* Scroll hint gradient — only when expanded */}
      {!isCompact && (
        <div className="pointer-events-none sticky bottom-0 h-8 bg-gradient-to-t from-black to-transparent" />
      )}
    </aside>
  )
}
