"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import type { PortfolioItem } from "@/types"

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

function Section({
  title,
  content,
}: {
  title: string
  content: string | null
}) {
  if (!content) return null
  return (
    <div className="py-8 border-b border-gray-800 last:border-b-0">
      <h2 className="font-mono font-bold text-2xl uppercase tracking-tight mb-4 text-white">
        {title}
      </h2>
      <p className="text-white leading-relaxed text-lg">{content}</p>
    </div>
  )
}

export function CaseStudyContent({ item }: { item: PortfolioItem }) {
  const [playing, setPlaying] = useState(false)
  const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null

  return (
    <div>
      {/* Hero media area */}
      <div className="relative aspect-video max-h-[70vh] w-full bg-gray-900">
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
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : videoId ? (
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
            )}

            {videoId && (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center"
                aria-label={`Play ${item.title}`}
              >
                <div className="w-20 h-20 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center transition-colors">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono">Back to Portfolio</span>
        </Link>

        <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight mb-4 text-white">
          {item.title}
        </h1>

        {item.category && (
          <span className="inline-block bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full mb-8">
            {item.category}
          </span>
        )}

        {item.description && (
          <p className="text-gray-400 text-lg mb-8">{item.description}</p>
        )}

        <div className="space-y-0">
          <Section title="The Client" content={item.clientName} />
          <Section title="The Challenge" content={item.challenge} />
          <Section title="Our Approach" content={item.approach} />
          <Section title="The Result" content={item.result} />
        </div>
      </div>
    </div>
  )
}
