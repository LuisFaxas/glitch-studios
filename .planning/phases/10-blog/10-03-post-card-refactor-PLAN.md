---
phase: 10-blog
plan: 03
type: execute
wave: 2
depends_on: [10-02]
files_modified:
  - src/components/blog/post-card.tsx
  - src/components/blog/post-card-placeholder.tsx
autonomous: true
requirements: [BLOG-01]
must_haves:
  truths:
    - "Every PostCard renders with uniform height regardless of title length, excerpt length, or cover image presence"
    - "Every card has SOMETHING in the image slot — real cover when coverImageUrl is present, on-brand glitch-styled placeholder when null"
    - "No 'NO IMAGE' or 'No Image' text appears anywhere on the blog index"
    - "PostCard title is wrapped in GlitchHeading (hover-only glitch, site-wide rule)"
    - "PostCard metadata row shows reading-time + date, separated by ' · '"
  artifacts:
    - path: "src/components/blog/post-card.tsx"
      provides: "Refactored uniform-height card with fixed structure + GlitchHeading title + reading-time in metadata"
      contains: "ReadingTimeBadge"
    - path: "src/components/blog/post-card-placeholder.tsx"
      provides: "On-brand placeholder for cards without cover images (D-04)"
      exports: ["PostCardPlaceholder"]
  key_links:
    - from: "src/components/blog/post-card.tsx"
      to: "src/components/blog/post-card-placeholder.tsx"
      via: "Renders PostCardPlaceholder when post.coverImageUrl is null"
      pattern: "PostCardPlaceholder"
    - from: "src/components/blog/post-card.tsx"
      to: "src/lib/reading-time.ts + src/components/blog/reading-time-badge.tsx"
      via: "Computes minutes via readingTimeCached and renders ReadingTimeBadge"
      pattern: "readingTimeCached|ReadingTimeBadge"
    - from: "src/components/blog/post-card.tsx"
      to: "src/components/ui/glitch-heading.tsx"
      via: "Title wrapped in GlitchHeading per site-wide hover-only glitch rule"
      pattern: "GlitchHeading"
---

