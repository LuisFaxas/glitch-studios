export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { bookings, services, rooms, serviceBookingConfig } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { addDays, format } from "date-fns"
import { Resend } from "resend"
import { BookingReminderEmail } from "@/lib/email/booking-reminder"
import { sendSms } from "@/lib/sms"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd")

  // Find confirmed bookings for tomorrow that haven't had reminders sent
  const upcomingBookings = await db
    .select({
      id: bookings.id,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      guestPhone: bookings.guestPhone,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      reminderSent: bookings.reminderSent,
      serviceName: services.name,
      roomName: rooms.name,
      prepInstructions: serviceBookingConfig.prepInstructions,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .leftJoin(
      serviceBookingConfig,
      eq(serviceBookingConfig.serviceId, bookings.serviceId)
    )
    .where(
      and(
        eq(bookings.date, tomorrow),
        eq(bookings.status, "confirmed"),
        eq(bookings.reminderSent, false)
      )
    )

  const address = process.env.STUDIO_ADDRESS || "Glitch Studios"
  let sent = 0

  for (const booking of upcomingBookings) {
    try {
      // Send reminder email
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "Glitch Studios <bookings@glitchstudios.com>",
          to: booking.guestEmail,
          subject: `Reminder: ${booking.serviceName} session tomorrow at ${booking.startTime}`,
          react: BookingReminderEmail({
            clientName: booking.guestName,
            serviceName: booking.serviceName,
            roomName: booking.roomName,
            date: booking.date,
            time: `${booking.startTime} - ${booking.endTime}`,
            address,
            prepInstructions: booking.prepInstructions,
          }),
        })
      }

      // Send reminder SMS
      if (booking.guestPhone) {
        await sendSms(
          booking.guestPhone,
          `Reminder: Your ${booking.serviceName} session at Glitch Studios is tomorrow at ${booking.startTime}. ${address}`
        )
      }

      // Mark as reminded
      await db
        .update(bookings)
        .set({ reminderSent: true, updatedAt: new Date() })
        .where(eq(bookings.id, booking.id))

      sent++
    } catch (error) {
      console.error(`Failed to send reminder for booking ${booking.id}:`, error)
    }
  }

  return Response.json({ sent, total: upcomingBookings.length })
}
