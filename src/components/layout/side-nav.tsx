"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Music, Wrench, Play, Users, LogIn, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { signOut, useSession } from "@/lib/auth-client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navItems = [
  { label: "Beats", href: "/beats", icon: Music },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Portfolio", href: "/portfolio", icon: Play },
  { label: "About", href: "/artists", icon: Users },
] as const

export function SideNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <Sidebar
      collapsible="icon"
      className="hidden md:flex border-r border-gray-800 bg-gray-900"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <GlitchLogo size="md" />
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={
                        isActive
                          ? "text-white border-l-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.15)]"
                          : "text-gray-400 hover:text-white"
                      }
                    >
                      <item.icon className="size-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {session?.user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Avatar className="size-8">
                <AvatarFallback className="bg-gray-800 text-white text-xs">
                  {session.user.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-white group-data-[collapsible=icon]:hidden">
                {session.user.name || session.user.email}
              </span>
            </div>
            <SidebarMenuButton
              tooltip="Sign Out"
              className="text-gray-400 hover:text-white"
              onClick={async () => {
                await signOut()
                router.push("/")
                router.refresh()
              }}
            >
              <LogOut className="size-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </div>
        ) : (
          <SidebarMenuButton
            render={<Link href="/login" />}
            tooltip="Sign In"
            className="text-gray-400 hover:text-white"
          >
            <LogIn className="size-5" />
            <span>Sign In</span>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
