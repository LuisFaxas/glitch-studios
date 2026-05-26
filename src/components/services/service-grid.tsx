"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ServiceCard } from "./service-card"
import { ServiceDetailOverlay } from "./service-detail-overlay"
import type { PortfolioItemLite, Service } from "./service-detail-panel"

export type { Service, PortfolioItemLite } from "./service-detail-panel"

interface ServiceGridProps {
  services: Service[]
  portfolioByServiceId: Record<string, PortfolioItemLite[]>
}

export function ServiceGrid({
  services,
  portfolioByServiceId,
}: ServiceGridProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  // Deep-link auto-open. setTimeout(0) deferral is LOAD-BEARING per
  // RESEARCH §Pitfall 6 + CLAUDE.md ranking-filter-safety rule — defers
  // setState out of the native-event task that would otherwise cascade.
  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash.slice(1)
    if (!hash || !services.some((s) => s.slug === hash)) return

    const timeoutId = window.setTimeout(() => {
      setSelectedSlug(hash)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [services])

  const handleTileOpen = (slug: string) => {
    setSelectedSlug(slug)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${slug}`)
    }
  }

  const handleOverlayClose = () => {
    setSelectedSlug(null)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname)
    }
  }

  const selectedService = selectedSlug
    ? (services.find((s) => s.slug === selectedSlug) ?? null)
    : null

  // Empty state — UI-SPEC §10 / UI-SVC-16. One tile spans the grid.
  if (services.length === 0) {
    return (
      <section
        id="service-grid"
        className="grid grid-cols-2 gap-1 md:grid-cols-3"
      >
        <div className="col-span-2 md:col-span-3 border border-[#222] bg-[#111] py-16 px-6 flex flex-col items-center text-center gap-4">
          <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            NO SERVICES LIVE YET
          </h2>
          <p className="font-sans text-[14px] max-w-md text-[#888]">
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
      </section>
    )
  }

  const customRequestIndex = String(services.length + 1).padStart(2, "0")

  return (
    <>
      <section
        id="service-grid"
        className="grid grid-cols-2 gap-1 md:grid-cols-3"
      >
        {services.map((service, i) => (
          <ServiceCard
            key={service.slug}
            service={{
              slug: service.slug,
              name: service.name,
              shortDescription: service.shortDescription,
              priceLabel: service.priceLabel,
              durationMinutes: service.durationMinutes,
            }}
            indexLabel={String(i + 1).padStart(2, "0")}
            onOpen={handleTileOpen}
          />
        ))}
        {/*
          Custom Request tile at position N+1 (UI-SPEC §7, RESEARCH Open Question 3).
          Rendered as a SIBLING <Link> (not a <ServiceCard>) because:
            (a) click target differs — direct nav, NOT overlay open
            (b) chip set is locked literals (CUSTOM + BY BRIEF), not formatted
                from DB fields
            (c) extracting a shared TileShell primitive for one extra tile is
                over-engineering this phase
          Visual styles mirror ServiceCard 1:1 to preserve "sixth equal option"
          parity per UI-SPEC §7.
        */}
        <Link
          href="/contact?service=custom"
          data-testid="custom-request-tile"
          className="group relative flex aspect-square w-full flex-col justify-between overflow-hidden md:aspect-auto md:min-h-[220px] border border-[#222] bg-[#111] p-3 md:p-5 text-left transition-colors duration-150 hover:border-[#444] hover:bg-[#1a1a1a] active:bg-[#0a0a0a] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0] rounded-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(245,245,240,0.025) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/10 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
          />
          <div className="relative z-20 flex w-full items-start justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#555]">
              {customRequestIndex}
            </span>
            <span
              aria-hidden
              className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-mono text-[14px] text-[#555] tracking-[0.2em]"
            >
              ··
            </span>
          </div>
          <div className="relative z-20 flex flex-col gap-1">
            <h3 className="font-mono font-bold uppercase tracking-[0.05em] text-[#f5f5f0] text-[16px] leading-[1.1] md:text-[22px] md:leading-[1.15]">
              CUSTOM REQUEST
            </h3>
            <p className="font-sans text-[#888] text-[11px] line-clamp-1 md:text-[13px] md:line-clamp-2">
              Anything we didn&apos;t list. Tell us what you need.
            </p>
          </div>
          <div className="relative z-20 flex flex-wrap gap-1">
            <span className="rounded-none border border-[#333] bg-[#222] px-1.5 py-0.5 font-mono text-[11px] uppercase text-[#f5f5f0] md:px-2 md:py-1">CUSTOM</span>
            <span className="rounded-none border border-[#333] bg-[#222] px-1.5 py-0.5 font-mono text-[11px] uppercase text-[#f5f5f0] md:px-2 md:py-1">BY BRIEF</span>
          </div>
        </Link>
      </section>
      <ServiceDetailOverlay
        service={selectedService}
        portfolioItems={
          selectedService
            ? (portfolioByServiceId[selectedService.id] ?? [])
            : []
        }
        onClose={handleOverlayClose}
      />
    </>
  )
}
