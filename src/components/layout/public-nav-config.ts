"use client"

import {
  BookOpen,
  Calendar,
  Film,
  Mail,
  Music,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export interface PublicNavItem {
  label: string
  href: string
  icon: LucideIcon
  desktopSize: "wide" | "medium" | "small"
  mobileSpan: string
}

export const publicNavItems: readonly PublicNavItem[] = [
  {
    label: "Beats",
    href: "/beats",
    icon: Music,
    desktopSize: "wide",
    mobileSpan: "col-span-4",
  },
  {
    label: "Services",
    href: "/services",
    icon: Wrench,
    desktopSize: "wide",
    mobileSpan: "col-span-8",
  },
  {
    label: "Book Session",
    href: "/book",
    icon: Calendar,
    desktopSize: "wide",
    mobileSpan: "col-span-7",
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: Film,
    desktopSize: "wide",
    mobileSpan: "col-span-5",
  },
  {
    label: "Artists",
    href: "/artists",
    icon: User,
    desktopSize: "medium",
    mobileSpan: "col-span-5",
  },
  {
    label: "Blog",
    href: "/blog",
    icon: BookOpen,
    desktopSize: "small",
    mobileSpan: "col-span-3",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail,
    desktopSize: "small",
    mobileSpan: "col-span-4",
  },
] as const

export const mobileTabItems = publicNavItems.filter((item) =>
  ["/beats", "/services", "/portfolio", "/blog"].includes(item.href),
)

export const mobileMenuItems = publicNavItems.filter((item) =>
  ["/book", "/artists", "/contact"].includes(item.href),
)
