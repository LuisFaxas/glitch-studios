---
phase: 10-blog
plan: 06
type: execute
wave: 3
depends_on: [10-01, 10-02, 10-03, 10-04, 10-05]
files_modified:
  - src/app/(public)/blog/page.tsx
  - src/components/blog/load-more-button.tsx
  - src/actions/public-blog.ts
autonomous: true
requirements: [BLOG-01, BLOG-02, BLOG-03]
must_haves:
  truths:
    - "The /blog page fetches the single featured post (is_featured=true) and renders BlogHeroBanner above the grid"
    - "When no post is featured, BlogHeroBanner returns null and the grid starts at the top (no placeholder)"
    - "Initial grid shows 9 non-featured published posts (or all posts up to ?offset=N if the URL has the offset query)"
    - "A LOAD MORE button appended below the grid fetches the next 9 posts and appends without page reload"
    - "URL updates to ?offset=N as posts are loaded (so deep-links preserve scroll position)"
    - "LOAD MORE button label swaps to LOADING... with a pulse while fetching"
    - "When there are no more posts, the LOAD MORE button disappears"
    - "Page h1 'BLOG' is wrapped in GlitchHeading"
    - "Tapping a category chip resets offset and refetches from offset=0 (handled in Plan 04 + query-params here)"
  artifacts:
    - path: "src/app/(public)/blog/page.tsx"
      provides: "Blog index with hero + category filter + grid + Load More"
      contains: "BlogHeroBanner"
    - path: "src/components/blog/load-more-button.tsx"
      provides: "Client component with loading state + offset advancement + server action integration"
      exports: ["LoadMoreButton"]
    - path: "src/actions/public-blog.ts"
      provides: "Server action to fetch next batch of non-featured posts"
      exports: ["loadMoreBlogPosts"]
  key_links:
    - from: "src/app/(public)/blog/page.tsx"
      to: "src/components/blog/blog-hero-banner.tsx"
      via: "Rendering BlogHeroBanner above the grid with the fetched featured post"
      pattern: "BlogHeroBanner"
    - from: "src/components/blog/load-more-button.tsx"
      to: "src/actions/public-blog.ts loadMoreBlogPosts"
      via: "Client calls server action, appends returned posts to client state"
      pattern: "loadMoreBlogPosts"
    - from: "src/app/(public)/blog/page.tsx"
      to: "src/db/schema.ts blogPosts.isFeatured (added in Plan 01)"
      via: "Query filters: featured post separately via eq(isFeatured, true); grid excludes featured via ne(isFeatured, true)"
      pattern: "isFeatured"
---

<objective>
Integrate everything: wire BlogHeroBanner, the refactored PostCard, the polished CategoryFilter, and a brand-new LoadMoreButton into /blog. Replace the current numeric pagination with offset-based Load More per D-05. Fetch the featured post (`is_featured=true`) separately and render it at the top.

Purpose: This is the integration plan — it makes every Wave 1 and Wave 2 deliverable visible on the page.

Output: Updated /blog page, new LoadMoreButton client component, new public-blog server action.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/10-blog/10-CONTEXT.md
@.planning/phases/10-blog/10-UI-SPEC.md
@.planning/phases/10-blog/10-01-SUMMARY.md
@.planning/phases/10-blog/10-02-SUMMARY.md
@.planning/phases/10-blog/10-03-SUMMARY.md
@.planning/phases/10-blog/10-04-SUMMARY.md
@.planning/phases/10-blog/10-05-SUMMARY.md

@src/app/(public)/blog/page.tsx
@src/components/blog/post-card.tsx
@src/components/blog/blog-hero-banner.tsx
@src/components/blog/category-filter.tsx
@src/db/schema.ts
@src/components/ui/glitch-heading.tsx

<interfaces>
Upstream artifacts (must consume):

From Plan 01 (src/db/schema.ts blogPosts):
- New column: `isFeatured: boolean` (non-null, default false)

