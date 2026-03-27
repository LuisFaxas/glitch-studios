"use client"

import { useState, useCallback } from "react"
import clsx from "clsx"
import {
  Headphones,
  Sliders,
  Volume2,
  Video,
  Waves,
  Palette,
} from "lucide-react"
import type { ServiceBookingInfo } from "@/types/booking"

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  studio_session: <Headphones className="h-5 w-5" />,
  mixing: <Sliders className="h-5 w-5" />,
  mastering: <Volume2 className="h-5 w-5" />,
  video_production: <Video className="h-5 w-5" />,
  sfx: <Waves className="h-5 w-5" />,
  graphic_design: <Palette className="h-5 w-5" />,
}

interface ServiceSelectorProps {
  services: ServiceBookingInfo[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ServiceSelector({
  services,
  selectedId,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <div>
      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-4">
        SELECT SERVICE
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-[var(--gap-tile)]">
        {services.map((service) => (
          <ServiceTile
            key={service.serviceId}
            service={service}
            isSelected={selectedId === service.serviceId}
            onSelect={onSelect}
          />
        ))}
      </div>
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
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => {
    if (!isSelected) setIsHovered(true)
  }, [isSelected])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  // Derive service type from slug for icon mapping
  const serviceType = service.serviceSlug.replace(/-/g, "_")
  const icon = SERVICE_ICONS[serviceType] || <Headphones className="h-5 w-5" />

  const durationLabel =
    service.durationMinutes >= 60
      ? `${service.durationMinutes / 60} hour${service.durationMinutes > 60 ? "s" : ""}`
      : `${service.durationMinutes} min`

  return (
    <button
      type="button"
      onClick={() => onSelect(service.serviceId)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "relative overflow-hidden flex flex-col items-start gap-2 p-4 border border-solid rounded-none transition-colors duration-200",
        "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
        "active:scale-[0.97] active:duration-100",
        isSelected && "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]",
        !isSelected && "bg-[#111111] text-[#f5f5f0] border-[#222222] cursor-pointer",
        !isSelected && isHovered && "bg-[#1a1a1a] border-[#444444]"
      )}
    >
      {/* Glitch hover overlay on unselected tiles */}
      {!isSelected && isHovered && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-start gap-2 p-4 bg-[#f5f5f0]/5 animate-glitch-hover motion-reduce:animate-none"
          aria-hidden="true"
        >
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
          <span className="font-mono text-sm font-bold uppercase tracking-[0.05em]">
            {service.serviceName}
          </span>
        </div>
      )}

      <span className="flex-shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span className="font-mono text-sm font-bold uppercase tracking-[0.05em]">
        {service.serviceName}
      </span>
      <span className="font-sans text-[13px] text-[#888888]">
        {durationLabel}
      </span>
      <span className={clsx(
        "font-mono text-[13px] font-bold",
        isSelected ? "text-[#000000]" : "text-[#f5f5f0]"
      )}>
        {service.priceLabel}
      </span>
    </button>
  )
}
