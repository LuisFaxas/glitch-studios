---
phase: 12-artists-team
plan: 06
status: complete
requirements: [TEAM-01, TEAM-02, TEAM-03]
---

## Delivered

`/artists/page.tsx` rewritten; `ArtistProfile` upgraded to brand tokens + `next/image` + shared util.

## Page Composition

```tsx
<div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
  <h1>ARTISTS</h1>                                          {/* plain, no GlitchHeading */}
  <ArtistHeroBanner member={featured} />                    {/* null-safe */}
  <ArtistsSection title="TEAM" members={team} />
  <ArtistsSection title="COLLABORATORS" members={collabs}
                  className="mt-16 pt-8 border-t border-[#222222]" />
</div>
```

- Single Drizzle query → split client-side via `m.kind === "internal"` / `m.kind === "collaborator"`.
- `featured = team.find((m) => m.isFeatured) ?? null`.
- Zero-members fallback: "Artists coming soon".
- `ScrollSection` wrapper removed — no per-card scroll animations.

## ArtistProfile Changes

- `<img>` → `<Image fill sizes>`.
- Local `parseSocialLinks` removed → imports `@/lib/parse-social-links`.
- Every `text-white` → `text-[#f5f5f0]`:
  - h1 name
  - bio `<p>`
  - Featured Track label
  - Credits & Work h2
  - Credit title span
- "Back to Team" → "Back to Artists" (naming aligned with page title).

## Verification

- `pnpm tsc --noEmit` passes.
- `grep -q "text-white" src/components/artists/artist-profile.tsx` exits 1 (confirmed).
