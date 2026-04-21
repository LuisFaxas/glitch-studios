---
phase: 11-portfolio
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/portfolio/video-card-placeholder.tsx
autonomous: true
requirements: [PORT-07]
must_haves:
  truths:
    - "VideoCardPlaceholder renders when a portfolio item has neither a thumbnailUrl nor a resolvable YouTube video ID"
    - "Placeholder displays the item title in mono uppercase inside a radial gradient with slice-line texture (mirrors Phase 10 PostCardPlaceholder)"
    - "Placeholder title is wrapped in GlitchHeading so hover-only RGB-split glitch is preserved (site-wide rule)"
    - "No 'NO IMAGE' or equivalent fallback label appears — the title IS the content"
  artifacts:
    - path: "src/components/portfolio/video-card-placeholder.tsx"
      provides: "On-brand placeholder for VideoCard when no imagery is available (D-12)"
      exports: ["VideoCardPlaceholder"]
  key_links:
    - from: "src/components/portfolio/video-card-placeholder.tsx"
      to: "src/components/ui/glitch-heading.tsx"
      via: "Title wrapped in GlitchHeading for hover-only glitch"
      pattern: "GlitchHeading"
---

<objective>
Create a portfolio-specific placeholder component for VideoCard thumbnails. Mirrors the Phase 10 PostCardPlaceholder pattern exactly so the blog and portfolio use the same visual language when imagery is missing (D-12).

Purpose: PORT-07 refinement — every portfolio card must fill its aspect-video slot on-brand even when thumbnailUrl and YouTube fallback both fail. No "NO IMAGE" placeholder text, no ugly default — the item title itself IS the placeholder content.

Output: One new file, one default-exported React component, zero dependencies beyond existing GlitchHeading.
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
@.planning/phases/11-portfolio/11-UI-SPEC.md

@src/components/blog/post-card-placeholder.tsx
@src/components/ui/glitch-heading.tsx

<interfaces>
<!-- Phase 10 twin (pattern source). Copy its structure with renamed symbol. -->

From src/components/blog/post-card-placeholder.tsx:
```typescript
interface PostCardPlaceholderProps { title: string }
export function PostCardPlaceholder({ title }: PostCardPlaceholderProps): JSX.Element
// Renders: radial-gradient + slice texture + h3 with GlitchHeading
// Exact gradient: "radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)"
// Exact texture: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)"
// Exact heading class: "font-mono font-bold uppercase tracking-wide text-[#f5f5f0] text-center line-clamp-3 text-[clamp(18px,3vw,28px)] leading-[1.1]"
```

