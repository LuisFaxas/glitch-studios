import { Suspense } from "react"
import { db } from "@/lib/db"
import { blogPosts, blogCategories } from "@/db/schema"
import { eq, desc, and, count } from "drizzle-orm"
import { PostCard } from "@/components/blog/post-card"
import { CategoryFilter } from "@/components/blog/category-filter"
import type { Metadata } from "next"

const POSTS_PER_PAGE = 9

export const metadata: Metadata = {
  title: "Blog",
  description:
    "News, production tips, and behind-the-scenes content from Glitch Studios.",
}

async function BlogContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10))
  const categorySlug = params.category || null

  // Fetch categories
  const categories = await db.select().from(blogCategories)

  // Build query conditions
  const conditions = [eq(blogPosts.status, "published")]
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug)
    if (cat) conditions.push(eq(blogPosts.categoryId, cat.id))
  }

  // Fetch posts with pagination
  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions)

  const [posts, countResult] = await Promise.all([
    db
      .select()
      .from(blogPosts)
      .where(whereClause)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(POSTS_PER_PAGE)
      .offset((page - 1) * POSTS_PER_PAGE),
    db
      .select({ total: count() })
      .from(blogPosts)
      .where(whereClause),
  ])

  const total = countResult[0]?.total ?? 0
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)

  // Map category to each post
  const postsWithCategory = posts.map((post) => ({
    ...post,
    category: categories.find((c) => c.id === post.categoryId) ?? null,
  }))

  // Empty state
  if (posts.length === 0 && page === 1 && !categorySlug) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-mono font-bold text-4xl uppercase mb-4 text-white">
          No posts yet
        </h1>
        <p className="text-[#888888] text-lg">
          Check back soon for news, updates, and behind-the-scenes content.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight mb-8 text-white">
        Blog
      </h1>
      <Suspense fallback={null}>
        <CategoryFilter categories={categories} activeCategory={categorySlug} />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8">
        {postsWithCategory.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/blog?page=${p}${categorySlug ? `&category=${categorySlug}` : ""}`}
              className={`px-4 py-2 rounded-none font-mono text-sm ${
                p === page
                  ? "bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0]"
                  : "text-[#888888] hover:text-[#f5f5f0] hover:bg-[#222222]"
              }`}
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}

export default async function BlogPage(props: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  return <BlogContent searchParams={props.searchParams} />
}
