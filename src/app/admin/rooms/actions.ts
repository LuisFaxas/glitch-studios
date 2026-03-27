"use server"

import { db } from "@/lib/db"
import { rooms } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function getRooms() {
  const result = await db
    .select()
    .from(rooms)
    .orderBy(rooms.sortOrder)
  return result
}

export async function createRoom(formData: FormData) {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) throw new Error("Room name is required")

  const description = (formData.get("description") as string) || null
  const featuresRaw = (formData.get("features") as string) || ""
  const features = featuresRaw
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
  const hourlyRateOverride = formData.get("hourlyRateOverride")
    ? (formData.get("hourlyRateOverride") as string)
    : null
  const bufferMinutes = parseInt(
    (formData.get("bufferMinutes") as string) || "15",
    10
  )
  const isActive = formData.get("isActive") === "true"

  await db.insert(rooms).values({
    name: name.trim(),
    slug: slugify(name),
    description,
    features,
    hourlyRateOverride,
    bufferMinutes,
    isActive,
  })

  revalidatePath("/admin/rooms")
}

export async function updateRoom(id: string, formData: FormData) {
  await requireAdmin()

  const name = formData.get("name") as string
  if (!name?.trim()) throw new Error("Room name is required")

  const description = (formData.get("description") as string) || null
  const featuresRaw = (formData.get("features") as string) || ""
  const features = featuresRaw
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
  const hourlyRateOverride = formData.get("hourlyRateOverride")
    ? (formData.get("hourlyRateOverride") as string)
    : null
  const bufferMinutes = parseInt(
    (formData.get("bufferMinutes") as string) || "15",
    10
  )
  const isActive = formData.get("isActive") === "true"

  await db
    .update(rooms)
    .set({
      name: name.trim(),
      slug: slugify(name),
      description,
      features,
      hourlyRateOverride,
      bufferMinutes,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(rooms.id, id))

  revalidatePath("/admin/rooms")
}

export async function deleteRoom(id: string) {
  await requireAdmin()
  await db.delete(rooms).where(eq(rooms.id, id))
  revalidatePath("/admin/rooms")
}
