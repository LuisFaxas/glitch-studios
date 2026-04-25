"use client"
import type { Brand } from "@/lib/brand"
import { BrandContext } from "./use-brand"

interface AuthShellProps {
  brand: Brand
  children: React.ReactNode
}

export function AuthShell({ brand, children }: AuthShellProps) {
  return (
    <BrandContext.Provider value={brand}>
      <div className="min-h-[100dvh] flex items-center justify-center px-3 py-6 md:px-4 md:py-10">
        <div className="w-full max-w-[1100px]">{children}</div>
      </div>
    </BrandContext.Provider>
  )
}
