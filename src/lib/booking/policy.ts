import { parse, differenceInHours, isBefore } from "date-fns"
import type { BookingStatus, RefundPolicy } from "@/types/booking"

interface CancelResult {
  allowed: boolean
  withinPolicy: boolean
  reason?: string
}

/**
 * Determine if a booking can be cancelled.
 * Compares current time to booking start time against the cancellation window.
 */
export function canCancel(
  booking: { date: string; startTime: string; status: BookingStatus },
  config: { cancellationWindowHours: number }
): CancelResult {
  if (booking.status === "cancelled") {
    return { allowed: false, withinPolicy: false, reason: "Booking already cancelled" }
  }
  if (booking.status === "completed") {
    return { allowed: false, withinPolicy: false, reason: "Booking already completed" }
  }

  const bookingStart = parse(
    `${booking.date} ${booking.startTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  )

  const now = new Date()

  if (isBefore(bookingStart, now)) {
    return { allowed: false, withinPolicy: false, reason: "Booking has already started" }
  }

  const hoursUntil = differenceInHours(bookingStart, now)
  const withinPolicy = hoursUntil >= config.cancellationWindowHours

  return {
    allowed: true,
    withinPolicy,
  }
}

/**
 * Determine if a booking can be rescheduled.
 * Uses the same policy window as cancellation.
 */
export function canReschedule(
  booking: { date: string; startTime: string; status: BookingStatus },
  config: { cancellationWindowHours: number }
): CancelResult {
  if (booking.status === "cancelled") {
    return { allowed: false, withinPolicy: false, reason: "Booking is cancelled" }
  }
  if (booking.status === "completed") {
    return { allowed: false, withinPolicy: false, reason: "Booking already completed" }
  }

  const bookingStart = parse(
    `${booking.date} ${booking.startTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  )

  const now = new Date()

  if (isBefore(bookingStart, now)) {
    return { allowed: false, withinPolicy: false, reason: "Booking has already started" }
  }

  const hoursUntil = differenceInHours(bookingStart, now)
  const withinPolicy = hoursUntil >= config.cancellationWindowHours

  return {
    allowed: true,
    withinPolicy,
  }
}

/**
 * Calculate refund amount based on policy and whether the cancellation
 * is within the policy window.
 */
export function getRefundAmount(
  depositAmountCents: number,
  refundPolicy: RefundPolicy,
  withinPolicy: boolean
): number {
  if (!withinPolicy) {
    return 0
  }

  switch (refundPolicy) {
    case "full":
      return depositAmountCents
    case "partial":
      return Math.floor(depositAmountCents * 0.5)
    case "none":
      return 0
  }
}
