---
phase: 11-portfolio
plan: 06
status: complete
requirements: [PORT-07]
---

## Delivered

`/portfolio` index rewritten as: h1 `PORTFOLIO` (GlitchHeading) → optional `PortfolioHeroBanner` (featured) → `PortfolioGrid` (chips + VideoCard grid).

## Queries

```ts
Promise.all([
  db.select().from(portfolioItems)
    .where(eq(portfolioItems.isActive, true))
    .orderBy(asc(portfolioItems.sortOrder)),
  db.select().from(portfolioItems)
    .where(
      and(
        eq(portfolioItems.isActive, true),
        eq(portfolioItems.isFeatured, true)
      )
    )
    .limit(1),
])
```

## Notes

- `PortfolioCarousel` no longer imported from `/portfolio/page.tsx`. Legacy file `src/components/portfolio/portfolio-carousel.tsx` is left in place and becomes orphaned (safe to remove in a later cleanup pass, per plan).
- Featured item is NOT excluded from the grid (D-08 explicit).
- Zero-items fallback copy "Portfolio coming soon" preserved verbatim.
- `pnpm tsc --noEmit` passes.
