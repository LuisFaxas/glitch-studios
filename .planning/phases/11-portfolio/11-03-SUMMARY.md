---
phase: 11-portfolio
plan: 03
status: complete
requirements: [PORT-07]
---

## Delivered

`PortfolioHeroBanner` server component. Renders a featured portfolio item as a 16:9 hero with gradient overlay, category pill, GlitchHeading headline, description, and a `VIEW WORK` CTA. Returns `null` when `item === null`.

## Contract

```ts
interface PortfolioHeroBannerProps { item: PortfolioItem | null }
export function PortfolioHeroBanner({ item }: PortfolioHeroBannerProps)
```

## Behavior

- `thumbnailUrl` → cover image via `next/image` (priority + object-cover).
- No `thumbnailUrl` but `isYouTubeEmbed && videoId` → fallback to `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`.
- Neither → radial gradient + slice texture placeholder (same pattern as VideoCardPlaceholder / PostCardPlaceholder).

## Notes

- Mirrors Phase 10 BlogHeroBanner structure verbatim except for reading-time / date (not applicable to portfolio).
- GlitchHeading usage unchanged: `<GlitchHeading text={item.title}>{item.title}</GlitchHeading>`.
- `pnpm tsc --noEmit` passes.
