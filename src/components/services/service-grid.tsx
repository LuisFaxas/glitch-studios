"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ServiceCard } from "./service-card"
import { ServiceDetail } from "./service-detail"
import {
  serviceIconUrl,
  serviceAccent,
  CUSTOM_REQUEST_ICON_URL,
} from "./types"
import type { Service } from "./types"
import { formatPriceChip } from "@/lib/services/format-price-chip"

export type { Service, PortfolioItemLite } from "./types"

const LINE = "#262626"
const ICO_REST = "#d8d8d2"
const CANVAS_HEADING_ID = "service-canvas-heading"

interface ServiceGridProps {
  services: Service[]
}

export function ServiceGrid({ services }: ServiceGridProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  // Deep-link auto-open. setTimeout(0) deferral is LOAD-BEARING per
  // RESEARCH §Pitfall 6 + CLAUDE.md ranking-filter-safety rule.
  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash.slice(1)
    if (!hash || !services.some((s) => s.slug === hash)) return
    const timeoutId = window.setTimeout(() => setSelectedSlug(hash), 0)
    return () => window.clearTimeout(timeoutId)
  }, [services])

  // React onClick (not a native input/focus/visibility path) → sync setState safe.
  const syncHash = (slug: string | null) => {
    if (typeof window === "undefined") return
    window.history.replaceState(
      null,
      "",
      slug ? `#${slug}` : window.location.pathname
    )
  }
  // Mobile accordion: toggle (can close → all-closed).
  const handleToggle = (slug: string) => {
    const next = selectedSlug === slug ? null : slug
    setSelectedSlug(next)
    syncHash(next)
  }
  // Desktop rail: always selects (canvas always shows one).
  const handleSelect = (slug: string) => {
    setSelectedSlug(slug)
    syncHash(slug)
  }

  if (services.length === 0) {
    return (
      <div id="service-grid" className="flex flex-col">
        <div className="flex flex-col items-center gap-4 border border-[#262626] bg-[#0d0d0d] px-6 py-16 text-center">
          <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            NO SERVICES LIVE YET
          </h2>
          <p className="max-w-md font-sans text-[14px] text-[#8a8a8a]">
            We&apos;re finishing the booking setup. In the meantime, send us a
            message and we&apos;ll get back to you about your project.
          </p>
          <Link
            href="/contact"
            className="mt-2 border border-[#f5f5f0] px-6 py-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors duration-150 hover:bg-[#f5f5f0] hover:text-[#000]"
          >
            CONTACT US
          </Link>
        </div>
      </div>
    )
  }

  // Desktop canvas always shows a service: the selected one, or the first.
  const desktopService =
    services.find((s) => s.slug === selectedSlug) ?? services[0]
  const desktopAccent = serviceAccent(desktopService.slug)

  return (
    <div id="service-grid">
      {/* ============ MOBILE — vertical accordion ============ */}
      <section
        data-services-layout="mobile"
        aria-label="Services"
        className="flex flex-col lg:hidden"
      >
        {services.map((service) => (
          <ServiceCard
            key={service.slug}
            service={service}
            iconUrl={serviceIconUrl(service.slug)}
            accent={serviceAccent(service.slug)}
            isOpen={selectedSlug === service.slug}
            onToggle={handleToggle}
          />
        ))}
        <CustomRequestRow layout="mobile" />
      </section>

      {/* ============ DESKTOP — master–detail ============ */}
      <section
        data-services-layout="desktop"
        aria-label="Services"
        className="hidden min-h-[560px] grid-cols-[340px_1fr] border border-[#262626] lg:grid"
      >
        {/* rail */}
        <div className="flex flex-col border-r border-[#262626] bg-[#0b0b0b]">
          {services.map((service) => {
            const sel = desktopService.slug === service.slug
            const accent = serviceAccent(service.slug)
            return (
              <button
                key={service.slug}
                type="button"
                data-service-slug={service.slug}
                aria-current={sel ? "true" : undefined}
                onClick={() => handleSelect(service.slug)}
                className="grid h-[72px] grid-cols-[24px_1fr_auto] items-center gap-[14px] border-b border-[#262626] px-[20px] text-left transition-colors duration-150 last:border-b-0 hover:bg-[#101010] focus-visible:outline-1 focus-visible:outline-[#f5f5f0]"
                style={
                  sel
                    ? { background: "#0d0d0d", boxShadow: `inset 3px 0 0 ${accent}` }
                    : undefined
                }
              >
                <span
                  aria-hidden
                  className="h-[24px] w-[24px] shrink-0 transition-colors duration-200 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
                  style={{
                    WebkitMaskImage: `url(${serviceIconUrl(service.slug)})`,
                    maskImage: `url(${serviceIconUrl(service.slug)})`,
                    backgroundColor: sel ? accent : ICO_REST,
                  }}
                />
                <span
                  className="truncate font-mono text-[12.5px] font-bold uppercase tracking-[0.04em]"
                  style={{ color: sel ? "#fff" : "#f5f5f0" }}
                >
                  {service.name}
                </span>
                <span
                  className="whitespace-nowrap font-mono text-[10.5px] font-bold uppercase tracking-[0.04em]"
                  style={{ color: sel ? accent : "#8a8a8a" }}
                >
                  {formatPriceChip(service.priceLabel)}
                </span>
              </button>
            )
          })}
          <CustomRequestRow layout="desktop" />
        </div>

        {/* canvas — stable labelled region; content swaps with selection */}
        <div
          aria-labelledby={CANVAS_HEADING_ID}
          className="relative overflow-hidden"
          style={{
            borderTop: `4px solid ${desktopAccent}`,
            background: `radial-gradient(ellipse at 88% 0%, color-mix(in srgb, ${desktopAccent} 14%, transparent) 0%, transparent 58%), repeating-linear-gradient(0deg, transparent 0 4px, color-mix(in srgb, ${desktopAccent} 3%, transparent) 4px 5px), linear-gradient(160deg, #0b0b0b 0%, color-mix(in srgb, ${desktopAccent} 7%, #070707) 100%)`,
          }}
        >
          <ServiceDetail
            service={desktopService}
            iconUrl={serviceIconUrl(desktopService.slug)}
            accent={desktopAccent}
            variant="canvas"
            headingId={CANVAS_HEADING_ID}
          />
        </div>
      </section>
    </div>
  )
}

