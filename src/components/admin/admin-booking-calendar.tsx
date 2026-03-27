"use client"

import { useState, useCallback, useMemo } from "react"
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Phone, Mail, Clock } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import type { AdminBookingRow } from "@/app/admin/bookings/actions"

type RoomInfo = { id: string; name: string; slug: string }

interface AdminBookingCalendarProps {
  initialBookings: AdminBookingRow[]
  rooms: RoomInfo[]
}

/** CSS patterns for each service type per UI-SPEC */
function getServiceStyle(serviceType: string): React.CSSProperties {
  switch (serviceType) {
    case "studio_session":
      return { backgroundColor: "#333333" }
    case "mixing":
    case "mastering":
      return {
        background:
          "repeating-linear-gradient(45deg, #333 0px, #333 2px, #222 2px, #222 4px)",
      }
    case "video_production":
      return {
        backgroundColor: "#222222",
        border: "2px dashed #444",
      }
    case "sfx":
      return {
        background:
          "repeating-linear-gradient(0deg, #333 0px, #333 2px, #222 2px, #222 4px)",
      }
    case "graphic_design":
      return { backgroundColor: "#444444" }
    default:
      return { backgroundColor: "#333333" }
  }
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { text: string; bg: string }> = {
    confirmed: { text: "#f5f5f0", bg: "#222222" },
    pending: { text: "#888888", bg: "#222222" },
    cancelled: { text: "#dc2626", bg: "#222222" },
    completed: { text: "#22c55e", bg: "#222222" },
    no_show: { text: "#f59e0b", bg: "#222222" },
  }
  const colors = colorMap[status] || colorMap.pending
  return (
    <span
      className="inline-block rounded-none px-2 py-0.5 font-mono text-xs uppercase tracking-wider"
      style={{ color: colors.text, backgroundColor: colors.bg }}
    >
      {status.replace("_", " ")}
    </span>
  )
}

