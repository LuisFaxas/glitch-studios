"use server"

import { db } from "@/lib/db"
import { beats, beatPricing, beatProducers, licenseTierDefs } from "@/db/schema"
import { eq, ilike, and, gte, lte, inArray, or, sql } from "drizzle-orm"
import { getPublicUrl } from "@/lib/r2"
import type { BeatSummary } from "@/types/beats"

export interface BeatFilters {
  genre?: string
  bpmMin?: number
  bpmMax?: number
  key?: string
  mood?: string
  search?: string
}

export async function getPublishedBeats(
  filters: BeatFilters = {}
): Promise<BeatSummary[]> {
  const conditions = [eq(beats.status, "published")]

  if (filters.genre) conditions.push(eq(beats.genre, filters.genre))
  if (filters.bpmMin) conditions.push(gte(beats.bpm, filters.bpmMin))
  if (filters.bpmMax) conditions.push(lte(beats.bpm, filters.bpmMax))
  if (filters.key) conditions.push(eq(beats.key, filters.key))
  if (filters.mood)
    conditions.push(sql`${filters.mood} = ANY(${beats.moods})`)
  if (filters.search) {
    conditions.push(
      or(
        ilike(beats.title, `%${filters.search}%`),
        ilike(beats.genre, `%${filters.search}%`),
        sql`EXISTS (SELECT 1 FROM unnest(${beats.moods}) AS m WHERE m ILIKE ${
          "%" + filters.search + "%"
        })`
      )!
    )
  }

  const beatRows = await db
    .select()
    .from(beats)
    .where(and(...conditions))
    .orderBy(beats.sortOrder)

  const beatIds = beatRows.map((b) => b.id)
  if (beatIds.length === 0) return []

  const pricing = await db
    .select()
    .from(beatPricing)
    .where(inArray(beatPricing.beatId, beatIds))
  const producers = await db
    .select()
    .from(beatProducers)
    .where(inArray(beatProducers.beatId, beatIds))

  return beatRows.map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    bpm: b.bpm,
    key: b.key,
    genre: b.genre,
    moods: b.moods,
    description: b.description,
    coverArtUrl: b.coverArtKey ? getPublicUrl(b.coverArtKey) : null,
    previewAudioUrl: b.previewAudioKey
      ? getPublicUrl(b.previewAudioKey)
      : null,
    waveformPeaks: b.waveformPeaks ?? null,
    midiFileUrl: b.midiFileKey ? getPublicUrl(b.midiFileKey) : null,
    status: b.status ?? "draft",
    pricing: pricing
      .filter((p) => p.beatId === b.id)
      .map((p) => ({
        tier: p.tier,
        price: p.price,
        isActive: p.isActive,
      })),
    producers: producers
      .filter((p) => p.beatId === b.id)
      .map((p) => ({
        name: p.name,
        splitPercent: p.splitPercent,
      })),
  }))
}

export async function getBeatFilterOptions(): Promise<{
  genres: string[]
  keys: string[]
  moods: string[]
}> {
  const allBeats = await db
    .select({
      genre: beats.genre,
      key: beats.key,
      moods: beats.moods,
    })
    .from(beats)
    .where(eq(beats.status, "published"))

  const genres = [...new Set(allBeats.map((b) => b.genre))].sort()
  const keys = [...new Set(allBeats.map((b) => b.key))].sort()
  const moods = [...new Set(allBeats.flatMap((b) => b.moods ?? []))].sort()

  return { genres, keys, moods }
}

export async function getLicenseTierDefs() {
  return db.select().from(licenseTierDefs).orderBy(licenseTierDefs.sortOrder)
}