<objective>
Refactor PostCard to match D-03 (fixed structure + uniform height + reading time in metadata) and D-04 (on-brand placeholder in the image slot when there's no cover). Introduce PostCardPlaceholder as a sibling file. Wrap the card title in GlitchHeading per the site-wide hover-only glitch rule (memory: feedback_glitch_headers.md).

Purpose: Deliver BLOG-01 (consistent card sizes) and the card half of BLOG-02 (per-card reading-time). The current PostCard is already a Client Component with a glitch-hover overlay — we're extending it, not rewriting it.

Output: Refactored PostCard with uniform height and mandatory image slot. New PostCardPlaceholder component for the null-cover case.

Mandatory: Convert PostCard from Client Component to a Server Component so it can call readingTimeCached() directly. Extract the hover overlay into a tiny inline Client Component (or use group-hover Tailwind classes if possible to eliminate state entirely).
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

    export function readingTime(content: string): number
    export const readingTimeCached: (content: string) => number  // react.cache wrapped

From src/components/blog/reading-time-badge.tsx (Plan 02 output):

    interface ReadingTimeBadgeProps { minutes: number; className?: string }
    export function ReadingTimeBadge(props): JSX.Element

Current PostCard prop signature (must preserve):

    interface PostCardProps {
      post: BlogPost & { category?: BlogCategory | null }
    }

BlogPost type likely includes: id, title, slug, excerpt, content, coverImageUrl, categoryId, publishedAt, isFeatured (after Plan 01), etc.

GlitchHeading usage pattern (check the file — expected signature):

    <GlitchHeading as="h2" className="...">{text}</GlitchHeading>

Verify the actual API by reading src/components/ui/glitch-heading.tsx before writing the card.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create PostCardPlaceholder component</name>
  <files>src/components/blog/post-card-placeholder.tsx</files>
  <read_first>
    - src/components/blog/post-card.tsx (lines 58-67 — the current "No Image" placeholder we are replacing)
    - src/components/ui/glitch-heading.tsx (to confirm GlitchHeading's exact prop API before wrapping)
    - .planning/phases/10-blog/10-UI-SPEC.md (Color section — radial gradient spec for placeholder)
    - .planning/phases/10-blog/10-CONTEXT.md (D-04 specifics)
  </read_first>
  <action>
    Create src/components/blog/post-card-placeholder.tsx with this EXACT content. This is the D-04 replacement for the current "No Image" label — it shows the post title on a dark radial gradient with the existing slice texture.

        import { GlitchHeading } from "@/components/ui/glitch-heading"

        interface PostCardPlaceholderProps {
          title: string
        }

        /**
         * Renders when a post has no coverImageUrl (D-04).
         * - Dark radial gradient (#111 -> #0a0a0a -> #000) within locked palette
         * - Slice/line-repeat texture overlay (matches the previous placeholder feel)
         * - Post title rendered in GlitchHeading at clamp(18px, 3vw, 28px)
         * - No "NO IMAGE" label anywhere
         */
        export function PostCardPlaceholder({ title }: PostCardPlaceholderProps) {
          return (
            <div
              className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
              style={{
                backgroundImage: [
                  "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
                  "radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)",
                ].join(", "),
              }}
              aria-hidden="true"
            >
              <GlitchHeading
                as="h3"
                className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] text-center line-clamp-3"
                style={{ fontSize: "clamp(18px, 3vw, 28px)", lineHeight: 1.1 }}
              >
                {title}
              </GlitchHeading>
            </div>
          )
        }

    IMPORTANT: Before writing, confirm GlitchHeading's actual prop API by reading src/components/ui/glitch-heading.tsx. If it does NOT accept `as` prop or does NOT accept `style`, adapt this component to match its real API. The ONLY non-negotiable points are:
      1. Post title rendered through GlitchHeading (hover-only glitch, per site-wide rule)
      2. The radial gradient + slice texture backgroundImage
      3. No "NO IMAGE" / "No Image" text
      4. Title capped with line-clamp-3 so long titles don't overflow

    If GlitchHeading doesn't accept inline style, use a Tailwind class like `text-[clamp(18px,3vw,28px)]` instead.
  </action>
  <verify>
    <automated>test -f src/components/blog/post-card-placeholder.tsx &amp;&amp; grep -q "export function PostCardPlaceholder" src/components/blog/post-card-placeholder.tsx &amp;&amp; grep -q "GlitchHeading" src/components/blog/post-card-placeholder.tsx &amp;&amp; grep -q "radial-gradient" src/components/blog/post-card-placeholder.tsx &amp;&amp; ! grep -i "no image" src/components/blog/post-card-placeholder.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - src/components/blog/post-card-placeholder.tsx exists and exports `PostCardPlaceholder`
    - Accepts `title: string` prop
    - Renders title through `<GlitchHeading>` (not plain `<h2>` / `<h3>`)
    - Contains `radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)` in the backgroundImage
    - Contains the slice texture `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)`
    - Does NOT contain any case-insensitive match for "no image"
    - Title size uses the fluid clamp `clamp(18px, 3vw, 28px)` either via inline style or via `text-[clamp(18px,3vw,28px)]` Tailwind arbitrary
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>PostCardPlaceholder renders the post title as a glitch-ready heading on a radial gradient with slice texture. No "NO IMAGE" text anywhere.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Refactor PostCard to uniform structure + reading-time + placeholder usage + GlitchHeading title</name>
  <files>src/components/blog/post-card.tsx</files>
  <read_first>
    - src/components/blog/post-card.tsx (full file — you are rewriting the JSX structure while preserving the public prop signature and the glitch-hover overlay)
    - src/components/blog/post-card-placeholder.tsx (the component you just created in Task 1)
    - src/lib/reading-time.ts (to import readingTimeCached)
    - src/components/blog/reading-time-badge.tsx (to import ReadingTimeBadge)
    - src/components/ui/glitch-heading.tsx (to confirm its exact prop API before wrapping the title)
  </read_first>
  <action>
    Rewrite src/components/blog/post-card.tsx. The new structure follows D-03 exactly:

    1. Image slot (16:9 aspect-video) — ALWAYS present:
       - If `post.coverImageUrl` is non-null: existing `<Image>` from next/image, unchanged
       - If `post.coverImageUrl` is null: `<PostCardPlaceholder title={post.title} />`

    2. Content block (flex flex-col + p-4, allows h-full for uniform row height):
       - Category badge (if post.category): mono 11px, bg `#222222`, text `#888888` (EXACT existing styling — keep it)
       - Title: wrapped in `<GlitchHeading as="h2" ...>`. Classes: `font-mono font-bold text-xl text-[#f5f5f0] line-clamp-2 mt-2`
       - Excerpt (if present): `<p>` with `line-clamp-3 text-[#888888] font-sans text-[13px] mt-2`
       - Metadata row (mt-3, flex items-center gap-2): `<ReadingTimeBadge minutes={minutes} />` + middle dot separator `<span className="text-[#555555]">·</span>` + `<time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">{formattedDate}</time>`

    3. Date format per UI-SPEC Copywriting Contract: `APR 20 2026` (mono uppercase short-form). Use:
       ```ts
       const formattedDate = post.publishedAt
         ? new Date(post.publishedAt).toLocaleDateString("en-US", {
             month: "short", day: "2-digit", year: "numeric"
           }).toUpperCase().replace(",", "")
         : null
       ```

    4. Reading time: compute via `readingTimeCached(post.content)` — this ONLY works in a Server Component, so convert this file to Server.

    5. Server Component conversion (IMPORTANT):
       - Remove `"use client"` at the top
       - Remove the `useState` + `useCallback` + `onMouseEnter` / `onMouseLeave` / `isHovered` state
       - Replace the glitch-hover overlay (currently `isHovered && <div className="...animate-glitch-hover">`) with a Tailwind `group`-based hover implementation. The `<Link>` already has `className="group block"` — add a sibling div inside the `<article>` with classes:
         ```
         pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity
         ```
         Style: `{{ animationDuration: "100ms" }}` can stay inline.
       - The `border-[#444444]` hover state on `<article>`: replace with `group-hover:border-[#444444]` Tailwind class.
       - Keep `<article>` classes: `relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]` — note the added `h-full flex flex-col` for D-03 uniform height.
       - The inner content `<div className="p-4">` becomes `<div className="p-4 flex flex-col flex-1">` so the content block stretches to fill card height.

    6. Imports at top:
       ```ts
       import Link from "next/link"
       import Image from "next/image"
       import { GlitchHeading } from "@/components/ui/glitch-heading"
       import { PostCardPlaceholder } from "./post-card-placeholder"
       import { ReadingTimeBadge } from "./reading-time-badge"
       import { readingTimeCached } from "@/lib/reading-time"
       import type { BlogPost, BlogCategory } from "@/types"
       ```
       Remove the clsx import if no longer used (check after refactor).

    7. Preserve the public prop signature exactly:
       ```ts
       interface PostCardProps {
         post: BlogPost & { category?: BlogCategory | null }
       }
       export function PostCard({ post }: PostCardProps)
       ```

    DO NOT change the link destination (`/blog/${post.slug}`). DO NOT remove the existing glitch-hover animation class — just move it behind `group-hover` instead of React state.

    If `post.content` contains no text (e.g., empty draft — shouldn't happen on published posts), readingTimeCached will return 1 per its floor. That's fine.
  </action>
  <verify>
    <automated>! grep -q '"use client"' src/components/blog/post-card.tsx &amp;&amp; grep -q "GlitchHeading" src/components/blog/post-card.tsx &amp;&amp; grep -q "PostCardPlaceholder" src/components/blog/post-card.tsx &amp;&amp; grep -q "readingTimeCached" src/components/blog/post-card.tsx &amp;&amp; grep -q "ReadingTimeBadge" src/components/blog/post-card.tsx &amp;&amp; grep -q "line-clamp-2" src/components/blog/post-card.tsx &amp;&amp; grep -q "line-clamp-3" src/components/blog/post-card.tsx &amp;&amp; grep -q "h-full" src/components/blog/post-card.tsx &amp;&amp; grep -q "flex flex-col" src/components/blog/post-card.tsx &amp;&amp; ! grep -i "no image" src/components/blog/post-card.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `src/components/blog/post-card.tsx` does NOT contain `"use client"` (Server Component)
    - Does NOT contain `useState` or `useCallback` imports
    - Imports `GlitchHeading`, `PostCardPlaceholder`, `ReadingTimeBadge`, `readingTimeCached`
    - Title rendered through `<GlitchHeading` (grep matches)
    - When `post.coverImageUrl` is null, renders `<PostCardPlaceholder title={post.title} />` (grep matches PostCardPlaceholder)
    - Contains `line-clamp-2` (title) and `line-clamp-3` (excerpt)
    - Contains `h-full` and `flex flex-col` on `<article>` for uniform row height
    - Contains `readingTimeCached(post.content)` call
    - Renders `<ReadingTimeBadge` in the JSX
    - Contains the middle-dot separator `·` between reading-time and date in the metadata row
    - Date format uses `toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })` + `.toUpperCase()`
    - Hover overlay now uses `group-hover:` Tailwind classes, not React state
    - Does NOT contain any case-insensitive match for "no image"
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>PostCard is a Server Component with uniform height, mandatory image slot (real cover OR glitch placeholder), GlitchHeading title, reading-time in metadata, and group-hover glitch overlay (no client state).</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- Manually (or via Playwright in a later phase): /blog renders cards at equal height; a card with no cover shows the glitch placeholder; reading-time badge visible in metadata row
</verification>

<success_criteria>
- BLOG-01: all cards render at consistent heights regardless of title/excerpt length or cover presence
- Every card has SOMETHING in the image slot — no "NO IMAGE" text anywhere
- Card title is wrapped in GlitchHeading (hover-only glitch, site-wide rule)
- Reading-time badge is visible in the metadata row of every card
- Card is a Server Component — no client state for hover
</success_criteria>

<output>
After completion, create `.planning/phases/10-blog/10-03-SUMMARY.md` documenting: the new card structure, the Server Component conversion (and why), and the group-hover pattern that replaced useState.
</output>
