"use client"

import Link from "next/link"
import type { BookingWithRelations } from "@/types/booking"
import { ClientBookingCard } from "./client-booking-card"

interface ClientBookingListProps {
  upcomingBookings: BookingWithRelations[]
  pastBookings: BookingWithRelations[]
}

export function ClientBookingList({
  upcomingBookings,
  pastBookings,
}: ClientBookingListProps) {
  if (upcomingBookings.length === 0 && pastBookings.length === 0) {
    return (
      <div className="border border-[#222222] bg-[#111111] p-12 text-center">
        <h2 className="font-mono text-[15px] font-bold text-[#f5f5f0] mb-2">
          No Bookings Yet
        </h2>
        <p className="font-sans text-[15px] text-[#888888] mb-6">
          Book your first studio session to get started.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center justify-center bg-[#f5f5f0] text-[#000000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] px-6 py-3 transition-colors hover:bg-[#e5e5e0]"
        >
          Browse Services
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {upcomingBookings.length > 0 && (
        <section>
          <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-3">
            Upcoming Bookings
          </h2>
          <div className="space-y-1">
            {upcomingBookings.map((booking) => (
              <ClientBookingCard
                key={booking.id}
                booking={booking}
                isPast={false}
              />
            ))}
          </div>
        </section>
      )}

      {pastBookings.length > 0 && (
        <section>
          <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-3">
            Past Bookings
          </h2>
          <div className="space-y-1">
            {pastBookings.map((booking) => (
              <ClientBookingCard
                key={booking.id}
                booking={booking}
                isPast={true}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
