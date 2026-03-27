"use client"

import { useState, useCallback } from "react"
import clsx from "clsx"
import { format } from "date-fns"

interface CalendarDayTileProps {
  date: string
  dayNumber: string
  isCurrentMonth: boolean
  isAvailable: boolean
  isSelected: boolean
  isToday: boolean
  isPast: boolean
  onClick: () => void
}

export function CalendarDayTile({
  date,
  dayNumber,
  isCurrentMonth,
  isAvailable,
  isSelected,
  isToday,
  isPast,
  onClick,
}: CalendarDayTileProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isDisabled = !isAvailable || isPast || !isCurrentMonth

  const handleMouseEnter = useCallback(() => {
    if (!isDisabled && !isSelected) setIsHovered(true)
  }, [isDisabled, isSelected])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const fullDateLabel = (() => {
    try {
      const d = new Date(date + "T12:00:00")
      return format(d, "MMMM d, yyyy")
    } catch {
      return date
    }
  })()

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isDisabled}
      aria-label={fullDateLabel}
      aria-disabled={isDisabled}
      className={clsx(
        "relative overflow-hidden aspect-square flex items-center justify-center",
        "min-h-[36px] sm:min-h-[44px] lg:min-h-[48px]",
        "border border-solid rounded-none transition-colors duration-150",
        "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
        // Selected state
        isSelected && "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]",
        // Available (not selected, not disabled)
        !isSelected &&
          !isDisabled && [
            "bg-[#111111] text-[#f5f5f0] border-[#222222] cursor-pointer",
            "active:bg-[#0a0a0a] active:scale-[0.97] active:duration-100",
          ],
        // Available + hovered
        !isSelected && !isDisabled && isHovered && "bg-[#1a1a1a] border-[#444444]",
        // Unavailable / past
        isDisabled &&
          !isSelected && "bg-[#0a0a0a] text-[#555555] border-[#222222] cursor-default",
        // Not current month
        !isCurrentMonth && !isSelected && "text-[#333333]",
        // Today indicator (not selected)
        isToday && !isSelected && "border-b-2 border-b-[#f5f5f0]"
      )}
    >
      {/* Glitch hover overlay for available tiles */}
      {!isSelected && !isDisabled && isHovered && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#f5f5f0]/5 animate-glitch-hover motion-reduce:animate-none"
          aria-hidden="true"
        >
          <span className="font-mono text-[15px] font-bold">{dayNumber}</span>
        </div>
      )}

      <span className="font-mono text-[15px] font-bold">{dayNumber}</span>
    </button>
  )
}
