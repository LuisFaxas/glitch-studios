"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { setBookingLive } from "@/actions/settings/set-booking-live"

interface BookingLiveToggleProps {
  initialValue: boolean
}

export function BookingLiveToggle({ initialValue }: BookingLiveToggleProps) {
  const [persistedValue, setPersistedValue] = useState(initialValue)
  const [pendingValue, setPendingValue] = useState(initialValue)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const hasChange = pendingValue !== persistedValue
  const turningOn = pendingValue === true

  async function handleConfirm() {
    setSaving(true)
    try {
      const res = await setBookingLive(pendingValue)
      if (res.success) {
        setPersistedValue(pendingValue)
        toast.success(
          turningOn
            ? "Booking turned on — wizard is live."
            : "Booking turned off — site now shows coming soon."
        )
        setConfirmOpen(false)
      } else {
        toast.error("Couldn't save. Try again.")
      }
    } catch {
      toast.error("Couldn't save. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#111111] border border-[#222222] p-6 rounded-none">
      <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-4">
        BOOKING STATUS
      </h2>

      <div className="flex items-center gap-4 mb-4">
        <Switch
          checked={pendingValue}
          onCheckedChange={setPendingValue}
          aria-label="Toggle booking live"
        />
        <span className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          {pendingValue ? "BOOKING: LIVE" : "BOOKING: COMING SOON"}
        </span>
      </div>

      <p className="font-sans text-[14px] leading-[1.5] text-[#888888] mb-6">
        When OFF, every Book CTA on the site redirects to the coming-soon page.
        Toggle ON to accept bookings.
      </p>

      <Button
        disabled={!hasChange || saving}
        onClick={() => setConfirmOpen(true)}
        className="bg-[#f5f5f0] text-[#000000] hover:opacity-90 disabled:opacity-50 font-mono uppercase"
      >
        Save Changes
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-mono text-[20px] font-bold uppercase tracking-[0.05em]">
              {turningOn ? "TURN ON BOOKING?" : "TURN OFF BOOKING?"}
            </DialogTitle>
            <DialogDescription className="font-sans text-[14px] leading-[1.5]">
              {turningOn
                ? "The booking wizard will become available to clients and Book CTAs will route to /book. Make sure at least one service has a booking config."
                : "Every Book Session and Book Now button across the site will redirect clients to the coming-soon page. The booking wizard will be hidden until you turn this back on."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
            >
              {turningOn ? "Keep Coming Soon" : "Keep Booking Live"}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={saving}
              className="bg-[#dc2626] text-[#f5f5f0] hover:brightness-110"
            >
              {saving
                ? "SAVING..."
                : turningOn
                  ? "Turn On Booking"
                  : "Turn Off Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
