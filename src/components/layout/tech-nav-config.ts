"use client"

import {
  FileText,
  Grid,
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Home,
  Trophy,
  Info,
} from "lucide-react"
import type { NavItem } from "@/components/layout/nav-config-types"

// Phase 29.1 D-01 — sidebar order: Reviews → Rankings → Categories → Compare
//                        → Benchmarks → Blog → About
export const techNavItems: readonly NavItem[] = [
  {
    label: "Reviews",
    href: "/tech/reviews",
    icon: FileText,
    desktopSize: "wide",
    mobileSpan: "col-span-6",
  },
  {
    label: "Rankings",
    href: "/tech/rankings",
    icon: Trophy,
    desktopSize: "medium",
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
  {
    label: "About",
    href: "/tech/about",
    icon: Info,
    desktopSize: "small",
    mobileSpan: "col-span-3",
  },
] as const

// Phase 29.1 — bottom-tab capacity preserved per RQ-6 (Rankings goes in overlay,
// not bottom tab). UNCHANGED from Phase 16.1.
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

// Phase 29.1 D-01 — overlay menu shows non-bottom-tab items in sidebar order:
// Rankings (new), Benchmarks, Blog, About (new).
export const techMobileMenuItems = [
  { label: "Rankings", href: "/tech/rankings", icon: Trophy },
  { label: "Benchmarks", href: "/tech/benchmarks", icon: BarChart3 },
  { label: "Blog", href: "/tech/blog", icon: BookOpen },
  { label: "About", href: "/tech/about", icon: Info },
] as const
