export const dynamic = "force-dynamic"

import { getSettings } from "@/actions/admin-settings"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { getBookingLive } from "@/lib/get-booking-live"
import { getSplashMode } from "@/lib/get-splash-mode"
import { BookingLiveToggle } from "@/components/admin/booking-live-toggle"
import { SplashModeSelector } from "@/components/admin/splash-mode-selector"

export default async function AdminSettingsPage() {
  const [settings, bookingLive, splashMode] = await Promise.all([
    getSettings(),
    getBookingLive(),
    getSplashMode(),
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

      <div className="mb-8">
        <SplashModeSelector initialValue={splashMode} />
      </div>

      <SiteSettingsForm initialSettings={settings} />
    </div>
  )
}
