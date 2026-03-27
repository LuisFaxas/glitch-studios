import { eq, and, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  rooms,
  bookings,
  serviceBookingConfig,
} from "@/db/schema"
import { getRoomAvailability } from "./availability"
import type { TimeSlot } from "@/types/booking"

/**
 * Generate candidate time slots within a window.
 * Each slot starts at `durationMinutes + bufferMinutes` intervals.
 * Only includes slots where the full duration fits before endTime.
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  bufferMinutes: number
): Array<{ startTime: string; endTime: string }> {
  const slots: Array<{ startTime: string; endTime: string }> = []

  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)
  const windowEnd = endH * 60 + endM
  let cursor = startH * 60 + startM

  while (cursor + durationMinutes <= windowEnd) {
    const slotEnd = cursor + durationMinutes
    const sh = Math.floor(cursor / 60)
    const sm = cursor % 60
    const eh = Math.floor(slotEnd / 60)
    const em = slotEnd % 60

    slots.push({
      startTime: `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`,
      endTime: `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`,
    })

    cursor += durationMinutes + bufferMinutes
  }

  return slots
}

/**
 * Get all available time slots for a service on a specific date.
 * Checks each active room's availability, generates candidate slots,
 * then removes slots that conflict with existing bookings (including buffer).
 */
export async function getAvailableSlots(
  serviceId: string,
  date: string
): Promise<TimeSlot[]> {
  // Get service config
  const [config] = await db
    .select()
    .from(serviceBookingConfig)
    .where(eq(serviceBookingConfig.serviceId, serviceId))
    .limit(1)

  if (!config) {
    return []
  }

  // Get all active rooms
  const activeRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.isActive, true))

  if (activeRooms.length === 0) {
    return []
  }

  // Get existing bookings for this date across all rooms
  const existingBookings = await db
    .select({
      roomId: bookings.roomId,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.date, date),
        inArray(bookings.status, ["pending", "confirmed"])
      )
    )

  const result: TimeSlot[] = []

  for (const room of activeRooms) {
    const availability = await getRoomAvailability(room.id, date)
    if (!availability.isOpen || !availability.startTime || !availability.endTime) {
      continue
    }

    const bufferMinutes = room.bufferMinutes ?? 15
    const candidates = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      config.durationMinutes,
      bufferMinutes
    )

    // Filter out candidates that overlap with existing bookings (including buffer)
    const roomBookings = existingBookings.filter((b) => b.roomId === room.id)

    for (const candidate of candidates) {
      const candidateStart = timeToMinutes(candidate.startTime)
      const candidateEnd = timeToMinutes(candidate.endTime)

      const hasConflict = roomBookings.some((booking) => {
        const bookingStart = timeToMinutes(booking.startTime) - bufferMinutes
        const bookingEnd = timeToMinutes(booking.endTime) + bufferMinutes
        return candidateStart < bookingEnd && candidateEnd > bookingStart
      })

      if (!hasConflict) {
        result.push({
          roomId: room.id,
          roomName: room.name,
          startTime: candidate.startTime,
          endTime: candidate.endTime,
        })
      }
    }
  }

  // Sort by startTime, then roomName
  result.sort((a, b) => {
    const timeDiff = a.startTime.localeCompare(b.startTime)
    if (timeDiff !== 0) return timeDiff
    return a.roomName.localeCompare(b.roomName)
  })

  return result
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}
