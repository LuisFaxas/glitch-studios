"use client"

import Image from "next/image"
import { Play, Pause, Music } from "lucide-react"
import { useAudioPlayer } from "@/components/player/audio-player-provider"
import { Badge } from "@/components/ui/badge"
import type { BeatSummary } from "@/types/beats"

interface BeatRowProps {
  beat: BeatSummary
  isExpanded: boolean
  onToggleExpand: () => void
}

export function BeatRow({ beat, isExpanded, onToggleExpand }: BeatRowProps) {
  const { currentBeat, isPlaying, play, pause } = useAudioPlayer()
  const isCurrentBeat = currentBeat?.id === beat.id
  const isActivePlaying = isCurrentBeat && isPlaying

  const lowestPrice = beat.pricing
    .filter((p) => p.isActive)
    .sort((a, b) => Number(a.price) - Number(b.price))[0]

  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation()
    if (!beat.previewAudioUrl) return

    if (isActivePlaying) {
      pause()
    } else {
      play({
        id: beat.id,
        title: beat.title,
        artist: beat.producers[0]?.name ?? "Glitch Studios",
        previewAudioUrl: beat.previewAudioUrl,
        coverArtUrl: beat.coverArtUrl,
      })
    }
  }

  return (
    <div>
      <div
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onToggleExpand()
          }
        }}
        role="button"
        tabIndex={0}
        className={`group relative flex cursor-pointer items-center gap-3 border-b border-[#222] px-3 py-3 transition-colors duration-100 hover:border-[#444] hover:bg-[#1a1a1a] md:gap-4 md:px-4 ${
          isActivePlaying ? "bg-[#0a0a0a]" : "bg-[#111]"
        }`}
      >
        {/* Playing accent bar */}
        {isActivePlaying && (
          <div className="absolute left-0 top-0 h-full w-0.5 bg-[#f5f5f0]" />
        )}

        {/* Cover art */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-none md:h-12 md:w-12">
          {beat.coverArtUrl ? (
            <Image
              src={beat.coverArtUrl}
              alt={beat.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#222]">
              <Music className="h-5 w-5 text-[#555]" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[15px] font-bold text-[#f5f5f0] group-hover:glitch-hover">
            {beat.title}
          </span>
          {/* Genre/mood tags - hidden on mobile */}
          <div className="mt-0.5 hidden gap-1.5 md:flex">
            <span className="font-sans text-[11px] text-[#888]">
              {beat.genre}
            </span>
            {beat.moods?.slice(0, 2).map((m) => (
              <span
                key={m}
                className="font-sans text-[11px] text-[#888]"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* BPM/Key badges - hidden on mobile */}
        <div className="hidden gap-2 md:flex">
          <Badge
            className="rounded-none border-[#333] bg-[#222] font-mono text-[11px] uppercase text-[#f5f5f0]"
          >
            {beat.bpm} BPM
          </Badge>
          <Badge
            className="rounded-none border-[#333] bg-[#222] font-mono text-[11px] uppercase text-[#f5f5f0]"
          >
            {beat.key}
          </Badge>
        </div>

        {/* Price */}
        {lowestPrice && (
          <span className="shrink-0 font-mono text-[15px] font-bold text-[#f5f5f0]">
            ${Number(lowestPrice.price).toFixed(0)}
          </span>
        )}

        {/* Play button */}
        <button
          type="button"
          onClick={handlePlay}
          disabled={!beat.previewAudioUrl}
          aria-label={isActivePlaying ? `Pause ${beat.title}` : `Play ${beat.title}`}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-none border border-[#333] bg-[#111] text-[#f5f5f0] transition-colors hover:border-[#f5f5f0] hover:bg-[#f5f5f0] hover:text-[#000] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isActivePlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expanded detail panel - placeholder for Plan 05 */}
      {isExpanded && (
        <div className="bg-[#0a0a0a] px-4 py-6 text-center font-mono text-[11px] uppercase tracking-[0.05em] text-[#555]">
          Detail panel — Plan 05
        </div>
      )}
    </div>
  )
}
