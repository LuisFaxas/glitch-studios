"use client"

import { Tile } from "@/components/tiles/tile"

interface WidgetLatestPostClientProps {
  title: string
  slug: string | null
  date: string | null
}

/**
 * Client rendering wrapper for the WidgetLatestPost server component.
 * Handles the Tile hover/animation behavior which requires client-side state.
 */
export function WidgetLatestPostClient({ title, slug, date }: WidgetLatestPostClientProps) {
  return (
    <Tile size="wide" href={slug ? `/blog/${slug}` : undefined} className="gap-1">
      {/* Line 1: LATEST label */}
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888888]">
        Latest
      </span>

      {/* Lines 2-3: Post title (max 2 lines) */}
      <span className="font-sans text-[13px] font-normal text-[#f5f5f0] line-clamp-2 w-full">
        {title}
      </span>

      {/* Line 4: Date */}
      {date && (
        <span className="font-sans text-[11px] font-normal text-[#555555]">
          {date}
        </span>
      )}
    </Tile>
  )
}
