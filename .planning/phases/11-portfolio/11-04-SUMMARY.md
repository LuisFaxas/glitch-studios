---
phase: 11-portfolio
plan: 04
status: complete
requirements: [PORT-07]
---

## Delivered

`VideoCard` rebuilt around a single `<Link>` wrapper. Uniform-height card that always navigates to `/portfolio/{slug}` with type chip + year metadata.

## Removals Verified

- `<iframe>` — gone
- `useState` / `setPlaying` — gone
- `Play` lucide icon import — gone
- `View Case Study` label — gone
- `clsx` import — gone
- `isCaseStudy` branching inside the card — gone (replaced by `typeLabel` ternary)

## Homepage Safety

`grep @/components/portfolio/video-card src/components/home/` returned empty. Homepage renders via `video-portfolio-carousel.tsx` (Pitfall 9 guard satisfied).

## Notes

- Image migrated to `next/image` with `fill` + `object-cover` + `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`.
- Glitch overlay uses `group-hover:animate-glitch-hover motion-reduce:hidden` per D-13.
- `pnpm tsc --noEmit` passes.
