"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { weeklyAvailability, availabilityOverrides } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: admin access required")
  }
  return session
}

export async function getWeeklySchedule(roomId: string) {
  const result = await db
    .select()
    .from(weeklyAvailability)
    .where(eq(weeklyAvailability.roomId, roomId))
    .orderBy(weeklyAvailability.dayOfWeek)
  return result
}

export async function upsertWeeklySchedule(
  roomId: string,
  schedules: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }>
) {
  await requireAdmin()

  // Delete existing entries and insert new ones in a transaction
  await db.transaction(async (tx) => {
    await tx
      .delete(weeklyAvailability)
      .where(eq(weeklyAvailability.roomId, roomId))

    if (schedules.length > 0) {
      await tx.insert(weeklyAvailability).values(
        schedules.map((s) => ({
          roomId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        }))
      )
    }
  })

  revalidatePath("/admin/availability")
}

export async function getOverrides(roomId: string) {
  const result = await db
    .select()
    .from(availabilityOverrides)
    .where(eq(availabilityOverrides.roomId, roomId))
    .orderBy(availabilityOverrides.date)
  return result
}

export async function createOverride(roomId: string, formData: FormData) {
  await requireAdmin()

  const date = formData.get("date") as string
  if (!date) throw new Error("Date is required")

  const isClosed = formData.get("isClosed") === "true"
  const startTime = isClosed ? null : (formData.get("startTime") as string) || null
  const endTime = isClosed ? null : (formData.get("endTime") as string) || null
  const reason = (formData.get("reason") as string) || null

  await db.insert(availabilityOverrides).values({
    roomId,
    date,
    isClosed,
    startTime,
    endTime,
    reason,
  })

  revalidatePath("/admin/availability")
}

export async function deleteOverride(id: string) {
  await requireAdmin()
  await db.delete(availabilityOverrides).where(eq(availabilityOverrides.id, id))
  revalidatePath("/admin/availability")
}
