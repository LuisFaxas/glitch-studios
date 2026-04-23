"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  LogIn,
  LogOut,
  ChevronsRight,
  ShoppingCart,
} from "lucide-react"
import { motion } from "motion/react"
import { Tile } from "@/components/tiles/tile"
import { LogoTile } from "@/components/tiles/logo-tile"
import { WidgetNowPlaying } from "@/components/tiles/widget-now-playing"
import { WidgetStudioStatus } from "@/components/tiles/widget-studio-status"
import { WidgetSocial } from "@/components/tiles/widget-social"
import { signOut, useSession } from "@/lib/auth-client"
import type { ReactNode } from "react"
import { useCart } from "@/components/cart/cart-provider"
import { useSidebar } from "@/components/layout/sidebar-context"
import Link from "next/link"
import type { NavItem } from "@/components/layout/nav-config-types"

function getInitials(name: string | null | undefined, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return (email.split("@")[0][0] ?? "U").toUpperCase()
}

interface TileNavProps {
  navItems: readonly NavItem[]
  topLogoTile?: ReactNode
  widgetSlots?: ReactNode
  crossLinkTile?: ReactNode
  /** Legacy slot for Studios-only WidgetLatestPost server component */
  latestPostSlot?: ReactNode
  /** Phase 09 D-03: when false, "/book" hrefs are rewritten to "/services". */
  bookingLive?: boolean
}

function resolveHref(href: string, bookingLive: boolean): string {
  return !bookingLive && href === "/book" ? "/services" : href
}