GlitchHeading usage pattern (used across blog + portfolio):
```typescript
<GlitchHeading text={title}>{title}</GlitchHeading>
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create VideoCardPlaceholder (mirror PostCardPlaceholder)</name>
  <files>src/components/portfolio/video-card-placeholder.tsx</files>
  <read_first>
    - src/components/blog/post-card-placeholder.tsx (twin — copy structure verbatim, rename symbol)
    - src/components/ui/glitch-heading.tsx (confirm API: the Phase 10 twin uses `<GlitchHeading text={title}>{title}</GlitchHeading>` — replicate exactly)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-12 locks the pattern to "mirror Phase 10 D-04" — no deviation)
    - .planning/phases/11-portfolio/11-UI-SPEC.md (Color section: radial-gradient composition, no new hex values)
  </read_first>
  <action>
    Create `src/components/portfolio/video-card-placeholder.tsx` with this exact content:

    ```typescript
    import { GlitchHeading } from "@/components/ui/glitch-heading"

    interface VideoCardPlaceholderProps {
      title: string
    }

    /**
     * On-brand placeholder for VideoCard when neither a thumbnailUrl nor a
     * resolvable YouTube video ID is available (D-12).
     *
     * Mirrors Phase 10 `PostCardPlaceholder` verbatim (same gradient, same
     * texture, same heading clamp) so blog and portfolio share one visual
     * language for missing imagery.
     */
    export function VideoCardPlaceholder({ title }: VideoCardPlaceholderProps) {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
              "radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)",
            ].join(", "),
          }}
        >
          <h3 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] text-center line-clamp-3 text-[clamp(18px,3vw,28px)] leading-[1.1]">
            <GlitchHeading text={title}>{title}</GlitchHeading>
          </h3>
        </div>
      )
    }
    ```

    Non-negotiable values (copy exactly from Phase 10 twin):
    - Server Component — no `"use client"` directive. (Phase 10 twin has none.)
    - Wrapper classes: `w-full h-full flex items-center justify-center p-4 overflow-hidden`.
    - Inline `style.backgroundImage` is an array joined with `", "` — first stop is the repeating-linear-gradient slice texture, second stop is the radial-gradient. Order matters (texture on top of gradient).
    - Texture gradient: `"repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)"`.
    - Radial gradient: `"radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)"`.
    - Heading classes: `font-mono font-bold uppercase tracking-wide text-[#f5f5f0] text-center line-clamp-3 text-[clamp(18px,3vw,28px)] leading-[1.1]`.
    - Title wrapped in `<GlitchHeading text={title}>{title}</GlitchHeading>` — the exact double-child+text-prop pattern used in the rest of the codebase.
    - No "NO IMAGE" / "PLACEHOLDER" / fallback text nodes — the title IS the content (D-12 explicit).
  </action>
  <verify>
    <automated>test -f src/components/portfolio/video-card-placeholder.tsx &amp;&amp; ! grep -q '"use client"' src/components/portfolio/video-card-placeholder.tsx &amp;&amp; grep -q 'export function VideoCardPlaceholder' src/components/portfolio/video-card-placeholder.tsx &amp;&amp; grep -q 'radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)' src/components/portfolio/video-card-placeholder.tsx &amp;&amp; grep -q 'repeating-linear-gradient(0deg, transparent, transparent 3px' src/components/portfolio/video-card-placeholder.tsx &amp;&amp; grep -q 'text-\[clamp(18px,3vw,28px)\]' src/components/portfolio/video-card-placeholder.tsx &amp;&amp; grep -q 'GlitchHeading text={title}' src/components/portfolio/video-card-placeholder.tsx &amp;&amp; ! grep -qi 'NO IMAGE\|PLACEHOLDER' src/components/portfolio/video-card-placeholder.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `src/components/portfolio/video-card-placeholder.tsx`
    - Does NOT contain `"use client"` (Server Component — matches Phase 10 twin)
    - Named export `VideoCardPlaceholder` with props `{ title: string }`
    - Contains exact string literal `radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)` (grep)
    - Contains exact string literal `repeating-linear-gradient(0deg, transparent, transparent 3px` (grep)
    - Heading class string contains exact token `text-[clamp(18px,3vw,28px)]` (grep)
    - Heading class string contains `font-mono`, `font-bold`, `uppercase`, `tracking-wide`, `text-[#f5f5f0]`, `text-center`, `line-clamp-3`, `leading-[1.1]`
    - Title wrapped exactly as `<GlitchHeading text={title}>{title}</GlitchHeading>` (grep)
    - Does NOT contain any case-insensitive match for "NO IMAGE" or "PLACEHOLDER" as rendered text (grep)
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>VideoCardPlaceholder is a pixel-for-pixel twin of PostCardPlaceholder with a renamed symbol. Blog and portfolio now share one visual language for missing imagery.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- Visual diff between `/blog` (with a category-only post lacking a cover) and `/portfolio` (with an item lacking both `thumbnailUrl` and YouTube fallback) shows identical placeholder rendering
</verification>

<success_criteria>
- VideoCardPlaceholder renders identically to PostCardPlaceholder (pattern consistency)
- Title is the only visible content — no placeholder label
- GlitchHeading wrap preserved so hover-only glitch rule is honored site-wide
- Ready for Plan 04 (VideoCard refactor) to consume
</success_criteria>

<output>
After completion, create `.planning/phases/11-portfolio/11-02-SUMMARY.md` documenting:
- Exact prop signature
- Confirmation that Phase 10 twin's gradient + texture strings were copied verbatim
- Any GlitchHeading API note (if the twin's pattern changed)
</output>
