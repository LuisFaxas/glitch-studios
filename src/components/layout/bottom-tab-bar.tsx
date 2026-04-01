"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music, Wrench, Film, BookOpen, LayoutGrid } from "lucide-react"
import clsx from "clsx"
import { MobileNavOverlay } from "@/components/layout/mobile-nav-overlay"
import { CartIcon } from "@/components/cart/cart-icon"

const tabItems = [
  { label: "Beats", href: "/beats", icon: Music },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Portfolio", href: "/portfolio", icon: Film },
  { label: "Blog", href: "/blog", icon: BookOpen },
] as const

export function BottomTabBar() {
  const pathname = usePathname()
  const [overlayOpen, setOverlayOpen] = useState(false)
  const isHome = pathname === "/"

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[var(--tab-bar-height)] items-stretch bg-[#000000] border-t border-[#222222] pb-[env(safe-area-inset-bottom)] md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Nav tabs: Beats, Services, Portfolio, Blog */}
        {tabItems.map((item) => {
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

        {/* Menu trigger (position 5) */}
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
            isHome
              ? "bg-[#f5f5f0] text-[#000000]"
              : "bg-[#111111] text-[#f5f5f0] active:bg-[#0a0a0a]",
          )}
        >
          <LayoutGrid className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Cart icon (position 6, rightmost) */}
        <div className="flex flex-1 items-center justify-center bg-[#111111] text-[#f5f5f0] min-h-[48px]">
          <CartIcon />
        </div>
      </nav>

      {/* Mobile nav overlay */}
      <MobileNavOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      />
    </>
  )
}
