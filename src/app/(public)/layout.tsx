import { SidebarProvider } from "@/components/ui/sidebar"
import { SideNav } from "@/components/layout/side-nav"
import { BottomTabBar } from "@/components/layout/bottom-tab-bar"
import { Footer } from "@/components/layout/footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SideNav />
      <main className="flex-1 min-h-screen pb-16 md:pb-0">
        {children}
        <Footer />
      </main>
      <BottomTabBar />
    </SidebarProvider>
  )
}
