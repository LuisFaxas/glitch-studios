"use server"

import { db } from "@/lib/db"
import { blogPosts, blogCategories } from "@/db/schema"
import { eq, and, desc, ne } from "drizzle-orm"
import { readingTimeCached } from "@/lib/reading-time"

const POSTS_PER_PAGE = 9

export async function loadMoreBlogPosts(params: {
  offset: number
  categorySlug: string | null
}) {
  const { offset, categorySlug } = params

  const conditions = [
    eq(blogPosts.status, "published"),
    ne(blogPosts.isFeatured, true),
  ]

  if (categorySlug) {
    const cat = await db
      .select({ id: blogCategories.id })
      .from(blogCategories)
      .where(eq(blogCategories.slug, categorySlug))
      .limit(1)
    if (cat[0]) {
      conditions.push(eq(blogPosts.categoryId, cat[0].id))
    } else {
      return { posts: [], hasMore: false }
    }
  }

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions)

  const rows = await db
    .select()
    .from(blogPosts)
    .where(whereClause)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(POSTS_PER_PAGE + 1)
    .offset(offset)

  const hasMore = rows.length > POSTS_PER_PAGE
  const posts = hasMore ? rows.slice(0, POSTS_PER_PAGE) : rows

  const categories = await db.select().from(blogCategories)
  const postsWithMeta = posts.map((post) => ({
    ...post,
    category: categories.find((c) => c.id === post.categoryId) ?? null,
    readingTime: readingTimeCached(post.content ?? ""),
  }))

  return { posts: postsWithMeta, hasMore }
}
