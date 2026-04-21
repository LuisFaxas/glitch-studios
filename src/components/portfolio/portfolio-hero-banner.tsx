import Link from "next/link"
import Image from "next/image"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { PortfolioItem } from "@/types"

interface PortfolioHeroBannerProps {
  item: PortfolioItem | null
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export function PortfolioHeroBanner({ item }: PortfolioHeroBannerProps) {
  if (!item) return null

  const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
  const coverUrl =
    item.thumbnailUrl ??
    (item.isYouTubeEmbed && videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null)

  return (
    <section className="relative w-full bg-[#000000] border border-[#222222] overflow-hidden mb-6">
      <div className="relative aspect-video">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={item.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
                "radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)",
              ].join(", "),
            }}
            aria-hidden="true"
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/0 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      <div className="relative md:absolute md:inset-x-0 md:bottom-0 px-6 md:px-12 py-6 md:py-12 flex flex-col gap-4 max-w-4xl">
        {item.category && (
          <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start">
            {item.category.toUpperCase()}
          </span>
        )}

        <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] leading-tight text-[clamp(28px,5vw,48px)]">
          <GlitchHeading text={item.title}>{item.title}</GlitchHeading>
        </h2>

        {item.description && (
          <p className="font-sans text-[14px] text-[#888888] line-clamp-3 max-w-[640px] leading-relaxed">
            {item.description}
          </p>
        )}

        <Link
          href={`/portfolio/${item.slug}`}
          className="inline-block self-start bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase tracking-wide px-6 py-3 mt-2 hover:bg-[#f5f5f0]/90 transition-colors"
        >
          VIEW WORK
        </Link>
      </div>
    </section>
  )
}
