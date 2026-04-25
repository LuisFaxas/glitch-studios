"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MediaEmbed } from "@/components/media/media-embed"
import { extractYouTubeId } from "@/lib/tech/youtube"
import type { PortfolioItem } from "@/types"

export function VideoDetailLayout({ item }: { item: PortfolioItem }) {
  const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
  const year = item.createdAt ? new Date(item.createdAt).getFullYear() : null

  return (
    <div>
      <div className="relative max-h-[70vh] w-full bg-[#111111]">
        {videoId ? (
          <MediaEmbed
            externalId={videoId}
            title={item.title}
            thumbnailUrl={item.thumbnailUrl ?? null}
            sizes="100vw"
            priority
          />
        ) : item.thumbnailUrl ? (
          <div className="aspect-video relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-[#111111]" />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono">Back to Portfolio</span>
        </Link>

        <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight mb-4 text-[#f5f5f0]">
          {item.title}
        </h1>

        {item.category && (
          <span className="inline-block bg-[#222222] text-[#888888] text-[11px] font-sans px-2 py-1 rounded-none mb-6">
            {item.category}
          </span>
        )}

        {item.description && (
          <p className="text-[#f5f5f0] leading-relaxed text-lg mb-8">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#222222]">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888] bg-[#0a0a0a] px-2 py-1">
            VIDEO
          </span>
          {year && (
            <>
              <span className="text-[#555555]" aria-hidden="true">·</span>
              <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                {year}
              </time>
            </>
          )}
          {item.clientName && (
            <>
              <span className="text-[#555555]" aria-hidden="true">·</span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                {item.clientName}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
