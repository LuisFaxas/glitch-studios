---
phase: 14-global-polish
plan: 01
status: complete
requirements: [POLISH-01]
---

## Delivered

ArtistCard + ArtistProfile now render brand SVG icons (Instagram, YouTube, SoundCloud, X) via the shared `src/components/icons/social-icons.tsx`.

## Changes

- **artist-card.tsx** — Lucide `AtSign/Globe/Music` dropped. New `SocialBrandIcon` helper maps platform → brand icon. `className="w-4 h-4"` at call site.
- **artist-profile.tsx** — same swap at `w-5 h-5`. Decorative `<Music>` in Featured Track block replaced with `<span>♪</span>` glyph so Music import can be removed entirely.
- **parse-social-links.ts** — Phase 14 TODO removed.
- `ExternalLink` (lucide) retained in both artist files as fallback for unknown platforms.

## Verification

- `pnpm tsc --noEmit` passes.
