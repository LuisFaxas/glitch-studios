"use client"

import { usePathname } from "next/navigation"
import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  isHomepage: boolean
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const pathname = usePathname()
  // glitchtech.io middleware rewrites "/" -> "/tech" internally; usePathname
  // reports the browser URL ("/"), so both resolve to the tech homepage. On
  // glitchstudios.io, only "/" is the homepage; "/tech" is unreachable there.
  // Either way, treating "/" or "/tech" as home is correct for both brands.
  const isHomepage = pathname === "/" || pathname === "/tech"

  // Collapsed state seeds from initial pathname only; never re-derived from
  // route changes. This is what allows TechLayout to be pathname-stable —
  // route nav only re-renders this provider, not its children, and the
  // memoized context value below means consumers only re-render when
  // collapsed or isHomepage actually change.
  const [collapsed, setCollapsed] = useState(isHomepage)

  const value = useMemo<SidebarContextValue>(
    () => ({ collapsed, setCollapsed, isHomepage }),
    [collapsed, isHomepage],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return ctx
}
