import type { Brand } from "@/lib/brand"

// AUTH-13: Studios = genre tags, Tech = focus areas. Both stored in `focusTags` jsonb.
export const GENRE_TAGS = [
  "Hip-hop",
  "R&B",
  "Trap",
  "Pop",
  "Electronic",
  "Lo-fi",
  "Drill",
  "Other",
] as const

export const FOCUS_TAGS = [
  "GPUs",
  "CPUs",
  "Displays",
  "Peripherals",
  "Audio gear",
  "Full-system",
] as const

export type GenreTag = (typeof GENRE_TAGS)[number]
export type FocusTag = (typeof FOCUS_TAGS)[number]

export function getTagsForBrand(brand: Brand): readonly string[] {
  return brand === "tech" ? FOCUS_TAGS : GENRE_TAGS
}

export interface ArtistApplicationInput {
  brand: Brand
  name: string
  email: string
  bio: string
  portfolioUrl?: string
  focusTags: string[]
}
