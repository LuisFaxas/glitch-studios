---
phase: 11-portfolio
plan: 04
type: execute
wave: 2
depends_on: [11-02]
files_modified:
  - src/components/portfolio/video-card.tsx
autonomous: true
requirements: [PORT-07]
must_haves:
  truths:
    - "Every VideoCard is a single <Link href='/portfolio/{slug}'> that wraps the entire card — no inline YouTube playback, no case-study/video branching"
    - "Clicking anywhere on the card navigates to /portfolio/{slug}"
    - "VideoCard renders a uniform layout with aspect-video thumbnail on top and equal-height info panel below (flex flex-col h-full)"
    - "Info panel ends with a metadata row containing the type chip (CASE STUDY or VIDEO) on the left and the year (derived from createdAt) on the right"
    - "Type chip uses bg-[#0a0a0a] to distinguish from the category chip's bg-[#222222]"
    - "VideoCard uses next/image (fill, object-cover) instead of raw <img>"
    - "When neither thumbnailUrl nor a resolvable YouTube ID is available, VideoCardPlaceholder renders in the image slot"
    - "The existing animate-glitch-hover overlay is preserved — runs only on hover (group-hover)"
    - "Title is wrapped in GlitchHeading (hover-only glitch, site-wide rule)"
  artifacts:
    - path: "src/components/portfolio/video-card.tsx"
      provides: "Uniform-height portfolio card that always links to the detail route"
      exports: ["VideoCard"]
  key_links:
    - from: "src/components/portfolio/video-card.tsx"
      to: "/portfolio/{slug}"
      via: "Entire card wrapped in <Link>"
      pattern: "href={`/portfolio/${item.slug}`}"
    - from: "src/components/portfolio/video-card.tsx"
      to: "src/components/portfolio/video-card-placeholder.tsx"
      via: "Rendered when no thumbnail AND no YouTube ID"
      pattern: "VideoCardPlaceholder"
    - from: "src/components/portfolio/video-card.tsx"
      to: "src/components/ui/glitch-heading.tsx"
      via: "Title wrapped in GlitchHeading"
      pattern: "GlitchHeading"
---

<objective>
Rebuild `VideoCard` around a single `<Link>` wrapper so every card navigates to `/portfolio/{slug}` (D-06). Replace inline YouTube playback + case-study/video branching with a uniform layout per D-11 (aspect-video cover, GlitchHeading title, category pill, line-clamp-2 description, metadata row with type chip + year). Preserve the existing `animate-glitch-hover` overlay (D-13). Render `VideoCardPlaceholder` when no cover is available (D-12).

Purpose: PORT-07 refinement — unifies the card interaction model (click → detail page) so the new prev/next navigation on the detail page (Plan 01) is coherent across case studies AND videos. Matches Phase 10 PostCard patterns for visual consistency.

Output: A refactored `src/components/portfolio/video-card.tsx` that is smaller, simpler, and has zero inline playback logic.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/11-portfolio/11-CONTEXT.md
@.planning/phases/11-portfolio/11-RESEARCH.md
@.planning/phases/11-portfolio/11-UI-SPEC.md
@.planning/phases/11-portfolio/11-02-SUMMARY.md

@src/components/portfolio/video-card.tsx
@src/components/blog/post-card.tsx
@src/components/portfolio/video-card-placeholder.tsx
@src/components/ui/glitch-heading.tsx
@src/db/schema.ts

<interfaces>
<!-- Plan 02 output (pattern dependency) -->

From src/components/portfolio/video-card-placeholder.tsx (Plan 02):
```typescript
interface VideoCardPlaceholderProps { title: string }
export function VideoCardPlaceholder({ title }: VideoCardPlaceholderProps): JSX.Element
```

<!-- Phase 10 twin pattern -->

From src/components/blog/post-card.tsx:
```typescript
// Entire card is <Link href="/blog/{slug}" className="group block h-full">
// Inner <article> uses "relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]"
// Glitch overlay: "pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity"
// Image wrapped in "aspect-video relative" div
// Info panel: "p-4 flex flex-col flex-1"
// Metadata row positioned with "mt-auto pt-3 flex items-center gap-2"
```