export function TileNav({
  navItems,
  topLogoTile,
  widgetSlots,
  crossLinkTile,
  latestPostSlot,
  bookingLive = true,
}: TileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { collapsed, setCollapsed } = useSidebar()
  const { itemCount, isMounted, toggleCart } = useCart()
  // D-07 (Phase 16.1): the cart tile is a native <button> (not a div wrapping
  // CartIcon) so the ENTIRE tile bounding box is a click target — previously
  // only the inner icon-button area took clicks.
  const cartAriaLabel =
    isMounted && itemCount > 0
      ? `Shopping cart, ${itemCount} items`
      : "Shopping cart, empty"
  const cartBadge = isMounted && itemCount > 0 && (
    <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center bg-[#333] text-[#f5f5f0] text-[10px] font-mono font-bold">
      {itemCount}
    </span>
  )

  const targetWidth = collapsed ? 64 : 280

  return (
    <motion.aside
      className={`hidden md:flex flex-col shrink-0 bg-[#000000] overflow-y-auto h-screen sticky top-0 sidebar-scroll ${
        collapsed ? "p-2 items-center" : "p-3"
      }`}
      initial={false}
      animate={{ width: targetWidth, minWidth: targetWidth }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ width: targetWidth, minWidth: targetWidth }}
    >
      {collapsed ? (
        /* ---- Collapsed: icon strip ---- */
        <>
          {/* Nav icons */}
          <nav aria-label="Main navigation" className="mt-1 flex flex-col gap-1 w-full">
            {navItems.map((item) => {
              const resolvedHref = resolveHref(item.href, bookingLive)
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={resolvedHref}
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

          {/* D-07/D-08 (Phase 16.1): native <button> — full-tile click target,
              matches sibling nav tile heights, hover-glitch via group pattern. */}
          <button
            type="button"
            onClick={toggleCart}
            aria-label={cartAriaLabel}
            className="group relative mt-2 flex items-center justify-center overflow-hidden p-3 border border-[#222] bg-[#111] hover:bg-[#1a1a1a] text-[#f5f5f0] w-full transition-colors duration-200 cursor-pointer"
          >
            <span
              className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:animate-glitch-hover group-hover:opacity-100 motion-reduce:hidden"
              aria-hidden="true"
            />
            <span className="relative z-10 inline-flex">
              <ShoppingCart className="h-5 w-5" />
              {cartBadge}
            </span>
          </button>

          {/* Auth icon — right under cart */}
          <div className="mt-1 w-full">
            {session?.user ? (
              <Link
                href={
                  session.user.role === "admin" || session.user.role === "owner"
                    ? "/admin"
                    : "/dashboard"
                }
                className="group relative flex items-center justify-center overflow-hidden p-3 border border-[#222] bg-[#111] hover:bg-[#1a1a1a] text-[#f5f5f0] w-full transition-colors duration-200"
                aria-label="My Account"
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:animate-glitch-hover group-hover:opacity-100 motion-reduce:hidden"
                  aria-hidden="true"
                />
                <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#222222] text-[#f5f5f0] font-mono text-[10px] font-bold uppercase shrink-0">
                  {getInitials(session.user.name, session.user.email ?? "")}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group relative flex items-center justify-center overflow-hidden p-3 border border-[#222] bg-[#111] hover:bg-[#1a1a1a] text-[#f5f5f0] w-full transition-colors duration-200"
                aria-label="Sign In"
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:animate-glitch-hover group-hover:opacity-100 motion-reduce:hidden"
                  aria-hidden="true"
                />
                <LogIn className="relative z-10 h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Expand button */}
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mt-2 flex items-center justify-center p-3 border border-[#222] bg-[#111] hover:bg-[#1a1a1a] text-[#f5f5f0] w-full transition-colors duration-200"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>

          {/* Player-bar-height spacer — same pattern as expanded layout. */}
          <div
            aria-hidden
            className="shrink-0"
            style={{ height: "var(--player-bar-height, 0px)" }}
          />
        </>
      ) : (
        /* ---- Expanded: full layout ---- */
        <>
          {/* Logo tile */}
          {topLogoTile ?? <LogoTile />}

          {/* Navigation tiles */}
          <nav aria-label="Main navigation" className="mt-1">
            <div className="grid grid-cols-2 gap-1">
              {navItems.map((item) => {
                const resolvedHref = resolveHref(item.href, bookingLive)
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Tile
                    key={item.href}
                    size={item.desktopSize}
                    label={item.label}
                    icon={<item.icon className="h-9 w-9" />}
                    isActive={isActive}
                    href={resolvedHref}
                    layout="horizontal"
                  />
                )
              })}
            </div>
          </nav>

          {/* D-07/D-08 (Phase 16.1): native <button> — full-tile click target,
              hover-glitch via group pattern. */}
          <button
            type="button"
            onClick={toggleCart}
            aria-label={cartAriaLabel}
            className="group relative mt-2 flex w-full items-center justify-center overflow-hidden border border-[#222222] bg-[#111111] text-[#f5f5f0] hover:bg-[#1a1a1a] py-2 transition-colors duration-200 cursor-pointer"
          >
            <span
              className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:animate-glitch-hover group-hover:opacity-100 motion-reduce:hidden"
              aria-hidden="true"
            />
            <span className="relative z-10 inline-flex p-2">
              <ShoppingCart className="h-6 w-6" />
              {cartBadge}
            </span>
          </button>

          {/* Auth — same width as cart */}
          <div className="mt-1">
            {session?.user ? (
              <div className="flex w-full border border-[#222222] bg-[#111111]">
                <Link
                  href={
                    session.user.role === "admin" || session.user.role === "owner"
                      ? "/admin"
                      : "/dashboard"
                  }
                  className="group relative flex flex-1 items-center gap-2 overflow-hidden py-2 pl-3 hover:bg-[#1a1a1a] transition-colors duration-200"
                >
                  <span
                    className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:animate-glitch-hover group-hover:opacity-100 motion-reduce:hidden"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#222222] text-[#f5f5f0] font-mono text-[10px] font-bold uppercase shrink-0">
                    {getInitials(session.user.name, session.user.email ?? "")}
                  </span>
                  <span className="relative z-10 font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                    My Account
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut()
                    router.push("/")
                    router.refresh()
                  }}
                  className="flex items-center justify-center px-3 py-2 hover:bg-[#1a1a1a] transition-colors duration-200"
                  aria-label="Sign Out"
                >
                  <LogOut className="h-4 w-4 text-[#f5f5f0]" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden border border-[#222222] bg-[#111111] py-2 text-[#f5f5f0] hover:bg-[#1a1a1a] transition-colors duration-200"
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:animate-glitch-hover group-hover:opacity-100 motion-reduce:hidden"
                  aria-hidden="true"
                />
                <LogIn className="relative z-10 h-4 w-4" />
                <span className="relative z-10 font-mono text-[11px] font-bold uppercase tracking-[0.05em]">Sign In</span>
              </Link>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-[#222222] my-4" />

          {/* Widgets section */}
          {widgetSlots ? (
            <div className="grid grid-cols-2 gap-1">{widgetSlots}</div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              <WidgetNowPlaying />
              <WidgetStudioStatus />
              {latestPostSlot}
              <WidgetSocial />
            </div>
          )}

          {/* Cross-link tile — sits between widgets and scroll hint */}
          {crossLinkTile && <div className="mt-2">{crossLinkTile}</div>}

          {/* Spacer equal to the current player-bar height. Extends the
              scrollable content downward so the last tile (cross-link)
              can scroll up past the fixed player bar instead of being
              hidden behind it. No-op when --player-bar-height is 0. */}
          <div
            aria-hidden
            className="shrink-0"
            style={{ height: "var(--player-bar-height, 0px)" }}
          />

          {/* Scroll hint gradient */}
          <div className="pointer-events-none sticky bottom-0 h-8 bg-gradient-to-t from-black to-transparent" />
        </>
      )}
    </motion.aside>
  )
}
