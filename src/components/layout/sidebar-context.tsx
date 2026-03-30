"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  isHomepage: boolean
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

interface SidebarProviderProps {
  defaultCollapsed?: boolean
  isHomepage?: boolean
  children: ReactNode
}

export function SidebarProvider({
  defaultCollapsed = false,
  isHomepage = false,
  children,
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, isHomepage }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return ctx
}
