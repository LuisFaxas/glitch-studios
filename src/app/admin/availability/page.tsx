export const dynamic = "force-dynamic"

import { getRooms } from "@/app/admin/rooms/actions"
import { AdminAvailabilityEditor } from "@/components/admin/admin-availability-editor"

export default async function AdminAvailabilityPage() {
  const rooms = await getRooms()
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        Availability
      </h1>
      <AdminAvailabilityEditor rooms={rooms} />
    </div>
  )
}
