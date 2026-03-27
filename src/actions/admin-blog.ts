"use server"

import { db } from "@/lib/db"
import {
  blogPosts,
  blogCategories,
  blogTags,
  blogPostTags,
} from "@/db/schema"
import { eq, desc, ilike, and, count, sql } from "drizzle-orm"
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

interface BlogPostFormData {
  title: string
  slug: string
  excerpt: string
  categoryId: string
  tagNames: string[]
  coverImageUrl: string | null
  content: string
  status: "draft" | "scheduled" | "published"
  scheduledAt: string | null
}

export async function createBlogPost(data: BlogPostFormData) {
  const session = await requirePermission("manage_content")

  const slug = data.slug || slugify(data.title)
  const excerpt =
    data.excerpt || stripHtml(data.content).slice(0, 160) || ""

  let publishedAt: Date | null = null
  let scheduledAt: Date | null = null

  if (data.status === "published") {
    publishedAt = new Date()
  } else if (data.status === "scheduled" && data.scheduledAt) {
    scheduledAt = new Date(data.scheduledAt)
  }

  const [inserted] = await db
    .insert(blogPosts)
    .values({
      title: data.title,
      slug,
      excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl,
      categoryId: data.categoryId || null,
      authorId: session.user.id,
      status: data.status,
      publishedAt,
      scheduledAt,
    })
    .returning({ id: blogPosts.id })

  // Handle tags
  if (data.tagNames.length > 0) {
    for (const tagName of data.tagNames) {
      const trimmed = tagName.trim()
      if (!trimmed) continue
      const tagSlug = slugify(trimmed)

      // Find or create tag
      let tag = await db.query.blogTags.findFirst({
        where: eq(blogTags.slug, tagSlug),
      })
      if (!tag) {
        const [created] = await db
          .insert(blogTags)
          .values({ name: trimmed, slug: tagSlug })
          .returning()
        tag = created
      }

      await db.insert(blogPostTags).values({
        postId: inserted.id,
        tagId: tag.id,
      })
    }
  }

  revalidatePath("/admin/blog")
  revalidatePath("/blog")
  return inserted.id
}

export async function updateBlogPost(id: string, data: BlogPostFormData) {
  await requirePermission("manage_content")

  const slug = data.slug || slugify(data.title)
  const excerpt =
    data.excerpt || stripHtml(data.content).slice(0, 160) || ""

  // Get current post to handle status transitions
  const current = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
  })
  if (!current) throw new Error("Post not found")

  let publishedAt: Date | null = current.publishedAt
  let scheduledAt: Date | null = current.scheduledAt

  // Handle status transitions
  const from = current.status
  const to = data.status

  if (from === "draft" && to === "published") {
    publishedAt = new Date()
    scheduledAt = null
  } else if (from === "draft" && to === "scheduled") {
    scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null
  } else if (from === "scheduled" && to === "published") {
    publishedAt = new Date()
    scheduledAt = null
  } else if (from === "scheduled" && to === "draft") {
    scheduledAt = null
  } else if (from === "published" && to === "draft") {
    publishedAt = null
    scheduledAt = null
  } else if (to === "scheduled" && data.scheduledAt) {
    scheduledAt = new Date(data.scheduledAt)
  }

  await db
    .update(blogPosts)
    .set({
      title: data.title,
      slug,
      excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl,
      categoryId: data.categoryId || null,
      status: to,
      publishedAt,
      scheduledAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))

  // Delete-and-reinsert tags
  await db.delete(blogPostTags).where(eq(blogPostTags.postId, id))

  if (data.tagNames.length > 0) {
    for (const tagName of data.tagNames) {
      const trimmed = tagName.trim()
      if (!trimmed) continue
      const tagSlug = slugify(trimmed)

      let tag = await db.query.blogTags.findFirst({
        where: eq(blogTags.slug, tagSlug),
      })
      if (!tag) {
        const [created] = await db
          .insert(blogTags)
          .values({ name: trimmed, slug: tagSlug })
          .returning()
        tag = created
      }

      await db.insert(blogPostTags).values({
        postId: id,
        tagId: tag.id,
      })
    }
  }

  revalidatePath("/admin/blog")
  revalidatePath("/blog")
}

export async function deleteBlogPost(id: string) {
  await requirePermission("manage_content")
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
  revalidatePath("/admin/blog")
  revalidatePath("/blog")
}

