export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { db } from "@/lib/db"
import { mediaAssets } from "@/db/schema"
import { inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getReview, listReviewers } from "@/actions/admin-tech-reviews"
import { listProducts } from "@/actions/admin-tech-products"
import { ReviewEditor } from "@/components/admin/tech/review-editor"
import { getMediaForEntity } from "@/lib/media/queries"
import { MediaItemAttachmentList } from "@/components/media/media-item-attachment-list"

export default async function EditTechReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [review, products, reviewers, session] = await Promise.all([
    getReview(id),
    listProducts(),
    listReviewers(),
    auth.api.getSession({ headers: await headers() }),
  ])
  if (!review) notFound()

  const assetIds = [review.heroImageId, ...review.galleryMediaIds].filter(
    (v): v is string => typeof v === "string"
  )
  const assets =
    assetIds.length > 0
      ? await db
          .select({ id: mediaAssets.id, url: mediaAssets.url })
          .from(mediaAssets)
          .where(inArray(mediaAssets.id, assetIds))
      : []
  const assetById = new Map(assets.map((a) => [a.id, a.url]))
  const heroImageUrl = review.heroImageId ? assetById.get(review.heroImageId) ?? null : null
  const galleryUrls = review.galleryMediaIds.map((mid) => ({
    id: mid,
    url: assetById.get(mid) ?? "",
  }))

  const initialReviewerId = session?.user.id ?? reviewers[0]?.id ?? ""
  const mediaRows = await getMediaForEntity("tech_review", id)

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link
          href={`/admin/tech/reviews/${id}/ingest`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Import Benchmark Data
        </Link>
      </div>
      <ReviewEditor
      mode="edit"
      reviewId={id}
      initialReviewerId={initialReviewerId}
      products={products}
      reviewers={reviewers}
      galleryUrls={galleryUrls}
      initial={{
        productId: review.productId,
        reviewerId: review.reviewerId,
        title: review.title,
        slug: review.slug,
        verdict: review.verdict,
        bodyHtml: review.bodyHtml,
        ratingPerformance: review.ratingPerformance,
        ratingBuild: review.ratingBuild,
        ratingValue: review.ratingValue,
        ratingDesign: review.ratingDesign,
        overallOverride: review.overallOverride !== null ? Number(review.overallOverride) : null,
        heroImageId: review.heroImageId,
        heroImageUrl,
        videoUrl: review.videoUrl,
        audienceFor: review.audienceFor,
        audienceNotFor: review.audienceNotFor,
        pros: review.pros,
        cons: review.cons,
        galleryMediaIds: review.galleryMediaIds,
        status: review.status,
      }}
    />
    <div className="mt-8">
      <MediaItemAttachmentList
        attachedToType="tech_review"
        attachedToId={id}
        entityNoun="review"
        initialItems={mediaRows.map((m) => ({
          id: m.id,
          kind: m.kind,
          externalId: m.externalId,
          title: m.title,
          thumbnailUrl: m.thumbnailUrl,
          isPrimary: m.isPrimary,
          sortOrder: m.sortOrder,
        }))}
      />
    </div>
    </>
  )
}
