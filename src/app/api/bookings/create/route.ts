import { z } from "zod"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import {
  bookings,
  bookingSeries,
  services,
  serviceBookingConfig,
  sessionPackages,
  rooms,
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getAvailableSlots } from "@/lib/booking/slots"
import { calculateDeposit } from "@/lib/booking/deposit"
import {
  generateRecurringSeries,
  validateSeriesAvailability,
  calculatePackagePrice,
} from "@/lib/booking/recurring"
import type { DepositType } from "@/types/booking"

const bookingCreateSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  roomId: z.string().uuid(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(7),
  notes: z.string().max(500).optional(),
  createAccount: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurringWeeks: z.number().int().min(2).max(52).optional(),
  packageId: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bookingCreateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Get service + config
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, data.serviceId))
    .limit(1)

  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 })
  }

  const [config] = await db
    .select()
    .from(serviceBookingConfig)
    .where(eq(serviceBookingConfig.serviceId, data.serviceId))
    .limit(1)

  if (!config) {
    return Response.json(
      { error: "Service not configured for booking" },
      { status: 404 }
    )
  }

  // Get room name
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, data.roomId))
    .limit(1)

  if (!room) {
    return Response.json({ error: "Room not found" }, { status: 404 })
  }

  // Parse total price from service price label
  const priceMatch = service.priceLabel.match(/\$?([\d,]+(?:\.\d{2})?)/)
  const totalPrice = priceMatch
    ? parseFloat(priceMatch[1].replace(",", ""))
    : 0

  if (totalPrice <= 0) {
    return Response.json({ error: "Could not determine price" }, { status: 400 })
  }

  // Verify slot is still available (race condition prevention)
  const availableSlots = await getAvailableSlots(data.serviceId, data.date)
  const slotStillAvailable = availableSlots.some(
    (slot) =>
      slot.roomId === data.roomId &&
      slot.startTime === data.startTime &&
      slot.endTime === data.endTime
  )

  if (!slotStillAvailable) {
    return Response.json(
      {
        error:
          "This time slot was just booked by someone else. Please select a different time.",
      },
      { status: 409 }
    )
  }

  const depositType = (config.depositType ?? "percentage") as DepositType
  const depositValue = parseFloat(String(config.depositValue))
  const { depositAmountCents } = calculateDeposit(
    depositType,
    depositValue,
    totalPrice
  )

  const depositDollars = (depositAmountCents / 100).toFixed(2)

  // Handle recurring bookings
  if (data.isRecurring && data.recurringWeeks) {
    const dayOfWeek = new Date(data.date + "T12:00:00").getDay()
    const seriesDates = generateRecurringSeries(
      data.date,
      dayOfWeek,
      data.startTime,
      data.recurringWeeks
    )

    // Validate all dates are available
    const { conflicts } = await validateSeriesAvailability(
      data.serviceId,
      seriesDates,
      data.startTime
    )

    if (conflicts.length > 0) {
      return Response.json(
        {
          error: "Some dates in the series are unavailable",
          conflicts,
        },
        { status: 409 }
      )
    }

    // Check for package discount
    let discountPercent = 0
    if (data.packageId) {
      const [pkg] = await db
        .select()
        .from(sessionPackages)
        .where(
          and(
            eq(sessionPackages.id, data.packageId),
            eq(sessionPackages.serviceId, data.serviceId)
          )
        )
        .limit(1)

      if (pkg) {
        discountPercent = pkg.discountPercent
      }
    }

    const packagePricing = calculatePackagePrice(
      totalPrice,
      data.recurringWeeks,
      discountPercent
    )

    // Calculate series deposit (deposit on total package price)
    const seriesDeposit = calculateDeposit(
      depositType,
      depositValue,
      packagePricing.total
    )

    // Create booking series
    const [series] = await db
      .insert(bookingSeries)
      .values({
        guestEmail: data.guestEmail,
        serviceId: data.serviceId,
        roomId: data.roomId,
        packageId: data.packageId ?? null,
        totalSessions: data.recurringWeeks,
        dayOfWeek,
        startTime: data.startTime,
      })
      .returning()

    // Create individual bookings
    const perSessionPrice = packagePricing.perSession
    const perSessionDeposit = calculateDeposit(
      depositType,
      depositValue,
      perSessionPrice
    )

    for (const date of seriesDates) {
      await db.insert(bookings).values({
        seriesId: series.id,
        serviceId: data.serviceId,
        roomId: data.roomId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        notes: data.notes ?? null,
        date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: "pending",
        depositAmount: perSessionDeposit.depositAmountCents / 100 + "",
        totalPrice: perSessionPrice.toFixed(2),
      })
    }

    // Create Stripe Checkout Session for series deposit
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${service.name} - ${data.recurringWeeks}-Session Package Deposit`,
              description: `Starting ${data.date} at ${data.startTime} - ${room.name}`,
            },
            unit_amount: seriesDeposit.depositAmountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "booking_deposit",
        bookingId: series.id,
        seriesId: series.id,
        serviceId: data.serviceId,
        roomId: data.roomId,
        date: data.date,
        startTime: data.startTime,
        isRecurring: "true",
      },
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    })

    // Update series with stripe session id
    await db
      .update(bookingSeries)
      .set({ stripeSessionId: stripeSession.id })
      .where(eq(bookingSeries.id, series.id))

    return Response.json({
      clientSecret: stripeSession.client_secret,
      bookingId: series.id,
      isRecurring: true,
    })
  }

  // Single booking
  const [booking] = await db
    .insert(bookings)
    .values({
      serviceId: data.serviceId,
      roomId: data.roomId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      notes: data.notes ?? null,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "pending",
      depositAmount: depositDollars,
      totalPrice: totalPrice.toFixed(2),
    })
    .returning()

  // Create Stripe Checkout Session
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${service.name} - Deposit`,
            description: `${data.date} at ${data.startTime} - ${room.name}`,
          },
          unit_amount: depositAmountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "booking_deposit",
      bookingId: booking.id,
      serviceId: data.serviceId,
      roomId: data.roomId,
      date: data.date,
      startTime: data.startTime,
    },
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
  })

  // Store stripe session id on booking
  await db
    .update(bookings)
    .set({ stripeSessionId: stripeSession.id })
    .where(eq(bookings.id, booking.id))

  return Response.json({
    clientSecret: stripeSession.client_secret,
    bookingId: booking.id,
  })
}
