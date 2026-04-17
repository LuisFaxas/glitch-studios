import { extractYouTubeId } from "@/lib/tech/youtube"

interface ReviewVideoEmbedProps {
  videoUrl: string | null
  reviewTitle: string
}

export function ReviewVideoEmbed({ videoUrl, reviewTitle }: ReviewVideoEmbedProps) {
  const id = extractYouTubeId(videoUrl)
  if (!id) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
        Video Review
      </h2>
      <div className="relative aspect-video w-full overflow-hidden border border-[#222] bg-[#0a0a0a]">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={`${reviewTitle} — video review`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </section>
  )
}
