import { z } from "zod"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { bookings } from "@/db/schema"
import { NextResponse } from "next/server"

const confirmSchema = z.object({
  bookingId: z.string().uuid(),
})

export async function POST(request: Request) {
  // Auth check: must be admin
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  if (session.user.role === "user") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = confirmSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { bookingId } = parsed.data

  // Fetch booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.status !== "pending") {
    return NextResponse.json(
      { error: `Cannot confirm booking with status "${booking.status}"` },
      { status: 400 }
    )
  }

  // Update to confirmed
  const [updated] = await db
    .update(bookings)
    .set({
      status: "confirmed",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning()

  return NextResponse.json({ success: true, booking: updated })
}
