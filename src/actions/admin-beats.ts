"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { beats, beatPricing, beatProducers } from "@/db/schema"
import { getUploadUrl } from "@/lib/r2"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import type { LicenseTier } from "@/types/beats"

interface BeatFormData {
  title: string
  bpm: number
  key: string
  genre: string
  moods: string[]
  description: string
  coverArtKey: string | null
  previewAudioKey: string | null
  wavFileKey: string | null
  stemsZipKey: string | null
  midiFileKey: string | null
  status: "draft" | "published"
  pricing: { tier: LicenseTier; price: number }[]
  producers: { name: string; splitPercent: number }[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: admin access required")
  }
  return session
}

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string
) {
  await requireAdmin()
  const key = `beats/${Date.now()}-${slugify(filename)}`
  const url = await getUploadUrl(key, contentType)
  return { url, key }
}

export async function createBeat(data: BeatFormData) {
  await requireAdmin()
  const slug = slugify(data.title)

  const [inserted] = await db
    .insert(beats)
    .values({
      title: data.title,
      slug,
      bpm: data.bpm,
      key: data.key,
      genre: data.genre,
      moods: data.moods,
      description: data.description,
      coverArtKey: data.coverArtKey,
      previewAudioKey: data.previewAudioKey,
      wavFileKey: data.wavFileKey,
      stemsZipKey: data.stemsZipKey,
      midiFileKey: data.midiFileKey,
      status: data.status,
    })
    .returning({ id: beats.id })

  const beatId = inserted.id

  if (data.pricing.length > 0) {
    await db.insert(beatPricing).values(
      data.pricing.map((p) => ({
        beatId,
        tier: p.tier,
        price: p.price.toFixed(2),
      }))
    )
  }

  if (data.producers.length > 0) {
    await db.insert(beatProducers).values(
      data.producers.map((p) => ({
        beatId,
        name: p.name,
        splitPercent: p.splitPercent,
      }))
    )
  }

  return beatId
}

export async function updateBeat(id: string, data: BeatFormData) {
  await requireAdmin()
  const slug = slugify(data.title)

  await db
    .update(beats)
    .set({
      title: data.title,
      slug,
      bpm: data.bpm,
      key: data.key,
      genre: data.genre,
      moods: data.moods,
      description: data.description,
      coverArtKey: data.coverArtKey,
      previewAudioKey: data.previewAudioKey,
      wavFileKey: data.wavFileKey,
      stemsZipKey: data.stemsZipKey,
      midiFileKey: data.midiFileKey,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(beats.id, id))

  // Delete existing pricing and producers, re-insert
  await db.delete(beatPricing).where(eq(beatPricing.beatId, id))
  await db.delete(beatProducers).where(eq(beatProducers.beatId, id))

  if (data.pricing.length > 0) {
    await db.insert(beatPricing).values(
      data.pricing.map((p) => ({
        beatId: id,
        tier: p.tier,
        price: p.price.toFixed(2),
      }))
    )
  }

  if (data.producers.length > 0) {
    await db.insert(beatProducers).values(
      data.producers.map((p) => ({
        beatId: id,
        name: p.name,
        splitPercent: p.splitPercent,
      }))
    )
  }
}

export async function deleteBeat(id: string) {
  await requireAdmin()
  await db.delete(beats).where(eq(beats.id, id))
}

export async function getAllBeatsAdmin() {
  await requireAdmin()

  const allBeats = await db.query.beats.findMany({
    orderBy: (beats, { desc }) => [desc(beats.createdAt)],
  })

  const allPricing = await db.query.beatPricing.findMany()
  const allProducers = await db.query.beatProducers.findMany()

  return allBeats.map((beat) => ({
    ...beat,
    pricing: allPricing
      .filter((p) => p.beatId === beat.id)
      .map((p) => ({ tier: p.tier, price: p.price, isActive: p.isActive })),
    producers: allProducers
      .filter((p) => p.beatId === beat.id)
      .map((p) => ({ name: p.name, splitPercent: p.splitPercent })),
  }))
}

export async function getBeatById(id: string) {
  await requireAdmin()

  const beat = await db.query.beats.findFirst({
    where: eq(beats.id, id),
  })

  if (!beat) return null

  const pricing = await db.query.beatPricing.findMany({
    where: eq(beatPricing.beatId, id),
  })

  const producers = await db.query.beatProducers.findMany({
    where: eq(beatProducers.beatId, id),
  })

  return {
    ...beat,
    pricing: pricing.map((p) => ({
      tier: p.tier,
      price: p.price,
      isActive: p.isActive,
    })),
    producers: producers.map((p) => ({
      name: p.name,
      splitPercent: p.splitPercent,
    })),
  }
}
