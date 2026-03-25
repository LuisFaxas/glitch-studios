"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music, Wrench, Play, Users } from "lucide-react"

const navItems = [
  { label: "Beats", href: "/beats", icon: Music },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Portfolio", href: "/portfolio", icon: Play },
  { label: "About", href: "/artists", icon: Users },
] as const

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-800 bg-gray-900 pb-[env(safe-area-inset-bottom)] md:hidden"
      role="tablist"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${
              isActive ? "text-white" : "text-gray-400"
            }`}
          >
            <item.icon className="size-5" />
            <span className="text-xs leading-none">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
