import "server-only"
import { cache } from "react"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSettings } from "@/db/schema"

export type SplashMode = "always" | "first_visit" | "never"

const VALID_MODES: readonly SplashMode[] = ["always", "first_visit", "never"]

function isSplashMode(v: string | null | undefined): v is SplashMode {
  return typeof v === "string" && (VALID_MODES as readonly string[]).includes(v)
}

// Default is first_visit — visitors see the intro once per browser, then the
// splash is suppressed on return visits. Matches the most common brand-intro
// pattern and stays quiet for regulars.
export const getSplashMode = cache(async (): Promise<SplashMode> => {
  const rows = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "splash_mode"))
    .limit(1)
  const v = rows[0]?.value
  return isSplashMode(v) ? v : "first_visit"
})
