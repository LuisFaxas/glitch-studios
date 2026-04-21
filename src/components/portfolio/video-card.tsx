"use client"

import Link from "next/link"
import Image from "next/image"
import { VideoCardPlaceholder } from "./video-card-placeholder"
import type { PortfolioItem } from "@/types"

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export function VideoCard({ item }: { item: PortfolioItem }) {
  const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
  const thumbnailUrl =
    item.isYouTubeEmbed && videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : item.thumbnailUrl || null

  const typeLabel = item.type === "case_study" ? "CASE STUDY" : "VIDEO"
  const year = item.createdAt
    ? new Date(item.createdAt).getFullYear()
    : null

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group block h-full"
    >
      <article className="relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]">
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity"
          style={{ animationDuration: "100ms" }}
          aria-hidden="true"
        />

        <div className="aspect-video relative">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <VideoCardPlaceholder title={item.title} />
          )}
        </div>

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
            <p className="line-clamp-2 text-[#888888] font-sans text-[13px] mt-2">
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
