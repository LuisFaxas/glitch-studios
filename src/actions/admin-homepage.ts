"use server"

import { db } from "@/lib/db"
import { homepageSections, beats, portfolioItems } from "@/db/schema"
import { eq, asc, inArray } from "drizzle-orm"
import { requirePermission } from "@/lib/permissions"

export type HomepageSection = typeof homepageSections.$inferSelect

const DEFAULT_SECTIONS = [
  {
    sectionType: "hero",
    sortOrder: 0,
    isVisible: true,
    config: JSON.stringify({
      title: "GLITCH STUDIOS",
      subtitle: "Music. Video. Vision.",
      ctaText: "Book a Session",
      ctaLink: "/services",
    }),
  },
  {
    sectionType: "featured_beats",
    sortOrder: 1,
    isVisible: true,
    config: JSON.stringify({ beatIds: [] }),
  },
  {
    sectionType: "services",
    sortOrder: 2,
    isVisible: true,
    config: "{}",
  },
  {
    sectionType: "portfolio",
    sortOrder: 3,
    isVisible: true,
    config: "{}",
  },
  {
    sectionType: "testimonials",
    sortOrder: 4,
    isVisible: true,
    config: "{}",
  },
  {
    sectionType: "blog",
    sortOrder: 5,
    isVisible: true,
    config: "{}",
  },
]

export async function getHomepageSections(): Promise<HomepageSection[]> {
  await requirePermission("manage_settings")

  let sections = await db
    .select()
    .from(homepageSections)
    .orderBy(asc(homepageSections.sortOrder))

  if (sections.length === 0) {
    await db.insert(homepageSections).values(DEFAULT_SECTIONS)
    sections = await db
      .select()
      .from(homepageSections)
      .orderBy(asc(homepageSections.sortOrder))
  }

  return sections
}

export async function getPublicHomepageSections(): Promise<HomepageSection[]> {
  return db
    .select()
    .from(homepageSections)
    .where(eq(homepageSections.isVisible, true))
    .orderBy(asc(homepageSections.sortOrder))
}

export async function updateSectionOrder(orderedIds: string[]) {
  await requirePermission("manage_settings")

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(homepageSections)
      .set({ sortOrder: i, updatedAt: new Date() })
      .where(eq(homepageSections.id, orderedIds[i]))
  }
}

export async function updateSectionVisibility(
  sectionId: string,
  isVisible: boolean
) {
  await requirePermission("manage_settings")

  await db
    .update(homepageSections)
    .set({ isVisible, updatedAt: new Date() })
    .where(eq(homepageSections.id, sectionId))
}

export async function updateSectionConfig(
  sectionId: string,
  config: string
) {
  await requirePermission("manage_settings")

  await db
    .update(homepageSections)
    .set({ config, updatedAt: new Date() })
    .where(eq(homepageSections.id, sectionId))
}

export async function getAvailableBeats() {
  const rows = await db
    .select({ id: beats.id, title: beats.title })
    .from(beats)
    .where(eq(beats.status, "published"))
    .orderBy(asc(beats.title))

  return rows
}

export async function getAvailablePortfolioItems() {
  const rows = await db
    .select({ id: portfolioItems.id, title: portfolioItems.title })
    .from(portfolioItems)
    .where(eq(portfolioItems.isActive, true))
    .orderBy(asc(portfolioItems.title))

  return rows
}
