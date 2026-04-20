"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import clsx from "clsx"
import { GlitchHeading } from "@/components/ui/glitch-heading"

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
  durationMinutes: number | null
  depositType: "flat" | "percentage" | null
  depositValue: number | null
  cancellationWindowHours: number | null
  refundPolicy: string | null
  deliverables: string[]
}

interface PortfolioItemLite {
  id: string
  title: string
  slug: string
  type: string
  category: string | null
  thumbnailUrl: string | null
}

interface ServiceGridProps {
  services: Service[]
  portfolioByServiceId: Record<string, PortfolioItemLite[]>
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60
    const rounded = h % 1 === 0 ? h.toString() : h.toFixed(1)
    return `${rounded} hour${h === 1 ? "" : "s"}`
  }
  return `${minutes} minutes`
}

const PROCESS_STEPS = [
  {
    n: "01",
    title: "PREP",
    body: "We confirm your goals, tech requirements, and session brief.",
  },
  {
    n: "02",
    title: "SESSION",
    body: "Full-focus studio time on the service you booked.",
  },
  {
    n: "03",
    title: "REVISIONS",
    body: "Up to two revision passes on deliverables where applicable.",
  },
  {
    n: "04",
    title: "DELIVERY",
    body: "Final files delivered digitally within the agreed window.",
  },
]

