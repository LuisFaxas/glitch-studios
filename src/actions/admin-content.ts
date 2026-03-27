"use server"

import { db } from "@/lib/db"
import { teamMembers, testimonials } from "@/db/schema"
import { eq } from "drizzle-orm"
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

// === Team Members ===

export async function getTeamMembers() {
  await requirePermission("manage_content")
  return db.select().from(teamMembers).orderBy(teamMembers.sortOrder)
}

export async function getTeamMember(id: string) {
  await requirePermission("manage_content")
  const [member] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.id, id))
    .limit(1)
  if (!member) throw new Error("Team member not found")
  return member
}

interface TeamMemberFormData {
  name: string
  slug?: string
  role: string
  bio: string
  photoUrl: string | null
  socialLinks: string | null
  credits: string | null
  featuredTrackUrl: string | null
  sortOrder: number
}

export async function createTeamMember(data: TeamMemberFormData) {
  await requirePermission("manage_content")

  const slug = data.slug || slugify(data.name)

  const [inserted] = await db
    .insert(teamMembers)
    .values({
      name: data.name,
      slug,
      role: data.role,
      bio: data.bio,
      photoUrl: data.photoUrl,
      socialLinks: data.socialLinks,
      credits: data.credits,
      featuredTrackUrl: data.featuredTrackUrl,
      sortOrder: data.sortOrder,
    })
    .returning({ id: teamMembers.id })

  revalidatePath("/admin/team")
  return inserted
}

export async function updateTeamMember(id: string, data: TeamMemberFormData) {
  await requirePermission("manage_content")

  const slug = data.slug || slugify(data.name)

  await db
    .update(teamMembers)
    .set({
      name: data.name,
      slug,
      role: data.role,
      bio: data.bio,
      photoUrl: data.photoUrl,
      socialLinks: data.socialLinks,
      credits: data.credits,
      featuredTrackUrl: data.featuredTrackUrl,
      sortOrder: data.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(teamMembers.id, id))

  revalidatePath("/admin/team")
}

export async function deleteTeamMember(id: string) {
  await requirePermission("manage_content")
  await db.delete(teamMembers).where(eq(teamMembers.id, id))
  revalidatePath("/admin/team")
}

export async function reorderTeamMembers(orderedIds: string[]) {
  await requirePermission("manage_content")
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(teamMembers)
      .set({ sortOrder: i, updatedAt: new Date() })
      .where(eq(teamMembers.id, orderedIds[i]))
  }
  revalidatePath("/admin/team")
}

// === Testimonials ===

export async function getTestimonials() {
  await requirePermission("manage_content")
  return db.select().from(testimonials).orderBy(testimonials.sortOrder)
}

export async function getTestimonial(id: string) {
  await requirePermission("manage_content")
  const [testimonial] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1)
  if (!testimonial) throw new Error("Testimonial not found")
  return testimonial
}

interface TestimonialFormData {
  clientName: string
  clientTitle: string | null
  quote: string
  serviceType: string | null
  rating: number | null
  avatarUrl: string | null
  isActive: boolean
  sortOrder: number
}

export async function createTestimonial(data: TestimonialFormData) {
  await requirePermission("manage_content")

  const [inserted] = await db
    .insert(testimonials)
    .values({
      clientName: data.clientName,
      clientTitle: data.clientTitle,
      quote: data.quote,
      serviceType: data.serviceType,
      rating: data.rating,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    })
    .returning({ id: testimonials.id })

  revalidatePath("/admin/testimonials")
  return inserted
}

export async function updateTestimonial(id: string, data: TestimonialFormData) {
  await requirePermission("manage_content")

  await db
    .update(testimonials)
    .set({
      clientName: data.clientName,
      clientTitle: data.clientTitle,
      quote: data.quote,
      serviceType: data.serviceType,
      rating: data.rating,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    })
    .where(eq(testimonials.id, id))

  revalidatePath("/admin/testimonials")
}

export async function deleteTestimonial(id: string) {
  await requirePermission("manage_content")
  await db.delete(testimonials).where(eq(testimonials.id, id))
  revalidatePath("/admin/testimonials")
}
