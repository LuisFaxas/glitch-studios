"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  Music,
  Wrench,
  Calendar,
  Image,
  User,
  FileText,
  Mail,
  LogIn,
  LogOut,
  ChevronsRight,
  ChevronsLeft,
  ShoppingCart,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Tile } from "@/components/tiles/tile"
import { LogoTile } from "@/components/tiles/logo-tile"
import { WidgetNowPlaying } from "@/components/tiles/widget-now-playing"
import { WidgetStudioStatus } from "@/components/tiles/widget-studio-status"
import { WidgetSocial } from "@/components/tiles/widget-social"
import { signOut, useSession } from "@/lib/auth-client"
import type { ReactNode } from "react"
import { CartIcon } from "@/components/cart/cart-icon"
import { useSidebar } from "@/components/layout/sidebar-context"
import Link from "next/link"

interface TileNavProps {
  /** Server-rendered WidgetLatestPost slot (async server component) */
  latestPostSlot?: ReactNode
}

const navItems = [
  { label: "Beats", href: "/beats", icon: Music, size: "wide" as const },
  { label: "Services", href: "/services", icon: Wrench, size: "wide" as const },
  { label: "Book Session", href: "/book", icon: Calendar, size: "wide" as const },
  { label: "Portfolio", href: "/portfolio", icon: Image, size: "wide" as const },
  { label: "Artists", href: "/artists", icon: User, size: "medium" as const },
  { label: "Blog", href: "/blog", icon: FileText, size: "small" as const },
  { label: "Contact", href: "/contact", icon: Mail, size: "small" as const },
] as const

export function TileNav({ latestPostSlot }: TileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { collapsed, setCollapsed } = useSidebar()

  // Collapsed sidebar: icon strip only
  if (collapsed) {
    return (
      <motion.aside
        className="hidden md:flex flex-col bg-[#000000] p-2 overflow-y-auto h-screen sticky top-0 sidebar-scroll items-center"
        animate={{ width: 64, minWidth: 64 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Nav icons */}
        <nav aria-label="Main navigation" className="mt-1 flex flex-col gap-1 w-full">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center p-3 border border-[#222] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f5f5f0] border-[#f5f5f0] text-[#000]"
                    : "bg-[#111] hover:bg-[#1a1a1a] text-[#f5f5f0]"
                }`}
                aria-label={item.label}
                {...(isActive ? { "aria-current": "page" as const } : {})}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            )
          })}
        </nav>

        {/* Cart icon */}
        <div className="mt-2 flex items-center justify-center border border-[#222] bg-[#111] text-[#f5f5f0] p-3 w-full">
          <ShoppingCart className="h-5 w-5" />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auth icon */}
        <div className="mt-2 w-full">
          {session?.user ? (
            <button
              type="button"
              onClick={async () => {
                await signOut()
                router.push("/")
                router.refresh()
              }}
              className="flex items-center justify-center p-3 border border-[#222] bg-[#111] hover:bg-[#1a1a1a] text-[#f5f5f0] w-full transition-colors duration-200"
              aria-label="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center p-3 border border-[#222] bg-[#111] hover:bg-[#1a1a1a] text-[#f5f5f0] w-full transition-colors duration-200"
              aria-label="Sign In"
            >
              <LogIn className="h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Expand button */}
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mt-2 flex items-center justify-center p-3 border border-[#222] bg-[#111] hover:bg-[#1a1a1a] text-[#f5f5f0] w-full transition-colors duration-200"
          aria-label="Expand sidebar"
        >
          <ChevronsRight className="h-5 w-5" />
        </button>
      </motion.aside>
    )
  }

  // Expanded sidebar: full layout
  return (
    <motion.aside
      className="hidden md:flex flex-col bg-[#000000] p-3 overflow-y-auto h-screen sticky top-0 sidebar-scroll"
      animate={{ width: 280, minWidth: 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
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
                icon={<item.icon className="h-9 w-9" />}
                isActive={isActive}
                href={item.href}
                layout="horizontal"
              />
            )
          })}
        </div>
      </nav>

      {/* Cart */}
      <div className="mt-2 flex items-center justify-center border border-[#222222] bg-[#111111] text-[#f5f5f0] py-2">
        <CartIcon />
      </div>

      {/* Separator */}
      <div className="border-t border-[#222222] my-4" />

      {/* Widgets section */}
      <div className="grid grid-cols-2 gap-1">
        <WidgetNowPlaying />
        <WidgetStudioStatus />
        {latestPostSlot}
        <WidgetSocial />
      </div>

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
          />
        ) : (
          <Tile
            size="wide"
            label="Sign In"
            icon={<LogIn className="h-5 w-5" />}
            href="/login"
            layout="horizontal"
          />
        )}
      </div>

      {/* Scroll hint gradient */}
      <div className="pointer-events-none sticky bottom-0 h-8 bg-gradient-to-t from-black to-transparent" />
    </motion.aside>
  )
}
