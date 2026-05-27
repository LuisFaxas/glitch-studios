import { formatPriceChip } from "./format-price-chip"
import { formatDurationChip } from "./format-duration-chip"
import type { Service } from "@/components/services/types"

export type ServiceSpec = { k: string; v: string }

// Spec-strip cells for the B2.9 detail interior (Phase 48.4 plan 06).
// Derived from existing fields only — no invented per-service data.
// - Cell 1: bookable → RATE; non-bookable → FROM (the price chip).
// - Cell 2: durationMinutes set → SESSION; else → SCOPE / BY BRIEF.
// - Cell 3: bookable + deposit present → DEPOSIT (percentage "{n}%" or flat "${n}").
// Bookable services yield 3 cells; quote-only services yield 2.
export function deriveSpecs(service: Service): ServiceSpec[] {
  const specs: ServiceSpec[] = []

  specs.push({
    k: service.isBookable ? "Rate" : "From",
    v: formatPriceChip(service.priceLabel),
  })

  const duration = formatDurationChip(service.durationMinutes)
  if (duration) {
    specs.push({ k: "Session", v: duration })
  } else {
    specs.push({ k: "Scope", v: "BY BRIEF" })
  }

  if (service.isBookable && service.depositValue != null) {
    const n = service.depositValue
    const v =
      service.depositType === "percentage"
        ? `${n}%`
        : `$${Number.isInteger(n) ? n : n.toFixed(2)}` // $25 · $37.50
    specs.push({ k: "Deposit", v })
  }

  return specs
}
