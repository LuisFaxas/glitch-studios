"use client"

import { cn } from "@/lib/utils"
import { formatPriceChip } from "@/lib/services/format-price-chip"
import { ServiceDetail } from "./service-detail"
import type { Service } from "./types"

// B2.9 mobile accordion row (Phase 48.4 plan 06).
// Closed = pure black & white (pixel icon + name + price). Open = the service
// accent floods in and the shared <ServiceDetail variant="inline"> expands below
// (description + spec strip + what-you-get + watermark + button).

const ICO_REST = "#d8d8d2"
const LINE = "#262626"

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
  const bodyId = `service-mobile-body-${service.slug}`
  const priceChip = formatPriceChip(service.priceLabel)

  return (
    <div
      data-testid="service-card"
      data-service-slug={service.slug}
      data-open={isOpen ? "" : undefined}
      className={cn(
        "relative -mt-px border transition-[border-color,background] duration-200",
        !isOpen &&
          "border-[#262626] bg-[#0d0d0d] hover:border-[#3a3a3a] hover:bg-[#121212]"
      )}
      style={{
        borderTopWidth: 4,
        ...(isOpen
          ? {
              zIndex: 1,
              borderColor: `color-mix(in srgb, ${accent} 40%, ${LINE})`,
              borderTopColor: accent,
              background: `linear-gradient(180deg, #0c0c0c 0%, color-mix(in srgb, ${accent} 7%, #070707) 100%)`,
            }
          : { borderTopColor: LINE }),
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(service.slug)}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${service.name}`}
        className="grid w-full grid-cols-[22px_1fr_auto_12px] items-center gap-[11px] px-[18px] py-[14px] text-left focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
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
        <span className="min-w-0 font-mono text-[12.5px] font-bold uppercase leading-[1.15] tracking-[0.02em] text-[#f5f5f0]">
          {service.name}
        </span>
        <span
          className="whitespace-nowrap font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] transition-colors duration-200"
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

      {/* open body — grid-rows trick animates to auto height */}
      <div
        id={bodyId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <ServiceDetail
            service={service}
            iconUrl={iconUrl}
            accent={accent}
            variant="inline"
          />
        </div>
      </div>
    </div>
  )
}
