// Shared service surface types + the per-service pixel-icon map.
// Relocated from service-detail-panel.tsx (deleted with the B2.9 mono-stack
// redesign — Phase 48.4 plan 05). Pure types, safe to import from server or
// client components.

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

/**
 * Per-service title icon (vendored Pixelarticons-Sharp, in public/icons/services/).
 * Keyed by service slug; falls back to plus-box-sharp for unknown slugs.
 * Rendered as a CSS mask so the glyph inherits color (mono → accent on open).
 */
const SERVICE_ICON_BY_SLUG: Record<string, string> = {
  "recording-session": "mic-sharp",
  "mixing-mastering": "sliders-2",
  "sfx-design": "audio-waveform-sharp",
  "video-production": "video-sharp",
  photography: "camera-sharp",
  "graphic-design": "image-sharp",
}

export function serviceIconUrl(slug: string): string {
  const name = SERVICE_ICON_BY_SLUG[slug] ?? "plus-box-sharp"
  return `/icons/services/${name}.svg`
}

/** The Custom Request row uses this fixed icon. */
export const CUSTOM_REQUEST_ICON_URL = "/icons/services/plus-box-sharp.svg"

/** Per-service muted accent hue (B2.9 locked palette), keyed by slug. */
const SERVICE_ACCENT_BY_SLUG: Record<string, string> = {
  "recording-session": "#4eb47a",
  "mixing-mastering": "#db8d36",
  "sfx-design": "#aabd58",
  "video-production": "#4cabbb",
  photography: "#c2735a",
  "graphic-design": "#897dc7",
}

export function serviceAccent(slug: string): string {
  return SERVICE_ACCENT_BY_SLUG[slug] ?? "#8a857e"
}

/** Custom Request accent (warm grey) — used by the link-variant row. */
export const CUSTOM_REQUEST_ACCENT = "#8a857e"
