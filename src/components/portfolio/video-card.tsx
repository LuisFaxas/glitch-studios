"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import clsx from "clsx"
import type { PortfolioItem } from "@/types"

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export function VideoCard({ item }: { item: PortfolioItem }) {
  const [playing, setPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
  const isCaseStudy = item.type === "case_study"

  const thumbnailUrl = item.isYouTubeEmbed && videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : item.thumbnailUrl || null

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  return (
    <div
      className="relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 hover:border-[#444444]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glitch hover animation overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 animate-glitch-hover motion-reduce:hidden"
          style={{ animationDuration: "100ms" }}
          aria-hidden="true"
        />
      )}

      {/* Media area */}
      <div className="relative aspect-video bg-[#111111]">
        {playing && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[#111111]" />
            )}

            {isCaseStudy ? (
              <Link
                href={`/portfolio/${item.slug}`}
                className="absolute inset-0 flex items-center justify-center bg-[#000000]/40 hover:bg-[#000000]/60 transition-colors"
              >
                <span className="font-mono font-bold text-sm uppercase tracking-[0.05em] text-[#f5f5f0] bg-[#111111]/80 border border-[#222222] px-4 py-2 rounded-none">
                  View Case Study
                </span>
              </Link>
            ) : videoId ? (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group/play"
                aria-label={`Play ${item.title}`}
              >
                <div className="w-[60px] h-[60px] rounded-none bg-[#000000]/60 hover:bg-[#000000]/80 border border-[#222222] flex items-center justify-center transition-colors">
                  <Play className="w-6 h-6 text-[#f5f5f0] ml-1" fill="#f5f5f0" />
                </div>
              </button>
            ) : null}
          </>
        )}
      </div>

      {/* Info area */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-mono font-bold text-lg text-[#f5f5f0]">
            {item.title}
          </h3>
        </div>
        {item.category && (
          <span className="inline-block bg-[#222222] text-[#888888] text-[11px] font-sans px-2 py-1 rounded-none">
            {item.category}
          </span>
        )}
        {item.description && (
          <p className="text-[#888888] text-[13px] font-sans line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  )
}
