---
phase: 11-portfolio
plan: 01
status: complete
requirements: [PORT-06]
---

## Delivered

PORT-06 end-to-end: prev/next navigation on `/portfolio/[slug]` with keyboard, mobile swipe, click navigation, and wrap-around. Detail route now branches on `item.type`.

## Key Files Created

- `src/lib/portfolio/get-portfolio-neighbors.ts` — cached neighbor helper (`server-only` + `react.cache`)
- `src/components/portfolio/prev-next-footer.tsx` — sticky footer, keyboard + click
- `src/components/portfolio/video-detail-layout.tsx` — minimal video-type layout
- `src/components/portfolio/portfolio-detail-layout.tsx` — swipe wrapper + footer composition
- `src/app/(public)/portfolio/[slug]/page.tsx` — type-branching route

## Contracts

```ts
export type PortfolioNeighbor = { slug: string; title: string }

export function getPortfolioNeighbors(
  currentSlug: string
): Promise<{ prev: PortfolioNeighbor; next: PortfolioNeighbor } | null>

// <PortfolioDetailLayout neighbors={neighbors}>{content}</PortfolioDetailLayout>
// <PrevNextFooter prev={prev} next={next} />
```

## Details

- Swipe threshold: **60px** (as specified). No tuning required.
- Horizontal-dominant guard: `Math.abs(dx) < Math.abs(dy)` short-circuits vertical scrolls.
- GlitchHeading API used as `<GlitchHeading text={item.title}>{item.title}</GlitchHeading>` — no adjustments.
- Route branches on literal `item.type === "case_study"`.
- Neighbor helper returns `null` when fewer than 2 active items → footer hidden gracefully.

## Verification

- `pnpm tsc --noEmit` passes.
- Visual verification happens in Plan 11-07 (Playwright).
