import "server-only"
import { unstable_cache } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSettings } from "@/db/schema"

// Cached for 60 seconds across all requests — this value rarely changes,
// and hitting Postgres on every render of every public layout is wasteful
// (was timing out under dev-server polling load — phase 25 perf prep).
export const getBookingLive = unstable_cache(
  async (): Promise<boolean> => {
    const rows = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, "booking_live"))
      .limit(1)
    return rows[0]?.value === "true"
  },
  ["booking-live"],
  { revalidate: 60, tags: ["site-settings"] },
)
