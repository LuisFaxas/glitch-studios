"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import type { ReactNode } from "react"

export function HomepageSidebarController({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHomepage = pathname === "/"

  return (
    <SidebarProvider defaultCollapsed={isHomepage} isHomepage={isHomepage}>
      {children}
    </SidebarProvider>
  )
}
