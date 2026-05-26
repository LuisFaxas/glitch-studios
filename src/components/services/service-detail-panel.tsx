"use client"

import Link from "next/link"

export type Service = {
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

export type PortfolioItemLite = {
  id: string
  title: string
  slug: string
  type: string
  category: string | null
  thumbnailUrl: string | null
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

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60
    const rounded = h % 1 === 0 ? h.toString() : h.toFixed(1)
    return `${rounded} hour${h === 1 ? "" : "s"}`
  }
  return `${minutes} minutes`
}

interface ServiceDetailPanelProps {
  service: Service
  portfolioItems: PortfolioItemLite[]
}

export function ServiceDetailPanel({
  service,
  portfolioItems,
}: ServiceDetailPanelProps) {
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
    <div className="space-y-6 p-4 md:p-6">
      {/* Section 1: Description */}
      <p className="font-sans text-[14px] md:text-[15px] leading-[1.5] text-[#f5f5f0] max-w-2xl">
        {service.description || service.shortDescription}
      </p>

      {/* Section 2: Pricing */}
      <section>
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888] mb-2">PRICING</h3>
        <p
          className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {service.priceLabel}
        </p>
        {depositHint && (
          <p className="font-sans text-[14px] leading-[1.5] text-[#888] mt-1">
            {depositHint}
          </p>
        )}
      </section>

      {/* Section 3: Duration & Includes */}
      {service.durationMinutes !== null && (
        <section>
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888] mb-2">DURATION & INCLUDES</h3>
          <p className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0] mb-3">
            {formatDuration(service.durationMinutes)}
          </p>
          <ul className="space-y-1">
            {service.deliverables.map((d) => (
              <li
                key={d}
                className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0] before:content-['›'] before:mr-2 before:text-[#888]"
              >
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 4: Highlights */}
      {service.features && service.features.length > 0 && (
        <section>
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888] mb-2">HIGHLIGHTS</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
            {service.features.map((feature, i) => (
              <li
                key={i}
                className="font-sans text-[14px] leading-[1.5] text-[#f5f5f0] before:content-['›'] before:mr-2 before:text-[#888]"
              >
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 5: Process */}
      <section>
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888] mb-2">PROCESS</h3>
        <ol className="space-y-3">
          {PROCESS_STEPS.map((step) => (
            <li key={step.n} className="flex gap-3">
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888] min-w-[32px]">
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

      {/* Section 6: Policies */}
      {hasPolicies && (
        <section>
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888] mb-2">POLICIES</h3>
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

      {/* Section 7: Example Work */}
      {hasExamples && (
        <section>
          <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888] mb-2">EXAMPLE WORK</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {portfolio.map((item) => (
              <Link
                key={item.id}
                href={`/portfolio/${item.slug}`}
                className="flex-shrink-0 w-[240px] bg-[#111] border border-[#222] hover:border-[#444] p-4 transition-colors duration-150"
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
    </div>
  )
}
