"use client"

import clsx from "clsx"
import { Clock } from "lucide-react"
import type { ServiceBookingInfo } from "@/types/booking"
import { GlitchHeading } from "@/components/ui/glitch-heading"

interface ServiceSelectorProps {
  services: ServiceBookingInfo[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function formatDurationLabel(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60
    const rounded = h % 1 === 0 ? h.toString() : h.toFixed(1)
    return `${rounded} ${h === 1 ? "HOUR" : "HOURS"}`
  }
  return `${minutes} MINUTES`
}

export function ServiceSelector({
  services,
  selectedId,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service) => (
        <ServiceTile
          key={service.serviceId}
          service={service}
          isSelected={selectedId === service.serviceId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function ServiceTile({
  service,
  isSelected,
  onSelect,
}: {
  service: ServiceBookingInfo
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service.serviceId)}
      aria-pressed={isSelected}
      className={clsx(
        "w-full text-left p-4 border border-solid rounded-none transition-colors duration-200",
        "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
        "active:scale-[0.98] active:duration-100",
        "min-h-[48px]",
        isSelected
          ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
          : "bg-[#111111] text-[#f5f5f0] border-[#222222] hover:bg-[#1a1a1a] hover:border-[#444444] cursor-pointer"
      )}
    >
      <div className="space-y-3">
        {/* 1. Name */}
        <h3
          className={clsx(
            "font-mono text-[20px] font-bold uppercase tracking-[0.05em]",
            isSelected ? "text-[#000000]" : "text-[#f5f5f0]"
          )}
        >
          {isSelected ? (
            service.serviceName.toUpperCase()
          ) : (
            <GlitchHeading text={service.serviceName.toUpperCase()}>
              {service.serviceName.toUpperCase()}
            </GlitchHeading>
          )}
        </h3>

        {/* 2. Description — 1-line truncated */}
        {service.prepInstructions && (
          <p
            className={clsx(
              "font-sans text-[14px] leading-[1.5] truncate",
              isSelected ? "text-[#000000]" : "text-[#888888]"
            )}
          >
            {service.prepInstructions}
          </p>
        )}

        {/* 3. Price */}
        <div
          className={clsx(
            "font-mono text-[20px] font-bold uppercase tracking-[0.05em]",
            isSelected ? "text-[#000000]" : "text-[#f5f5f0]"
          )}
        >
          {service.priceLabel}
        </div>

        {/* 4. Duration with Clock icon */}
        <div
          className={clsx(
            "flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.05em]",
            isSelected ? "text-[#000000]" : "text-[#888888]"
          )}
        >
          <Clock size={14} aria-hidden />
          <span>{formatDurationLabel(service.durationMinutes)}</span>
        </div>
      </div>
    </button>
  )
}
