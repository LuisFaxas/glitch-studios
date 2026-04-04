"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Check } from "lucide-react"
import clsx from "clsx"

type Service = {
  id: string
  name: string
  slug: string
  type: string
  description: string
  shortDescription: string
  priceLabel: string
  features: string[] | null
  ctaText: string | null
  sortOrder: number | null
  isActive: boolean | null
  isBookable?: boolean
}

interface ServiceGridProps {
  services: Service[]
}

function ServiceDetailPanel({ service }: { service: Service }) {
  return (
    <div className="border border-[#222222] bg-[#111111] p-6 md:p-8 rounded-none min-h-[300px]">
      <h2 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] text-[#f5f5f0] mb-4">
        {service.name}
      </h2>

      <p className="font-sans text-[15px] leading-relaxed text-[#f5f5f0] mb-6 max-w-2xl">
        {service.description || service.shortDescription}
      </p>

      <p
        className="font-mono font-bold text-xl text-[#f5f5f0] mb-6"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {service.priceLabel}
      </p>

      {service.features && service.features.length > 0 && (
        <ul className="space-y-3 mb-8">
          {service.features.map((feature, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[#f5f5f0] font-sans text-[15px]"
            >
              <Check
                className="h-5 w-5 text-[#f5f5f0] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        {service.isBookable && (
          <Link
            href={`/book?service=${service.slug}`}
            className="inline-flex items-center justify-center bg-[#f5f5f0] text-[#000000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] px-8 py-3 rounded-none transition-colors duration-200 hover:bg-[#e5e5e0] outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2"
          >
            Book Now
          </Link>
        )}
        <Link
          href={`/contact?service=${service.slug}`}
          className="inline-flex items-center justify-center border border-[#f5f5f0] bg-transparent text-[#f5f5f0] font-mono font-bold text-[13px] uppercase tracking-[0.05em] px-8 py-3 rounded-none transition-colors duration-200 hover:bg-[#f5f5f0] hover:text-[#000000] outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2"
        >
          {service.isBookable ? "Contact Us" : (service.ctaText || "Book a Session")}
        </Link>
      </div>
    </div>
  )
}

export function ServiceGrid({ services }: ServiceGridProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    services[0]?.slug ?? null,
  )
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  // Support deep-linking via URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && services.some((s) => s.slug === hash)) {
      setSelectedSlug(hash)
      setExpandedSlug(hash)
    }
  }, [services])

  const selectedService = services.find((s) => s.slug === selectedSlug)

  const handleTileClick = (slug: string) => {
    // Desktop: select service for detail panel
    setSelectedSlug(slug)
    window.history.replaceState(null, "", `#${slug}`)

    // Mobile: toggle accordion
    setExpandedSlug((prev) => (prev === slug ? null : slug))
  }

  if (services.length === 0) {
    return (
      <div className="border border-[#222222] bg-[#111111] p-12 text-center rounded-none">
        <p className="text-[#888888] font-sans text-[15px]">
          No services available at the moment.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop: master-detail layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_1fr] md:gap-1">
        {/* Left: tile grid */}
        <div className="grid grid-cols-2 gap-1">
          {services.map((service) => {
            const isSelected = service.slug === selectedSlug
            return (
              <button
                key={service.slug}
                type="button"
                onClick={() => handleTileClick(service.slug)}
                aria-selected={isSelected}
                className={clsx(
                  "group relative overflow-hidden flex flex-col items-start justify-start gap-2 p-4 border border-solid rounded-none",
                  "transition-colors duration-200",
                  "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
                  "min-h-[100px]",
                  isSelected
                    ? "bg-[#f5f5f0] border-[#f5f5f0] text-[#000000] shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                    : "bg-[#111111] border-[#222222] text-[#f5f5f0] cursor-pointer hover:bg-[#1a1a1a] hover:border-[#444444] active:bg-[#0a0a0a] active:scale-[0.97] active:duration-100",
                )}
              >
                {!isSelected && (
                  <span
                    className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
                    aria-hidden="true"
                  />
                )}
                <span className="font-mono font-bold text-lg uppercase tracking-[0.05em]">
                  {service.name}
                </span>
                <span
                  className={clsx(
                    "font-sans text-[13px]",
                    isSelected ? "text-[#000000]/70" : "text-[#888888]",
                  )}
                >
                  {service.shortDescription}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right: detail panel */}
        <div aria-live="polite">
          <AnimatePresence mode="wait">
            {selectedService && (
              <motion.div
                key={selectedService.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ServiceDetailPanel service={selectedService} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: accordion layout */}
      <div className="md:hidden space-y-1">
        {services.map((service) => {
          const isExpanded = service.slug === expandedSlug
          return (
            <div key={service.slug} className="border border-[#222222] overflow-hidden">
              <button
                type="button"
                onClick={() => handleTileClick(service.slug)}
                aria-expanded={isExpanded}
                className={clsx(
                  "w-full flex flex-col items-start gap-2 p-4 border border-solid rounded-none",
                  "transition-colors duration-200",
                  "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
                  "min-h-[48px]",
                  isExpanded
                    ? "bg-[#f5f5f0] border-[#f5f5f0] text-[#000000]"
                    : "bg-[#111111] border-[#222222] text-[#f5f5f0] active:bg-[#0a0a0a]",
                )}
              >
                <span className="font-mono font-bold text-lg uppercase tracking-[0.05em]">
                  {service.name}
                </span>
                <span
                  className={clsx(
                    "font-sans text-[13px]",
                    isExpanded ? "text-[#000000]/70" : "text-[#888888]",
                  )}
                >
                  {service.shortDescription}
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ServiceDetailPanel service={service} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </>
  )
}
