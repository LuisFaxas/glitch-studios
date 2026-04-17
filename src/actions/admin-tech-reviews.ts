"use server"

import { db } from "@/lib/db"
import {
  techReviews,
  techReviewPros,
  techReviewCons,
  techReviewGallery,
  techProducts,
  user,
} from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { requirePermission } from "@/lib/permissions"
import { slugify } from "@/lib/slugify"
import { revalidatePath } from "next/cache"

export interface ReviewFormInput {
  productId: string
  reviewerId: string
  title: string
  slug: string | null
  verdict: string
  bodyHtml: string
  ratingPerformance: number
  ratingBuild: number
  ratingValue: number
  ratingDesign: number
  overallOverride: number | null
  heroImageId: string
  videoUrl: string | null
  audienceFor: string | null
  audienceNotFor: string | null
  pros: string[]
  cons: string[]
  galleryMediaIds: string[]
}

export interface ReviewListRow {
  id: string
  title: string
  slug: string
  productId: string
  productName: string | null
  reviewerName: string
  status: "draft" | "published"
  updatedAt: Date
  publishedAt: Date | null
}

export async function listReviews(): Promise<ReviewListRow[]> {
  const rows = await db
    .select({
      id: techReviews.id,
      title: techReviews.title,
      slug: techReviews.slug,
      productId: techReviews.productId,
      productName: techProducts.name,
      reviewerName: user.name,
      status: techReviews.status,
      updatedAt: techReviews.updatedAt,
      publishedAt: techReviews.publishedAt,
    })
    .from(techReviews)
    .leftJoin(techProducts, eq(techReviews.productId, techProducts.id))
    .leftJoin(user, eq(techReviews.reviewerId, user.id))
    .orderBy(desc(techReviews.updatedAt))
  return rows.map((r) => ({ ...r, reviewerName: r.reviewerName ?? "Unknown" }))
}

export async function getReview(id: string) {
  const review = await db.query.techReviews.findFirst({
    where: eq(techReviews.id, id),
  })
  if (!review) return null

  const [pros, cons, gallery] = await Promise.all([
    db
      .select({ text: techReviewPros.text, sortOrder: techReviewPros.sortOrder })
      .from(techReviewPros)
      .where(eq(techReviewPros.reviewId, id))
      .orderBy(techReviewPros.sortOrder),
    db
      .select({ text: techReviewCons.text, sortOrder: techReviewCons.sortOrder })
      .from(techReviewCons)
      .where(eq(techReviewCons.reviewId, id))
      .orderBy(techReviewCons.sortOrder),
    db
      .select({ mediaId: techReviewGallery.mediaId, sortOrder: techReviewGallery.sortOrder })
      .from(techReviewGallery)
      .where(eq(techReviewGallery.reviewId, id))
      .orderBy(techReviewGallery.sortOrder),
  ])

  return {
    ...review,
    pros: pros.map((p) => p.text),
    cons: cons.map((c) => c.text),
    galleryMediaIds: gallery.map((g) => g.mediaId),
  }
}

async function resolveUniqueReviewSlug(base: string, excludeId?: string): Promise<string> {
  if (!base) throw new Error("Title produces an empty slug")
  let suffix = 0
  while (true) {
    const candidate = suffix === 0 ? base : `${base}-${suffix}`
    const row = await db.query.techReviews.findFirst({
      where: eq(techReviews.slug, candidate),
    })
    if (!row || row.id === excludeId) return candidate
    suffix++
  }
}

