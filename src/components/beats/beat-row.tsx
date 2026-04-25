"use client"

import Image from "next/image"
import { Play, Pause, Music } from "lucide-react"
import { AnimatePresence } from "motion/react"
import { useAudioPlayer } from "@/components/player/audio-player-provider"
import { Waveform } from "@/components/player/waveform"
import { BeatDetailPanel } from "@/components/beats/beat-detail-panel"
import { BeatMadeByHand } from "@/components/beats/beat-made-by-hand"
import { Badge } from "@/components/ui/badge"
import type { BeatSummary } from "@/types/beats"
import type { InferSelectModel } from "drizzle-orm"
import type { mediaItems } from "@/db/schema"

type MediaItem = InferSelectModel<typeof mediaItems>

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

interface BeatRowProps {
  beat: BeatSummary
  isExpanded: boolean
  onToggleExpand: () => void
  media: MediaItem[]
}

export function BeatRow({ beat, isExpanded, onToggleExpand, media }: BeatRowProps) {
  const { currentBeat, isPlaying, currentTime, duration, play, pause, seek } = useAudioPlayer()
  const isCurrentBeat = currentBeat?.id === beat.id
  const isActivePlaying = isCurrentBeat && isPlaying
  const progress = isCurrentBeat && duration > 0 ? currentTime / duration : 0

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
        slug: beat.slug,
        title: beat.title,
        artist: beat.producers[0]?.name ?? "Glitch Studios",
        previewAudioUrl: beat.previewAudioUrl,
        coverArtUrl: beat.coverArtUrl,
        waveformPeaks: beat.waveformPeaks,
      })
    }
  }

  function handleRowSeek(p: number) {
    if (isCurrentBeat && duration > 0) {
      seek(p * duration)
    } else if (beat.previewAudioUrl) {
      // Start playback for this beat (seek on fresh load isn't reliable)
      play({
        id: beat.id,
        slug: beat.slug,
        title: beat.title,
        artist: beat.producers[0]?.name ?? "Glitch Studios",
        previewAudioUrl: beat.previewAudioUrl,
        coverArtUrl: beat.coverArtUrl,
        waveformPeaks: beat.waveformPeaks,
      })
    }
  }

  const durationDisplay = isCurrentBeat && duration > 0 ? formatTime(duration) : "--:--"

  return (
    <div>
      <div
        data-testid="beat-row"
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
          <div className="absolute left-0 top-0 h-full w-[2px] bg-[#f5f5f0]" />
        )}

        {/* Cover art - 48px mobile, 56px desktop */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-none md:h-14 md:w-14">
          {beat.coverArtUrl ? (
            <Image
              src={beat.coverArtUrl}
              alt={beat.title}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#222]">
              <Music className="h-5 w-5 text-[#555]" />
            </div>
          )}
        </div>

        {/* Title + Producer + Genre/Mood */}
        <div className="min-w-0 flex-1 md:flex-initial md:w-[200px] md:shrink-0">
          <span className="block truncate font-mono text-[15px] font-bold text-[#f5f5f0]">
            {beat.title}
          </span>
          <span className="block truncate font-sans text-[11px] text-[#888]">
            {beat.producers[0]?.name ?? "Glitch Studios"}
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

        {/* Waveform strip - interactive, click to seek/play */}
        <div className="hidden min-w-0 flex-1 items-center md:flex">
          <Waveform
            peaks={beat.waveformPeaks}
            progress={progress}
            height={32}
            barRadius={1}
            interactive
            onSeek={handleRowSeek}
          />
        </div>

        {/* Duration display */}
        <span className="hidden md:block shrink-0 font-mono text-[11px] text-[#888] min-w-[36px] text-right">
          {durationDisplay}
        </span>

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

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <BeatDetailPanel beat={beat} />
            <BeatMadeByHand items={media} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
