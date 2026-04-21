---
phase: 14-global-polish
plan: 03
status: complete
requirements: [POLISH-03]
---

## Delivered

Player bar polished; Playwright spec covering all Phase 14 changes across 4 pages at desktop + mobile.

## Beats route

Confirmed flat `/beats` catalog — no detail route. License Beat CTA links to `/beats`.

## PlayerBeat.slug call sites updated

- `src/components/beats/beat-card.tsx` (×2)
- `src/components/beats/beat-row.tsx` (×2)
- `src/components/home/featured-carousel.tsx` (×1)

All 5 now pass `slug: beat.slug` to `play()`.

## Player bar polish

- Desktop cover art: `<img>` → `<Image width={48} height={48} unoptimized>`.
- Mobile cover art: `<img>` → `<Image width={40} height={40} unoptimized>`.
- Mobile row: `style={{ height: "36px" }}` → `h-9` class.
- Desktop track info: `NOW PLAYING` span (font-mono, 10px, tracking-[0.1em], text-[#555555]) added above title.
- `License Beat` button → `<Link href="/beats">` — functional CTA.

## Playwright results

13 passed, 1 skipped (legitimate desktop-only test at mobile). Screenshots: 7 total.

## Verification

- `pnpm tsc --noEmit` passes.
- Playwright pm2 glitch_studios dev server at :3004.
