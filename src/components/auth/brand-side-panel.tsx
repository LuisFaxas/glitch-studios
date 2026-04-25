"use client"
import type { Brand } from "@/lib/brand"
import { GlitchLogo } from "@/components/layout/glitch-logo"

interface BrandSidePanelProps {
  brand: Brand
}

const TAGLINE: Record<Brand, string> = {
  studios: "Beats, sessions, and a signal worth signing in for.",
  tech: "Benchmarks you can trust. Reviews that hold up.",
}

export function BrandSidePanel({ brand }: BrandSidePanelProps) {
  return (
    <div className="w-full h-full bg-[#111111] border-r border-[var(--border)] flex flex-col justify-between p-12 xl:p-16">
      <div>
        <GlitchLogo size="md" animate={false} />
      </div>

      <div className="flex-1 flex items-center justify-center my-12" aria-hidden="true">
        {brand === "studios" ? <StudiosArt /> : <TechArt />}
      </div>

      <p className="font-mono uppercase tracking-[0.05em] text-[28px] leading-[1.2] font-semibold text-[var(--foreground)]">
        {TAGLINE[brand]}
      </p>
    </div>
  )
}

function StudiosArt() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-48 h-48 text-[var(--muted-foreground)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <circle cx="100" cy="100" r="80" />
      <circle cx="100" cy="100" r="60" />
      <circle cx="100" cy="100" r="40" />
      <circle cx="100" cy="100" r="6" fill="currentColor" />
      {Array.from({ length: 21 }).map((_, i) => {
        const x = 20 + i * 8
        const heights = [10, 16, 24, 32, 28, 20, 36, 18, 26, 22, 30, 18, 24, 32, 14, 22, 28, 18, 26, 22, 14]
        const h = heights[i]
        return <line key={i} x1={x} y1={170 - h / 2} x2={x} y2={170 + h / 2} />
      })}
    </svg>
  )
}

function TechArt() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-48 h-48 text-[var(--muted-foreground)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`h${i}`} x1="20" y1={30 + i * 24} x2="180" y2={30 + i * 24} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`v${i}`} x1={30 + i * 24} y1="20" x2={30 + i * 24} y2="180" />
      ))}
      <circle cx="54" cy="54" r="3" fill="currentColor" />
      <circle cx="102" cy="78" r="3" fill="currentColor" />
      <circle cx="150" cy="102" r="3" fill="currentColor" />
      <circle cx="78" cy="126" r="3" fill="currentColor" />
      <circle cx="126" cy="150" r="3" fill="currentColor" />
    </svg>
  )
}