export function AdminBookingCalendar({
  initialBookings,
  rooms,
}: AdminBookingCalendarProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [bookingsList, setBookingsList] = useState(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const prevWeek = useCallback(
    () => setWeekStart((d) => addDays(d, -7)),
    []
  )
  const nextWeek = useCallback(
    () => setWeekStart((d) => addDays(d, 7)),
    []
  )

  const bookingsByRoomAndDay = useMemo(() => {
    const map = new Map<string, AdminBookingRow[]>()
    for (const b of bookingsList) {
      const key = `${b.roomId}_${b.date}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(b)
    }
    return map
  }, [bookingsList])

  function openDetail(booking: AdminBookingRow) {
    setSelectedBooking(booking)
    setSheetOpen(true)
  }

  async function handleConfirm(bookingId: string) {
    setActionLoading(true)
    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to confirm booking")
        return
      }
      toast.success("Booking confirmed")
      setBookingsList((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "confirmed" } : b))
      )
      setSelectedBooking((prev) =>
        prev?.id === bookingId ? { ...prev, status: "confirmed" } : prev
      )
    } catch {
      toast.error("Network error")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel(bookingId: string) {
    const reason = prompt("Cancel reason (optional):")
    setActionLoading(true)
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason: reason || undefined, isAdmin: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel booking")
        return
      }
      toast.success("Booking cancelled")
      setBookingsList((prev) => prev.filter((b) => b.id !== bookingId))
      setSheetOpen(false)
    } catch {
      toast.error("Network error")
    } finally {
      setActionLoading(false)
    }
  }

  // Mobile: day view (single day navigation)
  const [mobileDay, setMobileDay] = useState(0)
  const currentMobileDate = days[mobileDay]

  return (
    <div>
      {/* Week navigation */}
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={prevWeek}
          className="rounded-none border border-[#333] p-1.5 hover:bg-[#222]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-mono text-sm text-[#888]">
          {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <button
          onClick={nextWeek}
          className="rounded-none border border-[#333] p-1.5 hover:bg-[#222]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Desktop: full weekly grid */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-28 border border-[#222] bg-[#111] p-2 text-left font-mono text-xs uppercase text-[#666]">
                Room
              </th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  className="border border-[#222] bg-[#111] p-2 text-center font-mono text-xs uppercase text-[#666]"
                >
                  <div>{format(day, "EEE")}</div>
                  <div className="text-[#888]">{format(day, "MMM d")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="border border-[#222] bg-[#0a0a0a] p-2 font-mono text-xs text-[#999]">
                  {room.name}
                </td>
                {days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd")
                  const cellBookings = bookingsByRoomAndDay.get(`${room.id}_${dateStr}`) || []
                  return (
                    <td
                      key={`${room.id}_${dateStr}`}
                      className="border border-[#222] bg-[#0a0a0a] p-1 align-top"
                      style={{ minWidth: 120, minHeight: 60 }}
                    >
                      {cellBookings.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => openDetail(b)}
                          className="mb-1 block w-full cursor-pointer rounded-none p-1.5 text-left transition-opacity hover:opacity-80"
                          style={getServiceStyle(b.serviceType)}
                        >
                          <div className="font-mono text-[10px] text-[#999]">
                            {b.startTime}-{b.endTime}
                          </div>
                          <div className="truncate font-mono text-xs text-[#f5f5f0]">
                            {b.guestName.length > 20
                              ? b.guestName.slice(0, 20) + "..."
                              : b.guestName}
                          </div>
                        </button>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: single day view */}
      <div className="md:hidden">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setMobileDay((d) => Math.max(0, d - 1))}
            disabled={mobileDay === 0}
            className="rounded-none border border-[#333] p-1 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono text-sm text-[#888]">
            {format(currentMobileDate, "EEEE, MMM d")}
          </span>
          <button
            onClick={() => setMobileDay((d) => Math.min(6, d + 1))}
            disabled={mobileDay === 6}
            className="rounded-none border border-[#333] p-1 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {rooms.map((room) => {
          const dateStr = format(currentMobileDate, "yyyy-MM-dd")
          const cellBookings = bookingsByRoomAndDay.get(`${room.id}_${dateStr}`) || []
          return (
            <div key={room.id} className="mb-4">
              <div className="mb-1 font-mono text-xs uppercase text-[#666]">
                {room.name}
              </div>
              {cellBookings.length === 0 ? (
                <div className="border border-[#222] bg-[#0a0a0a] p-3 text-center font-mono text-xs text-[#444]">
                  No bookings
                </div>
              ) : (
                cellBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => openDetail(b)}
                    className="mb-1 block w-full cursor-pointer rounded-none p-2 text-left"
                    style={getServiceStyle(b.serviceType)}
                  >
                    <div className="font-mono text-[10px] text-[#999]">
                      {b.startTime}-{b.endTime}
                    </div>
                    <div className="truncate font-mono text-xs text-[#f5f5f0]">
                      {b.guestName}
                    </div>
                  </button>
                ))
              )}
            </div>
          )
        })}
      </div>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto bg-[#111] border-[#222]">
          {selectedBooking && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono text-lg uppercase text-[#f5f5f0]">
                  Booking Detail
                </SheetTitle>
                <SheetDescription className="text-[#666]">
                  {selectedBooking.serviceName}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedBooking.status} />
                </div>

                <div className="space-y-2 border-t border-[#222] pt-4">
                  <h3 className="font-mono text-xs uppercase text-[#666]">Client</h3>
                  <p className="font-mono text-sm text-[#f5f5f0]">
                    {selectedBooking.guestName}
                  </p>
                  <p className="flex items-center gap-1 font-mono text-xs text-[#888]">
                    <Mail className="h-3 w-3" />
                    {selectedBooking.guestEmail}
                  </p>
                  <p className="flex items-center gap-1 font-mono text-xs text-[#888]">
                    <Phone className="h-3 w-3" />
                    {selectedBooking.guestPhone}
                  </p>
                </div>

                <div className="space-y-2 border-t border-[#222] pt-4">
                  <h3 className="font-mono text-xs uppercase text-[#666]">Details</h3>
                  <p className="font-mono text-sm text-[#ccc]">
                    <span className="text-[#666]">Service:</span>{" "}
                    {selectedBooking.serviceName}
                  </p>
                  <p className="font-mono text-sm text-[#ccc]">
                    <span className="text-[#666]">Room:</span>{" "}
                    {selectedBooking.roomName}
                  </p>
                  <p className="flex items-center gap-1 font-mono text-sm text-[#ccc]">
                    <Clock className="h-3 w-3 text-[#666]" />
                    {selectedBooking.date} {selectedBooking.startTime}-{selectedBooking.endTime}
                  </p>
                </div>

                <div className="space-y-2 border-t border-[#222] pt-4">
                  <h3 className="font-mono text-xs uppercase text-[#666]">Payment</h3>
                  <p className="font-mono text-sm text-[#ccc]">
                    <span className="text-[#666]">Deposit:</span> $
                    {selectedBooking.depositAmount}
                  </p>
                  <p className="font-mono text-sm text-[#ccc]">
                    <span className="text-[#666]">Total:</span> $
                    {selectedBooking.totalPrice}
                  </p>
                </div>

                {selectedBooking.notes && (
                  <div className="space-y-2 border-t border-[#222] pt-4">
                    <h3 className="font-mono text-xs uppercase text-[#666]">Notes</h3>
                    <p className="font-mono text-xs text-[#999]">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {selectedBooking.cancellationReason && (
                  <div className="space-y-2 border-t border-[#222] pt-4">
                    <h3 className="font-mono text-xs uppercase text-[#dc2626]">
                      Cancellation Reason
                    </h3>
                    <p className="font-mono text-xs text-[#999]">
                      {selectedBooking.cancellationReason}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 border-t border-[#222] pt-4">
                  {selectedBooking.status === "pending" && (
                    <button
                      onClick={() => handleConfirm(selectedBooking.id)}
                      disabled={actionLoading}
                      className="w-full bg-[#f5f5f0] py-2 font-mono text-sm font-bold uppercase text-[#000] disabled:opacity-50"
                    >
                      Confirm Booking
                    </button>
                  )}
                  {selectedBooking.status !== "cancelled" &&
                    selectedBooking.status !== "completed" && (
                      <button
                        onClick={() => handleCancel(selectedBooking.id)}
                        disabled={actionLoading}
                        className="w-full border border-[#dc2626] bg-transparent py-2 font-mono text-sm font-bold uppercase text-[#dc2626] disabled:opacity-50"
                      >
                        Cancel Booking
                      </button>
                    )}
                  {selectedBooking.status !== "cancelled" &&
                    selectedBooking.status !== "completed" && (
                      <button
                        onClick={() =>
                          toast.info(
                            "Reschedule: select a new date/time from the booking calendar"
                          )
                        }
                        disabled={actionLoading}
                        className="w-full border border-[#444] bg-transparent py-2 font-mono text-sm font-bold uppercase text-[#888] disabled:opacity-50"
                      >
                        Reschedule
                      </button>
                    )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
