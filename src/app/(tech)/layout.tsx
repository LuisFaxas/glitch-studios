"use client"

import { usePathname } from "next/navigation"
import { TileNav } from "@/components/layout/tile-nav"
import { BottomTabBar } from "@/components/layout/bottom-tab-bar"
import { Footer } from "@/components/layout/footer"
import { MobileContentWrapper } from "@/components/layout/mobile-content-wrapper"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import {
  techNavItems,
  techMobileTabItems,
  techMobileMenuItems,
} from "@/components/layout/tech-nav-config"

export default function TechLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isTechHome = pathname === "/tech"

  return (
    <SidebarProvider defaultCollapsed={isTechHome} isHomepage={isTechHome}>
      <div data-brand="tech" className="flex min-h-screen">
        <TileNav navItems={techNavItems} />
        <MobileContentWrapper>
          {children}
          <Footer />
        </MobileContentWrapper>
        <BottomTabBar items={techMobileTabItems} overlayNavItems={techMobileMenuItems} />
      </div>
    </SidebarProvider>
  )
}
