import { db } from "@/lib/db"
import { blogPosts } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { WidgetLatestPostClient } from "@/components/tiles/widget-latest-post-client"

/**
 * Latest Post widget -- async server component fetching most recent
 * published blog post from database (D-07).
 */
export async function WidgetLatestPost() {
  let latestPost: { title: string; slug: string; publishedAt: Date | null } | null = null

  try {
    const results = await db
      .select({
        title: blogPosts.title,
        slug: blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(1)

    latestPost = results[0] ?? null
  } catch {
    // DB unavailable -- show empty state silently (per UI-SPEC: widget silently hides on error)
    latestPost = null
  }

  if (!latestPost) {
    return <WidgetLatestPostClient title="No Posts Yet" slug={null} date={null} />
  }

  const dateStr = latestPost.publishedAt
    ? latestPost.publishedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <WidgetLatestPostClient
      title={latestPost.title}
      slug={latestPost.slug}
      date={dateStr}
    />
  )
}
