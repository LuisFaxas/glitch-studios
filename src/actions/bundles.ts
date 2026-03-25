"use server"

import { db } from "@/lib/db"
import { bundles, bundleBeats, beats, beatPricing } from "@/db/schema"
import { eq, inArray, and } from "drizzle-orm"
import { getPublicUrl } from "@/lib/r2"

export async function getPublishedBundles() {
  const activeBundles = await db
    .select()
    .from(bundles)
    .where(eq(bundles.isActive, true))
  if (activeBundles.length === 0) return []

  const bundleIds = activeBundles.map((b) => b.id)
  const junctions = await db
    .select()
    .from(bundleBeats)
    .where(inArray(bundleBeats.bundleId, bundleIds))

  const beatIds = [...new Set(junctions.map((j) => j.beatId))]
  if (beatIds.length === 0)
    return activeBundles.map((b) => ({
      ...b,
      beats: [],
      originalTotal: 0,
      discountedTotal: 0,
    }))

  const beatRows = await db
    .select()
    .from(beats)
    .where(inArray(beats.id, beatIds))
  const pricing = await db
    .select()
    .from(beatPricing)
    .where(
      and(inArray(beatPricing.beatId, beatIds), eq(beatPricing.isActive, true))
    )

  return activeBundles.map((bundle) => {
    const bundleBeatIds = junctions
      .filter((j) => j.bundleId === bundle.id)
      .map((j) => j.beatId)
    const bundleBeatsData = beatRows.filter((b) =>
      bundleBeatIds.includes(b.id)
    )

    // Calculate original total (sum of lowest active price per beat)
    const originalTotal = bundleBeatsData.reduce((sum, beat) => {
      const beatPrices = pricing
        .filter((p) => p.beatId === beat.id)
        .map((p) => Number(p.price))
      const lowestPrice = beatPrices.length > 0 ? Math.min(...beatPrices) : 0
      return sum + lowestPrice
    }, 0)

    const discountedTotal =
      originalTotal * (1 - (bundle.discountPercent ?? 0) / 100)

    return {
      ...bundle,
      beats: bundleBeatsData.map((b) => ({
        id: b.id,
        title: b.title,
        coverArtUrl: b.coverArtKey ? getPublicUrl(b.coverArtKey) : null,
      })),
      originalTotal,
      discountedTotal: Math.round(discountedTotal * 100) / 100,
    }
  })
}

export async function calculateBundleDiscount(
  beatIds: string[]
): Promise<{
  bundleId: string | null
  bundleName: string | null
  discountPercent: number
} | null> {
  const activeBundles = await db
    .select()
    .from(bundles)
    .where(eq(bundles.isActive, true))
  if (activeBundles.length === 0) return null

  const bundleIdsAll = activeBundles.map((b) => b.id)
  const junctions = await db
    .select()
    .from(bundleBeats)
    .where(inArray(bundleBeats.bundleId, bundleIdsAll))

  // Find a bundle where ALL its beats are in the cart
  for (const bundle of activeBundles) {
    const bundleBeatIds = junctions
      .filter((j) => j.bundleId === bundle.id)
      .map((j) => j.beatId)
    const allBeatsInCart = bundleBeatIds.every((id) => beatIds.includes(id))
    if (allBeatsInCart && bundleBeatIds.length > 0) {
      return {
        bundleId: bundle.id,
        bundleName: bundle.title,
        discountPercent: bundle.discountPercent ?? 0,
      }
    }
  }

  return null
}
