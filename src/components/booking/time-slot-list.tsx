"use client"

import { useMemo } from "react"
import type { TimeSlot } from "@/types/booking"
import { TimeSlotTile } from "./time-slot-tile"
import { Skeleton } from "@/components/ui/skeleton"

interface TimeSlotListProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  isLoading: boolean
}

export function TimeSlotList({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
}: TimeSlotListProps) {
  const hasMultipleRooms = useMemo(() => {
    const roomIds = new Set(slots.map((s) => s.roomId))
    return roomIds.size > 1
  }, [slots])

  const isSlotSelected = (slot: TimeSlot) =>
    selectedSlot !== null &&
    selectedSlot.roomId === slot.roomId &&
    selectedSlot.startTime === slot.startTime &&
    selectedSlot.endTime === slot.endTime

  return (
    <div>
      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-4">
        CHOOSE A TIME
      </h2>

      {isLoading && (
        <div className="flex flex-col gap-[4px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-[44px] bg-[#222222] rounded-none"
            />
          ))}
        </div>
      )}

      {!isLoading && slots.length === 0 && (
        <div className="bg-[#111111] border border-[#222222] p-6">
          <h3 className="font-mono text-[15px] font-bold text-[#f5f5f0] mb-2">
            No Available Times
          </h3>
          <p className="font-sans text-[15px] text-[#888888]">
            All time slots for this date are booked. Try another date or check
            back later.
          </p>
        </div>
      )}

      {!isLoading && slots.length > 0 && (
        <div className="flex flex-col gap-[4px]">
          {slots.map((slot) => (
            <TimeSlotTile
              key={`${slot.roomId}-${slot.startTime}`}
              slot={slot}
              isSelected={isSlotSelected(slot)}
              onClick={() => onSelectSlot(slot)}
              showRoom={hasMultipleRooms}
            />
          ))}
        </div>
      )}
    </div>
  )
}
