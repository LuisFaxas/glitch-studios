"use client"

import { Tile } from "@/components/tiles/tile"

/**
 * Studio Status widget -- time-based open/closed logic.
 * Studio hours: Mon-Fri 10am-6pm EST (hardcoded).
 * Upgradeable to admin-managed in Phase 4 (D-06).
 */
export function WidgetStudioStatus() {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay() // 0=Sun, 6=Sat

  const isWeekday = day >= 1 && day <= 5
  const isOpen = isWeekday && hour >= 10 && hour < 18

  // Calculate next available time
  let nextAvailable: string
  if (isOpen) {
    nextAvailable = "Now"
  } else if (isWeekday && hour < 10) {
    nextAvailable = "Today at 10am"
  } else {
    // Next weekday
    const daysUntilMonday = day === 0 ? 1 : day === 6 ? 2 : 1
    if (daysUntilMonday === 1) {
      nextAvailable = "Tomorrow at 10am"
    } else {
      nextAvailable = "Monday at 10am"
    }
  }

  return (
    <Tile size="wide" className="gap-1">
      {/* Line 1: Status dot + label */}
      <div className="flex items-center gap-2 w-full">
        <span
          className="inline-block h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: isOpen ? "#f5f5f0" : "#555555" }}
          aria-hidden="true"
        />
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          {isOpen ? "Studio Open" : "Studio Closed"}
        </span>
      </div>

      {/* Line 2: Next available */}
      <span className="font-sans text-[11px] font-normal text-[#888888]">
        Next available: {nextAvailable}
      </span>
    </Tile>
  )
}
