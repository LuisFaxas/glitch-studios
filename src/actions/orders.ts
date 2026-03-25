"use server"

import { db } from "@/lib/db"
import { orders, orderItems, beats } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDownloadUrl } from "@/lib/r2"

export async function getOrderBySessionId(sessionId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
  if (!order) return null

  const items = await db
    .select({
      id: orderItems.id,
      beatId: orderItems.beatId,
      licenseTier: orderItems.licenseTier,
      price: orderItems.price,
      licensePdfKey: orderItems.licensePdfKey,
      beatTitle: beats.title,
      beatSlug: beats.slug,
      coverArtKey: beats.coverArtKey,
      wavFileKey: beats.wavFileKey,
      stemsZipKey: beats.stemsZipKey,
      previewAudioKey: beats.previewAudioKey,
    })
    .from(orderItems)
    .innerJoin(beats, eq(orderItems.beatId, beats.id))
    .where(eq(orderItems.orderId, order.id))

  return { ...order, items }
}

export async function getOrderDownloadUrls(orderId: string, itemId: string) {
  const [item] = await db
    .select({
      licenseTier: orderItems.licenseTier,
      licensePdfKey: orderItems.licensePdfKey,
      wavFileKey: beats.wavFileKey,
      stemsZipKey: beats.stemsZipKey,
      previewAudioKey: beats.previewAudioKey,
    })
    .from(orderItems)
    .innerJoin(beats, eq(orderItems.beatId, beats.id))
    .where(eq(orderItems.id, itemId))

  if (!item) return null

  const urls: Record<string, string> = {}
  // Always include MP3 preview
  if (item.previewAudioKey)
    urls.mp3 = await getDownloadUrl(item.previewAudioKey, 86400)
  // WAV for wav_lease and above
  if (
    item.wavFileKey &&
    ["wav_lease", "stems", "unlimited", "exclusive"].includes(item.licenseTier)
  )
    urls.wav = await getDownloadUrl(item.wavFileKey, 86400)
  // Stems for stems and above
  if (
    item.stemsZipKey &&
    ["stems", "unlimited", "exclusive"].includes(item.licenseTier)
  )
    urls.stems = await getDownloadUrl(item.stemsZipKey, 86400)
  // License PDF
  if (item.licensePdfKey)
    urls.license = await getDownloadUrl(item.licensePdfKey, 86400)

  return urls
}
