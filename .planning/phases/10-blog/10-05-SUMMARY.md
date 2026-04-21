---
phase: 10-blog
plan: 05
status: complete
---

# Plan 10-05 Summary — Blog hero banner

## What shipped

`BlogHeroBanner` server component at `src/components/blog/blog-hero-banner.tsx`.

Prop signature (for Plan 06 consumption):
```ts
interface BlogHeroBannerProps {
  post: (BlogPost & { category?: BlogCategory | null }) | null
}
```

Behavior:
- `if (!post) return null` — zero-featured fallback (D-01).
- 16:9 cover via `next/image` with `priority` (LCP optimization).
- Missing-cover fallback uses the same radial gradient + slice-line texture pattern as `PostCardPlaceholder`.
- Dark gradient overlay `bg-gradient-to-t from-black/90 via-black/50 to-black/0`.
- Headline wrapped in `GlitchHeading` (hover-only glitch) inside an `<h2>` with fluid size `text-[clamp(28px,5vw,48px)]`.
- Excerpt (`max-w-[640px] line-clamp-3`).
- Metadata row: `ReadingTimeBadge` + middle-dot separator + short-form date (`APR 20 2026`).
- Primary CTA `READ POST` → `/blog/{post.slug}` with inverse accent colors.
- Content block stacks below image on mobile (relative), overlays image bottom on `md+` (absolute).

## GlitchHeading API note

Mirrors Plan 10-03: `GlitchHeading` is a span wrapper needing `text` + `children`. Used inside an `<h2>` for semantic structure.

## Key files

created:
  - src/components/blog/blog-hero-banner.tsx

## Verification

- `pnpm tsc --noEmit` exits 0.
