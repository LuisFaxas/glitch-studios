import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { bookings, services, rooms } from "@/db/schema"
import { eq } from "drizzle-orm"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect("/book")
  }

  // Retrieve Stripe session to get booking metadata
  let stripeSession
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    redirect("/book")
  }

  const bookingId = stripeSession.metadata?.bookingId
  if (!bookingId) {
    redirect("/book")
  }

  // Query booking with service and room names
  const result = await db
    .select({
      id: bookings.id,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      serviceName: services.name,
      roomName: rooms.name,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (result.length === 0) {
    redirect("/book")
  }

  const booking = result[0]

  // Check if user is logged in
  const session = await auth.api.getSession({ headers: await headers() })
  const isLoggedIn = !!session?.user

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <BookingConfirmation
        serviceName={booking.serviceName}
        date={booking.date}
        startTime={booking.startTime}
        endTime={booking.endTime}
        roomName={booking.roomName}
        bookingId={booking.id}
        status={booking.status as "confirmed" | "pending"}
        isLoggedIn={isLoggedIn}
      />
    </div>
  )
}
