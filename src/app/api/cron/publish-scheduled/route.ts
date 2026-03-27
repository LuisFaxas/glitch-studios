export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { blogPosts } from "@/db/schema"
import { eq, and, lte } from "drizzle-orm"

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = new Date()

  // Find all scheduled posts whose scheduledAt has passed
  const scheduledPosts = await db
    .select({ id: blogPosts.id, title: blogPosts.title })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, "scheduled"),
        lte(blogPosts.scheduledAt, now)
      )
    )

  let published = 0

  for (const post of scheduledPosts) {
    try {
      await db
        .update(blogPosts)
        .set({
          status: "published",
          publishedAt: now,
          scheduledAt: null,
          updatedAt: now,
        })
        .where(eq(blogPosts.id, post.id))
      published++
    } catch (error) {
      console.error(
        `Failed to auto-publish post ${post.id} (${post.title}):`,
        error
      )
    }
  }

  return Response.json({
    published,
    total: scheduledPosts.length,
    timestamp: now.toISOString(),
  })
}
