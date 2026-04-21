---
phase: 10-blog
plan: 07
type: execute
wave: 2
depends_on: [10-02]
files_modified:
  - src/components/blog/post-content.tsx
autonomous: true
requirements: [BLOG-02]
must_haves:
  truths:
    - "Post detail page (/blog/[slug]) shows a reading-time badge in its metadata row"
    - "The reading-time is computed via the shared readingTimeCached helper (same source as the index + hero)"
    - "The badge uses the same ReadingTimeBadge component as the blog index (single visual source)"
    - "Date format in the metadata row matches UI-SPEC: 'APR 20 2026' (mono uppercase short-form)"
    - "The local estimateReadTime() helper is deleted (no duplicate algorithm)"
  artifacts:
    - path: "src/components/blog/post-content.tsx"
      provides: "Post detail component consuming shared readingTimeCached + ReadingTimeBadge; no local reading-time algorithm"
      contains: "ReadingTimeBadge"
  key_links:
    - from: "src/components/blog/post-content.tsx"
      to: "src/lib/reading-time.ts readingTimeCached"
      via: "Replaces local estimateReadTime with shared cached helper"
      pattern: "readingTimeCached"
    - from: "src/components/blog/post-content.tsx"
      to: "src/components/blog/reading-time-badge.tsx"
      via: "Replaces the `{readTime} min read` span with <ReadingTimeBadge>"
      pattern: "ReadingTimeBadge"
---

<objective>
Update the post detail component to consume the shared reading-time helper (Plan 02) and render the shared ReadingTimeBadge in its metadata row. Delete the local `estimateReadTime` function. Align the date format with the UI-SPEC (`APR 20 2026` mono uppercase short-form).

Purpose: Satisfies the post-detail half of BLOG-02 ("reading time estimates that encourage browsing"). Also unifies the reading-time compute across the whole blog surface — one algorithm, one visual component.

Scope guardrail: This is the ONLY change allowed on `/blog/[slug]` this phase. DO NOT refactor the typography, prose styling, back-to-blog link, cover image markup, or the `dangerouslySetInnerHTML` content rendering. Those are explicitly out of scope per CONTEXT.md deferred list.

Output: Updated post-content.tsx. No new files.
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

@src/components/blog/post-content.tsx
@src/lib/reading-time.ts
@src/components/blog/reading-time-badge.tsx

<interfaces>
Current file (src/components/blog/post-content.tsx) has a local helper at lines 10-13:

    function estimateReadTime(content: string): number {
      const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length
      return Math.max(1, Math.ceil(wordCount / 200))
    }

And renders the reading time in the metadata row (line 59):

    <span>{readTime} min read</span>

Both will be replaced.

From Plan 02 (src/lib/reading-time.ts):

    export const readingTimeCached: (content: string) => number

From Plan 02 (src/components/blog/reading-time-badge.tsx):

    interface ReadingTimeBadgeProps { minutes: number; className?: string }
    export function ReadingTimeBadge(props): JSX.Element