From src/types (PortfolioItem):
```typescript
// createdAt: Date (non-null)
// type: "case_study" | "video" (string — narrow at boundary per Pitfall 4)
// slug, title, category, description, thumbnailUrl, videoUrl, isYouTubeEmbed
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Refactor VideoCard to uniform-height linked card with type chip + year</name>
  <files>src/components/portfolio/video-card.tsx</files>
  <read_first>
    - src/components/portfolio/video-card.tsx (current implementation — to know what you are replacing)
    - src/components/blog/post-card.tsx (Phase 10 twin — copy the group-hover + article + metadata-row pattern verbatim, adapt fields to PortfolioItem)
    - src/components/portfolio/video-card-placeholder.tsx (Plan 02 output — import target)
    - src/components/ui/glitch-heading.tsx (confirm `<GlitchHeading text={title}>{title}</GlitchHeading>` pattern is used across the codebase — same as post-card.tsx line 56)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-06, D-11, D-12, D-13)
    - .planning/phases/11-portfolio/11-UI-SPEC.md (Typography: `font-mono font-bold text-lg` for title; Interaction Contract: "Entire card clickable"; Copywriting: type chip labels "CASE STUDY" / "VIDEO")
    - .planning/phases/11-portfolio/11-RESEARCH.md (Example 2 "Uniform VideoCard"; Pitfall 9 confirms homepage uses its OWN video-portfolio-carousel.tsx, so refactoring VideoCard does NOT affect the homepage)
  </read_first>
  <action>
    REPLACE the full contents of `src/components/portfolio/video-card.tsx` with:

    ```typescript
    "use client"

    import Link from "next/link"
    import Image from "next/image"
    import { GlitchHeading } from "@/components/ui/glitch-heading"
    import { VideoCardPlaceholder } from "./video-card-placeholder"
    import type { PortfolioItem } from "@/types"

    function extractYouTubeId(url: string): string | null {
      const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      )
      return match ? match[1] : null
    }

    /**
     * Uniform-height portfolio card. Every card is a single <Link> to the
     * detail route — no inline playback, no case-study/video branching (D-06).
     *
     * Layout (D-11 mirrors Phase 10 PostCard):
     *   - aspect-video thumbnail on top (next/image with fill + object-cover)
     *   - fallback to VideoCardPlaceholder when no image source resolves (D-12)
     *   - info panel below with category pill, GlitchHeading title, description
     *   - metadata row at the bottom: type chip (bg-#0a0a0a) + year (derived from createdAt)
     *   - group-hover animate-glitch-hover overlay preserved (D-13)
     */
    export function VideoCard({ item }: { item: PortfolioItem }) {
      const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
      const thumbnailUrl =
        item.isYouTubeEmbed && videoId
          ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          : item.thumbnailUrl || null

      // Pitfall 4: narrow item.type (text column, no enum)
      const typeLabel = item.type === "case_study" ? "CASE STUDY" : "VIDEO"
      const year = item.createdAt
        ? new Date(item.createdAt).getFullYear()
        : null

      return (
        <Link
          href={`/portfolio/${item.slug}`}
          className="group block h-full"
        >
          <article className="relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]">
            {/* Glitch hover overlay — hover-only per site-wide rule (D-13) */}
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity"
              style={{ animationDuration: "100ms" }}
              aria-hidden="true"
            />

            {/* Cover — aspect-video slot, always rendered */}
            <div className="aspect-video relative">
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <VideoCardPlaceholder title={item.title} />
              )}
            </div>

            {/* Info panel */}
            <div className="p-4 flex flex-col flex-1">
              {item.category && (
                <span className="bg-[#222222] text-[#888888] text-[11px] font-sans px-2 py-1 rounded-none inline-block mb-2 self-start">
                  {item.category}
                </span>
              )}
              <h3 className="font-mono font-bold text-lg text-[#f5f5f0] line-clamp-2 mt-2">
                <GlitchHeading text={item.title}>{item.title}</GlitchHeading>
              </h3>
              {item.description && (
                <p className="line-clamp-2 text-[#888888] font-sans text-[13px] mt-2">
                  {item.description}
                </p>
              )}

              {/* Metadata row: type chip left, year right */}
              <div className="mt-auto pt-3 flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888] bg-[#0a0a0a] px-2 py-1">
                  {typeLabel}
                </span>
                {year && (
                  <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                    {year}
                  </time>
                )}
              </div>
            </div>
          </article>
        </Link>
      )
    }
    ```

    Non-negotiable concrete values:
    - `"use client"` on line 1 (VideoCard was already a client component; keeping it so for next/image + hover consistency with twin).
    - Outer `<Link>` classes: `group block h-full` — enables `group-hover:*` cascade and equal-height grid cells.
    - Inner `<article>` classes: `relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]` — identical to PostCard.
    - Glitch overlay classes: `pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity` + inline `animationDuration: "100ms"` — identical to PostCard.
    - Image `sizes` attribute literal: `"(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"` (three-column grid on lg).
    - Info panel wrapper: `p-4 flex flex-col flex-1`.
    - Title classes: `font-mono font-bold text-lg text-[#f5f5f0] line-clamp-2 mt-2` (UI-SPEC Typography: `text-lg`).
    - Title element is `<h3>` (matches PostCard).
    - Title wrapped as `<GlitchHeading text={item.title}>{item.title}</GlitchHeading>`.
    - Description classes: `line-clamp-2 text-[#888888] font-sans text-[13px] mt-2`.
    - Metadata row classes: `mt-auto pt-3 flex items-center justify-between`.
    - Type chip classes: `font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888] bg-[#0a0a0a] px-2 py-1` — note `bg-[#0a0a0a]` to distinguish from category pill's `bg-[#222222]` (UI-SPEC "Accent reserved for"; CONTEXT.md specifics).
    - Type label ternary: `item.type === "case_study" ? "CASE STUDY" : "VIDEO"` — literal strings from UI-SPEC Copywriting Contract.
    - Year derived from `new Date(item.createdAt).getFullYear()`; guarded by `item.createdAt ? ... : null`.
    - DELETE from the old file: `useState` for `playing` and `isHovered`, `useCallback`, the inline `<iframe>`, the `Play` lucide icon import, the "View Case Study" button, the `isCaseStudy` branching. None of these exist in the new file.
  </action>
  <verify>
    <automated>test -f src/components/portfolio/video-card.tsx &amp;&amp; head -1 src/components/portfolio/video-card.tsx | grep -q '^"use client"' &amp;&amp; grep -q 'export function VideoCard' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'import Image from "next/image"' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'import { VideoCardPlaceholder }' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'import { GlitchHeading }' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'href={`/portfolio/\${item.slug}`}' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'group block h-full' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'group-hover:border-\[#444444\]' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'group-hover:animate-glitch-hover' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'item.type === "case_study" ? "CASE STUDY" : "VIDEO"' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'new Date(item.createdAt).getFullYear()' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'bg-\[#0a0a0a\]' src/components/portfolio/video-card.tsx &amp;&amp; grep -q 'mt-auto pt-3 flex items-center justify-between' src/components/portfolio/video-card.tsx &amp;&amp; ! grep -q '&lt;iframe' src/components/portfolio/video-card.tsx &amp;&amp; ! grep -q 'useState' src/components/portfolio/video-card.tsx &amp;&amp; ! grep -q 'View Case Study' src/components/portfolio/video-card.tsx &amp;&amp; ! grep -q 'setPlaying' src/components/portfolio/video-card.tsx &amp;&amp; pnpm tsc --noEmit &amp;&amp; pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - File `src/components/portfolio/video-card.tsx` exists
    - Line 1 is `"use client"`
    - Named export `VideoCard` accepting `{ item: PortfolioItem }`
    - Imports `Image` from `next/image` (refactored away from `<img>`)
    - Imports `VideoCardPlaceholder` from `./video-card-placeholder`
    - Imports `GlitchHeading` from `@/components/ui/glitch-heading`
    - Imports `Link` from `next/link`
    - Outer `<Link href={`/portfolio/${item.slug}`} className="group block h-full">` wraps the entire card
    - Contains `group-hover:border-[#444444]` and `group-hover:animate-glitch-hover` (hover overlay preserved)
    - Type label ternary literal: `item.type === "case_study" ? "CASE STUDY" : "VIDEO"`
    - Year extraction: `new Date(item.createdAt).getFullYear()`
    - Type chip includes `bg-[#0a0a0a]` (distinct from category pill bg)
    - Metadata row wrapper: `mt-auto pt-3 flex items-center justify-between`
    - Renders `<VideoCardPlaceholder title={item.title} />` in the fallback branch
    - Does NOT contain `<iframe` (no inline YouTube playback)
    - Does NOT contain `useState` or `setPlaying` (no play state)
    - Does NOT contain the text `View Case Study` (replaced by whole-card link)
    - Does NOT contain `Play` icon import (no in-card play button)
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0 (or warnings-only)
  </acceptance_criteria>
  <done>VideoCard is a single-Link uniform-height card that renders type chip + year metadata, preserves the glitch hover overlay, uses next/image, falls back to VideoCardPlaceholder, and wraps the title in GlitchHeading. No inline playback, no case-study/video branching in the card.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0 (or warnings-only)
- Visual diff against a blog card (PostCard): both should have identical outer article styling, metadata row positioning, glitch-hover behavior
- Playwright verification (Plan 07) confirms card click navigates to /portfolio/{slug} (no inline iframe appears)
- Homepage `/` "Our Work" section (which uses `src/components/home/video-portfolio-carousel.tsx`, NOT this VideoCard per RESEARCH Pitfall 9) must still render unchanged — grep confirms no import of `@/components/portfolio/video-card` from `src/components/home/`
</verification>

<success_criteria>
- Single interaction model: whole card → detail page (D-06)
- Uniform grid cells (all VideoCards equal height via flex flex-col h-full)
- Type chip + year metadata row visible and correctly labeled (D-11)
- Fallback placeholder on-brand (D-12 via VideoCardPlaceholder)
- Glitch-hover overlay preserved (D-13, hover-only)
- No inline YouTube playback anywhere in the card
- Homepage portfolio section unaffected (Pitfall 9 guard)
</success_criteria>

<output>
After completion, create `.planning/phases/11-portfolio/11-04-SUMMARY.md` documenting:
- Confirmation that `<iframe>`, `useState`, `Play` icon import, and "View Case Study" label were all removed
- Confirmation that Homepage `/` still renders (grep for `@/components/portfolio/video-card` under `src/components/home/` returns empty)
- Any notes on Tailwind class order after prettier-plugin-tailwindcss (if lint re-ordered classes)
</output>
