"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatPriceChip } from "@/lib/services/format-price-chip"
import { formatDurationChip } from "@/lib/services/format-duration-chip"
import type { Service } from "./types"

// B2.9 "mono stack" accordion row.
// Closed = pure black & white (icon + name + price). Open = the service accent
// floods in (top edge, eyebrow, price, chips, button, and the icon mask color).
// Interior "B": eyebrow + description + "WHAT YOU GET" (deliverables) + chips + button.

const ICO_REST = "#d8d8d2"
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

export interface ServiceCardProps {
  service: Service
  iconUrl: string
  accent: string
  isOpen: boolean
  onToggle: (slug: string) => void
}

export function ServiceCard({
  service,
  iconUrl,
  accent,
  isOpen,
  onToggle,
}: ServiceCardProps) {
  const bodyId = `service-body-${service.slug}`
  const priceChip = formatPriceChip(service.priceLabel)
  const durationChip = formatDurationChip(service.durationMinutes)
  const eyebrow = `SERVICE · ${(EYEBROW_BY_TYPE[service.type] ?? "Studio").toUpperCase()}`
  const ctaLabel = service.isBookable ? "BOOK THIS SERVICE" : "REQUEST A QUOTE"
  const ctaHref = service.isBookable
    ? `/book?service=${service.slug}`
    : `/contact?service=${service.slug}`

  return (
    <div
      data-testid="service-card"
      data-service-slug={service.slug}
      data-open={isOpen ? "" : undefined}
      className={cn(
        "relative -mt-px border transition-[border-color,background] duration-200",
        !isOpen && "border-[#262626] bg-[#0d0d0d] hover:border-[#3a3a3a] hover:bg-[#121212]"
      )}
      style={{
        borderTopWidth: 4,
        ...(isOpen
          ? {
              zIndex: 1,
              borderColor: `color-mix(in srgb, ${accent} 40%, ${LINE})`,
              borderTopColor: accent,
              background: `radial-gradient(ellipse at 100% 0%, color-mix(in srgb, ${accent} 14%, transparent) 0%, transparent 60%), linear-gradient(180deg, #0c0c0c 0%, color-mix(in srgb, ${accent} 8%, #070707) 100%)`,
            }
          : { borderTopColor: LINE }),
      }}
    >
      {/* ---- closed head (always visible, toggles open) ---- */}
      <button
        type="button"
        onClick={() => onToggle(service.slug)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${service.name}`}
        className="grid w-full grid-cols-[22px_1fr_auto_12px] items-center gap-[13px] px-[18px] py-[17px] text-left focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
        style={{ minHeight: 56 }}
      >
        <span
          aria-hidden
          className="h-[22px] w-[22px] shrink-0 transition-colors duration-200 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          style={{
            WebkitMaskImage: `url(${iconUrl})`,
            maskImage: `url(${iconUrl})`,
            backgroundColor: isOpen ? accent : ICO_REST,
          }}
        />
        <span className="min-w-0 truncate font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          {service.name}
        </span>
        <span
          className="whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-[0.05em] transition-colors duration-200"
          style={{ color: isOpen ? accent : "#8a8a8a" }}
        >
          {priceChip}
        </span>
        <span
          aria-hidden
          className="h-[9px] w-[9px] border-b border-r transition-transform duration-200"
          style={{
            borderColor: isOpen ? accent : "#8a8a8a",
            transform: isOpen ? "rotate(225deg)" : "rotate(45deg)",
          }}
        />
      </button>

      {/* ---- open body (interior B), animated via grid-rows trick ---- */}
      <div
        id={bodyId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-[18px] pb-[20px] pt-[2px]">
            <p
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: accent }}
            >
              {eyebrow}
            </p>
            <p className="mb-4 max-w-[40ch] font-sans text-[13.5px] leading-[1.6] text-[#d4d4ce]">
              {service.shortDescription}
            </p>

            <p className="mb-[9px] font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">
              What you get
            </p>
            <ul className="mb-[14px] flex flex-col gap-[7px]">
              {service.deliverables.map((d) => (
                <li
                  key={d}
                  className="relative pl-[15px] font-sans text-[13px] leading-[1.4] text-[#cfcfca]"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 font-mono"
                    style={{ color: accent }}
                  >
                    ›
                  </span>
                  {d}
                </li>
              ))}
            </ul>

            <div className="flex gap-[7px]">
              <span
                className="border px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.05em] [font-variant-numeric:tabular-nums]"
                style={{
                  borderColor: `color-mix(in srgb, ${accent} 45%, ${LINE})`,
                  backgroundColor: `color-mix(in srgb, ${accent} 10%, #0d0d0d)`,
                  color: `color-mix(in srgb, ${accent} 80%, #f5f5f0)`,
                }}
              >
                {priceChip}
              </span>
              {durationChip && (
                <span
                  className="border px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.05em] [font-variant-numeric:tabular-nums]"
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 45%, ${LINE})`,
                    backgroundColor: `color-mix(in srgb, ${accent} 10%, #0d0d0d)`,
                    color: `color-mix(in srgb, ${accent} 80%, #f5f5f0)`,
                  }}
                >
                  {durationChip}
                </span>
              )}
            </div>

            <Link
              href={ctaHref}
              className="mt-4 block w-full px-3 py-[13px] text-center font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-[#0a0a0a] transition-opacity duration-150 hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              {ctaLabel} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
