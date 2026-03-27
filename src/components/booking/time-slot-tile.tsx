"use client"

import { useState, useCallback } from "react"
import clsx from "clsx"
import type { TimeSlot } from "@/types/booking"

interface TimeSlotTileProps {
  slot: TimeSlot
  isSelected: boolean
  onClick: () => void
  showRoom?: boolean
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`
}

export function TimeSlotTile({
  slot,
  isSelected,
  onClick,
  showRoom = false,
}: TimeSlotTileProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => {
    if (!isSelected) setIsHovered(true)
  }, [isSelected])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const timeLabel = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "relative overflow-hidden w-full min-h-[44px] flex items-center px-4 py-3",
        "border border-solid rounded-none transition-colors duration-150",
        "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
        isSelected && "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]",
        !isSelected && [
          "bg-[#111111] text-[#f5f5f0] border-[#222222] cursor-pointer",
          "active:bg-[#0a0a0a] active:scale-[0.97] active:duration-100",
        ],
        !isSelected && isHovered && "bg-[#1a1a1a] border-[#444444]"
      )}
    >
      {/* Glitch hover overlay */}
      {!isSelected && isHovered && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center px-4 py-3 bg-[#f5f5f0]/5 animate-glitch-hover motion-reduce:animate-none"
          aria-hidden="true"
        >
          <span className="font-mono text-[15px]">{timeLabel}</span>
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[15px]">{timeLabel}</span>
        {showRoom && (
          <span
            className={clsx(
              "font-sans text-[13px]",
              isSelected ? "text-[#000000]/60" : "text-[#888888]"
            )}
          >
            {slot.roomName}
          </span>
        )}
      </div>
    </button>
  )
}
