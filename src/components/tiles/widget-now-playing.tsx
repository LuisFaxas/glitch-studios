"use client"

import { Play, Pause } from "lucide-react"
import { Tile } from "@/components/tiles/tile"
import { useAudioPlayer } from "@/components/player/audio-player-provider"

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function WidgetNowPlaying() {
  const { currentBeat, isPlaying, currentTime, duration, toggle } =
    useAudioPlayer()

  if (!currentBeat) {
    return (
      <Tile size="wide" className="gap-1">
        {/* Line 1: Play icon + no track */}
        <div className="flex items-center gap-2 w-full">
          <Play className="h-4 w-4 flex-shrink-0 text-[#555555]" />
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555555] truncate">
            No track playing
          </span>
        </div>

        {/* Line 2: Placeholder */}
        <div className="flex items-center justify-between w-full">
          <span className="font-sans text-[11px] font-normal text-[#555555]">
            ---
          </span>
          <span className="font-sans text-[11px] font-normal text-[#555555]">
            0:00 / 0:00
          </span>
        </div>

        {/* Line 3: Empty progress bar */}
        <div className="w-full h-[2px] bg-[#333333] mt-1">
          <div className="h-full bg-[#f5f5f0] w-0" />
        </div>
      </Tile>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Tile size="wide" className="gap-1" onClick={toggle}>
      {/* Line 1: Play/Pause icon + track name */}
      <div className="flex items-center gap-2 w-full">
        {isPlaying ? (
          <Pause className="h-4 w-4 flex-shrink-0 text-[#f5f5f0]" />
        ) : (
          <Play className="h-4 w-4 flex-shrink-0 text-[#f5f5f0]" />
        )}
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] truncate">
          {currentBeat.title}
        </span>
      </div>

      {/* Line 2: Artist + duration */}
      <div className="flex items-center justify-between w-full">
        <span className="font-sans text-[11px] font-normal text-[#888888]">
          {currentBeat.artist}
        </span>
        <span className="font-sans text-[11px] font-normal text-[#888888]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Line 3: Progress bar */}
      <div className="w-full h-[2px] bg-[#333333] mt-1">
        <div
          className="h-full bg-[#f5f5f0] transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Tile>
  )
}
