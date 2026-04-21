import { Suspense } from "react"
import { db } from "@/lib/db"
import { blogPosts, blogCategories } from "@/db/schema"
import { eq, desc, and, ne } from "drizzle-orm"
import { PostCard } from "@/components/blog/post-card"
import { CategoryFilter } from "@/components/blog/category-filter"
import { BlogHeroBanner } from "@/components/blog/blog-hero-banner"
import { LoadMoreButton } from "@/components/blog/load-more-button"
import { readingTimeCached } from "@/lib/reading-time"
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
  searchParams: Promise<{ offset?: string; category?: string }>
}) {
  const params = await searchParams
  const requestedOffset = Math.max(0, parseInt(params.offset || "0", 10))
  const categorySlug = params.category || null

  const categories = await db.select().from(blogCategories)

  let categoryId: string | null = null
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug)
    categoryId = cat?.id ?? null
  }

  let featured: (typeof blogPosts.$inferSelect & {
    category: (typeof blogCategories.$inferSelect) | null
  }) | null = null
  if (!categorySlug) {
    const featuredRows = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.status, "published"), eq(blogPosts.isFeatured, true)))
      .limit(1)
    if (featuredRows[0]) {
      const fp = featuredRows[0]
      featured = {
        ...fp,
        category: categories.find((c) => c.id === fp.categoryId) ?? null,
      }
    }
  }

  const gridConditions = [
    eq(blogPosts.status, "published"),
    ne(blogPosts.isFeatured, true),
  ]
  if (categoryId) gridConditions.push(eq(blogPosts.categoryId, categoryId))
  const whereClause = gridConditions.length === 1 ? gridConditions[0] : and(...gridConditions)

  const initialBatchSize = requestedOffset + POSTS_PER_PAGE
  const rows = await db
    .select()
    .from(blogPosts)
    .where(whereClause)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(initialBatchSize + 1)

  const hasMore = rows.length > initialBatchSize
  const gridRows = hasMore ? rows.slice(0, initialBatchSize) : rows

  const postsWithMeta = gridRows.map((post) => ({
    ...post,
    category: categories.find((c) => c.id === post.categoryId) ?? null,
    readingTime: readingTimeCached(post.content ?? ""),
  }))

  if (postsWithMeta.length === 0 && !featured) {
    if (categorySlug) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <h1 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]">
            BLOG
          </h1>
          <Suspense fallback={null}>
            <CategoryFilter categories={categories} activeCategory={categorySlug} />
          </Suspense>
          <div className="mt-16 text-center">
            <h2 className="font-mono font-bold text-2xl uppercase text-[#f5f5f0] mb-4">
              NO POSTS IN THIS CATEGORY
            </h2>
            <p className="text-[#888888] font-sans">
              Try a different category or clear the filter to see every post.
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-mono font-bold text-4xl uppercase mb-4 text-[#f5f5f0]">
          NO POSTS YET
        </h1>
        <p className="text-[#888888] font-sans">
          New writing is in the works. Check back soon.
        </p>
      </div>
    )
  }

  const nextOffset = gridRows.length

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]">
        BLOG
      </h1>
      <Suspense fallback={null}>
        <CategoryFilter categories={categories} activeCategory={categorySlug} />
      </Suspense>
      {featured && (
        <div className="mt-8">
          <BlogHeroBanner post={featured} />
        </div>
      )}
      {postsWithMeta.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8">
          {postsWithMeta.map((post) => (
            <PostCard key={post.id} post={post} minutes={post.readingTime} />
          ))}
        </div>
      )}
      <LoadMoreButton
        initialOffset={nextOffset}
        initialHasMore={hasMore}
        categorySlug={categorySlug}
      />
    </div>
  )
}

export default async function BlogPage(props: {
  searchParams: Promise<{ offset?: string; category?: string }>
}) {
  return <BlogContent searchParams={props.searchParams} />
}
