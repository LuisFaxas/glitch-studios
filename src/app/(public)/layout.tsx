import { TileNav } from "@/components/layout/tile-nav"
import { WidgetLatestPost } from "@/components/tiles/widget-latest-post"
import { BottomTabBar } from "@/components/layout/bottom-tab-bar"
import { Footer } from "@/components/layout/footer"
import { HomepageSidebarController } from "@/components/layout/homepage-sidebar-controller"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HomepageSidebarController>
      <div className="flex min-h-screen">
        <TileNav latestPostSlot={<WidgetLatestPost />} />
        <main className="page-content flex-1 min-w-0 min-h-screen overflow-x-hidden pb-16 md:pb-0">
          {children}
          <Footer />
        </main>
        <BottomTabBar />
      </div>
    </HomepageSidebarController>
  )
}
