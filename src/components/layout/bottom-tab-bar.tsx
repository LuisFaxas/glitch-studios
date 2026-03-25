"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music, Wrench, Image, FileText, LayoutGrid } from "lucide-react"
import clsx from "clsx"
import { MobileNavOverlay } from "@/components/layout/mobile-nav-overlay"

const tabItems = [
  { label: "Beats", href: "/beats", icon: Music },
  { label: "Services", href: "/services", icon: Wrench },
  // Center position is the logo/menu trigger (handled separately)
  { label: "Portfolio", href: "/portfolio", icon: Image },
  { label: "Blog", href: "/blog", icon: FileText },
] as const

export function BottomTabBar() {
  const pathname = usePathname()
  const [overlayOpen, setOverlayOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[var(--tab-bar-height)] items-stretch bg-[#000000] border-t border-[#222222] pb-[env(safe-area-inset-bottom)] md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Left two tabs */}
        {tabItems.slice(0, 2).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={clsx(
                "flex flex-1 items-center justify-center",
                "border-r border-[#222222]",
                "rounded-none transition-colors duration-200",
                "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-[-2px]",
                "min-h-[48px]",
                isActive
                  ? "bg-[#f5f5f0] text-[#000000]"
                  : "bg-[#111111] text-[#f5f5f0] active:bg-[#0a0a0a]",
              )}
            >
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </Link>
          )
        })}

        {/* Center: Logo/Menu trigger */}
        <button
          type="button"
          onClick={() => setOverlayOpen(true)}
          aria-label="Open navigation menu"
          className={clsx(
            "flex flex-1 items-center justify-center",
            "border-r border-[#222222]",
            "rounded-none transition-colors duration-200",
            "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-[-2px]",
            "min-h-[48px]",
            "bg-[#111111] text-[#f5f5f0] active:bg-[#0a0a0a]",
          )}
        >
          <LayoutGrid className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Right two tabs */}
        {tabItems.slice(2).map((item, idx) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={clsx(
                "flex flex-1 items-center justify-center",
                idx < tabItems.slice(2).length - 1 && "border-r border-[#222222]",
                "rounded-none transition-colors duration-200",
                "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-[-2px]",
                "min-h-[48px]",
                isActive
                  ? "bg-[#f5f5f0] text-[#000000]"
                  : "bg-[#111111] text-[#f5f5f0] active:bg-[#0a0a0a]",
              )}
            >
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </Link>
          )
        })}
      </nav>

      {/* Mobile nav overlay */}
      <MobileNavOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      />
    </>
  )
}
