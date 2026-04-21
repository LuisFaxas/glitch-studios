---
phase: 10-blog
plan: 05
type: execute
wave: 2
depends_on: [10-02]
files_modified:
  - src/components/blog/blog-hero-banner.tsx
autonomous: true
requirements: [BLOG-02]
must_haves:
  truths:
    - "BlogHeroBanner renders a featured post as a full-width hero block (16:9 cover + gradient + headline + excerpt + metadata + READ POST CTA)"
    - "Component returns null when the post prop is null (zero-featured fallback per D-01)"
    - "Hero image uses next/image with the `priority` prop for LCP optimization"
    - "Headline is wrapped in GlitchHeading per site-wide hover-only glitch rule"
    - "Metadata row shows reading-time + date using ReadingTimeBadge"
    - "CTA reads 'READ POST' and links to /blog/{post.slug}"
  artifacts:
    - path: "src/components/blog/blog-hero-banner.tsx"
      provides: "Featured post hero block rendered above the blog grid"
      exports: ["BlogHeroBanner"]
  key_links:
    - from: "src/components/blog/blog-hero-banner.tsx"
      to: "src/lib/reading-time.ts readingTimeCached"
      via: "Computes minutes on server; renders via ReadingTimeBadge"
      pattern: "readingTimeCached"
    - from: "src/components/blog/blog-hero-banner.tsx"
      to: "src/components/ui/glitch-heading.tsx"
      via: "Headline wrapped in GlitchHeading"
      pattern: "GlitchHeading"
    - from: "src/components/blog/blog-hero-banner.tsx"
      to: "/blog/{slug}"
      via: "READ POST CTA as Next.js <Link>"
      pattern: "/blog/"
---

<objective>
Create BlogHeroBanner, a server component that renders the featured post as a dominant hero block above the card grid (D-02). When no post is featured, the component returns null so the blog page shows the grid directly (zero-featured fallback, D-01).

Purpose: Delivers the hero-post engagement hook from BLOG-02's success criterion 2. Plan 06 wires this component into the /blog page.

Output: Single new file — a server component that accepts `post: FeaturedPost | null` and renders the hero or nothing.
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
@.planning/phases/10-blog/10-02-SUMMARY.md

@src/components/blog/post-card.tsx
@src/components/ui/glitch-heading.tsx
@src/lib/reading-time.ts
@src/components/blog/reading-time-badge.tsx

<interfaces>
From src/lib/reading-time.ts (Plan 02 output):

    export const readingTimeCached: (content: string) => number

From src/components/blog/reading-time-badge.tsx (Plan 02 output):

    interface ReadingTimeBadgeProps { minutes: number; className?: string }
    export function ReadingTimeBadge(props): JSX.Element

From src/types (via BlogPost + BlogCategory):

    type BlogPost = {
      id: string
      title: string
      slug: string
      excerpt: string | null
      content: string
      coverImageUrl: string | null
      publishedAt: Date | null
      isFeatured: boolean  // added in Plan 01
      // ... other fields
    }
    type BlogCategory = { id: string; name: string; slug: string }