export async function upsertReview(
  id: string | null,
  data: ReviewFormInput,
): Promise<{ id: string }> {
  await requirePermission("manage_content")
  if (!data.title.trim()) throw new Error("Title is required")
  if (!data.productId) throw new Error("Product is required")
  if (!data.heroImageId) throw new Error("Hero image is required")
  for (const field of ["ratingPerformance", "ratingBuild", "ratingValue", "ratingDesign"] as const) {
    const v = data[field]
    if (!Number.isInteger(v) || v < 1 || v > 10) {
      throw new Error("Rating must be integer 1-10")
    }
  }

  const slugBase = data.slug?.trim() || slugify(data.title)
  const slug = await resolveUniqueReviewSlug(slugBase, id ?? undefined)

  let resolvedId: string
  if (id === null) {
    const [inserted] = await db
      .insert(techReviews)
      .values({
        productId: data.productId,
        reviewerId: data.reviewerId,
        title: data.title.trim(),
        slug,
        verdict: data.verdict.trim(),
        bodyHtml: data.bodyHtml,
        ratingPerformance: data.ratingPerformance,
        ratingBuild: data.ratingBuild,
        ratingValue: data.ratingValue,
        ratingDesign: data.ratingDesign,
        overallOverride: data.overallOverride !== null ? String(data.overallOverride) : null,
        heroImageId: data.heroImageId,
        videoUrl: data.videoUrl?.trim() || null,
        audienceFor: data.audienceFor?.trim() || null,
        audienceNotFor: data.audienceNotFor?.trim() || null,
        status: "draft",
      })
      .returning({ id: techReviews.id })
    resolvedId = inserted.id
  } else {
    await db
      .update(techReviews)
      .set({
        productId: data.productId,
        reviewerId: data.reviewerId,
        title: data.title.trim(),
        slug,
        verdict: data.verdict.trim(),
        bodyHtml: data.bodyHtml,
        ratingPerformance: data.ratingPerformance,
        ratingBuild: data.ratingBuild,
        ratingValue: data.ratingValue,
        ratingDesign: data.ratingDesign,
        overallOverride: data.overallOverride !== null ? String(data.overallOverride) : null,
        heroImageId: data.heroImageId,
        videoUrl: data.videoUrl?.trim() || null,
        audienceFor: data.audienceFor?.trim() || null,
        audienceNotFor: data.audienceNotFor?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(techReviews.id, id))
    resolvedId = id
  }

  await db.delete(techReviewPros).where(eq(techReviewPros.reviewId, resolvedId))
  await db.delete(techReviewCons).where(eq(techReviewCons.reviewId, resolvedId))
  await db.delete(techReviewGallery).where(eq(techReviewGallery.reviewId, resolvedId))

  for (let i = 0; i < data.pros.length; i++) {
    const t = data.pros[i].trim()
    if (!t) continue
    await db.insert(techReviewPros).values({
      reviewId: resolvedId,
      text: t,
      sortOrder: (i + 1) * 100,
    })
  }
  for (let i = 0; i < data.cons.length; i++) {
    const t = data.cons[i].trim()
    if (!t) continue
    await db.insert(techReviewCons).values({
      reviewId: resolvedId,
      text: t,
      sortOrder: (i + 1) * 100,
    })
  }
  for (let i = 0; i < data.galleryMediaIds.length; i++) {
    await db.insert(techReviewGallery).values({
      reviewId: resolvedId,
      mediaId: data.galleryMediaIds[i],
      sortOrder: (i + 1) * 100,
    })
  }

  revalidatePath("/admin/tech/reviews")
  revalidatePath(`/admin/tech/reviews/${resolvedId}/edit`)
  return { id: resolvedId }
}

export async function publishReview(id: string): Promise<void> {
  await requirePermission("manage_content")
  await db
    .update(techReviews)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(techReviews.id, id))
  revalidatePath("/admin/tech/reviews")
  revalidatePath(`/admin/tech/reviews/${id}/edit`)
}

export async function unpublishReview(id: string): Promise<void> {
  await requirePermission("manage_content")
  await db
    .update(techReviews)
    .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
    .where(eq(techReviews.id, id))
  revalidatePath("/admin/tech/reviews")
  revalidatePath(`/admin/tech/reviews/${id}/edit`)
}

export async function deleteReview(id: string): Promise<void> {
  await requirePermission("manage_content")
  await db.delete(techReviews).where(eq(techReviews.id, id))
  revalidatePath("/admin/tech/reviews")
}
