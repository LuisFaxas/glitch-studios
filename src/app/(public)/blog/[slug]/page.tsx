import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { blogPosts, blogCategories } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { PostContent } from "@/components/blog/post-content"
import type { Metadata } from "next"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1)

  const post = posts[0]
  if (!post) {
    return { title: "Post Not Found" }
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  }
}

export async function generateStaticParams() {
  try {
    const posts = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))

    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    // Return empty array when database is unavailable (e.g., build time)
    return []
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1)

  const post = posts[0]
  if (!post) {
    notFound()
  }

  // Fetch category if post has one
  let category = null
  if (post.categoryId) {
    const categories = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, post.categoryId))
      .limit(1)
    category = categories[0] ?? null
  }

  return <PostContent post={{ ...post, category }} />
}
