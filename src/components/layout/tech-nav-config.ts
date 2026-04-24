"use client"

import {
  FileText,
  Grid,
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Home,
} from "lucide-react"
import type { NavItem } from "@/components/layout/nav-config-types"

export const techNavItems: readonly NavItem[] = [
  {
    label: "Reviews",
    href: "/tech/reviews",
    icon: FileText,
    desktopSize: "wide",
    mobileSpan: "col-span-6",
  },
  {
    label: "Categories",
    href: "/tech/categories",
    icon: Grid,
    desktopSize: "medium",
    mobileSpan: "col-span-5",
  },
  {
    label: "Compare",
    href: "/tech/compare",
    icon: ArrowLeftRight,
    desktopSize: "medium",
    mobileSpan: "col-span-5",
  },
  {
    label: "Benchmarks",
    href: "/tech/benchmarks",
    icon: BarChart3,
    desktopSize: "medium",
    mobileSpan: "col-span-4",
  },
  {
    label: "Blog",
    href: "/tech/blog",
    icon: BookOpen,
    desktopSize: "small",
    mobileSpan: "col-span-3",
  },
] as const

export const techMobileTabItems: readonly NavItem[] = [
  {
    label: "Home",
    href: "/tech",
    icon: Home,
    desktopSize: "medium",
    mobileSpan: "col-span-1",
  },
  {
    label: "Reviews",
    href: "/tech/reviews",
    icon: FileText,
    desktopSize: "medium",
    mobileSpan: "col-span-1",
  },
  {
    label: "Categories",
    href: "/tech/categories",
    icon: Grid,
    desktopSize: "medium",
    mobileSpan: "col-span-1",
  },
  {
    label: "Compare",
    href: "/tech/compare",
    icon: ArrowLeftRight,
    desktopSize: "medium",
    mobileSpan: "col-span-1",
  },
] as const

// D-09 (Phase 16.1): Blog available on mobile overlay too so it's reachable
// across every surface (desktop sidebar + mobile overlay menu).
export const techMobileMenuItems = [
  { label: "Benchmarks", href: "/tech/benchmarks", icon: BarChart3 },
  { label: "Blog", href: "/tech/blog", icon: BookOpen },
] as const