From Plan 03 (src/components/blog/post-card.tsx):
- Now a Server Component that calls readingTimeCached internally — just render `<PostCard post={post} />`

From Plan 04 (src/components/blog/category-filter.tsx):
- Prop signature unchanged: `{ categories: BlogCategory[], activeCategory: string | null }`
- Click handler deletes `page` AND `offset` params — the page must pass `offset` (not `page`) going forward

From Plan 05 (src/components/blog/blog-hero-banner.tsx):
- `BlogHeroBanner({ post })` — renders null if post is null

Page-level query pattern already in src/app/(public)/blog/page.tsx:

    const conditions = [eq(blogPosts.status, "published")]
    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug)
      if (cat) conditions.push(eq(blogPosts.categoryId, cat.id))
    }
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create loadMoreBlogPosts server action</name>
  <files>src/actions/public-blog.ts</files>
  <read_first>
    - src/actions/admin-blog.ts (for the `"use server"` directive + the slugify helper + the shape of db.select returns — mirror the style)
    - src/app/(public)/blog/page.tsx (for the current query structure: eq(status, "published"), categorySlug handling)
    - src/db/schema.ts (blogPosts and blogCategories — confirm column names)
  </read_first>
  <action>
    Create src/actions/public-blog.ts with this content. This is a server action (safe to call from client components) that returns the next batch of non-featured published posts.

        "use server"

        import { db } from "@/lib/db"
        import { blogPosts, blogCategories } from "@/db/schema"
        import { eq, and, desc, ne, or, isNull } from "drizzle-orm"

        const POSTS_PER_PAGE = 9

        export async function loadMoreBlogPosts(params: {
          offset: number
          categorySlug: string | null
        }) {
          const { offset, categorySlug } = params

          // Build where conditions
          const conditions = [
            eq(blogPosts.status, "published"),
            // Exclude featured post from the grid (it's shown in the hero).
            // Using OR(ne(isFeatured, true), isNull(isFeatured)) is safest; schema is not-null, but defensive.
            ne(blogPosts.isFeatured, true),
          ]

          if (categorySlug) {
            // Look up category id once
            const cat = await db
              .select({ id: blogCategories.id })
              .from(blogCategories)
              .where(eq(blogCategories.slug, categorySlug))
              .limit(1)
            if (cat[0]) {
              conditions.push(eq(blogPosts.categoryId, cat[0].id))
            } else {
              // Category not found — return empty, not an error
              return { posts: [], hasMore: false }
            }
          }

          const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions)

          // Fetch one extra to determine hasMore without a separate count query
          const rows = await db
            .select()
            .from(blogPosts)
            .where(whereClause)
            .orderBy(desc(blogPosts.publishedAt))
            .limit(POSTS_PER_PAGE + 1)
            .offset(offset)

          const hasMore = rows.length > POSTS_PER_PAGE
          const posts = hasMore ? rows.slice(0, POSTS_PER_PAGE) : rows

          // Attach categories (one query, map client-side)
          const categories = await db.select().from(blogCategories)
          const postsWithCategory = posts.map((post) => ({
            ...post,
            category: categories.find((c) => c.id === post.categoryId) ?? null,
          }))

          return { posts: postsWithCategory, hasMore }
        }

    Notes:
    - Unused import `or` / `isNull` can be dropped if the linter complains; keep if the executor finds them needed for schema quirks. The active safety net is `ne(blogPosts.isFeatured, true)`.
    - `POSTS_PER_PAGE = 9` matches D-05 batch size.
    - The `limit(POSTS_PER_PAGE + 1)` + slice trick avoids a second COUNT query.
    - `hasMore: false` lets the client hide the LOAD MORE button.
  </action>
  <verify>
    <automated>test -f src/actions/public-blog.ts &amp;&amp; grep -q "\"use server\"" src/actions/public-blog.ts &amp;&amp; grep -q "export async function loadMoreBlogPosts" src/actions/public-blog.ts &amp;&amp; grep -q "ne(blogPosts.isFeatured, true)" src/actions/public-blog.ts &amp;&amp; grep -q "POSTS_PER_PAGE" src/actions/public-blog.ts &amp;&amp; grep -q "hasMore" src/actions/public-blog.ts &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists with `"use server"` directive at the top
    - Exports `loadMoreBlogPosts` async function
    - Accepts `{ offset: number; categorySlug: string | null }` params
    - Excludes featured post via `ne(blogPosts.isFeatured, true)`
    - Excludes non-published via `eq(blogPosts.status, "published")`
    - Batch size is 9 (constant `POSTS_PER_PAGE = 9`)
    - Returns `{ posts: Array, hasMore: boolean }`
    - `hasMore` determined by fetching one extra row (limit PER_PAGE + 1) and slicing
    - Each returned post includes `category` key (resolved from blogCategories)
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Server action fetches non-featured published posts with offset + category filter, returns posts + hasMore flag.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create LoadMoreButton client component</name>
  <files>src/components/blog/load-more-button.tsx</files>
  <read_first>
    - src/actions/public-blog.ts (the loadMoreBlogPosts signature you just created)
    - src/components/blog/post-card.tsx (to understand PostCardProps shape for appended posts)
    - src/components/blog/category-filter.tsx (for the nuqs / router pattern used elsewhere)
    - .planning/phases/10-blog/10-UI-SPEC.md (Copywriting Contract — "LOAD MORE", "LOADING...", error text)
    - package.json (to confirm `nuqs` is installed — referenced in CONTEXT.md code_context as reusable)
  </read_first>
  <action>
    Create src/components/blog/load-more-button.tsx with this content. This is a Client Component that owns the list of appended posts + offset + loading state.

        "use client"

        import { useState, useTransition } from "react"
        import { PostCard } from "./post-card"
        import { loadMoreBlogPosts } from "@/actions/public-blog"
        import type { BlogPost, BlogCategory } from "@/types"

        type PostWithCategory = BlogPost & { category?: BlogCategory | null }

        interface LoadMoreButtonProps {
          initialOffset: number           // offset AFTER the server-rendered initial batch
          initialHasMore: boolean
          categorySlug: string | null
        }

        /**
         * Renders the LOAD MORE button below the blog grid.
         * Owns the list of APPENDED posts (the server-rendered initial batch lives in page.tsx).
         * On click: calls loadMoreBlogPosts server action, appends posts, advances offset,
         * and updates the URL via history.replaceState (no navigation, no reload).
         *
         * States:
         *   - idle      -> "LOAD MORE"
         *   - loading   -> "LOADING..." with pulse
         *   - error     -> "COULDN'T LOAD MORE POSTS. TAP TO RETRY."
         *   - exhausted -> button hidden (no "No more posts" label per UI-SPEC)
         */
        export function LoadMoreButton({
          initialOffset,
          initialHasMore,
          categorySlug,
        }: LoadMoreButtonProps) {
          const [appended, setAppended] = useState<PostWithCategory[]>([])
          const [offset, setOffset] = useState(initialOffset)
          const [hasMore, setHasMore] = useState(initialHasMore)
          const [error, setError] = useState(false)
          const [isPending, startTransition] = useTransition()

          function handleClick() {
            setError(false)
            startTransition(async () => {
              try {
                const result = await loadMoreBlogPosts({ offset, categorySlug })
                const nextAppended = [...appended, ...(result.posts as PostWithCategory[])]
                const nextOffset = offset + result.posts.length
                setAppended(nextAppended)
                setOffset(nextOffset)
                setHasMore(result.hasMore)

                // Update URL to ?offset=N without navigation (deep-link support)
                const url = new URL(window.location.href)
                url.searchParams.set("offset", String(nextOffset))
                window.history.replaceState({}, "", url.toString())
              } catch (e) {
                setError(true)
              }
            })
          }

          if (!hasMore && appended.length === 0) return null  // nothing to show

          return (
            <>
              {appended.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-1">
                  {appended.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={handleClick}
                    disabled={isPending}
                    className={
                      "font-mono text-[11px] font-bold uppercase tracking-wide px-8 py-3 border transition-colors duration-200 " +
                      (isPending
                        ? "bg-[#111111] text-[#888888] border-[#222222] animate-pulse"
                        : "bg-[#111111] text-[#f5f5f0] border-[#222222] hover:bg-[#f5f5f0] hover:text-[#000000] hover:border-[#f5f5f0]")
                    }
                  >
                    {error
                      ? "COULDN'T LOAD MORE POSTS. TAP TO RETRY."
                      : isPending
                        ? "LOADING..."
                        : "LOAD MORE"}
                  </button>
                </div>
              )}
            </>
          )
        }

    Design notes:
    - `useTransition` gives us React's non-blocking pending state without manual abort logic.
    - We append rendered cards as a second grid (with `mt-1` matching the 4px Metro gap) rather than pushing into the server-rendered first grid — this keeps the Server Component in page.tsx purely stateless.
    - History replaceState (not pushState) so Back button doesn't traverse through every Load More click.
    - Error retries the SAME offset (because we didn't advance offset on failure).
  </action>
  <verify>
    <automated>test -f src/components/blog/load-more-button.tsx &amp;&amp; grep -q "\"use client\"" src/components/blog/load-more-button.tsx &amp;&amp; grep -q "export function LoadMoreButton" src/components/blog/load-more-button.tsx &amp;&amp; grep -q "LOAD MORE" src/components/blog/load-more-button.tsx &amp;&amp; grep -q "LOADING..." src/components/blog/load-more-button.tsx &amp;&amp; grep -q "loadMoreBlogPosts" src/components/blog/load-more-button.tsx &amp;&amp; grep -q "history.replaceState" src/components/blog/load-more-button.tsx &amp;&amp; grep -q "useTransition" src/components/blog/load-more-button.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File has `"use client"` directive
    - Exports `LoadMoreButton`
    - Props: `initialOffset: number`, `initialHasMore: boolean`, `categorySlug: string | null`
    - Uses `useTransition` for pending state
    - Calls `loadMoreBlogPosts` server action
    - Contains literal copy: `LOAD MORE`, `LOADING...`, `COULDN'T LOAD MORE POSTS. TAP TO RETRY.`
    - Updates URL via `window.history.replaceState` with `offset` search param
    - Button applies `animate-pulse` in loading state
    - Button hover state uses inverse fill (`hover:bg-[#f5f5f0] hover:text-[#000000]`)
    - Button typography: mono 11px bold uppercase tracking-wide (matches UI-SPEC Label/Metadata)
    - Button hidden when `hasMore === false`
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>LoadMoreButton renders appended cards below the server-rendered grid, handles loading/error states, and syncs URL offset without navigation.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Rewire /blog page — featured fetch, hero slot, offset-based initial batch, wire LoadMoreButton</name>
  <files>src/app/(public)/blog/page.tsx</files>
  <read_first>
    - src/app/(public)/blog/page.tsx (full file — you are rewriting the query + render structure while preserving metadata export + Suspense for CategoryFilter)
    - src/components/blog/blog-hero-banner.tsx (Plan 05 output — the component you are slotting in)
    - src/components/blog/load-more-button.tsx (the component you just created in Task 2)
    - src/actions/public-blog.ts (the server action signature — for the initial batch-with-hasMore logic)
    - src/db/schema.ts (to confirm blogPosts.isFeatured column exists after Plan 01)
    - src/components/ui/glitch-heading.tsx (for wrapping the BLOG h1)
  </read_first>
  <action>
    Rewrite src/app/(public)/blog/page.tsx with this structure. The key changes from the current file:
    1. Accept `offset` searchParam (replace the legacy `page` searchParam)
    2. Fetch the featured post separately (where is_featured = true, status = published)
    3. Grid query excludes featured (`ne(isFeatured, true)`) and returns up to `offset + 9` posts so deep-links land in the right place
    4. Wrap h1 in GlitchHeading
    5. Render `<BlogHeroBanner post={featured} />` above the grid
    6. Render `<LoadMoreButton>` below the grid
    7. Empty state copy from UI-SPEC Copywriting Contract

        import { Suspense } from "react"
        import { db } from "@/lib/db"
        import { blogPosts, blogCategories } from "@/db/schema"
        import { eq, desc, and, ne } from "drizzle-orm"
        import { PostCard } from "@/components/blog/post-card"
        import { CategoryFilter } from "@/components/blog/category-filter"
        import { BlogHeroBanner } from "@/components/blog/blog-hero-banner"
        import { LoadMoreButton } from "@/components/blog/load-more-button"
        import { GlitchHeading } from "@/components/ui/glitch-heading"
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

          // Fetch categories
          const categories = await db.select().from(blogCategories)

          // Resolve categoryId if filter applied
          let categoryId: string | null = null
          if (categorySlug) {
            const cat = categories.find((c) => c.slug === categorySlug)
            categoryId = cat?.id ?? null
          }

          // ---- Featured post (only show on the "all" view, not inside a category filter) ----
          let featured = null
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

          // ---- Grid posts ----
          // Exclude featured; apply category filter if present; fetch requestedOffset + PER_PAGE + 1
          // (the +1 lets us detect hasMore without a count query).
          const gridConditions = [
            eq(blogPosts.status, "published"),
            ne(blogPosts.isFeatured, true),
          ]
          if (categoryId) gridConditions.push(eq(blogPosts.categoryId, categoryId))
          const whereClause = gridConditions.length === 1 ? gridConditions[0] : and(...gridConditions)

          // Initial batch = rows from 0 .. (requestedOffset + PER_PAGE)
          const initialBatchSize = requestedOffset + POSTS_PER_PAGE
          const rows = await db
            .select()
            .from(blogPosts)
            .where(whereClause)
            .orderBy(desc(blogPosts.publishedAt))
            .limit(initialBatchSize + 1)  // +1 to detect hasMore

          const hasMore = rows.length > initialBatchSize
          const gridRows = hasMore ? rows.slice(0, initialBatchSize) : rows

          const postsWithCategory = gridRows.map((post) => ({
            ...post,
            category: categories.find((c) => c.id === post.categoryId) ?? null,
          }))

          // ---- Empty states per UI-SPEC Copywriting Contract ----
          if (postsWithCategory.length === 0 && !featured) {
            if (categorySlug) {
              return (
                <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
                  <GlitchHeading
                    as="h1"
                    className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8"
                    style={{ fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.1 }}
                  >
                    BLOG
                  </GlitchHeading>
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

          // Offset the LoadMoreButton should start from = how many grid posts were server-rendered
          const nextOffset = gridRows.length

          return (
            <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
              <GlitchHeading
                as="h1"
                className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8"
                style={{ fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.1 }}
              >
                BLOG
              </GlitchHeading>
              <Suspense fallback={null}>
                <CategoryFilter categories={categories} activeCategory={categorySlug} />
              </Suspense>
              {featured && (
                <div className="mt-8">
                  <BlogHeroBanner post={featured} />
                </div>
              )}
              {postsWithCategory.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8">
                  {postsWithCategory.map((post) => (
                    <PostCard key={post.id} post={post} />
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

    CRITICAL implementation points:
    - REMOVE the old numeric pagination `<nav>` at the bottom of the current file — it's replaced by LoadMoreButton.
    - REMOVE the `page` searchParam reading — replaced by `offset`. (Links still containing `?page=N` will fall back to offset=0, which is acceptable.)
    - The initial SSR batch fetches `requestedOffset + POSTS_PER_PAGE + 1` rows so a deep-link like `/blog?offset=18` server-renders posts 0-26 (three pages worth), matching D-05's "deep-link with ?offset=N renders the full batch up to that offset".
    - `nextOffset` passed to LoadMoreButton equals the actual number of grid posts rendered (so the client starts fetching from the correct spot).
    - The featured post is hidden inside a category filter view — if a user lands on `/blog?category=news`, they see only category posts, no hero.
    - Don't forget to wrap `<BlogHeroBanner post={featured} />` — even though the component returns null for a null post, adding the wrapping check `{featured && ...}` avoids an unnecessary render cycle.

    If GlitchHeading doesn't accept inline `style`, replace the fontSize style with `text-[clamp(28px,5vw,48px)]` Tailwind arbitrary class.
  </action>
  <verify>
    <automated>grep -q "BlogHeroBanner" src/app/\(public\)/blog/page.tsx &amp;&amp; grep -q "LoadMoreButton" src/app/\(public\)/blog/page.tsx &amp;&amp; grep -q "GlitchHeading" src/app/\(public\)/blog/page.tsx &amp;&amp; grep -q "ne(blogPosts.isFeatured, true)" src/app/\(public\)/blog/page.tsx &amp;&amp; grep -q "eq(blogPosts.isFeatured, true)" src/app/\(public\)/blog/page.tsx &amp;&amp; grep -q "offset" src/app/\(public\)/blog/page.tsx &amp;&amp; grep -q "NO POSTS YET" src/app/\(public\)/blog/page.tsx &amp;&amp; grep -q "NO POSTS IN THIS CATEGORY" src/app/\(public\)/blog/page.tsx &amp;&amp; ! grep -q "totalPages" src/app/\(public\)/blog/page.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - searchParams type uses `{ offset?: string; category?: string }` (no `page`)
    - Imports and renders `BlogHeroBanner`
    - Imports and renders `LoadMoreButton`
    - Imports and uses `GlitchHeading` for the page h1
    - Grid query filters include `ne(blogPosts.isFeatured, true)` (grep matches)
    - Featured query filters include `eq(blogPosts.isFeatured, true)` (grep matches)
    - Featured fetch is SKIPPED when `categorySlug` is non-null (inside an `if (!categorySlug)` block)
    - Contains empty-state copy `NO POSTS YET` and `NO POSTS IN THIS CATEGORY` matching UI-SPEC
    - Does NOT contain the old `totalPages` variable or numeric pagination `<nav>` block
    - Initial SSR batch size equals `requestedOffset + POSTS_PER_PAGE` (so deep-links work)
    - `LoadMoreButton` receives `initialOffset={nextOffset}` + `initialHasMore={hasMore}` + `categorySlug={categorySlug}`
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>/blog renders hero (if featured exists) + category filter + uniform grid + Load More. URL stays in sync with offset. Empty states use UI-SPEC copy.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- Manual: toggle `is_featured=true` on a post → /blog shows it in the hero. Untoggle → hero disappears. Scroll to bottom → LOAD MORE appends 9 more posts, URL shows ?offset=18. Reload with ?offset=18 → those 18 posts + hero render on initial HTML.
</verification>

<success_criteria>
- BLOG-01: cards render at uniform heights (Plan 03) and appear in both initial SSR grid AND LoadMore-appended grid
- BLOG-02: featured hero renders above the grid when is_featured=true exists; reading-time visible on every card (via PostCard from Plan 03); category filter row visible below h1 (from Plan 04)
- BLOG-03: LOAD MORE replaces numeric pagination; clicking appends 9 posts without reload; URL stays in sync; deep-links to ?offset=N work
- All empty-state and button copy matches UI-SPEC Copywriting Contract
- All hover / loading / error states per UI-SPEC Interaction Contract
</success_criteria>

<output>
After completion, create `.planning/phases/10-blog/10-06-SUMMARY.md` documenting: the final query structure (featured vs grid), the deep-link SSR batch-size calculation, and the LoadMoreButton ↔ server-action wiring for future debugging.
</output>
