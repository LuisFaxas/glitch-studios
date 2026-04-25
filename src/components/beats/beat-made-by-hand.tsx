"use client"

import { MediaEmbed } from "@/components/media/media-embed"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { InferSelectModel } from "drizzle-orm"
import type { mediaItems } from "@/db/schema"

type MediaItem = InferSelectModel<typeof mediaItems>

interface BeatMadeByHandProps {
  items: MediaItem[]
}

/**
 * "Made by hand" section for an expanded beat row.
 *
 * Pure presentation. Data is fetched server-side in src/app/(public)/beats/page.tsx
 * via getMediaByBeatIds and prop-passed down through BeatCatalog → BeatList → BeatRow.
 *
 * Per UI-SPEC Copywriting Contract: heading "Made by hand"; empty state DO NOT RENDER.
 * Per project memory feedback_glitch_headers: H2 wrapped in <GlitchHeading>; site-wide rule.
 */
export function BeatMadeByHand({ items }: BeatMadeByHandProps) {
  if (items.length === 0) return null

  return (
    <section
      aria-label="Made by hand"
      className="border-t border-[#222] bg-[#0a0a0a] px-4 py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 font-mono text-2xl font-bold uppercase tracking-tight text-[#f5f5f0]">
          <GlitchHeading text="Made by hand">Made by hand</GlitchHeading>
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {items.map((m) => (
            <article key={m.id} className="bg-[#111] border border-[#222]">
              <MediaEmbed
                externalId={m.externalId}
                title={m.title ?? "Making-of video"}
                thumbnailUrl={m.thumbnailUrl}
              />
              {m.title && (
                <div className="p-4">
                  <h3 className="font-mono text-lg font-bold uppercase text-[#f5f5f0]">
                    <GlitchHeading text={m.title}>{m.title}</GlitchHeading>
                  </h3>
                  {m.description && (
                    <p className="mt-2 text-sm text-[#888] line-clamp-2">
                      {m.description}
                    </p>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
