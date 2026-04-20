"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSettings } from "@/db/schema"
import { requirePermission } from "@/lib/permissions"

export async function setBookingLive(
  value: boolean
): Promise<{ success: boolean; value: boolean }> {
  await requirePermission("manage_settings")

  const existing = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.key, "booking_live"))
    .limit(1)

  const strValue = value ? "true" : "false"

  if (existing.length > 0) {
    await db
      .update(siteSettings)
      .set({ value: strValue, updatedAt: new Date() })
      .where(eq(siteSettings.key, "booking_live"))
  } else {
    await db.insert(siteSettings).values({
      key: "booking_live",
      value: strValue,
      updatedAt: new Date(),
    })
  }

  revalidatePath("/")
  revalidatePath("/services")
  revalidatePath("/book")
  revalidatePath("/admin/settings")
  revalidatePath("/admin/services")

  return { success: true, value }
}
