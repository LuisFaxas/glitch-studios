"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { bundles, bundleBeats, beats, beatPricing } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

interface BundleFormData {
  title: string
  description: string
  discountPercent: number
  coverArtKey: string | null
  isActive: boolean
  beatIds: string[]
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

export async function createBundle(data: BundleFormData) {
  await requireAdmin()
  const slug = slugify(data.title)

  const [inserted] = await db
    .insert(bundles)
    .values({
      title: data.title,
      slug,
      description: data.description,
      discountPercent: data.discountPercent,
      isActive: data.isActive,
    })
    .returning({ id: bundles.id })

  const bundleId = inserted.id

  if (data.beatIds.length > 0) {
    await db.insert(bundleBeats).values(
      data.beatIds.map((beatId) => ({
        bundleId,
        beatId,
      }))
    )
  }

  return bundleId
}

export async function updateBundle(id: string, data: BundleFormData) {
  await requireAdmin()
  const slug = slugify(data.title)

  await db
    .update(bundles)
    .set({
      title: data.title,
      slug,
      description: data.description,
      discountPercent: data.discountPercent,
      isActive: data.isActive,
    })
    .where(eq(bundles.id, id))

  // Delete existing beat assignments, re-insert
  await db.delete(bundleBeats).where(eq(bundleBeats.bundleId, id))

  if (data.beatIds.length > 0) {
    await db.insert(bundleBeats).values(
      data.beatIds.map((beatId) => ({
        bundleId: id,
        beatId,
      }))
    )
  }
}

export async function deleteBundle(id: string) {
  await requireAdmin()
  await db.delete(bundles).where(eq(bundles.id, id))
}

export async function getAllBundlesAdmin() {
  await requireAdmin()

  const allBundles = await db.query.bundles.findMany({
    orderBy: (bundles, { desc }) => [desc(bundles.createdAt)],
  })

  const allBundleBeats = await db.query.bundleBeats.findMany()
  const allBeats = await db.query.beats.findMany()

  return allBundles.map((bundle) => {
    const assignedBeatIds = allBundleBeats
      .filter((bb) => bb.bundleId === bundle.id)
      .map((bb) => bb.beatId)

    const assignedBeats = allBeats
      .filter((b) => assignedBeatIds.includes(b.id))
      .map((b) => ({ id: b.id, title: b.title }))

    return {
      ...bundle,
      beats: assignedBeats,
      beatCount: assignedBeats.length,
    }
  })
}

export async function getBundleById(id: string) {
  await requireAdmin()

  const bundle = await db.query.bundles.findFirst({
    where: eq(bundles.id, id),
  })

  if (!bundle) return null

  const assignments = await db.query.bundleBeats.findMany({
    where: eq(bundleBeats.bundleId, id),
  })

  const allBeats = await db.query.beats.findMany()
  const assignedBeats = allBeats
    .filter((b) => assignments.some((a) => a.beatId === b.id))
    .map((b) => ({ id: b.id, title: b.title }))

  return {
    ...bundle,
    beats: assignedBeats,
    beatIds: assignments.map((a) => a.beatId),
  }
}

export async function getPublishedBeatsForSelection() {
  await requireAdmin()

  const publishedBeats = await db.query.beats.findMany({
    where: eq(beats.status, "published"),
  })

  // Also get pricing for bundle price preview
  const allPricing = await db.query.beatPricing.findMany()

  return publishedBeats.map((b) => {
    const pricing = allPricing.filter((p) => p.beatId === b.id)
    const lowestPrice = pricing.length > 0
      ? Math.min(...pricing.map((p) => parseFloat(p.price)))
      : 0

    return {
      id: b.id,
      title: b.title,
      lowestPrice,
    }
  })
}
