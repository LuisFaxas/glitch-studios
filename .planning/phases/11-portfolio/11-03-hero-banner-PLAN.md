---
phase: 11-portfolio
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/portfolio/portfolio-hero-banner.tsx
autonomous: true
requirements: [PORT-07]
must_haves:
  truths:
    - "PortfolioHeroBanner renders a featured portfolio item as a full-width 16:9 hero block with gradient overlay, GlitchHeading title, category chip, description, and a VIEW WORK CTA"
    - "When the item prop is null the component returns null (zero-feature fallback per D-10)"
    - "Hero image uses next/image with the priority prop for LCP optimization"
    - "When item has no thumbnailUrl but is a YouTube embed, fallback uses https://img.youtube.com/vi/{videoId}/maxresdefault.jpg"
    - "When item has neither thumbnailUrl nor YouTube ID, placeholder is the same radial-gradient + slice-texture pattern used in VideoCardPlaceholder / PostCardPlaceholder"
    - "Headline is wrapped in GlitchHeading per site-wide hover-only glitch rule"
    - "CTA reads 'VIEW WORK' and links to /portfolio/{item.slug}"
  artifacts:
    - path: "src/components/portfolio/portfolio-hero-banner.tsx"
      provides: "Featured portfolio item hero block rendered above the index grid"
      exports: ["PortfolioHeroBanner"]
  key_links:
    - from: "src/components/portfolio/portfolio-hero-banner.tsx"
      to: "src/components/ui/glitch-heading.tsx"
      via: "Headline wrapped in GlitchHeading"
      pattern: "GlitchHeading"
    - from: "src/components/portfolio/portfolio-hero-banner.tsx"
      to: "/portfolio/{slug}"
      via: "VIEW WORK CTA as Next.js Link"
      pattern: "/portfolio/"
---

<objective>
Create PortfolioHeroBanner — a Server Component that renders the featured portfolio item as a dominant hero block above the grid (D-08). When no item is featured (`isFeatured = true`), the component returns null so the index page renders h1 + filter + grid without hero (zero-feature fallback, D-10).

Purpose: Delivers the hero affordance required by PORT-07's "featured hero + grid" refinement. Plan 06 wires this component into `/portfolio`.

Output: Single new file — Server Component accepting `item: PortfolioItem | null` rendering hero or nothing. Mirrors Phase 10's BlogHeroBanner structure.
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

@src/components/blog/blog-hero-banner.tsx
@src/components/ui/glitch-heading.tsx
@src/db/schema.ts

<interfaces>
<!-- Phase 10 twin (pattern source). Copy its structure, adapt to PortfolioItem. -->

From src/components/blog/blog-hero-banner.tsx:
```typescript
interface BlogHeroBannerProps {
  post: (BlogPost & { category?: BlogCategory | null }) | null
}
export function BlogHeroBanner({ post }: BlogHeroBannerProps): JSX.Element | null
```
- Returns null when post is null
- Renders <section> with aspect-video <Image fill priority />
- Gradient overlay: from-black/90 via-black/50 to-black/0
- Category pill, GlitchHeading title with clamp(28px,5vw,48px), excerpt, metadata row, CTA
- CTA: bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase

From src/types (via InferSelectModel<typeof portfolioItems>):
```typescript
type PortfolioItem = {
  id: string
  title: string
  slug: string
  type: string                // "case_study" | "video"
  category: string | null
  description: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  isYouTubeEmbed: boolean | null
  clientName: string | null
  // ... other fields
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create PortfolioHeroBanner Server Component</name>
  <files>src/components/portfolio/portfolio-hero-banner.tsx</files>
  <read_first>
    - src/components/blog/blog-hero-banner.tsx (twin — copy the full structure, adapt for PortfolioItem; the Phase 10 plan 10-05 produced this)
    - src/components/ui/glitch-heading.tsx (confirm exact usage: `<GlitchHeading text={title}>{title}</GlitchHeading>` — same as blog-hero-banner.tsx line 65)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-08 hero requirements, D-10 zero-feature fallback)
    - .planning/phases/11-portfolio/11-UI-SPEC.md (Color section: gradient `from-black/90 via-black/50 to-black/0`; Typography: display clamp; Copywriting Contract: "VIEW WORK" CTA)
    - .planning/phases/11-portfolio/11-RESEARCH.md (Example 1 "Featured hero using existing blog pattern")
  </read_first>
  <action>
    Create `src/components/portfolio/portfolio-hero-banner.tsx` with this exact content:

    ```typescript
    import Link from "next/link"
    import Image from "next/image"
    import { GlitchHeading } from "@/components/ui/glitch-heading"
    import type { PortfolioItem } from "@/types"

    interface PortfolioHeroBannerProps {
      item: PortfolioItem | null
    }

    function extractYouTubeId(url: string): string | null {
      const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      )
      return match ? match[1] : null
    }

    /**
     * Featured portfolio item hero block rendered above the /portfolio grid (D-08).
     * Returns null when item is null (zero-feature fallback per D-10).
     *
     * Structure (mirrors Phase 10 BlogHeroBanner):
     *   - 16:9 cover image with next/image priority (LCP)
     *   - Fallback image: YouTube maxresdefault when isYouTubeEmbed && videoUrl
     *   - Fallback placeholder: radial gradient + slice texture
     *   - Dark vertical gradient overlay (from-black/90 via-black/50 to-black/0)
     *   - Category pill (if any)
     *   - Headline in GlitchHeading, fluid clamp(28px, 5vw, 48px)
     *   - Description (Inter 14px, max-width 640px, line-clamp-3)
     *   - Primary CTA "VIEW WORK" linking to /portfolio/{slug}
     */
    export function PortfolioHeroBanner({ item }: PortfolioHeroBannerProps) {
      if (!item) return null

      const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
      const coverUrl =
        item.thumbnailUrl ??
        (item.isYouTubeEmbed && videoId
          ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          : null)

      return (
        <section className="relative w-full bg-[#000000] border border-[#222222] overflow-hidden mb-6">
          {/* 16:9 cover */}
          <div className="relative aspect-video">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={item.title}
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
            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/0 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* Content block anchored to bottom of image on desktop, stacked on mobile */}
          <div className="relative md:absolute md:inset-x-0 md:bottom-0 px-6 md:px-12 py-6 md:py-12 flex flex-col gap-4 max-w-4xl">
            {item.category && (
              <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start">
                {item.category.toUpperCase()}
              </span>
            )}

            <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] leading-tight text-[clamp(28px,5vw,48px)]">
              <GlitchHeading text={item.title}>{item.title}</GlitchHeading>
            </h2>

            {item.description && (
              <p className="font-sans text-[14px] text-[#888888] line-clamp-3 max-w-[640px] leading-relaxed">
                {item.description}
              </p>
            )}

            <Link
              href={`/portfolio/${item.slug}`}
              className="inline-block self-start bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase tracking-wide px-6 py-3 mt-2 hover:bg-[#f5f5f0]/90 transition-colors"
            >
              VIEW WORK
            </Link>
          </div>
        </section>
      )
    }
    ```

    Non-negotiable concrete values:
    - Server Component — NO `"use client"` directive.
    - Guard `if (!item) return null` is literal — do not replace with ternary or fragment.
    - `<Image>` uses `fill`, `priority`, `className="object-cover"`, `sizes="(max-width: 1024px) 100vw, 1024px"` — identical to Phase 10 BlogHeroBanner.
    - YouTube fallback URL: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` (verified pattern in RESEARCH Example 1).
    - Gradient overlay classes: `bg-gradient-to-t from-black/90 via-black/50 to-black/0` — exact.
    - Headline classes: `font-mono font-bold uppercase tracking-wide text-[#f5f5f0] leading-tight text-[clamp(28px,5vw,48px)]`.
    - CTA classes: `inline-block self-start bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase tracking-wide px-6 py-3 mt-2 hover:bg-[#f5f5f0]/90 transition-colors`.
    - CTA copy literal: `VIEW WORK` (UI-SPEC Copywriting Contract).
    - Category pill: same classes as Phase 10 BlogHeroBanner (`bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start`).
    - Category text rendered `{item.category.toUpperCase()}` (category column is lowercase in the DB).
    - Fallback placeholder styling is the same radial-gradient + slice-texture from BlogHeroBanner — do not invent a new pattern.
    - No ReadingTimeBadge / no date — portfolio items don't have `publishedAt` and don't need reading-time. (This is the only deliberate divergence from the blog twin.)
  </action>
  <verify>
    <automated>test -f src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; ! grep -q '"use client"' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'export function PortfolioHeroBanner' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'if (!item) return null' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'extractYouTubeId' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'img.youtube.com/vi/\${videoId}/maxresdefault.jpg' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'priority' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'from-black/90 via-black/50 to-black/0' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'GlitchHeading text={item.title}' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'text-\[clamp(28px,5vw,48px)\]' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'VIEW WORK' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'href={`/portfolio/\${item.slug}`}' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'bg-\[#f5f5f0\] text-\[#000000\]' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; grep -q 'sizes="(max-width: 1024px) 100vw, 1024px"' src/components/portfolio/portfolio-hero-banner.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `src/components/portfolio/portfolio-hero-banner.tsx`
    - Does NOT contain `"use client"` (Server Component)
    - Exports `PortfolioHeroBanner` (named export)
    - Accepts `item: PortfolioItem | null`
    - Contains exact guard `if (!item) return null`
    - Contains `extractYouTubeId` helper function
    - Contains YouTube fallback URL pattern `img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    - Uses `<Image ... priority ... fill ... className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />`
    - Gradient overlay classes include exact `from-black/90 via-black/50 to-black/0`
    - Headline wrapped as `<GlitchHeading text={item.title}>{item.title}</GlitchHeading>`
    - Headline classes include `text-[clamp(28px,5vw,48px)]`
    - Contains CTA literal text `VIEW WORK`
    - CTA href is `/portfolio/${item.slug}` (grep finds `href={`/portfolio/${item.slug}`}`)
    - CTA classes include exact tokens `bg-[#f5f5f0]` AND `text-[#000000]`
    - Fallback placeholder uses the same radial-gradient string as BlogHeroBanner: `radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)`
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>PortfolioHeroBanner renders a complete featured-item hero (cover + gradient + category + GlitchHeading + description + VIEW WORK CTA) or null when item is null. Structure mirrors Phase 10 BlogHeroBanner exactly.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- Manual: once Plan 06 wires this component, a DB row with `is_featured = true` renders a full-width hero above the grid; flipping it off hides the hero
</verification>

<success_criteria>
- PortfolioHeroBanner exists as a Server Component that mirrors Phase 10 BlogHeroBanner (one consistent hero pattern site-wide)
- Returns null for zero-feature fallback (D-10)
- Uses next/image with priority for LCP
- Headline wrapped in GlitchHeading
- CTA label matches UI-SPEC Copywriting Contract exactly (`VIEW WORK`)
- All colors from the locked palette
</success_criteria>

<output>
After completion, create `.planning/phases/11-portfolio/11-03-SUMMARY.md` documenting:
- Exact prop signature
- Behavior when coverUrl is null (placeholder rendering)
- Any GlitchHeading API adjustments that had to be made
- Confirmation that the fallback image URL pattern matches RESEARCH Example 1
</output>
