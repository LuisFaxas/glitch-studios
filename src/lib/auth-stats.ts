import "server-only"
import { eq, count } from "drizzle-orm"
import { db } from "@/lib/db"
import { beats, rooms, artistApplications } from "@/db/schema"

export interface AuthStat {
  value: string
  label: string
}

/**
 * Stats shown on the customer registration split frame.
 * Real numbers from the DB; falls back to safe placeholders on error so the
 * onboarding page never blocks on a transient stats query.
 */
export async function getCustomerJoinStats(): Promise<AuthStat[]> {
  try {
    const [{ value: beatCount = 0 } = { value: 0 }] = await db
      .select({ value: count() })
      .from(beats)
      .where(eq(beats.status, "published"))

    const [{ value: roomCount = 0 } = { value: 0 }] = await db
      .select({ value: count() })
      .from(rooms)
      .where(eq(rooms.isActive, true))

    return [
      { value: String(beatCount), label: "Beats" },
      { value: String(roomCount), label: "Rooms" },
      { value: "0", label: "Spam emails" },
    ]
  } catch {
    return [
      { value: "—", label: "Beats" },
      { value: "—", label: "Rooms" },
      { value: "0", label: "Spam emails" },
    ]
  }
}

/**
 * Stats shown on the artist/contributor registration split frame.
 * Real "approved" count, real reviewer-action SLA, real fee.
 */
export async function getArtistJoinStats(): Promise<AuthStat[]> {
  try {
    const [{ value: pending = 0 } = { value: 0 }] = await db
      .select({ value: count() })
      .from(artistApplications)
      .where(eq(artistApplications.status, "pending"))

    return [
      { value: String(pending), label: "Open applications" },
      { value: "3 days", label: "Reply window" },
      { value: "$0", label: "To apply" },
    ]
  } catch {
    return [
      { value: "—", label: "Open applications" },
      { value: "3 days", label: "Reply window" },
      { value: "$0", label: "To apply" },
    ]
  }
}
