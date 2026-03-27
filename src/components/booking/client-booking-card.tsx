"use client"

import { useState } from "react"
import { toast } from "sonner"

import type { BookingWithRelations } from "@/types/booking"

interface ClientBookingCardProps {
  booking: BookingWithRelations
  isPast: boolean
}

const statusColors: Record<string, string> = {
  confirmed: "bg-[#f5f5f0] text-[#000000]",
  pending: "bg-[#888888] text-[#000000]",
  cancelled: "bg-[#dc2626] text-[#f5f5f0]",
  completed: "bg-[#f5f5f0] text-[#000000]",
  no_show: "bg-[#dc2626] text-[#f5f5f0]",
}

export function ClientBookingCard({ booking, isPast }: ClientBookingCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const isActionable =
    !isPast &&
    booking.status !== "cancelled" &&
    booking.status !== "completed" &&
    booking.status !== "no_show"

  async function handleCancel() {
    setIsCancelling(true)
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, isAdmin: false }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel booking")
        return
      }
      toast.success("Booking cancelled successfully")
      // Reload to reflect changes
      window.location.reload()
    } catch {
      toast.error("Failed to cancel booking")
    } finally {
      setIsCancelling(false)
      setShowCancelDialog(false)
    }
  }

  return (
    <div className="bg-[#111111] border border-[#222222] p-4 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-[15px] font-bold text-[#f5f5f0] truncate">
            {booking.serviceName}
          </h3>
          <p className="font-sans text-[15px] text-[#f5f5f0] mt-1">
            {booking.date} &middot; {booking.startTime} &ndash;{" "}
            {booking.endTime}
          </p>
          <p className="font-sans text-[13px] text-[#888888] mt-0.5">
            {booking.roomName}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.05em] ${statusColors[booking.status] ?? "bg-[#888888] text-[#000000]"}`}
        >
          {booking.status}
        </span>
      </div>

      {isActionable && (
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => setShowCancelDialog(true)}
            className="px-3 py-1.5 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#dc2626] border border-[#dc2626] transition-colors hover:bg-[#dc2626] hover:text-[#f5f5f0]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowRescheduleDialog(true)}
            className="px-3 py-1.5 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] border border-[#333333] transition-colors hover:bg-[#222222]"
          >
            Reschedule
          </button>
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#111111] border border-[#222222] p-6 max-w-md w-full mx-4">
            <h4 className="font-mono text-[15px] font-bold text-[#f5f5f0] mb-3">
              Cancel Booking
            </h4>
            <p className="font-sans text-[15px] text-[#888888] mb-6">
              Your deposit of ${booking.depositAmount} will be refunded within
              5-10 business days if you are within the cancellation window.
              Sessions within the cancellation window may forfeit the deposit.
              This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] border border-[#333333] transition-colors hover:bg-[#222222]"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] bg-[#dc2626] border border-[#dc2626] transition-colors hover:bg-[#b91c1c] disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {showRescheduleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#111111] border border-[#222222] p-6 max-w-md w-full mx-4">
            <h4 className="font-mono text-[15px] font-bold text-[#f5f5f0] mb-3">
              Reschedule Booking
            </h4>
            <p className="font-sans text-[15px] text-[#888888] mb-6">
              To reschedule your session, please contact the studio or use the
              booking calendar to select a new time. Your current slot will be
              released once rescheduled.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowRescheduleDialog(false)}
                className="px-4 py-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] border border-[#333333] transition-colors hover:bg-[#222222]"
              >
                Close
              </button>
              <a
                href={`/book?reschedule=${booking.id}`}
                className="inline-flex items-center px-4 py-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em] bg-[#f5f5f0] text-[#000000] transition-colors hover:bg-[#e5e5e0]"
              >
                Open Calendar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
