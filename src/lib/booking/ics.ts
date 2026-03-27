import { createEvent, type EventAttributes } from "ics"

interface BookingIcsInput {
  serviceName: string
  date: string // "YYYY-MM-DD"
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  roomName: string
  address: string
}

/**
 * Generate an ICS calendar file string for a booking.
 * Returns the raw ICS content that can be sent as an email attachment
 * or served as a file download.
 */
export function generateBookingIcs(booking: BookingIcsInput): string {
  const [year, month, day] = booking.date.split("-").map(Number)
  const [startH, startM] = booking.startTime.split(":").map(Number)
  const [endH, endM] = booking.endTime.split(":").map(Number)

  const event: EventAttributes = {
    title: `${booking.serviceName} - Glitch Studios`,
    start: [year, month, day, startH, startM],
    end: [year, month, day, endH, endM],
    location: booking.address,
    description: `Studio session in ${booking.roomName}`,
    organizer: { name: "Glitch Studios", email: "booking@glitchstudios.com" },
    status: "CONFIRMED",
  }

  const { error, value } = createEvent(event)

  if (error) {
    throw new Error(`Failed to generate ICS: ${error.message}`)
  }

  return value!
}
