"use client"

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
  { label: "About", href: "/artists", icon: User, size: "small" as const },
  { label: "Blog", href: "/blog", icon: FileText, size: "small" as const },
  { label: "Contact", href: "/contact", icon: Mail, size: "wide" as const },
] as const

export function TileNav({ latestPostSlot }: TileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <aside className="hidden md:flex flex-col w-[280px] min-w-[280px] bg-[#000000] p-6 overflow-y-auto h-screen sticky top-0">
      {/* Logo tile */}
      <LogoTile />

      {/* Navigation tiles */}
      <nav aria-label="Main navigation" className="mt-1">
        <div className="grid grid-cols-2 gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Tile
                key={item.href}
                size={item.size}
                label={item.label}
                icon={<item.icon className="h-5 w-5" />}
                isActive={isActive}
                href={item.href}
              />
            )
          })}
        </div>
      </nav>

      {/* Separator */}
      <div className="border-t border-[#222222] my-4" />

      {/* Widgets section */}
      <div className="grid grid-cols-2 gap-1">
        <WidgetNowPlaying />
        <WidgetStudioStatus />
        {latestPostSlot}
        <WidgetSocial />
      </div>

      {/* Spacer to push auth to bottom */}
      <div className="flex-1" />

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
          />
        ) : (
          <Tile
            size="wide"
            label="Sign In"
            icon={<LogIn className="h-5 w-5" />}
            href="/login"
          />
        )}
      </div>
    </aside>
  )
}
