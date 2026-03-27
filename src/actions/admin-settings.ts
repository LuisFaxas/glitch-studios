"use server"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSettings } from "@/db/schema"
import { requirePermission } from "@/lib/permissions"

const VALID_KEYS = [
  "studio_name",
  "studio_tagline",
  "studio_about",
  "contact_email",
  "contact_phone",
  "contact_address",
  "social_instagram",
  "social_youtube",
  "social_soundcloud",
  "social_twitter",
] as const

export type SettingsKey = (typeof VALID_KEYS)[number]

export async function getSettings(): Promise<Record<string, string | null>> {
  const rows = await db.select().from(siteSettings)
  const result: Record<string, string | null> = {}
  for (const row of rows) {
    result[row.key] = row.value
  }
  return result
}

export async function updateSettings(
  settings: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  await requirePermission("manage_settings")

  try {
    for (const [key, value] of Object.entries(settings)) {
      if (!VALID_KEYS.includes(key as SettingsKey)) continue

      // Check if key exists
      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(siteSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(siteSettings.key, key))
      } else {
        await db.insert(siteSettings).values({
          key,
          value,
          updatedAt: new Date(),
        })
      }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save settings",
    }
  }
}
