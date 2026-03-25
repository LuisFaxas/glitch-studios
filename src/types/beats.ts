import type { InferSelectModel } from "drizzle-orm"
import type {
  beats,
  beatPricing,
  beatProducers,
  orders,
  orderItems,
  licenseTierDefs,
  bundles,
} from "@/db/schema"

// Database row types
export type Beat = InferSelectModel<typeof beats>
export type BeatPricingRow = InferSelectModel<typeof beatPricing>
export type BeatProducer = InferSelectModel<typeof beatProducers>
export type Order = InferSelectModel<typeof orders>
export type OrderItem = InferSelectModel<typeof orderItems>
export type LicenseTierDef = InferSelectModel<typeof licenseTierDefs>
export type Bundle = InferSelectModel<typeof bundles>

// Composite types for UI
export interface BeatSummary {
  id: string
  title: string
  slug: string
  bpm: number
  key: string
  genre: string
  moods: string[] | null
  description: string | null
  coverArtUrl: string | null
  previewAudioUrl: string | null
  midiFileUrl: string | null
  status: "draft" | "published" | "sold_exclusive"
  pricing: { tier: string; price: string; isActive: boolean | null }[]
  producers: { name: string; splitPercent: number }[]
}

export interface CartItem {
  beatId: string
  beatTitle: string
  beatSlug: string
  coverArtUrl: string | null
  licenseTier: string
  licenseTierDisplay: string
  price: number
}

export type LicenseTier =
  | "mp3_lease"
  | "wav_lease"
  | "stems"
  | "unlimited"
  | "exclusive"

export const LICENSE_TIER_DISPLAY: Record<LicenseTier, string> = {
  mp3_lease: "MP3 Lease",
  wav_lease: "WAV Lease",
  stems: "Stems",
  unlimited: "Unlimited",
  exclusive: "Exclusive",
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    beat: Pick<Beat, "id" | "title" | "slug" | "coverArtKey">
  })[]
}
