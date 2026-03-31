"use client"

import Image from "next/image"
import { Play, Pause, Music } from "lucide-react"
import { AnimatePresence } from "motion/react"
import { useAudioPlayer } from "@/components/player/audio-player-provider"
import { Waveform } from "@/components/player/waveform"
import { BeatDetailPanel } from "@/components/beats/beat-detail-panel"
import { Badge } from "@/components/ui/badge"
import type { BeatSummary } from "@/types/beats"

interface BeatRowProps {
  beat: BeatSummary
  isExpanded: boolean
  onToggleExpand: () => void
}

export function BeatRow({ beat, isExpanded, onToggleExpand }: BeatRowProps) {
  const { currentBeat, isPlaying, currentTime, duration, play, pause } = useAudioPlayer()
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
        title: beat.title,
        artist: beat.producers[0]?.name ?? "Glitch Studios",
        previewAudioUrl: beat.previewAudioUrl,
        coverArtUrl: beat.coverArtUrl,
        waveformPeaks: beat.waveformPeaks,
      })
    }
  }

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
          <span className="block truncate font-mono text-[15px] font-bold text-[#f5f5f0] group-hover:glitch-hover">
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

        {/* Waveform strip - visual only, no scrubbing per D-08 */}
        <div className="hidden min-w-0 flex-1 items-center md:flex">
          <Waveform
            peaks={beat.waveformPeaks}
            progress={progress}
            height={32}
            barRadius={1}
            interactive={false}
          />
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

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isExpanded && <BeatDetailPanel beat={beat} />}
      </AnimatePresence>
    </div>
  )
}
