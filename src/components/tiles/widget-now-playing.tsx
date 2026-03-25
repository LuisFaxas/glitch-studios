"use client"

import { Play } from "lucide-react"
import { Tile } from "@/components/tiles/tile"

export function WidgetNowPlaying() {
  return (
    <Tile size="wide" className="gap-1">
      {/* Line 1: Play icon + track name */}
      <div className="flex items-center gap-2 w-full">
        <Play className="h-4 w-4 flex-shrink-0 text-[#f5f5f0]" />
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] truncate">
          Synth Wave
        </span>
      </div>

      {/* Line 2: Artist + duration */}
      <div className="flex items-center justify-between w-full">
        <span className="font-sans text-[11px] font-normal text-[#888888]">
          Trap Snyder
        </span>
        <span className="font-sans text-[11px] font-normal text-[#888888]">
          1:41 / 4:12
        </span>
      </div>

      {/* Line 3: Progress bar at ~40% */}
      <div className="w-full h-[2px] bg-[#333333] mt-1">
        <div className="h-full bg-[#f5f5f0] w-[40%]" />
      </div>
    </Tile>
  )
}
