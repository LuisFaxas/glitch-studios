---
phase: 10-blog
plan: 03
status: complete
---

# Plan 10-03 Summary — PostCard refactor + placeholder

## What shipped

- New `PostCardPlaceholder` component: renders title via `GlitchHeading` on radial gradient + slice-line texture. No "NO IMAGE" copy anywhere.
- `PostCard` converted from Client to Server Component. `useState`/`useCallback` removed. Hover overlay now uses Tailwind `group-hover:opacity-100 group-hover:animate-glitch-hover` instead of React state.
- Card has `h-full flex flex-col` with `p-4 flex flex-col flex-1` inner block + metadata row pinned to bottom via `mt-auto` — guarantees uniform height per D-03.
- Title wrapped in `<GlitchHeading text={title}>{title}</GlitchHeading>` (site-wide hover-only rule).
- Reading time computed via `readingTimeCached(post.content)` then rendered through `ReadingTimeBadge`.
- Metadata row: `{N} MIN READ · APR 20 2026` (mono uppercase short-form date per UI-SPEC).

## GlitchHeading API note

`GlitchHeading` is a `<span>` wrapper that takes `text` + `children` props (not `as`). Wrapped inside an actual `<h2>` / `<h3>` tag so semantic HTML is preserved while the hover RGB-split layers sit inside the heading.

## Key files

created:
  - src/components/blog/post-card-placeholder.tsx
modified:
  - src/components/blog/post-card.tsx

## Verification

- `pnpm tsc --noEmit` exits 0.
- Only consumer is `src/app/(public)/blog/page.tsx` (Server Component), so Server-Component conversion is safe.
