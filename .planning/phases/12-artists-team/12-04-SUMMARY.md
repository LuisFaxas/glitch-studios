---
phase: 12-artists-team
plan: 04
status: complete
requirements: [TEAM-02]
---

## Delivered

`src/components/artists/artist-hero-banner.tsx` — server component wired to `TeamMember`.

## Structural Mirror

| PortfolioHeroBanner | ArtistHeroBanner |
|---|---|
| `{ item: PortfolioItem \| null }` | `{ member: TeamMember \| null }` |
| `aspect-video` container + gradient overlay | same |
| Category badge (`item.category.toUpperCase()`) | Role badge (`member.role.toUpperCase()`) |
| `VIEW WORK` CTA to `/portfolio/{slug}` | `VIEW PROFILE` CTA to `/artists/{slug}` |
| YouTube maxresdefault fallback | Scanline + radial-gradient texture fallback |
| `item.title` in h2 | `member.name` in h2 (plain — no GlitchHeading) |
| `item.description` line-clamp-3 | `member.bio` line-clamp-3 |

## Verification

- `pnpm tsc --noEmit` passes.
