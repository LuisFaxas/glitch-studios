"use client"

import { Suspense } from "react"
import { TileNav } from "@/components/layout/tile-nav"
import { BottomTabBar } from "@/components/layout/bottom-tab-bar"
import { Footer } from "@/components/layout/footer"
import { MobileContentWrapper } from "@/components/layout/mobile-content-wrapper"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import { DiagInstrumentation } from "@/components/debug/diag-instrumentation"
import {
  techNavItems,
  techMobileTabItems,
  techMobileMenuItems,
} from "@/components/layout/tech-nav-config"
import { TechLogoTile } from "@/components/tiles/tech-logo-tile"
import { StudiosCrossLinkTile } from "@/components/tiles/studios-cross-link-tile"
import { WidgetLatestReview } from "@/components/tiles/widget-latest-review"
import { WidgetFeaturedProduct } from "@/components/tiles/widget-featured-product"
import { WidgetSocialTech } from "@/components/tiles/widget-social-tech"

// TechLayout is intentionally pathname-stable. Route navigation only
// re-renders SidebarProvider (which owns the pathname read), not this
// component or its children. See `.planning/debug/rankings-categories-filter-crash.md`.
export default function TechLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {/* Diagnostic instrumentation — activates only when URL has ?diag=1.
          See .planning/debug/rankings-categories-filter-crash.md */}
      <Suspense fallback={null}>
        <DiagInstrumentation />
      </Suspense>
      <div data-brand="tech" className="flex min-h-screen">
        <TileNav
          navItems={techNavItems}
          topLogoTile={<TechLogoTile />}
          widgetSlots={
            <>
              <WidgetLatestReview />
              <WidgetFeaturedProduct />
              <WidgetSocialTech />
            </>
          }
          crossLinkTile={<StudiosCrossLinkTile />}
        />
        <MobileContentWrapper>
          {children}
          <Footer />
        </MobileContentWrapper>
        <BottomTabBar items={techMobileTabItems} overlayNavItems={techMobileMenuItems} />
      </div>
    </SidebarProvider>
  )
}
