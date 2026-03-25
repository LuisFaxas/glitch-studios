"use client"

import { useState } from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import type { PortfolioItem } from "@/types"

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export function VideoCard({ item }: { item: PortfolioItem }) {
  const [playing, setPlaying] = useState(false)
  const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
  const isCaseStudy = item.type === "case_study"

  const thumbnailUrl = item.isYouTubeEmbed && videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : item.thumbnailUrl || null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Media area */}
      <div className="relative aspect-video bg-gray-800">
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
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
            )}

            {isCaseStudy ? (
              <Link
                href={`/portfolio/${item.slug}`}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
              >
                <span className="font-mono font-bold text-sm uppercase tracking-wider text-white bg-gray-800/80 border border-white/20 px-4 py-2 rounded-full">
                  View Case Study
                </span>
              </Link>
            ) : videoId ? (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group/play"
                aria-label={`Play ${item.title}`}
              >
                <div className="w-[60px] h-[60px] rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center transition-colors">
                  <Play className="w-6 h-6 text-white ml-1" fill="white" />
                </div>
              </button>
            ) : null}
          </>
        )}
      </div>

      {/* Info area */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-mono font-bold text-lg text-white">
            {item.title}
          </h3>
        </div>
        {item.category && (
          <span className="inline-block bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
            {item.category}
          </span>
        )}
        {item.description && (
          <p className="text-gray-400 text-sm line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  )
}
