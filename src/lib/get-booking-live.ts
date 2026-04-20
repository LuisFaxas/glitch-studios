import "server-only"
import { cache } from "react"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSettings } from "@/db/schema"

export const getBookingLive = cache(async (): Promise<boolean> => {
  const rows = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "booking_live"))
    .limit(1)
  return rows[0]?.value === "true"
})
