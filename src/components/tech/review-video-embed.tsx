import { extractYouTubeId } from "@/lib/tech/youtube"
import { getMediaForEntity } from "@/lib/media/queries"
import { MediaEmbed } from "@/components/media/media-embed"
import { GlitchHeading } from "@/components/ui/glitch-heading"

interface ReviewVideoEmbedProps {
  videoUrl: string | null
  reviewTitle: string
  reviewId?: string
}

/**
 * Tech review video section.
 *
 * Per CONTEXT D-07: prefer media_item rows; fall back to legacy
 * tech_reviews.video_url for one release. RESEARCH Pitfall 7 documents
 * this precedence rule.
 */
export async function ReviewVideoEmbed({
  videoUrl,
  reviewTitle,
  reviewId,
}: ReviewVideoEmbedProps) {
  let externalId: string | null = null
  let title: string = reviewTitle
  let thumbnailUrl: string | null = null

  if (reviewId) {
    const items = await getMediaForEntity("tech_review", reviewId)
    const primary = items.find((i) => i.isPrimary) ?? items[0]
    if (primary) {
      externalId = primary.externalId
      title = primary.title ?? reviewTitle
      thumbnailUrl = primary.thumbnailUrl
    }
  }
  if (!externalId) {
    externalId = extractYouTubeId(videoUrl)
  }
  if (!externalId) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
        <GlitchHeading text="Video Review">Video Review</GlitchHeading>
      </h2>
      <MediaEmbed
        externalId={externalId}
        title={title}
        thumbnailUrl={thumbnailUrl}
        sizes="(max-width: 768px) 100vw, 1280px"
      />
    </section>
  )
}
