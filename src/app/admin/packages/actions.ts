"use server"

import { db } from "@/lib/db"
import { sessionPackages, services, serviceBookingConfig } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function getPackages() {
  const result = await db
    .select({
      id: sessionPackages.id,
      serviceId: sessionPackages.serviceId,
      name: sessionPackages.name,
      sessionCount: sessionPackages.sessionCount,
      discountPercent: sessionPackages.discountPercent,
      isActive: sessionPackages.isActive,
      createdAt: sessionPackages.createdAt,
      serviceName: services.name,
    })
    .from(sessionPackages)
    .innerJoin(services, eq(sessionPackages.serviceId, services.id))
    .orderBy(services.name, sessionPackages.sessionCount)
  return result
}

export async function createPackage(formData: FormData) {
  await requireAdmin()

  const serviceId = formData.get("serviceId") as string
  if (!serviceId) throw new Error("Service is required")

  const name = formData.get("name") as string
  if (!name?.trim()) throw new Error("Package name is required")

  const sessionCount = parseInt(
    (formData.get("sessionCount") as string) || "4",
    10
  )
  const discountPercent = parseInt(
    (formData.get("discountPercent") as string) || "15",
    10
  )
  const isActive = formData.get("isActive") === "true"

  await db.insert(sessionPackages).values({
    serviceId,
    name: name.trim(),
    sessionCount,
    discountPercent,
    isActive,
  })

  revalidatePath("/admin/packages")
}

export async function updatePackage(id: string, formData: FormData) {
  await requireAdmin()

  const serviceId = formData.get("serviceId") as string
  if (!serviceId) throw new Error("Service is required")

  const name = formData.get("name") as string
  if (!name?.trim()) throw new Error("Package name is required")

  const sessionCount = parseInt(
    (formData.get("sessionCount") as string) || "4",
    10
  )
  const discountPercent = parseInt(
    (formData.get("discountPercent") as string) || "15",
    10
  )
  const isActive = formData.get("isActive") === "true"

  await db
    .update(sessionPackages)
    .set({
      serviceId,
      name: name.trim(),
      sessionCount,
      discountPercent,
      isActive,
    })
    .where(eq(sessionPackages.id, id))

  revalidatePath("/admin/packages")
}

export async function deletePackage(id: string) {
  await requireAdmin()
  await db.delete(sessionPackages).where(eq(sessionPackages.id, id))
  revalidatePath("/admin/packages")
}

export async function getServicesWithConfig() {
  const result = await db
    .select({
      id: services.id,
      name: services.name,
    })
    .from(services)
    .innerJoin(
      serviceBookingConfig,
      eq(services.id, serviceBookingConfig.serviceId)
    )
    .orderBy(services.name)
  return result
}
