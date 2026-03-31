"use client"

import Image from "next/image"
import { Play, Pause } from "lucide-react"
import { Tile } from "@/components/tiles/tile"
import { Waveform } from "@/components/player/waveform"
import { useAudioPlayer } from "@/components/player/audio-player-provider"

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function WidgetNowPlaying() {
  const { currentBeat, isPlaying, currentTime, duration, toggle, seek } =
    useAudioPlayer()

  const progress = duration > 0 ? currentTime / duration : 0

  function handleSeek(p: number) {
    if (duration > 0) seek(p * duration)
  }

  if (!currentBeat) {
    return (
      <Tile size="wide" className="gap-1">
        {/* Row 1: icon + title + time */}
        <div className="flex items-center gap-2 w-full">
          <Play className="h-4 w-4 flex-shrink-0 text-[#555555]" />
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555555] truncate flex-1">
            No track playing
          </span>
          <span className="font-mono text-[13px] font-normal text-[#555555] flex-shrink-0">
            0:00 / 0:00
          </span>
        </div>
        {/* Row 2: placeholder artist */}
        <div className="flex items-center w-full">
          <span className="font-sans text-[11px] font-normal text-[#555555]">
            ---
          </span>
        </div>
        {/* Row 3: flat waveform fallback */}
        <Waveform
          peaks={null}
          progress={0}
          height={20}
          interactive={false}
        />
      </Tile>
    )
  }

  return (
    <Tile size="wide" className="gap-1 !p-0 overflow-hidden">
      {/* Row 1: Cover art + track info + time + play/pause */}
      <div className="flex items-start gap-2 w-full px-3 pt-3">
        {/* Cover art 40x40 */}
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden">
          {currentBeat.coverArtUrl ? (
            <Image
              src={currentBeat.coverArtUrl}
              alt={`${currentBeat.title} cover`}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div className="h-full w-full bg-[#222222]" />
          )}
        </div>

        {/* Info column */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Title row with time */}
          <div className="flex items-baseline justify-between gap-1">
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] truncate">
              {currentBeat.title}
            </span>
            <span className="font-mono text-[13px] font-normal text-[#888888] flex-shrink-0">
              {formatTime(currentTime)}/{formatTime(duration)}
            </span>
          </div>
          {/* Artist row with play/pause */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-normal text-[#888888] truncate">
              {currentBeat.artist}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle() }}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex-shrink-0 p-0.5 text-[#f5f5f0] hover:text-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Waveform - full width, interactive */}
      <div className="px-3 pb-2">
        <Waveform
          peaks={currentBeat.waveformPeaks}
          progress={progress}
          height={20}
          interactive
          onSeek={handleSeek}
        />
      </div>
    </Tile>
  )
}
