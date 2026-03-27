"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { serviceBookingConfig } from "@/db/schema"
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

export async function getServiceBookingConfig(serviceId: string) {
  const [config] = await db
    .select()
    .from(serviceBookingConfig)
    .where(eq(serviceBookingConfig.serviceId, serviceId))
    .limit(1)
  return config ?? null
}

export async function upsertServiceBookingConfig(
  serviceId: string,
  formData: FormData
) {
  await requireAdmin()

  const durationMinutes = parseInt(
    (formData.get("durationMinutes") as string) || "120",
    10
  )
  const depositType =
    (formData.get("depositType") as "percentage" | "flat") || "percentage"
  const depositValue = (formData.get("depositValue") as string) || "50"
  const autoConfirm = formData.get("autoConfirm") === "true"
  const cancellationWindowHours = parseInt(
    (formData.get("cancellationWindowHours") as string) || "48",
    10
  )
  const refundPolicy =
    (formData.get("refundPolicy") as "full" | "partial" | "none") || "full"
  const maxAdvanceBookingDays = parseInt(
    (formData.get("maxAdvanceBookingDays") as string) || "90",
    10
  )
  const prepInstructions =
    (formData.get("prepInstructions") as string) || null

  // Check if config exists
  const existing = await getServiceBookingConfig(serviceId)

  if (existing) {
    await db
      .update(serviceBookingConfig)
      .set({
        durationMinutes,
        depositType,
        depositValue,
        autoConfirm,
        cancellationWindowHours,
        refundPolicy,
        maxAdvanceBookingDays,
        prepInstructions,
        updatedAt: new Date(),
      })
      .where(eq(serviceBookingConfig.serviceId, serviceId))
  } else {
    await db.insert(serviceBookingConfig).values({
      serviceId,
      durationMinutes,
      depositType,
      depositValue,
      autoConfirm,
      cancellationWindowHours,
      refundPolicy,
      maxAdvanceBookingDays,
      prepInstructions,
    })
  }

  revalidatePath(`/admin/services/${serviceId}/booking-config`)
}
