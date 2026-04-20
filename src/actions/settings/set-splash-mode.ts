"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSettings } from "@/db/schema"
import { requirePermission } from "@/lib/permissions"
import type { SplashMode } from "@/lib/get-splash-mode"

const VALID_MODES: readonly SplashMode[] = ["always", "first_visit", "never"]

export async function setSplashMode(
  mode: SplashMode
): Promise<{ success: boolean; value: SplashMode }> {
  await requirePermission("manage_settings")

  if (!(VALID_MODES as readonly string[]).includes(mode)) {
    return { success: false, value: mode }
  }

  const existing = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.key, "splash_mode"))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(siteSettings)
      .set({ value: mode, updatedAt: new Date() })
      .where(eq(siteSettings.key, "splash_mode"))
  } else {
    await db.insert(siteSettings).values({
      key: "splash_mode",
      value: mode,
      updatedAt: new Date(),
    })
  }

  revalidatePath("/")
  revalidatePath("/admin/settings")

  return { success: true, value: mode }
}
