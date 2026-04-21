import Link from "next/link"
import Image from "next/image"
import { ReadingTimeBadge } from "./reading-time-badge"
import { readingTimeCached } from "@/lib/reading-time"
import type { BlogPost, BlogCategory } from "@/types"

interface BlogHeroBannerProps {
  post: (BlogPost & { category?: BlogCategory | null }) | null
}

export function BlogHeroBanner({ post }: BlogHeroBannerProps) {
  if (!post) return null

  const minutes = readingTimeCached(post.content)
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        .toUpperCase()
        .replace(",", "")
    : null

  return (
    <section className="relative w-full bg-[#000000] border border-[#222222] overflow-hidden mb-6">
      <div className="relative aspect-video">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
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
        {post.category && (
          <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start">
            {post.category.name.toUpperCase()}
          </span>
        )}

        <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] leading-tight text-[clamp(28px,5vw,48px)]">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="font-sans text-[14px] text-[#888888] line-clamp-3 max-w-[640px] leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-2">
          <ReadingTimeBadge minutes={minutes} />
          {formattedDate && (
            <>
              <span className="text-[#555555]" aria-hidden="true">
                ·
              </span>
              <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                {formattedDate}
              </time>
            </>
          )}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-block self-start bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase tracking-wide px-6 py-3 mt-2 hover:bg-[#f5f5f0]/90 transition-colors"
        >
          READ POST
        </Link>
      </div>
    </section>
  )
}
