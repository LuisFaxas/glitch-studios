import { TileNav } from "@/components/layout/tile-nav"
import { WidgetLatestPost } from "@/components/tiles/widget-latest-post"
import { BottomTabBar } from "@/components/layout/bottom-tab-bar"
import { Footer } from "@/components/layout/footer"
import { HomepageSidebarController } from "@/components/layout/homepage-sidebar-controller"
import { MobileContentWrapper } from "@/components/layout/mobile-content-wrapper"
import { publicNavItems, mobileTabItems } from "@/components/layout/public-nav-config"
import { TechCrossLinkTile } from "@/components/tiles/tech-cross-link-tile"
import { getBookingLive } from "@/lib/get-booking-live"
import { requireVerifiedEmailOrRedirect } from "@/lib/auth-guards"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireVerifiedEmailOrRedirect()
  const bookingLive = await getBookingLive()

  return (
    <HomepageSidebarController>
      <div className="flex min-h-screen">
        <TileNav
          navItems={publicNavItems}
          latestPostSlot={<WidgetLatestPost />}
          crossLinkTile={<TechCrossLinkTile />}
          bookingLive={bookingLive}
        />
        <MobileContentWrapper>
          {children}
          <Footer />
        </MobileContentWrapper>
        <BottomTabBar items={mobileTabItems} bookingLive={bookingLive} />
      </div>
    </HomepageSidebarController>
  )
}
