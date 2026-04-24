"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutGrid, type LucideIcon } from "lucide-react"
import clsx from "clsx"
import {
  MobileNavOverlay,
  defaultStudiosOverlayNavItems,
  defaultStudiosOverlaySocialLinks,
} from "@/components/layout/mobile-nav-overlay"
import type { NavItem, SocialLink } from "@/components/layout/nav-config-types"

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
  const pathname = usePathname()
  const router = useRouter()
  const [overlayOpen, setOverlayOpen] = useState(false)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  // Phase 23-04 router.prefetch mitigation for audit §A.12 (Beats-icon cold-nav).
  // Full perf fix lives in Phase 25 (Performance Audit + Fixes).
  useEffect(() => {
    for (const item of items) {
      const href = !bookingLive && item.href === "/book" ? "/services" : item.href
      router.prefetch(href)
    }
  }, [items, bookingLive, router])

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[var(--tab-bar-height)] items-stretch bg-[#000000] border-t border-[#222222] pb-[env(safe-area-inset-bottom)] md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Nav tabs with labels */}
        {items.map((item) => {
          const resolvedHref =
            !bookingLive && item.href === "/book" ? "/services" : item.href
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={resolvedHref}
              aria-label={item.label}
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
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-wider">{item.label}</span>
            </Link>
          )
        })}

        {/* Menu trigger (rightmost) */}
        <button
          ref={menuTriggerRef}
          type="button"
          onClick={() => setOverlayOpen(true)}
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
        onClose={() => setOverlayOpen(false)}
        triggerRef={menuTriggerRef}
        navItems={overlayNavItems ?? defaultStudiosOverlayNavItems}
        socialLinks={overlaySocialLinks ?? defaultStudiosOverlaySocialLinks}
      />
    </>
  )
}
