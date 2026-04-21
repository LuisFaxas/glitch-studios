---
phase: 11-portfolio
plan: 02
status: complete
requirements: [PORT-07]
---

## Delivered

`VideoCardPlaceholder` — pixel-for-pixel twin of `PostCardPlaceholder` with a renamed symbol.

## Contract

```ts
interface VideoCardPlaceholderProps { title: string }
export function VideoCardPlaceholder({ title }: VideoCardPlaceholderProps)
```

## Notes

- Server Component (no `"use client"`).
- Gradient and texture strings copied verbatim from Phase 10 twin.
- Title wrapped in `<GlitchHeading text={title}>{title}</GlitchHeading>`.
- No placeholder label — title IS the content.
- `pnpm tsc --noEmit` passes.