PostContent is a Server Component (no "use client"). Safe to call readingTimeCached directly.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Replace local estimateReadTime with readingTimeCached + ReadingTimeBadge, align date format</name>
  <files>src/components/blog/post-content.tsx</files>
  <read_first>
    - src/components/blog/post-content.tsx (full file — editing in place, preserving Prose block and back-to-blog link)
    - src/lib/reading-time.ts (to confirm readingTimeCached export)
    - src/components/blog/reading-time-badge.tsx (to confirm ReadingTimeBadge prop shape)
    - .planning/phases/10-blog/10-UI-SPEC.md (Copywriting Contract — date format "APR 20 2026")
  </read_first>
  <action>
    Edit src/components/blog/post-content.tsx:

    1. DELETE the local helper (lines 10-13):
       ```ts
       function estimateReadTime(content: string): number {
         const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length
         return Math.max(1, Math.ceil(wordCount / 200))
       }
       ```

    2. Add imports at the top (after the existing `ArrowLeft` import):
       ```ts
       import { readingTimeCached } from "@/lib/reading-time"
       import { ReadingTimeBadge } from "./reading-time-badge"
       ```

    3. Replace the line `const readTime = estimateReadTime(post.content)` inside the component with:
       ```ts
       const minutes = readingTimeCached(post.content)
       ```

    4. Update the `formattedDate` definition to match UI-SPEC `APR 20 2026` format. Replace the existing:
       ```ts
       const formattedDate = post.publishedAt
         ? new Date(post.publishedAt).toLocaleDateString("en-US", {
             year: "numeric",
             month: "long",
             day: "numeric",
           })
         : null
       ```
       with:
       ```ts
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
       ```

    5. Replace the metadata row block (lines 52-60) with the new structure using ReadingTimeBadge:
       ```tsx
       <div className="flex flex-wrap items-center gap-2 mb-12">
         <ReadingTimeBadge minutes={minutes} />
         <span className="text-[#555555]">·</span>
         {formattedDate && (
           <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
             {formattedDate}
           </time>
         )}
         {post.category && (
           <>
             <span className="text-[#555555]">·</span>
             <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1">
               {post.category.name.toUpperCase()}
             </span>
           </>
         )}
       </div>
       ```

       Key behaviors of this new metadata row:
       - Reading-time first (leftmost), per UI-SPEC metadata row convention on cards/hero
       - Middle-dot separator `·` in muted color `#555555`
       - Date in mono 11px bold uppercase
       - Category badge appended at the end, only when present
       - All spacing via `gap-2` (8px, matches UI-SPEC Spacing token `sm`)

    6. Everything below the metadata row — the `<div className="prose...">` content block and the back-to-blog link — stays EXACTLY as-is. DO NOT touch the prose styling, the cover image markup, or the article header. Any changes outside the metadata row are explicitly out of scope for this plan.

    After the edits, the file's top-level structure should be:
      imports -> PostContentProps interface -> export function PostContent({ post }) -> {return JSX with Link, cover Image, h1, NEW metadata row, prose div}
    No `estimateReadTime` function anywhere.
  </action>
  <verify>
    <automated>grep -q "readingTimeCached" src/components/blog/post-content.tsx &amp;&amp; grep -q "ReadingTimeBadge" src/components/blog/post-content.tsx &amp;&amp; ! grep -q "estimateReadTime" src/components/blog/post-content.tsx &amp;&amp; ! grep -q "min read" src/components/blog/post-content.tsx &amp;&amp; grep -q "month: \"short\"" src/components/blog/post-content.tsx &amp;&amp; grep -q "toUpperCase" src/components/blog/post-content.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `src/components/blog/post-content.tsx` imports `readingTimeCached` from `@/lib/reading-time`
    - Imports `ReadingTimeBadge` from `./reading-time-badge`
    - Does NOT contain the function declaration `estimateReadTime`
    - Does NOT contain the lowercase string `min read` (the old format)
    - Contains call `readingTimeCached(post.content)`
    - Renders `<ReadingTimeBadge minutes={minutes}` in the metadata row
    - Date uses `toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })` + `.toUpperCase()` + `.replace(",", "")`
    - Middle-dot separator `·` present in the metadata row
    - Category badge moved into the SAME metadata row (flex-wrap gap-2) with uppercase name
    - No changes to the prose block (`dangerouslySetInnerHTML`) or back-to-blog link
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>Post detail page shows shared ReadingTimeBadge in its metadata row. Local estimate helper removed. Date format aligned with UI-SPEC. Prose content untouched.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- Manual: visit any `/blog/{slug}` → metadata row shows `N MIN READ · APR 20 2026 · {CATEGORY}` in mono uppercase; content below unchanged
</verification>

<success_criteria>
- Reading-time on post detail derives from the shared helper (single source of truth)
- Badge component reused (single visual source of truth)
- Date format matches UI-SPEC (APR 20 2026)
- Local estimateReadTime function is deleted
- No changes outside the metadata row (scope discipline)
</success_criteria>

<output>
After completion, create `.planning/phases/10-blog/10-07-SUMMARY.md` documenting: the exact metadata row structure, the UI-SPEC date format adoption, and confirmation that the prose / back-link / cover image / h1 remain untouched (scope boundary held).
</output>
