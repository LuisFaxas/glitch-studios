"use client"
import type { Brand } from "@/lib/brand"
import { BrandContext } from "./use-brand"
import { BrandSidePanel } from "./brand-side-panel"
import { GlitchLogo } from "@/components/layout/glitch-logo"

interface AuthShellProps {
  brand: Brand
  children: React.ReactNode
}

const MOBILE_TAGLINE: Record<Brand, string> = {
  studios: "Beats, sessions, and a signal worth signing in for.",
  tech: "Benchmarks you can trust. Reviews that hold up.",
}

export function AuthShell({ brand, children }: AuthShellProps) {
  return (
    <BrandContext.Provider value={brand}>
      <div className="min-h-screen flex flex-col lg:flex-row">
        <aside className="hidden lg:flex lg:w-1/2 lg:min-h-screen sticky top-0 self-start">
          <BrandSidePanel brand={brand} />
        </aside>

        <header className="lg:hidden flex flex-col items-center gap-2 px-6 pt-4 pb-2">
          <GlitchLogo size="sm" animate={false} />
          <p className="text-xs font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)] text-center">
            {MOBILE_TAGLINE[brand]}
          </p>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-8 lg:py-12">
          <div className="w-full max-w-[480px]">
            {children}
          </div>
        </main>
      </div>
    </BrandContext.Provider>
  )
}
