"use server"

import { db } from "@/lib/db"
import {
  services,
  serviceBookingConfig,
  sessionPackages,
  bookingSeries,
  bookings,
} from "@/db/schema"
import { eq, and, inArray, sql } from "drizzle-orm"
import { requirePermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function getServices() {
  await requirePermission("manage_content")

  const allServices = await db
    .select()
    .from(services)
    .orderBy(services.sortOrder)

  // Check which services have booking config
  const configs = await db
    .select({ serviceId: serviceBookingConfig.serviceId })
    .from(serviceBookingConfig)

  const configSet = new Set(configs.map((c) => c.serviceId))

  return allServices.map((s) => ({
    ...s,
    hasBookingConfig: configSet.has(s.id),
  }))
}

export async function getService(id: string) {
  await requirePermission("manage_content")

  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1)

  if (!service) throw new Error("Service not found")

  // Check if has booking config
  const [config] = await db
    .select({ id: serviceBookingConfig.id })
    .from(serviceBookingConfig)
    .where(eq(serviceBookingConfig.serviceId, id))
    .limit(1)

  return { ...service, hasBookingConfig: !!config }
}

interface ServiceFormData {
  name: string
  slug?: string
  type: "studio_session" | "mixing" | "mastering" | "video_production" | "sfx" | "graphic_design"
  description: string
  shortDescription: string
  priceLabel: string
  features: string[]
  ctaText: string
  sortOrder: number
  isActive: boolean
}

export async function createService(data: ServiceFormData) {
  await requirePermission("manage_content")

  const slug = data.slug || slugify(data.name)

  const [inserted] = await db
    .insert(services)
    .values({
      name: data.name,
      slug,
      type: data.type,
      description: data.description,
      shortDescription: data.shortDescription,
      priceLabel: data.priceLabel,
      features: data.features,
      ctaText: data.ctaText || "Book Now",
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    })
    .returning({ id: services.id })

  revalidatePath("/admin/services")
  return inserted
}

export async function updateService(id: string, data: ServiceFormData) {
  await requirePermission("manage_content")

  // Check if service has booking config — restrict slug changes
  const [config] = await db
    .select({ id: serviceBookingConfig.id })
    .from(serviceBookingConfig)
    .where(eq(serviceBookingConfig.serviceId, id))
    .limit(1)

  const slug = data.slug || slugify(data.name)

  const [existing] = await db
    .select({ slug: services.slug })
    .from(services)
    .where(eq(services.id, id))
    .limit(1)

  if (config && existing && existing.slug !== slug) {
    throw new Error(
      "Cannot change slug for a service with booking configuration. This would break existing booking URLs."
    )
  }

  await db
    .update(services)
    .set({
      name: data.name,
      slug,
      type: data.type,
      description: data.description,
      shortDescription: data.shortDescription,
      priceLabel: data.priceLabel,
      features: data.features,
      ctaText: data.ctaText || "Book Now",
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id))

  revalidatePath("/admin/services")
}

export async function deactivateService(id: string) {
  await requirePermission("manage_content")

  // Check if service has active bookings
  const activeBookings = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.serviceId, id),
        inArray(bookings.status, ["pending", "confirmed"])
      )
    )
    .limit(1)

  if (activeBookings.length > 0) {
    throw new Error(
      "Cannot deactivate service with pending or confirmed bookings. Cancel or complete those bookings first."
    )
  }

  await db
    .update(services)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(services.id, id))

  revalidatePath("/admin/services")
}

export async function deleteService(id: string) {
  await requirePermission("manage_content")

  // Check for any references
  const [hasConfig] = await db
    .select({ id: serviceBookingConfig.id })
    .from(serviceBookingConfig)
    .where(eq(serviceBookingConfig.serviceId, id))
    .limit(1)

  const [hasPackage] = await db
    .select({ id: sessionPackages.id })
    .from(sessionPackages)
    .where(eq(sessionPackages.serviceId, id))
    .limit(1)

  const [hasSeries] = await db
    .select({ id: bookingSeries.id })
    .from(bookingSeries)
    .where(eq(bookingSeries.serviceId, id))
    .limit(1)

  const [hasBooking] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.serviceId, id))
    .limit(1)

  if (hasConfig || hasPackage || hasSeries || hasBooking) {
    throw new Error(
      "This service has booking history. Use deactivate instead."
    )
  }

  await db.delete(services).where(eq(services.id, id))

  revalidatePath("/admin/services")
}

export async function reorderServices(orderedIds: string[]) {
  await requirePermission("manage_content")

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(services)
      .set({ sortOrder: i, updatedAt: new Date() })
      .where(eq(services.id, orderedIds[i]))
  }

  revalidatePath("/admin/services")
}
