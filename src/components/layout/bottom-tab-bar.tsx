"use client"

import { memo, useCallback, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, type LucideIcon } from "lucide-react"
import clsx from "clsx"
import {
  MobileNavOverlay,
  defaultStudiosOverlayNavItems,
  defaultStudiosOverlaySocialLinks,
} from "@/components/layout/mobile-nav-overlay"
import type { NavItem, SocialLink } from "@/components/layout/nav-config-types"
import { isTechPathActive } from "@/lib/tech/nav"

// Per-tile subcomponent owns its own pathname subscription. Parent BottomTabBar
// stops re-rendering on every route change (which previously cascaded the entire
// tab bar + the always-mounted MobileNavOverlay outer JSX). See
// debug/rankings-categories-filter-crash.
interface TabBarLinkProps {
  href: string
  label: string
  Icon: LucideIcon
}

const TabBarLink = memo(function TabBarLink({ href, label, Icon }: TabBarLinkProps) {
  const pathname = usePathname()
  const isActive = isTechPathActive(href, pathname)
  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={label}
      data-active={isActive ? "true" : "false"}
      className={clsx(
        "flex flex-1 flex-col items-center justify-center gap-0.5",
        "border-r border-[#222222]",
        "rounded-none transition-colors duration-200",
        "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-[-2px]",
        "min-h-[48px]",
        isActive
          ? "bg-[#f5f5f0] text-[#000000]"
          : "bg-[#111111] text-[#f5f5f0] active:bg-[#0a0a0a]",
      )}
      {...(isActive ? { "aria-current": "page" as const } : {})}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="font-mono text-[9px] uppercase tracking-wider">{label}</span>
    </Link>
  )
})

interface BottomTabBarProps {
  items: readonly NavItem[]
  menuLabel?: string
  overlayNavItems?: readonly { label: string; href: string; icon: LucideIcon }[]
  overlaySocialLinks?: readonly SocialLink[]
  /** Phase 09 D-03: when false, "/book" hrefs are rewritten to "/services". */
  bookingLive?: boolean
}

export function BottomTabBar({
  items,
  menuLabel = "Menu",
  overlayNavItems,
  overlaySocialLinks,
  bookingLive = true,
}: BottomTabBarProps) {
  // NOTE: BottomTabBar intentionally does NOT call usePathname here. Per-tab
  // active-state is handled inside TabBarLink so route changes do not
  // re-render the entire tab bar + MobileNavOverlay shell. See
  // debug/rankings-categories-filter-crash.
  const [overlayOpen, setOverlayOpen] = useState(false)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const setOverlayOpenAfterInput = useCallback((next: boolean) => {
    window.setTimeout(() => {
      setOverlayOpen(next)
    }, 0)
  }, [])
  // Stable close callback for <RouteChangeCloser>'s memo equality. Without this,
  // a parent re-render (TechLayout still uses usePathname) would create a new
  // closure each time and bust the memo. Per Codex post-fix Round 2 review.
  const closeOverlay = useCallback(() => {
    setOverlayOpenAfterInput(false)
  }, [setOverlayOpenAfterInput])
  const openOverlay = useCallback(() => {
    setOverlayOpenAfterInput(true)
  }, [setOverlayOpenAfterInput])

  // router.prefetch effect removed — `useRouter()` returns a new object every
  // render, so listing it in deps caused the prefetch loop to re-fire every
  // time pathname changed (which Next.js considers a render trigger even on
  // shallow URL state changes from nuqs). Each filter chip click triggered
  // a fresh round of prefetch fetches for every nav item. <Link> components
  // already auto-prefetch on viewport intersection — the explicit useEffect
  // was redundant and load-bearing for the chip-click crash.

  return (
    <>
      <nav
        data-tab-bar=""
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[var(--tab-bar-height)] items-stretch bg-[#000000] border-t border-[#222222] pb-[env(safe-area-inset-bottom)] md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Nav tabs — each tab owns its own pathname subscription. */}
        {items.map((item) => (
          <TabBarLink
            key={item.href}
            href={
              !bookingLive && item.href === "/book" ? "/services" : item.href
            }
            label={item.label}
            Icon={item.icon}
          />
        ))}

        {/* Menu trigger (rightmost) */}
        <button
          ref={menuTriggerRef}
          type="button"
          data-mobile-menu-trigger
          onClick={openOverlay}
          aria-label="Open navigation menu"
          aria-expanded={overlayOpen}
          aria-controls="mobile-navigation-dialog"
          className={clsx(
            "flex flex-1 flex-col items-center justify-center gap-0.5",
            "rounded-none transition-colors duration-200",
            "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-[-2px]",
            "min-h-[48px]",
            overlayOpen
              ? "bg-[#f5f5f0] text-[#000000]"
              : "bg-[#111111] text-[#f5f5f0] active:bg-[#0a0a0a]",
          )}
        >
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
          <span className="font-mono text-[9px] uppercase tracking-wider">{menuLabel}</span>
        </button>
      </nav>

      {/* Mobile nav overlay */}
      <MobileNavOverlay
        isOpen={overlayOpen}
        onClose={closeOverlay}
        triggerRef={menuTriggerRef}
        navItems={overlayNavItems ?? defaultStudiosOverlayNavItems}
        socialLinks={overlaySocialLinks ?? defaultStudiosOverlaySocialLinks}
      />
    </>
  )
}
