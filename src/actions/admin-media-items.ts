"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { eq, and, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { mediaItems } from "@/db/schema"
import { requirePermission } from "@/lib/permissions"
import { extractYouTubeId } from "@/lib/tech/youtube"
import { fetchYouTubeOEmbed } from "@/lib/media/youtube-oembed"

/**
 * Sentinel UUID used as media_item.attached_to_id when attached_to_type='home_feature'.
 * Per RESEARCH "Home Features Modeling" Option A: home_feature rows are full
 * media_item rows with this fixed sentinel rather than a separate join table.
 * The same YouTube video may exist in multiple media_item rows (one per
 * entity attachment + one for the home feature). Each is independently editable.
 */
const HOME_FEATURE_SENTINEL_ID = "00000000-0000-0000-0000-000000000000"

const ATTACH_TYPES = [
  "beat",
  "portfolio_item",
  "service",
  "tech_review",
  "home_feature",
] as const
export type AttachType = (typeof ATTACH_TYPES)[number]

// ---------------- attachMediaItem ----------------

const attachSchema = z.object({
  attachedToType: z.enum(ATTACH_TYPES),
  attachedToId: z.string().uuid(),
  url: z.string().url(),
})

export async function attachMediaItem(input: {
  attachedToType: AttachType
  attachedToId: string
  url: string
}) {
  const session = await requirePermission("manage_content")

  const parsed = attachSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(
      "That URL doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.",
    )
  }

  const externalId = extractYouTubeId(parsed.data.url)
  if (!externalId) {
    throw new Error(
      "That URL doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.",
    )
  }

  const meta = await fetchYouTubeOEmbed(parsed.data.url)

  const maxRow = await db
    .select({
      maxOrder: sql<number>`COALESCE(MAX(${mediaItems.sortOrder}), -1)`,
    })
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.attachedToType, parsed.data.attachedToType),
        eq(mediaItems.attachedToId, parsed.data.attachedToId),
      ),
    )
  const maxOrder = Number(maxRow[0]?.maxOrder ?? -1)

  const [inserted] = await db
    .insert(mediaItems)
    .values({
      kind: "youtube_video",
      externalId,
      externalUrl: parsed.data.url,
      title: meta?.title ?? "Untitled video",
      description: null,
      thumbnailUrl: meta?.thumbnail_url ?? null,
      durationSec: null,
      attachedToType: parsed.data.attachedToType,
      attachedToId: parsed.data.attachedToId,
      isPrimary: maxOrder === -1,
      sortOrder: maxOrder + 1,
      createdBy: session.user.id,
    })
    .returning({ id: mediaItems.id })

  revalidateForType(parsed.data.attachedToType)
  return { id: inserted.id }
}

// ---------------- updateMediaItem (admin edit title/description) ----------------

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
})

export async function updateMediaItem(input: z.infer<typeof updateSchema>) {
  await requirePermission("manage_content")
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  const [updated] = await db
    .update(mediaItems)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      updatedAt: new Date(),
    })
    .where(eq(mediaItems.id, parsed.data.id))
    .returning({
      attachedToType: mediaItems.attachedToType,
    })

  if (updated) revalidateForType(updated.attachedToType as AttachType)
}

// ---------------- removeMediaItem ----------------

export async function removeMediaItem(id: string) {
  await requirePermission("manage_content")

  const [row] = await db
    .delete(mediaItems)
    .where(eq(mediaItems.id, id))
    .returning({
      attachedToType: mediaItems.attachedToType,
    })

  if (row) revalidateForType(row.attachedToType as AttachType)
}

// ---------------- reorderMediaItems ----------------

const reorderSchema = z.object({
  attachedToType: z.enum(ATTACH_TYPES),
  attachedToId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()),
})

export async function reorderMediaItems(input: z.infer<typeof reorderSchema>) {
  await requirePermission("manage_content")
  const parsed = reorderSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  await db.transaction(async (tx) => {
    for (let i = 0; i < parsed.data.orderedIds.length; i++) {
      await tx
        .update(mediaItems)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(
          and(
            eq(mediaItems.id, parsed.data.orderedIds[i]),
            eq(mediaItems.attachedToType, parsed.data.attachedToType),
            eq(mediaItems.attachedToId, parsed.data.attachedToId),
          ),
        )
    }
  })

  revalidateForType(parsed.data.attachedToType)
}

