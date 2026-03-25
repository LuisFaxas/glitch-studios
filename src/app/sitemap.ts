export const dynamic = "force-dynamic"

import { MetadataRoute } from "next"
import { db } from "@/lib/db"
import { blogPosts, portfolioItems, teamMembers } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://glitchstudios.com"

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/artists`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ]

  // Dynamic blog routes
  const posts = await db
    .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  // Dynamic portfolio routes
  const items = await db
    .select({ slug: portfolioItems.slug, updatedAt: portfolioItems.updatedAt })
    .from(portfolioItems)
    .where(eq(portfolioItems.isActive, true))
  const portfolioRoutes: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${baseUrl}/portfolio/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  // Dynamic artist routes
  const members = await db
    .select({ slug: teamMembers.slug, updatedAt: teamMembers.updatedAt })
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
  const artistRoutes: MetadataRoute.Sitemap = members.map((member) => ({
    url: `${baseUrl}/artists/${member.slug}`,
    lastModified: member.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  return [...staticRoutes, ...blogRoutes, ...portfolioRoutes, ...artistRoutes]
}
