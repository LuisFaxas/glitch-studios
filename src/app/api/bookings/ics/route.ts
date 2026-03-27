import { db } from "@/lib/db"
import { bookings, services, rooms } from "@/db/schema"
import { eq } from "drizzle-orm"
import { generateBookingIcs } from "@/lib/booking/ics"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId")

  if (!bookingId) {
    return new Response("Missing bookingId", { status: 400 })
  }

  // Query booking with service and room names
  const result = await db
    .select({
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      serviceName: services.name,
      roomName: rooms.name,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (result.length === 0) {
    return new Response("Booking not found", { status: 404 })
  }

  const booking = result[0]
  const address = process.env.STUDIO_ADDRESS ?? "Glitch Studios"

  const icsContent = generateBookingIcs({
    serviceName: booking.serviceName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    roomName: booking.roomName,
    address,
  })

  return new Response(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition":
        'attachment; filename="glitch-studios-booking.ics"',
    },
  })
}