// Custom Request — same closed-row look, link variant. Monochrome (never opens).
// Rendered once per layout (mobile row / desktop rail row).
function CustomRequestRow({ layout }: { layout: "mobile" | "desktop" }) {
  const isMobile = layout === "mobile"
  return (
    <Link
      href="/contact?service=custom"
      data-testid="custom-request-tile"
      className={cn(
        "relative grid items-center gap-[13px] border-[#262626] bg-[#0d0d0d] transition-[border-color,background] duration-200 hover:border-[#3a3a3a] hover:bg-[#121212] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]",
        isMobile
          ? "-mt-px grid-cols-[22px_1fr_auto_12px] border px-[18px] py-[17px]"
          : "h-[72px] grid-cols-[24px_1fr_auto] border-t px-[20px]"
      )}
      style={
        isMobile ? { borderTopWidth: 4, borderTopColor: LINE, minHeight: 56 } : undefined
      }
    >
      <span
        aria-hidden
        className={cn(
          "shrink-0 bg-[#d8d8d2] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
          isMobile ? "h-[22px] w-[22px]" : "h-[24px] w-[24px]"
        )}
        style={{
          WebkitMaskImage: `url(${CUSTOM_REQUEST_ICON_URL})`,
          maskImage: `url(${CUSTOM_REQUEST_ICON_URL})`,
        }}
      />
      <span
        className={cn(
          "min-w-0 truncate font-mono font-bold uppercase tracking-[0.05em] text-[#f5f5f0]",
          isMobile ? "text-[13px]" : "text-[12.5px]"
        )}
      >
        CUSTOM REQUEST
      </span>
      {isMobile && (
        <span className="whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#8a8a8a]">
          BY BRIEF
        </span>
      )}
      <span
        aria-hidden
        className="justify-self-end font-mono text-[12px] text-[#8a8a8a]"
      >
        →
      </span>
    </Link>
  )
}
