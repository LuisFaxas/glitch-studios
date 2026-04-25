"use client"

import Image from "next/image"

interface MediaEmbedThumbnailProps {
  externalId: string
  thumbnailUrl?: string | null
  sizes?: string
  priority?: boolean
}

/**
 * Static YouTube thumbnail with maxresdefault -> hqdefault fallback.
 * Pitfall 1 (RESEARCH): maxresdefault.jpg only exists for >=720p uploads;
 * older videos return 404. onError swaps to hqdefault.jpg which always exists.
 *
 * Decorative — `alt=""`. The wrapping <MediaEmbed> button carries the
 * accessible name (aria-label="Play video: {title}").
 */
export function MediaEmbedThumbnail({
  externalId,
  thumbnailUrl,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: MediaEmbedThumbnailProps) {
  const src =
    thumbnailUrl ?? `https://i.ytimg.com/vi/${externalId}/maxresdefault.jpg`

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      className="object-cover"
      priority={priority}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement
        if (!img.src.includes("hqdefault")) {
          img.src = `https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`
        }
      }}
    />
  )
}
