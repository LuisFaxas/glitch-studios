"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { deriveSpecs } from "@/lib/services/derive-specs"
import type { Service } from "./types"

// Shared rich interior for the B2.9 detail (Phase 48.4 plan 06). Rendered inline
// inside the mobile accordion body and inside the desktop master-detail canvas —
// one component = the cross-size cohesion in code.
//   variant="inline"  → mobile; omits the big title (the accordion head shows it)
//   variant="canvas"  → desktop; leads with a big icon + title

const LINE = "#262626"

const EYEBROW_BY_TYPE: Record<string, string> = {
  studio_session: "Tracking",
  mixing: "Post",
  mastering: "Post",
  sfx: "Sound",
  video_production: "Visual",
  photography: "Visual",
  graphic_design: "Visual",
}

export interface ServiceDetailProps {
  service: Service
  iconUrl: string
  accent: string
  variant: "inline" | "canvas"
  /** id for the labelled region heading (canvas variant), for aria-labelledby. */
  headingId?: string
}

export function ServiceDetail({
  service,
  iconUrl,
  accent,
  variant,
  headingId,
}: ServiceDetailProps) {
  const isCanvas = variant === "canvas"
  const eyebrow = `SERVICE · ${(EYEBROW_BY_TYPE[service.type] ?? "Studio").toUpperCase()}`
  const specs = deriveSpecs(service)
  const ctaLabel = service.isBookable ? "BOOK THIS SERVICE" : "REQUEST A QUOTE"
  const ctaHref = service.isBookable
    ? `/book?service=${service.slug}`
    : `/contact?service=${service.slug}`

  const mixBorder = `color-mix(in srgb, ${accent} 28%, ${LINE})`
  const cellBorder = `color-mix(in srgb, ${accent} 18%, ${LINE})`

  return (
    <div className={cn("relative overflow-hidden", isCanvas ? "flex-1 p-[44px_40px]" : "px-[18px] pb-[20px] pt-[6px]")}>
      {/* faded pixel-icon watermark — the "media" graphic */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
          isCanvas
            ? "bottom-[-60px] right-[-50px] h-[440px] w-[440px] opacity-[0.07]"
            : "right-[-26px] top-1/2 h-[170px] w-[170px] -translate-y-1/2 opacity-[0.07]"
        )}
        style={{
          backgroundColor: accent,
          WebkitMaskImage: `url(${iconUrl})`,
          maskImage: `url(${iconUrl})`,
        }}
      />

      <div className={cn("relative z-[2]", isCanvas && "max-w-[560px]")}>
        <p
          className={cn(
            "font-mono uppercase",
            isCanvas
              ? "mb-[18px] text-[11px] tracking-[0.24em]"
              : "mb-3 text-[10px] tracking-[0.22em]"
          )}
          style={{ color: accent }}
        >
          {eyebrow}
        </p>

        {isCanvas && (
          <div className="mb-2 flex items-center gap-4">
            <span
              aria-hidden
              className="h-[44px] w-[44px] shrink-0 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
              style={{
                backgroundColor: accent,
                WebkitMaskImage: `url(${iconUrl})`,
                maskImage: `url(${iconUrl})`,
              }}
            />
            <h2
              id={headingId}
              className="font-mono text-[34px] font-extrabold uppercase leading-none tracking-[0.01em] text-white"
            >
              {service.name}
            </h2>
          </div>
        )}

        <p
          className={cn(
            "font-sans leading-[1.6] text-[#d4d4ce]",
            isCanvas ? "mb-6 mt-[18px] max-w-[48ch] text-[15px]" : "mb-4 max-w-[34ch] text-[13.5px]"
          )}
        >
          {service.shortDescription}
        </p>

        {/* spec strip */}
        {specs.length > 0 && (
          <div
            className={cn("flex w-max max-w-full border", isCanvas ? "mb-[26px]" : "mb-[18px]")}
            style={{ borderColor: mixBorder }}
          >
            {specs.map((s, i) => (
              <div
                key={s.k}
                className={cn(
                  isCanvas ? "min-w-[96px] px-[22px] py-3" : "min-w-[74px] px-[14px] py-[9px]",
                  i < specs.length - 1 && "border-r"
                )}
                style={i < specs.length - 1 ? { borderColor: cellBorder } : undefined}
              >
                <div
                  className={cn(
                    "mb-[6px] font-mono uppercase text-[#6f6f6f]",
                    isCanvas ? "text-[9px] tracking-[0.16em]" : "text-[8px] tracking-[0.14em]"
                  )}
                >
                  {s.k}
                </div>
                <div
                  className={cn(
                    "whitespace-nowrap font-mono font-bold text-white [font-variant-numeric:tabular-nums]",
                    isCanvas ? "text-[17px]" : "text-[13px]"
                  )}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mb-[9px] font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">
          What you get
        </p>
        <ul className={cn("flex flex-col", isCanvas ? "mb-[30px] gap-[9px]" : "mb-[18px] gap-[7px]")}>
          {service.deliverables.map((d) => (
            <li
              key={d}
              className={cn(
                "relative pl-[16px] font-sans leading-[1.4] text-[#d4d4ce]",
                isCanvas ? "text-[14px]" : "text-[13px]"
              )}
            >
              <span aria-hidden className="absolute left-0 font-mono" style={{ color: accent }}>
                ›
              </span>
              {d}
            </li>
          ))}
        </ul>

        <Link
          href={ctaHref}
          className={cn(
            "font-mono font-bold uppercase tracking-[0.08em] text-[#0a0a0a] transition-opacity duration-150 hover:opacity-90",
            isCanvas
              ? "inline-flex items-center gap-[10px] px-[30px] py-[15px] text-[13px]"
              : "block w-full px-3 py-[13px] text-center text-[12px]"
          )}
          style={{ backgroundColor: accent }}
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  )
}
