import { addWeeks, format } from "date-fns"
import { getAvailableSlots } from "./slots"

/**
 * Generate N weekly dates starting from startDate on the given dayOfWeek.
 * Returns array of "YYYY-MM-DD" date strings.
 */
export function generateRecurringSeries(
  startDate: string,
  dayOfWeek: number,
  startTime: string,
  totalSessions: number
): string[] {
  const dates: string[] = []
  let current = new Date(startDate + "T12:00:00")

  for (let i = 0; i < totalSessions; i++) {
    dates.push(format(current, "yyyy-MM-dd"))
    current = addWeeks(current, 1)
  }

  return dates
}

/**
 * Check availability for each date in a recurring series.
 * Returns which dates have an available slot matching the startTime
 * and which have conflicts.
 */
export async function validateSeriesAvailability(
  serviceId: string,
  dates: string[],
  startTime: string
): Promise<{ available: string[]; conflicts: string[] }> {
  const available: string[] = []
  const conflicts: string[] = []

  for (const date of dates) {
    const slots = await getAvailableSlots(serviceId, date)
    const hasMatch = slots.some((slot) => slot.startTime === startTime)

    if (hasMatch) {
      available.push(date)
    } else {
      conflicts.push(date)
    }
  }

  return { available, conflicts }
}

/**
 * Calculate package pricing with discount.
 *
 * @param basePrice - per-session price in dollars
 * @param sessionCount - number of sessions in the package
 * @param discountPercent - percentage discount (e.g. 15 for 15% off)
 */
export function calculatePackagePrice(
  basePrice: number,
  sessionCount: number,
  discountPercent: number
): { perSession: number; total: number; savings: number } {
  const fullTotal = basePrice * sessionCount
  const discountMultiplier = 1 - discountPercent / 100
  const total = Math.round(fullTotal * discountMultiplier * 100) / 100
  const perSession = Math.round((total / sessionCount) * 100) / 100
  const savings = Math.round((fullTotal - total) * 100) / 100

  return { perSession, total, savings }
}
