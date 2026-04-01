import { TileNav } from "@/components/layout/tile-nav"
import { WidgetLatestPost } from "@/components/tiles/widget-latest-post"
import { BottomTabBar } from "@/components/layout/bottom-tab-bar"
import { Footer } from "@/components/layout/footer"
import { HomepageSidebarController } from "@/components/layout/homepage-sidebar-controller"
import { MobileContentWrapper } from "@/components/layout/mobile-content-wrapper"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HomepageSidebarController>
      <div className="flex min-h-screen">
        <TileNav latestPostSlot={<WidgetLatestPost />} />
        <MobileContentWrapper>
          {children}
          <Footer />
        </MobileContentWrapper>
        <BottomTabBar />
      </div>
    </HomepageSidebarController>
  )
}
