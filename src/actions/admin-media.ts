"use server"

import { eq, ilike, like, sql, desc } from "drizzle-orm"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { db } from "@/lib/db"
import { mediaAssets } from "@/db/schema"
import { requirePermission } from "@/lib/permissions"
import { getUploadUrl, getPublicUrl, r2Client } from "@/lib/r2"

const PAGE_SIZE = 24

/**
 * Step 1: Client calls this to get a presigned upload URL.
 * Only metadata is sent -- NO file data touches the server.
 */
export async function getMediaUploadUrl(data: {
  filename: string
  mimeType: string
  size: number
}): Promise<{ uploadUrl: string; key: string }> {
  await requirePermission("manage_media")

  const slugifiedName = data.filename
    .replace(/[^a-z0-9.]/gi, "-")
    .toLowerCase()
  const key = `media/${Date.now()}-${slugifiedName}`
  const uploadUrl = await getUploadUrl(key, data.mimeType)
  return { uploadUrl, key }
}

/**
 * Step 2: After client uploads file directly to R2, record metadata in DB.
 */
export async function confirmMediaUpload(data: {
  key: string
  filename: string
  mimeType: string
  size: number
  width?: number
  height?: number
  duration?: number
  alt?: string
}) {
  const session = await requirePermission("manage_media")

  const url = getPublicUrl(data.key)
  const [asset] = await db
    .insert(mediaAssets)
    .values({
      key: data.key,
      filename: data.filename,
      url,
      mimeType: data.mimeType,
      size: data.size,
      width: data.width ?? null,
      height: data.height ?? null,
      duration: data.duration ?? null,
      alt: data.alt ?? null,
      uploadedBy: session.user.id,
    })
    .returning()
  return asset
}

/**
 * Update alt text for a media asset.
 */
export async function updateMediaAlt(mediaId: string, alt: string) {
  await requirePermission("manage_media")
  await db.update(mediaAssets).set({ alt }).where(eq(mediaAssets.id, mediaId))
}

/**
 * Delete a media asset from R2 and DB.
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  await requirePermission("manage_media")

  const [asset] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId))

  if (asset) {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: asset.key,
      })
    )
    await db.delete(mediaAssets).where(eq(mediaAssets.id, mediaId))
  }
}

/**
 * Query media assets with filters and pagination.
 */
export async function getMediaAssets(filters?: {
  type?: string
  search?: string
  page?: number
}): Promise<{
  items: (typeof mediaAssets.$inferSelect)[]
  totalPages: number
  currentPage: number
}> {
  const page = filters?.page ?? 1
  const conditions: ReturnType<typeof eq>[] = []

  if (filters?.type && filters.type !== "all") {
    conditions.push(like(mediaAssets.mimeType, `${filters.type}/%`))
  }

  if (filters?.search) {
    conditions.push(ilike(mediaAssets.filename, `%${filters.search}%`))
  }

  const whereClause =
    conditions.length > 0
      ? conditions.reduce(
          (acc, cond) => sql`${acc} AND ${cond}`,
          sql`TRUE`
        )
      : undefined

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mediaAssets)
    .where(whereClause)

  const totalCount = countResult?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const items = await db
    .select()
    .from(mediaAssets)
    .where(whereClause)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)

  return { items, totalPages, currentPage: page }
}
