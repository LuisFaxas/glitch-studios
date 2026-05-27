"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ServiceCard } from "./service-card"
import {
  serviceIconUrl,
  serviceAccent,
  CUSTOM_REQUEST_ICON_URL,
} from "./types"
import type { Service } from "./types"

export type { Service, PortfolioItemLite } from "./types"

interface ServiceGridProps {
  services: Service[]
}

export function ServiceGrid({ services }: ServiceGridProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  // Deep-link auto-open. setTimeout(0) deferral is LOAD-BEARING per
  // RESEARCH §Pitfall 6 + CLAUDE.md ranking-filter-safety rule — defers
  // setState out of the load task. Opens the matching accordion row (no overlay).
  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash.slice(1)
    if (!hash || !services.some((s) => s.slug === hash)) return

    const timeoutId = window.setTimeout(() => {
      setSelectedSlug(hash)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [services])

  // Single-open accordion. Click handler is a React synthetic onClick (NOT a
  // native input/focus/visibility path), so synchronous setState here is safe.
  const handleToggle = (slug: string) => {
    const next = selectedSlug === slug ? null : slug
    setSelectedSlug(next)
    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        next ? `#${slug}` : window.location.pathname
      )
    }
  }

  // Empty state — booking live but no service rows. One block spans the stack.
  if (services.length === 0) {
    return (
      <section id="service-grid" className="flex flex-col">
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
      </section>
    )
  }

  return (
    <section id="service-grid" className="flex flex-col">
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

      {/*
        Custom Request — same closed-row primitive, link variant.
        Direct nav to /contact?service=custom (no toggle, no open body).
        Stays monochrome (it never "opens", so it never blooms accent).
      */}
      <Link
        href="/contact?service=custom"
        data-testid="custom-request-tile"
        className="relative -mt-px grid grid-cols-[22px_1fr_auto_12px] items-center gap-[13px] border border-[#262626] bg-[#0d0d0d] px-[18px] py-[17px] transition-[border-color,background] duration-200 hover:border-[#3a3a3a] hover:bg-[#121212] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
        style={{ borderTopWidth: 4, borderTopColor: "#262626", minHeight: 56 }}
      >
        <span
          aria-hidden
          className="h-[22px] w-[22px] shrink-0 bg-[#d8d8d2] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          style={{
            WebkitMaskImage: `url(${CUSTOM_REQUEST_ICON_URL})`,
            maskImage: `url(${CUSTOM_REQUEST_ICON_URL})`,
          }}
        />
        <span className="min-w-0 truncate font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          CUSTOM REQUEST
        </span>
        <span className="whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#8a8a8a]">
          BY BRIEF
        </span>
        <span
          aria-hidden
          className="justify-self-end font-mono text-[12px] text-[#8a8a8a]"
        >
          →
        </span>
      </Link>
    </section>
  )
}
