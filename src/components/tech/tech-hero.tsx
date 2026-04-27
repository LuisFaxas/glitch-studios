// src/components/tech/tech-hero.tsx
// Phase 29.1 D-08 — derived from the beats-store hero (single slide rhythm).
// Hover-only RGB-split glitch on h1 (memory: feedback_glitch_headers.md).
// No auto-running animations.
import Link from "next/link"
import { GlitchHeading } from "@/components/ui/glitch-heading"

export interface TechHeroProps {
  eyebrow?: string
  title: string
  subhead: string
  ctaLabel: string
  ctaHref: string
  ctaOpensInNewTab?: boolean
  tone?: "cyan" | "amber"
  size?: "compact" | "default" | "tall"
}

const GRADIENTS: Record<NonNullable<TechHeroProps["tone"]>, string> = {
  cyan: `
    radial-gradient(ellipse at 70% 50%, rgba(56,189,248,0.08) 0%, transparent 60%),
    repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(56,189,248,0.03) 3px, rgba(56,189,248,0.03) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(56,189,248,0.02) 8px, rgba(56,189,248,0.02) 9px),
    linear-gradient(to right, #0a0a0a 0%, #0a0e14 50%, #0a0a0a 100%)
  `,
  amber: `
    radial-gradient(ellipse at 70% 50%, rgba(245,158,11,0.08) 0%, transparent 60%),
    repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(245,158,11,0.03) 3px, rgba(245,158,11,0.03) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(245,158,11,0.02) 8px, rgba(245,158,11,0.02) 9px),
    linear-gradient(to right, #0a0a0a 0%, #140d0a 50%, #0a0a0a 100%)
  `,
}

const HEIGHT_MAP: Record<NonNullable<TechHeroProps["size"]>, string> = {
  compact: "h-[200px]",
  default: "h-[280px]",
  tall: "h-[400px]",
}

export function TechHero({
  eyebrow,
  title,
  subhead,
  ctaLabel,
  ctaHref,
  ctaOpensInNewTab = false,
  tone = "cyan",
  size = "default",
}: TechHeroProps) {
  return (
    <div data-tech-hero data-tone={tone}>
      {eyebrow && (
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.15em] text-[#555]">
          {eyebrow}
        </span>
      )}
      <div
        className={`relative ${HEIGHT_MAP[size]} w-full overflow-hidden`}
        style={{ background: GRADIENTS[tone] }}
      >
        <div className="flex h-full flex-col items-center justify-center text-center px-6 md:px-10">
          <h1 className="font-mono text-[24px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[40px]">
            <GlitchHeading text={title}>{title}</GlitchHeading>
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-[13px] text-[#888] md:text-[15px]">
            {subhead}
          </p>
          <Link
            href={ctaHref}
            {...(ctaOpensInNewTab
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="mt-5 inline-flex min-h-[44px] w-fit items-center border border-[#f5f5f0] px-6 py-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#000]"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
