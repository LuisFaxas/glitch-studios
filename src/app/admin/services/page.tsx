export const dynamic = "force-dynamic"

import { getServices } from "@/actions/admin-services"
import { AdminServiceTable } from "@/components/admin/admin-service-table"
import { getBookingLive } from "@/lib/get-booking-live"
import { BookingLiveToggle } from "@/components/admin/booking-live-toggle"
import Link from "next/link"

export default async function AdminServicesPage() {
  const [services, bookingLive] = await Promise.all([
    getServices(),
    getBookingLive(),
  ])
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <BookingLiveToggle initialValue={bookingLive} />
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em]">
          Services
        </h1>
        <Link
          href="/admin/services/new"
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 rounded-none"
        >
          New Service
        </Link>
      </div>
      <AdminServiceTable services={services} />
    </div>
  )
}