// ---------------- setPrimaryMediaItem ----------------

const setPrimarySchema = z.object({
  id: z.string().uuid(),
})

/**
 * Mark the given media_item as is_primary=true and clear is_primary on
 * its siblings (same attached_to_type + attached_to_id). App-level
 * invariant per D-08; no DB constraint.
 */
export async function setPrimaryMediaItem(input: z.infer<typeof setPrimarySchema>) {
  await requirePermission("manage_content")
  const parsed = setPrimarySchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  const [target] = await db
    .select({
      attachedToType: mediaItems.attachedToType,
      attachedToId: mediaItems.attachedToId,
    })
    .from(mediaItems)
    .where(eq(mediaItems.id, parsed.data.id))

  if (!target) throw new Error("Media item not found")

  await db.transaction(async (tx) => {
    await tx
      .update(mediaItems)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(
        and(
          eq(mediaItems.attachedToType, target.attachedToType),
          eq(mediaItems.attachedToId, target.attachedToId),
        ),
      )
    await tx
      .update(mediaItems)
      .set({ isPrimary: true, updatedAt: new Date() })
      .where(eq(mediaItems.id, parsed.data.id))
  })

  revalidateForType(target.attachedToType as AttachType)
}

// ---------------- pinToHomeFeatures ----------------

const pinSchema = z.object({
  sourceMediaItemId: z.string().uuid(),
})

/**
 * "Pin to home" creates a NEW media_item row with attached_to_type='home_feature'
 * (Option A from RESEARCH "Home Features Modeling"). The source row stays
 * attached to its own entity. The two rows are independently editable.
 */
export async function pinToHomeFeatures(input: z.infer<typeof pinSchema>) {
  const session = await requirePermission("manage_content")
  const parsed = pinSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  const [source] = await db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.id, parsed.data.sourceMediaItemId))
  if (!source) throw new Error("Source media item not found")

  const maxRow = await db
    .select({
      maxOrder: sql<number>`COALESCE(MAX(${mediaItems.sortOrder}), -1)`,
    })
    .from(mediaItems)
    .where(eq(mediaItems.attachedToType, "home_feature"))
  const maxOrder = Number(maxRow[0]?.maxOrder ?? -1)

  const [inserted] = await db
    .insert(mediaItems)
    .values({
      kind: source.kind,
      externalId: source.externalId,
      externalUrl: source.externalUrl,
      title: source.title,
      description: source.description,
      thumbnailUrl: source.thumbnailUrl,
      durationSec: source.durationSec,
      attachedToType: "home_feature",
      attachedToId: HOME_FEATURE_SENTINEL_ID,
      isPrimary: false,
      sortOrder: maxOrder + 1,
      createdBy: session.user.id,
    })
    .returning({ id: mediaItems.id })

  revalidatePath("/")
  return { id: inserted.id }
}

// ---------------- setHomeFeatures (reorder home_feature rows) ----------------

const setHomeFeaturesSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
})

/**
 * Reorder existing home_feature media_item rows. Hard cap of 3 visible
 * is enforced at the public read site (getHomeFeatureMedia .limit(3)) and
 * called out in admin copy ("Only the top 3 by sort order appear...").
 * Per Pitfall 9: do NOT enforce cap at write — admin can over-pin and reorder.
 */
export async function setHomeFeatures(input: z.infer<typeof setHomeFeaturesSchema>) {
  await requirePermission("manage_content")
  const parsed = setHomeFeaturesSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  await db.transaction(async (tx) => {
    for (let i = 0; i < parsed.data.orderedIds.length; i++) {
      await tx
        .update(mediaItems)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(
          and(
            eq(mediaItems.id, parsed.data.orderedIds[i]),
            eq(mediaItems.attachedToType, "home_feature"),
          ),
        )
    }
  })

  revalidatePath("/")
}

// ---------------- revalidation helper ----------------

function revalidateForType(t: AttachType) {
  revalidatePath("/")
  switch (t) {
    case "portfolio_item":
      revalidatePath("/portfolio")
      revalidatePath("/portfolio/[slug]", "page")
      break
    case "tech_review":
      revalidatePath("/tech")
      revalidatePath("/tech/reviews/[slug]", "page")
      break
    case "beat":
      revalidatePath("/beats")
      revalidatePath("/beats/[slug]", "page")
      break
    case "service":
      revalidatePath("/services")
      break
    case "home_feature":
      break
  }
}
