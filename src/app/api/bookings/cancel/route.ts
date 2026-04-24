import { z } from "zod"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { bookings, serviceBookingConfig } from "@/db/schema"
import { stripe } from "@/lib/stripe"
import { canCancel, getRefundAmount } from "@/lib/booking/policy"
import { sendBookingModificationEmail } from "@/lib/email/send-booking-modification"
import { NextResponse } from "next/server"

const cancelSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().max(500).optional(),
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

  const parsed = cancelSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { bookingId, reason, isAdmin } = parsed.data

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
    return NextResponse.json({ error: "Booking already cancelled" }, { status: 400 })
  }

  if (booking.status === "completed") {
    return NextResponse.json({ error: "Booking already completed" }, { status: 400 })
  }

  let refundAmount = 0

  if (isAdmin) {
    // Admin override (D-11): skip policy, always allow, full refund
    if (booking.stripePaymentIntentId) {
      try {
        const depositCents = Math.round(parseFloat(booking.depositAmount) * 100)
        if (depositCents > 0) {
          await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
          })
          refundAmount = depositCents
        }
      } catch (err) {
        // Log but don't block cancellation if refund fails
        console.error("Stripe refund error:", err)
      }
    }

    await db
      .update(bookings)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: "admin",
        cancellationReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))

    await sendBookingModificationEmail(booking, {
      newDate: null,
      reason: reason ?? null,
    })

    return NextResponse.json({ success: true, refundAmount })
  }

  // Client cancellation: check policy
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

  const cancelResult = canCancel(
    { date: booking.date, startTime: booking.startTime, status: booking.status as any },
    { cancellationWindowHours: config.cancellationWindowHours ?? 48 }
  )

  if (!cancelResult.allowed) {
    return NextResponse.json(
      { error: cancelResult.reason || "Cancellation not allowed" },
      { status: 403 }
    )
  }

  // Calculate refund
  if (cancelResult.withinPolicy && booking.stripePaymentIntentId) {
    const depositCents = Math.round(parseFloat(booking.depositAmount) * 100)
    refundAmount = getRefundAmount(
      depositCents,
      (config.refundPolicy as any) ?? "full",
      true
    )

    if (refundAmount > 0) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          amount: refundAmount,
        })
      } catch (err) {
        console.error("Stripe refund error:", err)
      }
    }
  }

  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: "client",
      cancellationReason: reason || null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))

  await sendBookingModificationEmail(booking, {
    newDate: null,
    reason: reason ?? null,
  })

  return NextResponse.json({ success: true, refundAmount })
}
