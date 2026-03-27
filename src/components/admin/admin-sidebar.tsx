"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  Quote,
  Music,
  Package,
  CalendarDays,
  UserCircle,
  Image,
  Inbox,
  Mail,
  Settings,
  Layout,
  Shield,
  Menu,
  X,
} from "lucide-react"
import type { Permission } from "@/lib/permissions"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  permission?: Permission
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

function getNavSections(unreadCount: number): NavSection[] {
  return [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Content",
      items: [
        { label: "Blog Posts", href: "/admin/blog", icon: FileText, permission: "manage_content" },
        { label: "Services", href: "/admin/services", icon: Briefcase, permission: "manage_content" },
        { label: "Team", href: "/admin/team", icon: Users, permission: "manage_content" },
        { label: "Testimonials", href: "/admin/testimonials", icon: Quote, permission: "manage_content" },
      ],
    },
    {
      title: "Commerce",
      items: [
        { label: "Beats", href: "/admin/beats", icon: Music, permission: "manage_bookings" },
        { label: "Bundles", href: "/admin/bundles", icon: Package, permission: "manage_bookings" },
        { label: "Bookings", href: "/admin/bookings", icon: CalendarDays, permission: "manage_bookings" },
      ],
    },
    {
      title: "Clients",
      items: [
        { label: "Client List", href: "/admin/clients", icon: UserCircle, permission: "view_clients" },
      ],
    },
    {
      title: "Media",
      items: [
        { label: "Media Library", href: "/admin/media", icon: Image, permission: "manage_media" },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          label: "Contact Inbox",
          href: "/admin/inbox",
          icon: Inbox,
          permission: "reply_messages",
          badge: unreadCount,
        },
        { label: "Newsletter", href: "/admin/newsletter", icon: Mail, permission: "send_newsletters" },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "Site Settings", href: "/admin/settings", icon: Settings, permission: "manage_settings" },
        { label: "Homepage", href: "/admin/homepage", icon: Layout, permission: "manage_settings" },
        { label: "Roles & Permissions", href: "/admin/roles", icon: Shield, permission: "manage_roles" },
      ],
    },
  ]
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin"
  return pathname.startsWith(href)
}

function SidebarContent({
  permissions,
  unreadCount,
  pathname,
  onNavigate,
}: {
  permissions: Permission[]
  unreadCount: number
  pathname: string
  onNavigate?: () => void
}) {
  const sections = getNavSections(unreadCount)

  return (
    <nav className="flex flex-col gap-6 p-4">
      {sections.map((section) => {
        const visibleItems = section.items.filter(
          (item) => !item.permission || permissions.includes(item.permission)
        )
        if (visibleItems.length === 0) return null

        return (
          <div key={section.title}>
            <h3
              className="mb-2 px-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em]"
              style={{ color: "#555555" }}
            >
              {section.title}
            </h3>
            <div className="flex flex-col gap-1">
              {visibleItems.map((item) => {
                const active = isActiveRoute(pathname, item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`group relative flex min-h-[44px] items-center gap-3 px-3 py-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em] transition-colors ${
                      active
                        ? "bg-[#f5f5f0] text-[#000000]"
                        : "bg-[#111111] text-[#f5f5f0] hover:bg-[#1a1a1a]"
                    }`}
                  >
                    {/* Glitch hover overlay */}
                    {!active && (
                      <span
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:animate-glitch-hover group-hover:opacity-60"
                        style={{ background: "#f5f5f0" }}
                        aria-hidden="true"
                      />
                    )}
                    <Icon size={18} className="relative z-10 shrink-0" />
                    <span className="relative z-10">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center bg-[#f5f5f0] px-1 font-mono text-[11px] font-bold text-[#000000]">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({
  permissions,
  role,
  unreadCount,
}: {
  permissions: Permission[]
  role: string
  unreadCount: number
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center bg-[#111111] text-[#f5f5f0] lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sheet */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform overflow-y-auto bg-[#000000] transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#222222] p-4">
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Admin
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-[#888888] hover:text-[#f5f5f0]"
            aria-label="Close admin menu"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent
          permissions={permissions}
          unreadCount={unreadCount}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside className="sidebar-scroll hidden w-[240px] shrink-0 overflow-y-auto border-r border-[#222222] bg-[#000000] lg:block">
        <div className="border-b border-[#222222] p-4">
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Admin
          </span>
          <span className="ml-2 bg-[#222222] px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-[#888888]">
            {role}
          </span>
        </div>
        <SidebarContent
          permissions={permissions}
          unreadCount={unreadCount}
          pathname={pathname}
        />
      </aside>
    </>
  )
}
