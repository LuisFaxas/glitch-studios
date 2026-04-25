"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { MediaEmbedThumbnail } from "./media-embed-thumbnail"
import { useFinePointer } from "@/lib/hooks/use-fine-pointer"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

interface MediaEmbedProps {
  externalId: string
  title: string
  thumbnailUrl?: string | null
  previewOnHover?: boolean
  mode?: "interactive" | "thumbnailOnly"
  sizes?: string
  priority?: boolean
  className?: string
}

/**
 * Canonical YouTube embed.
 *
 * - Default render: static thumbnail (zero YouTube JS) — D-01.
 * - Hover (desktop, full-motion): muted iframe preview — D-02.
 * - Hover (mobile / pointer:coarse): no-op — D-03.
 * - prefers-reduced-motion: reduce — no preview swap — D-05.
 * - Click/tap: full iframe with sound + controls.
 * - Always uses youtube-nocookie.com — D-04.
 *
 * Hover preview iframe loads YouTube JS once mounted (Pitfall 8) — this is
 * intentional per D-02. Preview is unmounted on mouseleave to keep cost off
 * the idle state.
 */
export function MediaEmbed({
  externalId,
  title,
  thumbnailUrl,
  previewOnHover = true,
  mode = "interactive",
  sizes,
  priority,
  className,
}: MediaEmbedProps) {
  const [state, setState] = useState<"idle" | "preview" | "play">("idle")
  const finePointer = useFinePointer()
  const reducedMotion = useReducedMotion()
  const canPreview =
    mode === "interactive" &&
    previewOnHover &&
    finePointer &&
    !reducedMotion

  // Per RESEARCH Pitfall 4: loop=1 only works with playlist={id} for single videos.
  // Per CONTEXT D-04: youtube-nocookie.com always.
  const previewSrc =
    `https://www.youtube-nocookie.com/embed/${externalId}` +
    `?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${externalId}` +
    `&rel=0&playsinline=1`
  const playSrc =
    `https://www.youtube-nocookie.com/embed/${externalId}` +
    `?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`

  if (mode === "thumbnailOnly") {
    return (
      <div
        className={`relative aspect-video overflow-hidden border border-[#222] bg-[#0a0a0a] ${className ?? ""}`}
      >
        <MediaEmbedThumbnail
          externalId={externalId}
          thumbnailUrl={thumbnailUrl}
          sizes={sizes}
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div
      className={`relative aspect-video overflow-hidden border border-[#222] bg-[#0a0a0a] ${className ?? ""}`}
      onMouseEnter={
        canPreview && state === "idle" ? () => setState("preview") : undefined
      }
      onMouseLeave={
        canPreview && state === "preview" ? () => setState("idle") : undefined
      }
    >
      <MediaEmbedThumbnail
        externalId={externalId}
        thumbnailUrl={thumbnailUrl}
        sizes={sizes}
        priority={priority}
      />

      {state === "preview" && (
        <iframe
          src={previewSrc}
          title={`${title} — silent preview`}
          aria-hidden="true"
          tabIndex={-1}
          allow="autoplay"
          className="absolute inset-0 h-full w-full pointer-events-none"
        />
      )}

      {state === "play" && (
        <iframe
          src={playSrc}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}

      {state !== "play" && (
        <button
          type="button"
          onClick={() => setState("play")}
          aria-label={`Play video: ${title}`}
          className="absolute inset-0 flex items-center justify-center group focus-visible:outline-2 focus-visible:outline-[#f5f5f0]/40 focus-visible:outline-offset-2"
        >
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full bg-[#0a0a0a]/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
          >
            <Play className="size-6 text-[#f5f5f0]" />
          </span>
        </button>
      )}
    </div>
  )
}
