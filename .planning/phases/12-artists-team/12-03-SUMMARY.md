---
phase: 12-artists-team
plan: 03
status: complete
requirements: [TEAM-02]
---

## Delivered

1. `src/lib/parse-social-links.ts` — shared utility (`SocialLink` type + `parseSocialLinks` function).
2. `src/components/artists/artist-card.tsx` — rebuilt card.

## Card Changes (before → after)

| Aspect | Before | After |
|---|---|---|
| Image tag | `<img>` | `next/image` with `fill` + `sizes` |
| Aspect ratio | `aspect-square` | `aspect-[4/3]` |
| Hover overlay | `useState(isHovered)` + conditional render | `group-hover:animate-glitch-hover` pattern (matches VideoCard) |
| Role | plain `<p>` | badge chip (`bg-[#222222]`) |
| Bio | `line-clamp-2` | `line-clamp-3` |
| Specialties | absent | up to 3 chips (`bg-[#0a0a0a]`) |
| Social links | absent | Lucide icon row (AtSign/Globe/Music/ExternalLink) via shared `parseSocialLinks` |
| Name wrap | plain h3 (no GlitchHeading) | plain h3 (no GlitchHeading) — site-wide rule preserved |

## ArtistProfile Status

`src/components/artists/artist-profile.tsx` still has its local `parseSocialLinks`. That's fine for this plan — Plan 12-06 will migrate it to the shared util. `pnpm tsc --noEmit` passes (no type conflict because the local one has identical shape).

## Verification

- `pnpm tsc --noEmit` passes.
