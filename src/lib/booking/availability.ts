import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  rooms,
  weeklyAvailability,
  availabilityOverrides,
  serviceBookingConfig,
} from "@/db/schema"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
} from "date-fns"

interface RoomAvailabilityResult {
  isOpen: boolean
  startTime: string | null
  endTime: string | null
}

/**
 * Get a room's availability for a specific date.
 * Checks weekly schedule first, then applies date-specific overrides.
 */
export async function getRoomAvailability(
  roomId: string,
  date: string
): Promise<RoomAvailabilityResult> {
  const dayOfWeek = getDay(new Date(date + "T12:00:00"))

  // Check for date-specific override first
  const [override] = await db
    .select()
    .from(availabilityOverrides)
    .where(
      and(
        eq(availabilityOverrides.roomId, roomId),
        eq(availabilityOverrides.date, date)
      )
    )
    .limit(1)

  if (override) {
    if (override.isClosed) {
      return { isOpen: false, startTime: null, endTime: null }
    }
    if (override.startTime && override.endTime) {
      return {
        isOpen: true,
        startTime: override.startTime,
        endTime: override.endTime,
      }
    }
  }

  // Fall back to weekly schedule
  const [weekly] = await db
    .select()
    .from(weeklyAvailability)
    .where(
      and(
        eq(weeklyAvailability.roomId, roomId),
        eq(weeklyAvailability.dayOfWeek, dayOfWeek),
        eq(weeklyAvailability.isActive, true)
      )
    )
    .limit(1)

  if (!weekly) {
    return { isOpen: false, startTime: null, endTime: null }
  }

  return {
    isOpen: true,
    startTime: weekly.startTime,
    endTime: weekly.endTime,
  }
}

/**
 * Get all available dates for a service in a given month.
 * A date is "available" if at least one active room has open hours
 * and the open window can fit the service duration.
 */
export async function getAvailableDates(
  serviceId: string,
  month: Date
): Promise<Map<string, boolean>> {
  const result = new Map<string, boolean>()

  // Get service duration
  const [config] = await db
    .select()
    .from(serviceBookingConfig)
    .where(eq(serviceBookingConfig.serviceId, serviceId))
    .limit(1)

  if (!config) {
    return result
  }

  const durationMinutes = config.durationMinutes

  // Get all active rooms
  const activeRooms = await db
    .select({ id: rooms.id, bufferMinutes: rooms.bufferMinutes })
    .from(rooms)
    .where(eq(rooms.isActive, true))

  if (activeRooms.length === 0) {
    return result
  }

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  })

  for (const day of days) {
    const dateStr = format(day, "yyyy-MM-dd")
    let hasAvailableSlot = false

    for (const room of activeRooms) {
      const availability = await getRoomAvailability(room.id, dateStr)
      if (!availability.isOpen || !availability.startTime || !availability.endTime) {
        continue
      }

      // Check if the open window can fit at least one session
      const [startH, startM] = availability.startTime.split(":").map(Number)
      const [endH, endM] = availability.endTime.split(":").map(Number)
      const windowMinutes = (endH * 60 + endM) - (startH * 60 + startM)

      if (windowMinutes >= durationMinutes) {
        hasAvailableSlot = true
        break
      }
    }

    result.set(dateStr, hasAvailableSlot)
  }

  return result
}
