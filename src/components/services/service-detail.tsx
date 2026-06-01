"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { deriveSpecs } from "@/lib/services/derive-specs"
import type { Service } from "./types"

// Shared rich interior for the B2.9 detail (Phase 48.4).
//   variant="inline"  → mobile accordion body (single column; watermark on right)
//   variant="canvas"  → desktop master-detail card. Rebuilt 2026-05-27 to the
//     "refined C v2" booking-card: left READ column (eyebrow · big title ·
//     description · "what you get" glyph cells) + right BUY BOX led by a large,
//     fully-visible service icon (no covered background watermark — the icon is
//     identity hardware, not filler). Buy box carries price + spec rows + CTA.

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

  // ============ DESKTOP — booking card (refined C v2) ============
  if (isCanvas) {
    const head = specs[0]
    const rows = specs.slice(1)
    const cellBorder = `color-mix(in srgb, ${accent} 22%, ${LINE})`
    const cellBg = `color-mix(in srgb, ${accent} 5%, #0b0b0b)`

    return (
      <div className="flex flex-1 flex-col justify-center p-[36px] xl:p-[42px_40px]">
        <div className="grid grid-cols-1 gap-[34px] xl:grid-cols-[1fr_282px] xl:items-center xl:gap-[42px]">
          {/* read column */}
          <div className="min-w-0">
            <p
              className="font-mono text-[11px] font-medium uppercase tracking-[0.26em]"
              style={{ color: accent }}
            >
              {eyebrow}
            </p>
            <h2
              id={headingId}
              className="mb-4 mt-3 font-mono text-[34px] font-extrabold uppercase leading-[0.94] tracking-[0.01em] text-white xl:text-[50px]"
            >
              {service.name}
            </h2>
            <p className="max-w-[40ch] font-sans text-[15px] leading-[1.6] text-[#d4d4ce]">
              {service.shortDescription}
            </p>

            {service.deliverables.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a8a8a]">
                  What you get
                </p>
                <ul className="flex flex-col gap-[8px]">
                  {service.deliverables.map((d) => (
                    <li
                      key={d}
                      className="flex items-center gap-[12px] border px-[15px] py-[12px]"
                      style={{ borderColor: cellBorder, background: cellBg }}
                    >
                      <span
                        aria-hidden
                        className="shrink-0 font-mono text-[15px] font-extrabold leading-none"
                        style={{ color: accent }}
                      >
                        ›
                      </span>
                      <span className="font-sans text-[13.5px] font-semibold leading-[1.3] text-white">
                        {d}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* buy box — icon-led, fully visible */}
          <div
            className="border p-[24px_22px] backdrop-blur-[5px]"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 32%, ${LINE})`,
              borderTopWidth: 3,
              borderTopColor: accent,
              background: `color-mix(in srgb, ${accent} 9%, rgba(7,7,7,0.82))`,
            }}
          >
            <span
              aria-hidden
              className="mb-[18px] block h-[80px] w-[80px] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
              style={{
                backgroundColor: accent,
                WebkitMaskImage: `url(${iconUrl})`,
                maskImage: `url(${iconUrl})`,
              }}
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a8a8a]">
              {head.k}
            </p>
            <p className="mt-[2px] font-mono text-[29px] font-extrabold leading-none tracking-[0.01em] text-white [font-variant-numeric:tabular-nums]">
              {head.v}
            </p>

            <div className="my-[18px]">
              {rows.map((s, i) => (
                <div
                  key={s.k}
                  className="flex items-center justify-between py-[9px]"
                  style={{
                    borderTop:
                      i === 0
                        ? `1px solid color-mix(in srgb, ${accent} 18%, ${LINE})`
                        : undefined,
                    borderBottom: `1px solid color-mix(in srgb, ${accent} 12%, ${LINE})`,
                  }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-[#8a8a8a]">
                    {s.k}
                  </span>
                  <span className="font-mono text-[13px] font-bold text-white [font-variant-numeric:tabular-nums]">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={ctaHref}
              className="block w-full px-3 py-[13px] text-center font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-[#0a0a0a] transition-opacity duration-150 hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              {ctaLabel} →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ============ MOBILE — inline accordion body (unchanged) ============
  const mixBorder = `color-mix(in srgb, ${accent} 28%, ${LINE})`
  const cellBorder = `color-mix(in srgb, ${accent} 18%, ${LINE})`

  return (
    <div className="relative overflow-hidden px-[18px] pb-[20px] pt-[6px]">
      {/* faded pixel-icon watermark — the "media" graphic */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[-26px] top-1/2 h-[170px] w-[170px] -translate-y-1/2 opacity-[0.07] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
        style={{
          backgroundColor: accent,
          WebkitMaskImage: `url(${iconUrl})`,
          maskImage: `url(${iconUrl})`,
        }}
      />

      <div className="relative z-[2]">
        <p
          className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {eyebrow}
        </p>

        <p className="mb-4 max-w-[34ch] font-sans text-[13.5px] leading-[1.6] text-[#d4d4ce]">
          {service.shortDescription}
        </p>

        {specs.length > 0 && (
          <div
            className="mb-[18px] flex w-max max-w-full border"
            style={{ borderColor: mixBorder }}
          >
            {specs.map((s, i) => (
              <div
                key={s.k}
                className={cn(
                  "min-w-[74px] px-[14px] py-[9px]",
                  i < specs.length - 1 && "border-r"
                )}
                style={i < specs.length - 1 ? { borderColor: cellBorder } : undefined}
              >
                <div className="mb-[6px] font-mono text-[8px] uppercase tracking-[0.14em] text-[#6f6f6f]">
                  {s.k}
                </div>
                <div className="whitespace-nowrap font-mono text-[13px] font-bold text-white [font-variant-numeric:tabular-nums]">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mb-[9px] font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">
          What you get
        </p>
        <ul className="mb-[18px] flex flex-col gap-[7px]">
          {service.deliverables.map((d) => (
            <li
              key={d}
              className="relative pl-[16px] font-sans text-[13px] leading-[1.4] text-[#d4d4ce]"
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
          className="block w-full px-3 py-[13px] text-center font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-[#0a0a0a] transition-opacity duration-150 hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  )
}
