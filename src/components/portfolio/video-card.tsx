"use client"

import Link from "next/link"
import { VideoCardPlaceholder } from "./video-card-placeholder"
import { MediaEmbed } from "@/components/media/media-embed"
import { extractYouTubeId } from "@/lib/tech/youtube"
import type { PortfolioItem } from "@/types"

export function VideoCard({ item }: { item: PortfolioItem }) {
  const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null

  const typeLabel = item.type === "case_study" ? "CASE STUDY" : "VIDEO"
  const year = item.createdAt ? new Date(item.createdAt).getFullYear() : null

  return (
    <Link href={`/portfolio/${item.slug}`} className="group block h-full">
      <article className="relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]">
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity"
          style={{ animationDuration: "100ms" }}
          aria-hidden="true"
        />

        {item.isYouTubeEmbed && videoId ? (
          <MediaEmbed
            externalId={videoId}
            title={item.title}
            thumbnailUrl={item.thumbnailUrl ?? null}
            mode="thumbnailOnly"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : item.thumbnailUrl ? (
          <div className="aspect-video relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video relative">
            <VideoCardPlaceholder title={item.title} />
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          {item.category && (
            <span className="bg-[#222222] text-[#888888] text-[11px] font-sans px-2 py-1 rounded-none inline-block mb-2 self-start">
              {item.category}
            </span>
          )}
          <h3 className="font-mono font-bold text-lg text-[#f5f5f0] line-clamp-2 mt-2">
            {item.title}
          </h3>
          {item.description && (
            <p className="line-clamp-2 text-[#888888] font-sans text-sm mt-2">
              {item.description}
            </p>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888] bg-[#0a0a0a] px-2 py-1">
              {typeLabel}
            </span>
            {year && (
              <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                {year}
              </time>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
