"use client"

import { cn } from "@/lib/utils"
import { formatPriceChip } from "@/lib/services/format-price-chip"
import { formatDurationChip } from "@/lib/services/format-duration-chip"

export interface ServiceCardProps {
  service: {
    slug: string
    name: string
    shortDescription: string
    priceLabel: string
    durationMinutes: number | null
  }
  indexLabel: string
  onOpen: (slug: string) => void
}

export function ServiceCard({ service, indexLabel, onOpen }: ServiceCardProps) {
  const priceChipText = formatPriceChip(service.priceLabel)
  const durationChipText = formatDurationChip(service.durationMinutes)

  return (
    <button
      type="button"
      onClick={() => onOpen(service.slug)}
      data-testid="service-card"
      data-service-slug={service.slug}
      aria-label={`Open ${service.name} details`}
      style={{
        backgroundImage:
          "radial-gradient(rgba(245,245,240,0.025) 1px, transparent 1px)",
        backgroundSize: "8px 8px",
      }}
      className={cn(
        "group relative flex aspect-square w-full flex-col justify-between overflow-hidden",
        "md:aspect-auto md:min-h-[220px]",
        "border border-[#222] bg-[#111] p-3 md:p-5",
        "text-left transition-colors duration-150",
        "hover:border-[#444] hover:bg-[#1a1a1a]",
        "active:bg-[#0a0a0a]",
        "focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]",
        "rounded-none",
      )}
    >
      {/* Glitch hover overlay — reserved DNA for high-intent cards (rubric) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
      />

      {/* Top row: index + hover dots */}
      <div className="relative z-20 flex w-full items-start justify-between">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#555]">
          {indexLabel}
        </span>
        <span
          aria-hidden="true"
          className="hidden font-mono text-[14px] tracking-[0.2em] text-[#555] opacity-0 transition-opacity duration-150 group-hover:opacity-100 md:block"
        >
          {"··"}
        </span>
      </div>

      {/* Middle: name + short description */}
      <div className="relative z-20 flex flex-col gap-1">
        <h3 className="font-mono text-[16px] font-bold uppercase leading-[1.1] tracking-[0.05em] text-[#f5f5f0] md:text-[22px] md:leading-[1.15]">
          {service.name}
        </h3>
        <p className="line-clamp-1 font-sans text-[11px] text-[#888] md:line-clamp-2 md:text-[13px]">
          {service.shortDescription}
        </p>
      </div>

      {/* Bottom: chip row (price always; duration conditional) */}
      <div className="relative z-20 flex flex-wrap gap-1">
        <span
          style={{ fontVariantNumeric: "tabular-nums" }}
          className="rounded-none border border-[#333] bg-[#222] px-1.5 py-0.5 font-mono text-[11px] uppercase text-[#f5f5f0] md:px-2 md:py-1"
        >
          {priceChipText}
        </span>
        {durationChipText && (
          <span
            style={{ fontVariantNumeric: "tabular-nums" }}
            className="rounded-none border border-[#333] bg-[#222] px-1.5 py-0.5 font-mono text-[11px] uppercase text-[#f5f5f0] md:px-2 md:py-1"
          >
            {durationChipText}
          </span>
        )}
      </div>
    </button>
  )
}
