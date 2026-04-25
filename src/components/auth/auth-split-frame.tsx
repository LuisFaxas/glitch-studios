"use client"

import Link from "next/link"
import logoStyles from "@/components/tiles/logo-tile.module.css"
import { TechPulseLine } from "@/components/home/tech-pulse-line"

interface AuthSplitFrameProps {
  wordmark: string
  eyebrow?: string
  highlight: {
    title: string
    points: { label: string; description?: string }[]
  }
  /** Optional small stat strip rendered under the points list. */
  stats?: { value: string; label: string }[]
  children: React.ReactNode
}

export function AuthSplitFrame({
  wordmark,
  eyebrow,
  highlight,
  stats,
  children,
}: AuthSplitFrameProps) {
  return (
    <div className="grid w-full gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,520px)] md:items-stretch md:gap-12">
      {/* LEFT — brand + value prop. Hidden compact on mobile. */}
      <aside className="flex flex-col gap-5 md:gap-8 md:py-8">
        <Link
          href="/"
          aria-label="Glitch Studios — Home"
          className={`${logoStyles.glitchWrapper} block w-full max-w-[420px]`}
        >
          <div className={logoStyles.glitchImg} />
          <div className={logoStyles.glitchLayer1} aria-hidden="true" />
          <div className={logoStyles.glitchLayer2} aria-hidden="true" />
          <div className={logoStyles.beamLayer1} aria-hidden="true" />
          <div className={logoStyles.beamLayer2} aria-hidden="true" />
        </Link>

        <div className="flex w-full max-w-[420px] items-center gap-3">
          <TechPulseLine delay={0} />
          <span
            className={`${logoStyles.glitchTextWrapper} font-mono text-[11px] md:text-[13px] font-bold uppercase tracking-[0.4em] text-[#f5f5f0] whitespace-nowrap`}
            aria-label={wordmark}
          >
            {wordmark}
            <span
              className={`${logoStyles.glitchTextLayer} ${logoStyles.glitchTextLayer1}`}
              aria-hidden="true"
            >
              {wordmark}
            </span>
            <span
              className={`${logoStyles.glitchTextLayer} ${logoStyles.glitchTextLayer2}`}
              aria-hidden="true"
            >
              {wordmark}
            </span>
          </span>
          <TechPulseLine delay={1} />
        </div>

        <div className="hidden flex-col gap-5 md:flex">
          {eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {eyebrow}
            </span>
          )}
          <h2 className="font-mono text-[22px] uppercase leading-[1.15] tracking-[0.04em] text-[#f5f5f0]">
            {highlight.title}
          </h2>
          <ul className="flex flex-col gap-4">
            {highlight.points.map((p) => (
              <li key={p.label} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[10px] inline-block h-1 w-3 shrink-0 bg-[#f5f5f0]"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[16px] leading-[1.4] text-[#f5f5f0]">
                    {p.label}
                  </span>
                  {p.description && (
                    <span className="font-sans text-[13px] leading-[1.45] text-[var(--muted-foreground)]">
                      {p.description}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {stats && stats.length > 0 && (
            <div className="mt-auto grid grid-cols-3 gap-3 border-t border-[#222] pt-5">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="font-mono text-[20px] font-bold text-[#f5f5f0]">
                    {s.value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT — form column */}
      <section className="flex w-full flex-col rounded-2xl border border-[#222] bg-[#0a0a0a]/70 p-6 md:p-10">
        {children}
      </section>
    </div>
  )
}
