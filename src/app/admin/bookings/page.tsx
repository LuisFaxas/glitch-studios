export const dynamic = "force-dynamic"

import { format, startOfWeek } from "date-fns"
import {
  getBookingsForWeek,
  getBookingsFiltered,
  getRoomsForCalendar,
} from "./actions"
import { AdminBookingCalendar } from "@/components/admin/admin-booking-calendar"
import { AdminBookingList } from "@/components/admin/admin-booking-list"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default async function AdminBookingsPage() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekStartStr = format(weekStart, "yyyy-MM-dd")

  const [weekBookings, allBookings, rooms] = await Promise.all([
    getBookingsForWeek(weekStartStr),
    getBookingsFiltered({}),
    getRoomsForCalendar(),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em]">
          Bookings
        </h1>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList className="mb-6 bg-[#111] border border-[#222]">
          <TabsTrigger value="calendar" className="font-mono text-xs uppercase">
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="font-mono text-xs uppercase">
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <AdminBookingCalendar
            initialBookings={weekBookings}
            rooms={rooms}
          />
        </TabsContent>

        <TabsContent value="list">
          <AdminBookingList initialBookings={allBookings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
