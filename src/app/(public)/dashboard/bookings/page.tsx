export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { bookings, services, rooms } from "@/db/schema"
import { eq, and, or, gte, lt, inArray, asc, desc } from "drizzle-orm"
import { ClientBookingList } from "@/components/booking/client-booking-list"
import type { BookingWithRelations } from "@/types/booking"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View and manage your studio bookings.",
}

export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const today = new Date().toISOString().split("T")[0]

  // Query all bookings for this user
  const allBookings = await db
    .select({
      id: bookings.id,
      serviceName: services.name,
      roomName: rooms.name,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      depositAmount: bookings.depositAmount,
      totalPrice: bookings.totalPrice,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      guestPhone: bookings.guestPhone,
      notes: bookings.notes,
      seriesId: bookings.seriesId,
      createdAt: bookings.createdAt,
      cancelledAt: bookings.cancelledAt,
      cancellationReason: bookings.cancellationReason,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(
      or(
        eq(bookings.userId, session.user.id),
        eq(bookings.guestEmail, session.user.email)
      )
    )
    .orderBy(asc(bookings.date), asc(bookings.startTime))

  // Split into upcoming and past
  const upcoming: BookingWithRelations[] = []
  const past: BookingWithRelations[] = []

  for (const b of allBookings) {
    const mapped: BookingWithRelations = {
      id: b.id,
      serviceName: b.serviceName,
      roomName: b.roomName,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status as BookingWithRelations["status"],
      depositAmount: b.depositAmount,
      totalPrice: b.totalPrice,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      guestPhone: b.guestPhone,
      notes: b.notes,
      seriesId: b.seriesId,
      createdAt: b.createdAt,
      cancelledAt: b.cancelledAt,
      cancellationReason: b.cancellationReason,
    }

    const isUpcoming =
      b.date >= today &&
      (b.status === "pending" || b.status === "confirmed")

    if (isUpcoming) {
      upcoming.push(mapped)
    } else {
      past.push(mapped)
    }
  }

  // Sort past descending (most recent first)
  past.sort((a, b) => (a.date > b.date ? -1 : 1))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-mono font-bold text-[28px] leading-[1.2] uppercase tracking-[0.05em] text-[#f5f5f0] mb-8">
        My Bookings
      </h1>
      <ClientBookingList upcomingBookings={upcoming} pastBookings={past} />
    </div>
  )
}
