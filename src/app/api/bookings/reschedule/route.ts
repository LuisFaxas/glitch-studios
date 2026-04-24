import { z } from "zod"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { bookings, serviceBookingConfig } from "@/db/schema"
import { getAvailableSlots } from "@/lib/booking/slots"
import { canReschedule } from "@/lib/booking/policy"
import { sendBookingModificationEmail } from "@/lib/email/send-booking-modification"
import { NextResponse } from "next/server"

const rescheduleSchema = z.object({
  bookingId: z.string().uuid(),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  newEndTime: z.string().regex(/^\d{2}:\d{2}$/),
  newRoomId: z.string().uuid(),
  isAdmin: z.boolean().default(false),
})

export async function POST(request: Request) {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = rescheduleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { bookingId, newDate, newStartTime, newEndTime, newRoomId, isAdmin } = parsed.data

  // If claiming admin, verify role
  if (isAdmin && session.user.role === "user") {
    return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 })
  }

  // Fetch booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "Cannot reschedule cancelled booking" }, { status: 400 })
  }

  if (booking.status === "completed") {
    return NextResponse.json({ error: "Cannot reschedule completed booking" }, { status: 400 })
  }

  // Client reschedule: check policy
  if (!isAdmin) {
    const [config] = await db
      .select()
      .from(serviceBookingConfig)
      .where(eq(serviceBookingConfig.serviceId, booking.serviceId))
      .limit(1)

    if (!config) {
      return NextResponse.json(
        { error: "Service configuration not found" },
        { status: 500 }
      )
    }

    const rescheduleResult = canReschedule(
      { date: booking.date, startTime: booking.startTime, status: booking.status as any },
      { cancellationWindowHours: config.cancellationWindowHours ?? 48 }
    )

    if (!rescheduleResult.allowed) {
      return NextResponse.json(
        { error: rescheduleResult.reason || "Reschedule not allowed" },
        { status: 403 }
      )
    }
  }

  // Verify the new slot is available
  const availableSlots = await getAvailableSlots(booking.serviceId, newDate)
  const slotExists = availableSlots.some(
    (slot) =>
      slot.roomId === newRoomId &&
      slot.startTime === newStartTime &&
      slot.endTime === newEndTime
  )

  if (!slotExists) {
    return NextResponse.json(
      { error: "Selected time slot is not available" },
      { status: 409 }
    )
  }

  // Only fire the email if date or time actually changed.
  const dateChanged =
    booking.date !== newDate || booking.startTime !== newStartTime

  // Update booking with new date/time/room
  const [updated] = await db
    .update(bookings)
    .set({
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      roomId: newRoomId,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning()

  if (dateChanged) {
    await sendBookingModificationEmail(booking, {
      newDate,
      newStartTime,
      reason: null,
    })
  }

  return NextResponse.json({ success: true, booking: updated })
}