GlitchHeading usage pattern: confirm exact API before writing (see src/components/ui/glitch-heading.tsx).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create BlogHeroBanner server component</name>
  <files>src/components/blog/blog-hero-banner.tsx</files>
  <read_first>
    - src/components/ui/glitch-heading.tsx (to confirm the GlitchHeading prop API — `as`, `className`, `style` support)
    - src/components/blog/post-card.tsx (after Plan 03 — to match category badge styling for consistency with the hero's category badge)
    - src/lib/reading-time.ts (for readingTimeCached import)
    - src/components/blog/reading-time-badge.tsx (for ReadingTimeBadge import)
    - .planning/phases/10-blog/10-UI-SPEC.md (Color section for hero gradient `from-black/90 via-black/50 to-black/0`, Typography section for display clamp, Copywriting Contract for READ POST copy)
    - .planning/phases/10-blog/10-CONTEXT.md (D-02 specifics)
  </read_first>
  <action>
    Create src/components/blog/blog-hero-banner.tsx with this content:

        import Link from "next/link"
        import Image from "next/image"
        import { GlitchHeading } from "@/components/ui/glitch-heading"
        import { ReadingTimeBadge } from "./reading-time-badge"
        import { readingTimeCached } from "@/lib/reading-time"
        import type { BlogPost, BlogCategory } from "@/types"

        interface BlogHeroBannerProps {
          post: (BlogPost & { category?: BlogCategory | null }) | null
        }

        /**
         * Featured-post hero banner rendered above the /blog grid (D-02).
         * Returns null when post is null (zero-featured fallback per D-01).
         *
         * Structure:
         *   - 16:9 cover image with next/image priority prop (LCP)
         *   - Dark vertical gradient overlay (locked palette, pure black alpha stops)
         *   - Category badge (if any)
         *   - Headline in GlitchHeading, fluid clamp(28px, 5vw, 48px)
         *   - Excerpt (Inter 14px, max-width 640px, line-clamp-3)
         *   - Metadata row: ReadingTimeBadge + middle-dot + date (mono uppercase short-form)
         *   - Primary CTA button "READ POST" linking to /blog/{slug}
         */
        export function BlogHeroBanner({ post }: BlogHeroBannerProps) {
          if (!post) return null

          const minutes = readingTimeCached(post.content)
          const formattedDate = post.publishedAt
            ? new Date(post.publishedAt)
                .toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
                .toUpperCase()
                .replace(",", "")
            : null

          return (
            <section className="relative w-full bg-[#000000] border border-[#222222] overflow-hidden mb-6">
              {/* 16:9 cover */}
              <div className="relative aspect-video">
                {post.coverImageUrl ? (
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 1024px"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: [
                        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
                        "radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)",
                      ].join(", "),
                    }}
                    aria-hidden="true"
                  />
                )}
                {/* Dark gradient overlay per UI-SPEC Color section */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/0 pointer-events-none"
                  aria-hidden="true"
                />
              </div>

              {/* Content block anchored to the bottom of the image on desktop, stacked below on mobile */}
              <div className="relative md:absolute md:inset-x-0 md:bottom-0 px-6 md:px-12 py-6 md:py-12 flex flex-col gap-4 max-w-4xl">
                {post.category && (
                  <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start">
                    {post.category.name.toUpperCase()}
                  </span>
                )}

                <GlitchHeading
                  as="h2"
                  className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] leading-tight"
                  style={{ fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.1 }}
                >
                  {post.title}
                </GlitchHeading>

                {post.excerpt && (
                  <p className="font-sans text-[14px] text-[#888888] line-clamp-3 max-w-[640px] leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <ReadingTimeBadge minutes={minutes} />
                  <span className="text-[#555555]">·</span>
                  {formattedDate && (
                    <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                      {formattedDate}
                    </time>
                  )}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-block self-start bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase tracking-wide px-6 py-3 mt-2 hover:bg-[#f5f5f0]/90 transition-colors"
                >
                  READ POST
                </Link>
              </div>
            </section>
          )
        }

    IMPORTANT: Before writing, confirm GlitchHeading's API. If it doesn't accept inline `style`, replace the fontSize style with a Tailwind arbitrary class like `text-[clamp(28px,5vw,48px)]`. If it doesn't accept `as`, use its default tag (the component's internal choice) — the hover-glitch behavior is the only non-negotiable point.

    Note the responsive content positioning:
    - Mobile (<md): content stacks vertically below the image (relative positioning)
    - Desktop (>=md): content is absolutely positioned over the bottom of the image using the gradient for legibility

    All colors come from the locked palette (#000000, #0a0a0a, #111111, #222222, #f5f5f0, #888888, #555555). No new hex values.
  </action>
  <verify>
    <automated>test -f src/components/blog/blog-hero-banner.tsx &amp;&amp; ! grep -q "\"use client\"" src/components/blog/blog-hero-banner.tsx &amp;&amp; grep -q "export function BlogHeroBanner" src/components/blog/blog-hero-banner.tsx &amp;&amp; grep -q "if (!post) return null" src/components/blog/blog-hero-banner.tsx &amp;&amp; grep -q "readingTimeCached" src/components/blog/blog-hero-banner.tsx &amp;&amp; grep -q "GlitchHeading" src/components/blog/blog-hero-banner.tsx &amp;&amp; grep -q "READ POST" src/components/blog/blog-hero-banner.tsx &amp;&amp; grep -q "priority" src/components/blog/blog-hero-banner.tsx &amp;&amp; grep -q "from-black/90" src/components/blog/blog-hero-banner.tsx &amp;&amp; grep -q "ReadingTimeBadge" src/components/blog/blog-hero-banner.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at src/components/blog/blog-hero-banner.tsx
    - Does NOT contain `"use client"` (Server Component)
    - Exports `BlogHeroBanner` (named export)
    - Accepts `post: (BlogPost & { category?: BlogCategory | null }) | null`
    - Contains the exact guard `if (!post) return null`
    - Calls `readingTimeCached(post.content)` to derive minutes
    - Renders title through `<GlitchHeading` (grep matches)
    - Contains the literal CTA text `READ POST`
    - Contains `<Link href={`/blog/${post.slug}`}>` on the CTA
    - Contains the `priority` prop on the `<Image>` for LCP
    - Contains the gradient `from-black/90 via-black/50 to-black/0`
    - Renders `<ReadingTimeBadge` in the metadata row
    - Contains the middle-dot separator `·`
    - CTA classes include `bg-[#f5f5f0]` + `text-[#000000]` (inverse accent per UI-SPEC)
    - Uses fluid headline size via clamp (either inline style with `clamp(28px, 5vw, 48px)` or Tailwind `text-[clamp(28px,5vw,48px)]`)
    - Placeholder (when coverImageUrl is null) uses the same radial gradient + slice texture pattern as PostCardPlaceholder
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>BlogHeroBanner renders a complete featured-post hero with cover, gradient, GlitchHeading headline, excerpt, metadata, and READ POST CTA. Returns null when post is null.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- Once wired in Plan 06: /blog shows hero above the grid when a post is flagged `is_featured=true`; hero disappears when none is flagged
</verification>

<success_criteria>
- New component `BlogHeroBanner` exists as a Server Component
- Returns null for the zero-featured fallback (D-01)
- Uses readingTimeCached + ReadingTimeBadge (shared helpers from Plan 02)
- Headline wrapped in GlitchHeading (hover-only glitch, site-wide rule)
- CTA label matches UI-SPEC Copywriting Contract exactly (`READ POST`)
- All colors sourced from the locked palette
</success_criteria>

<output>
After completion, create `.planning/phases/10-blog/10-05-SUMMARY.md` documenting: the component's exact prop signature (for Plan 06 to consume), how the zero-featured fallback behaves, and any GlitchHeading API adjustments that had to be made.
</output>
