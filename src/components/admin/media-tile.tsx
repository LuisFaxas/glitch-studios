"use client"

import Image from "next/image"
import { AudioLines, Video } from "lucide-react"
import type { mediaAssets } from "@/db/schema"

type MediaAsset = typeof mediaAssets.$inferSelect

interface MediaTileProps {
  asset: MediaAsset
  selected: boolean
  onSelect: () => void
  onDoubleClick?: () => void
}

export function MediaTile({
  asset,
  selected,
  onSelect,
  onDoubleClick,
}: MediaTileProps) {
  const isImage = asset.mimeType.startsWith("image/")
  const isAudio = asset.mimeType.startsWith("audio/")
  const isVideo = asset.mimeType.startsWith("video/")

  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`relative flex flex-col items-center bg-[#111111] overflow-hidden transition-colors group ${
        selected ? "ring-2 ring-[#f5f5f0]" : "ring-1 ring-[#222222]"
      }`}
    >
      <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
        {isImage ? (
          <Image
            src={asset.url}
            alt={asset.alt || asset.filename}
            fill
            className="object-cover"
            sizes="120px"
          />
        ) : isAudio ? (
          <AudioLines size={32} className="text-[#555555]" />
        ) : isVideo ? (
          <div className="relative flex items-center justify-center w-full h-full">
            <Video size={32} className="text-[#555555]" />
            {asset.duration && (
              <span className="absolute bottom-1 right-1 text-[10px] font-mono text-[#888888] bg-[#000000]/80 px-1">
                {Math.floor(asset.duration / 60)}:
                {String(asset.duration % 60).padStart(2, "0")}
              </span>
            )}
          </div>
        ) : (
          <div className="text-[#555555] text-[11px] font-mono uppercase">
            File
          </div>
        )}
      </div>
      <div className="w-full px-2 py-1.5 bg-[#0a0a0a]">
        <p className="text-[13px] text-[#888888] font-sans truncate">
          {asset.filename}
        </p>
      </div>
    </button>
  )
}