export async function getBlogPosts(filters?: {
  status?: string
  search?: string
  page?: number
}) {
  const page = filters?.page ?? 1
  const perPage = 20
  const offset = (page - 1) * perPage

  const conditions: ReturnType<typeof eq>[] = []
  if (filters?.status && filters.status !== "all") {
    conditions.push(
      eq(blogPosts.status, filters.status as "draft" | "scheduled" | "published")
    )
  }
  if (filters?.search) {
    conditions.push(ilike(blogPosts.title, `%${filters.search}%`))
  }

  const whereClause =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions)

  const [posts, countResult] = await Promise.all([
    db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        status: blogPosts.status,
        coverImageUrl: blogPosts.coverImageUrl,
        categoryId: blogPosts.categoryId,
        categoryName: blogCategories.name,
        publishedAt: blogPosts.publishedAt,
        scheduledAt: blogPosts.scheduledAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(whereClause)
      .orderBy(desc(blogPosts.updatedAt))
      .limit(perPage)
      .offset(offset),
    db
      .select({ total: count() })
      .from(blogPosts)
      .where(whereClause),
  ])

  const total = countResult[0]?.total ?? 0

  return {
    posts,
    totalPages: Math.ceil(total / perPage),
    currentPage: page,
  }
}

export async function getBlogPost(id: string) {
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
  })
  if (!post) return null

  // Fetch tags
  const postTags = await db
    .select({ name: blogTags.name })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(eq(blogPostTags.postId, id))

  return {
    ...post,
    tagNames: postTags.map((t) => t.name),
  }
}

export async function getCategories() {
  const result = await db
    .select({
      id: blogCategories.id,
      name: blogCategories.name,
      slug: blogCategories.slug,
      postCount: sql<number>`count(${blogPosts.id})::int`,
    })
    .from(blogCategories)
    .leftJoin(blogPosts, eq(blogPosts.categoryId, blogCategories.id))
    .groupBy(blogCategories.id, blogCategories.name, blogCategories.slug)
    .orderBy(blogCategories.name)

  return result
}

export async function createCategory(name: string) {
  await requirePermission("manage_content")
  const catSlug = slugify(name)
  const [created] = await db
    .insert(blogCategories)
    .values({ name, slug: catSlug })
    .returning()
  revalidatePath("/admin/blog/categories")
  return created
}

export async function updateCategory(id: string, name: string) {
  await requirePermission("manage_content")
  const catSlug = slugify(name)
  await db
    .update(blogCategories)
    .set({ name, slug: catSlug })
    .where(eq(blogCategories.id, id))
  revalidatePath("/admin/blog/categories")
}

export async function deleteCategory(id: string) {
  await requirePermission("manage_content")
  // Set posts in this category to uncategorized
  await db
    .update(blogPosts)
    .set({ categoryId: null, updatedAt: new Date() })
    .where(eq(blogPosts.categoryId, id))
  await db.delete(blogCategories).where(eq(blogCategories.id, id))
  revalidatePath("/admin/blog/categories")
}

export async function getTags() {
  const result = await db
    .select({
      id: blogTags.id,
      name: blogTags.name,
      slug: blogTags.slug,
      postCount: sql<number>`count(${blogPostTags.id})::int`,
    })
    .from(blogTags)
    .leftJoin(blogPostTags, eq(blogPostTags.tagId, blogTags.id))
    .groupBy(blogTags.id, blogTags.name, blogTags.slug)
    .orderBy(blogTags.name)

  return result
}

export async function createTag(name: string) {
  await requirePermission("manage_content")
  const tagSlug = slugify(name)
  const [created] = await db
    .insert(blogTags)
    .values({ name, slug: tagSlug })
    .returning()
  revalidatePath("/admin/blog/categories")
  return created
}

export async function updateTag(id: string, name: string) {
  await requirePermission("manage_content")
  const tagSlug = slugify(name)
  await db
    .update(blogTags)
    .set({ name, slug: tagSlug })
    .where(eq(blogTags.id, id))
  revalidatePath("/admin/blog/categories")
}

export async function mergeTags(
  sourceTagIds: string[],
  targetTagId: string
) {
  await requirePermission("manage_content")

  for (const sourceId of sourceTagIds) {
    // Get all post associations for this source tag
    const sourcePosts = await db
      .select({ postId: blogPostTags.postId })
      .from(blogPostTags)
      .where(eq(blogPostTags.tagId, sourceId))

    for (const { postId } of sourcePosts) {
      // Check if target tag already associated with this post
      const existing = await db.query.blogPostTags.findFirst({
        where: and(
          eq(blogPostTags.postId, postId),
          eq(blogPostTags.tagId, targetTagId)
        ),
      })
      if (!existing) {
        await db
          .insert(blogPostTags)
          .values({ postId, tagId: targetTagId })
      }
    }

    // Delete source tag (cascade deletes its blogPostTags)
    await db.delete(blogTags).where(eq(blogTags.id, sourceId))
  }

  revalidatePath("/admin/blog/categories")
}

export async function deleteTag(id: string) {
  await requirePermission("manage_content")
  await db.delete(blogTags).where(eq(blogTags.id, id))
  revalidatePath("/admin/blog/categories")
}