function ServiceDetailPanel({
  service,
  portfolioItems,
}: {
  service: Service
  portfolioItems: PortfolioItemLite[]
}) {
  const depositHint =
    service.depositType && service.depositValue !== null
      ? service.depositType === "flat"
        ? `Deposit: $${service.depositValue.toFixed(2)} due at booking`
        : `Deposit: ${service.depositValue}% due at booking`
      : null

  const depositPolicy =
    service.depositType && service.depositValue !== null
      ? service.depositType === "flat"
        ? `Deposit: $${service.depositValue.toFixed(2)} secures your booking.`
        : `Deposit: ${service.depositValue}% of total secures your booking.`
      : null

  const hasPolicies = service.cancellationWindowHours !== null
  const portfolio = portfolioItems ?? []
  const hasExamples = portfolio.length > 0

  return (
    <div className="border border-[#222222] bg-[#111111] p-6 md:p-8 rounded-none min-h-[300px] space-y-6">
      {/* Section 1: Name */}
      <h1
        className="font-mono font-bold uppercase tracking-[0.05em] leading-[1.1] md:leading-[1.2] text-[#f5f5f0]"
        style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
      >
        <GlitchHeading text={service.name}>{service.name}</GlitchHeading>
      </h1>

      {/* Section 2: Description */}
      <p className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0] max-w-2xl">
        {service.description || service.shortDescription}
      </p>

      {/* Section 3: Pricing */}
      <section>
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-2">
          PRICING
        </h3>
        <p
          className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {service.priceLabel}
        </p>
        {depositHint && (
          <p className="font-sans text-[14px] leading-[1.5] text-[#888888] mt-1">
            {depositHint}
          </p>
        )}
      </section>

      {/* Section 4: Duration & Includes */}
      {service.durationMinutes !== null && (
        <section>
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-2">
            DURATION & INCLUDES
          </h3>
          <p className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0] mb-3">
            {formatDuration(service.durationMinutes)}
          </p>
          <ul className="space-y-1">
            {service.deliverables.map((d) => (
              <li
                key={d}
                className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0] before:content-['›'] before:mr-2 before:text-[#888888]"
              >
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 5: Highlights */}
      {service.features && service.features.length > 0 && (
        <section>
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-2">
            HIGHLIGHTS
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
            {service.features.map((feature, i) => (
              <li
                key={i}
                className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0] before:content-['›'] before:mr-2 before:text-[#888888]"
              >
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 6: Process */}
      <section>
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-2">
          PROCESS
        </h3>
        <ol className="space-y-3">
          {PROCESS_STEPS.map((step) => (
            <li key={step.n} className="flex gap-3">
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] min-w-[32px]">
                {step.n}
              </span>
              <div>
                <div className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                  {step.title}
                </div>
                <p className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Section 7: Policies */}
      {hasPolicies && (
        <section>
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-2">
            POLICIES
          </h3>
          <div className="space-y-2 font-sans text-[14px] leading-[1.5] text-[#f5f5f0]">
            {depositPolicy && <p>{depositPolicy}</p>}
            <p>
              Cancel up to {service.cancellationWindowHours}h before your
              session for a full refund.
            </p>
            {service.refundPolicy && <p>{service.refundPolicy}</p>}
          </div>
        </section>
      )}

      {/* Section 8: Example Work */}
      {hasExamples && (
        <section>
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-2">
            EXAMPLE WORK
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {portfolio.map((item) => (
              <Link
                key={item.id}
                href={`/portfolio/${item.slug}`}
                className="flex-shrink-0 w-[240px] bg-[#111111] border border-[#222222] hover:border-[#444444] p-4 transition-colors"
              >
                {item.thumbnailUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full aspect-video object-cover mb-2"
                  />
                )}
                <p className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0]">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section 9: CTA */}
      <div className="flex flex-wrap gap-3 pt-2">
        {service.isBookable ? (
          <Link
            href={`/book?service=${service.slug}`}
            className="inline-flex items-center justify-center bg-[#f5f5f0] text-[#000000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] px-8 py-3 rounded-none transition-colors duration-200 hover:bg-[#e5e5e0] outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2"
          >
            BOOK THIS SERVICE
          </Link>
        ) : (
          <Link
            href={`/contact?service=${service.slug}`}
            className="inline-flex items-center justify-center bg-[#f5f5f0] text-[#000000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] px-8 py-3 rounded-none transition-colors duration-200 hover:bg-[#e5e5e0] outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2"
          >
            CONTACT FOR QUOTE
          </Link>
        )}
      </div>
    </div>
  )
}

export function ServiceGrid({
  services,
  portfolioByServiceId,
}: ServiceGridProps) {
  const firstSlug = services[0]?.slug ?? null
  const [selectedSlug, setSelectedSlug] = useState<string | null>(firstSlug)
  // B-01 fix: default mobile accordion to first service so content is visible on load
  const [expandedSlug, setExpandedSlug] = useState<string | null>(firstSlug)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && services.some((s) => s.slug === hash)) {
      setSelectedSlug(hash)
      setExpandedSlug(hash)
    }
  }, [services])

  const selectedService = services.find((s) => s.slug === selectedSlug)

  const handleTileClick = (slug: string) => {
    setSelectedSlug(slug)
    window.history.replaceState(null, "", `#${slug}`)
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
                    : "bg-[#111111] border-[#222222] text-[#f5f5f0] cursor-pointer hover:bg-[#1a1a1a] hover:border-[#444444] active:bg-[#0a0a0a] active:scale-[0.97] active:duration-100"
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
                    isSelected ? "text-[#000000]/70" : "text-[#888888]"
                  )}
                >
                  {service.shortDescription}
                </span>
              </button>
            )
          })}
        </div>

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
                <ServiceDetailPanel
                  service={selectedService}
                  portfolioItems={
                    portfolioByServiceId[selectedService.id] ?? []
                  }
                />
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
            <div
              key={service.slug}
              className="border border-[#222222] overflow-hidden"
            >
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
                    : "bg-[#111111] border-[#222222] text-[#f5f5f0] active:bg-[#0a0a0a]"
                )}
              >
                <span className="font-mono font-bold text-lg uppercase tracking-[0.05em]">
                  {service.name}
                </span>
                <span
                  className={clsx(
                    "font-sans text-[13px]",
                    isExpanded ? "text-[#000000]/70" : "text-[#888888]"
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
                    <ServiceDetailPanel
                      service={service}
                      portfolioItems={portfolioByServiceId[service.id] ?? []}
                    />
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
