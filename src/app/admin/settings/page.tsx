export const dynamic = "force-dynamic"

import { getSettings } from "@/actions/admin-settings"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { getBookingLive } from "@/lib/get-booking-live"
import { BookingLiveToggle } from "@/components/admin/booking-live-toggle"

export default async function AdminSettingsPage() {
  const [settings, bookingLive] = await Promise.all([
    getSettings(),
    getBookingLive(),
  ])

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
          Site Settings
        </h1>
      </div>

      <div className="mb-8">
        <BookingLiveToggle initialValue={bookingLive} />
      </div>

      <SiteSettingsForm initialSettings={settings} />
    </div>
  )
}
