"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

const tabs = [
  { label: "Purchases", href: "/dashboard/purchases" },
  { label: "Bookings", href: "/dashboard/bookings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div>
      <nav
        aria-label="Dashboard tabs"
        className="max-w-4xl mx-auto px-4 pt-6"
      >
        <div className="flex gap-6 border-b border-[#222222]">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/")
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "font-mono text-[13px] font-bold uppercase tracking-[0.05em] pb-3 -mb-px transition-colors",
                  isActive
                    ? "text-[#f5f5f0] border-b-2 border-[#f5f5f0]"
                    : "text-[#555555] hover:text-[#888888]"
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
      {children}
    </div>
  )
}
