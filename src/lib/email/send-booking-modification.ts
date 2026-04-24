import "server-only"
import { eq } from "drizzle-orm"
import { Resend } from "resend"
import { db } from "@/lib/db"
import { services } from "@/db/schema"
import { BookingModificationEmail } from "@/lib/email/booking-modification"

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = "Glitch Studios <noreply@glitchstudios.io>"

interface BookingForEmail {
  id: string
  serviceId: string
  guestName: string
  guestEmail: string
  date: string
  startTime: string
}

/**
 * Fire a booking-modification / cancellation email.
 * Pass `newDate: null` to signal cancellation.
 * Safe to call without try/catch — logs and swallows errors so callers
 * never fail because of an email issue.
 */
export async function sendBookingModificationEmail(
  booking: BookingForEmail,
  opts: {
    newDate: string | null
    newStartTime?: string | null
    reason?: string | null
  },
): Promise<void> {
  const recipient = booking.guestEmail
  if (!recipient) {
    console.log("[email:booking-mod] skipped — no recipient email")
    return
  }

  try {
    // Look up service name for readable email copy.
    let serviceName = "your booking"
    try {
      const [svc] = await db
        .select({ name: services.name })
        .from(services)
        .where(eq(services.id, booking.serviceId))
        .limit(1)
      if (svc?.name) serviceName = svc.name
    } catch (err) {
      console.error("[email:booking-mod] service lookup failed:", err)
    }

    const oldDate = `${booking.date} ${booking.startTime}`
    const newDate =
      opts.newDate === null
        ? null
        : opts.newStartTime
          ? `${opts.newDate} ${opts.newStartTime}`
          : opts.newDate

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipient,
      subject:
        newDate === null
          ? "Your Glitch Studios booking was cancelled"
          : "Your Glitch Studios booking was rescheduled",
      react: BookingModificationEmail({
        name: booking.guestName ?? "there",
        bookingId: booking.id.slice(0, 8),
        service: serviceName,
        oldDate,
        newDate,
        reason: opts.reason ?? undefined,
      }),
    })

    if (error) {
      console.error("[email:booking-mod] Resend send failed:", error)
    }
  } catch (err) {
    console.error("[email:booking-mod] Unexpected error:", err)
  }
}
