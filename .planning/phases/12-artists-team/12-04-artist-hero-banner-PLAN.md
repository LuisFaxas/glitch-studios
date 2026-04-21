---
phase: 12-artists-team
plan: 04
type: execute
wave: 2
depends_on: [12-01]
files_modified:
  - src/components/artists/artist-hero-banner.tsx
autonomous: true
requirements: [TEAM-02]
must_haves:
  truths:
    - "ArtistHeroBanner renders when given a featured TeamMember and returns null when given null"
    - "Hero shows the member's photo (next/image fill + priority) with a gradient overlay"
    - "When photoUrl is null, a fallback texture (scanlines + radial gradient) is shown"
    - "Hero shows role badge, name heading, truncated bio (line-clamp-3), and VIEW PROFILE CTA"
    - "Hero is structurally identical to PortfolioHeroBanner (section > aspect container > image + overlay > copy block)"
  artifacts:
    - path: "src/components/artists/artist-hero-banner.tsx"
      provides: "ArtistHeroBanner server component wired to TeamMember"
      contains: "ArtistHeroBanner"
  key_links:
    - from: "src/components/artists/artist-hero-banner.tsx"
      to: "/artists/{slug}"
      via: "Next.js Link for VIEW PROFILE CTA"
      pattern: "/artists/"
---

<objective>
Build ArtistHeroBanner, a server component that mirrors PortfolioHeroBanner's structure but is wired to TeamMember instead of PortfolioItem. Shows the isFeatured internal member at the top of the TEAM section with a photo, role badge, name, truncated bio, and "VIEW PROFILE" CTA.

Purpose: The artists page needs a visual anchor at the top of the TEAM section (matching the portfolio page's hero pattern). ArtistHeroBanner is a standalone component to avoid premature abstraction of PortfolioHeroBanner (RESEARCH Q10). Addresses TEAM-02.

Output: src/components/artists/artist-hero-banner.tsx — new server component.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/12-artists-team/12-RESEARCH.md
@.planning/phases/12-artists-team/12-01-SUMMARY.md

<interfaces>
From src/components/portfolio/portfolio-hero-banner.tsx (mirror this structure):
```typescript
// Pattern: section > div.aspect-video > Image fill priority + gradient overlay > copy block absolute bottom-left
// Copy block: category badge + h2 title + description line-clamp-3 + CTA Link
// Fallback when no image: scanline + radial gradient div

export function PortfolioHeroBanner({ item }: { item: PortfolioItem | null }) {
  if (!item) return null
  return (
    <section className="relative w-full bg-[#000000] border border-[#222222] overflow-hidden mb-6">
      <div className="relative aspect-video">
        {coverUrl ? (
          <Image src={coverUrl} alt={item.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: [...scanlines + radial gradient...] }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/0 pointer-events-none" />
      </div>
      <div className="relative md:absolute md:inset-x-0 md:bottom-0 px-6 md:px-12 py-6 md:py-12 flex flex-col gap-4 max-w-4xl">
        {/* badge */}
        <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] leading-tight text-[clamp(28px,5vw,48px)]">...</h2>
        {/* description line-clamp-3 */}
        <Link href="..." className="inline-block self-start bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase tracking-wide px-6 py-3 mt-2 hover:bg-[#f5f5f0]/90 transition-colors">VIEW WORK</Link>
      </div>
    </section>
  )
}
```

TeamMember type (after Plan 12-01):
```typescript
type TeamMember = {
  slug: string; name: string; role: string; bio: string
  photoUrl: string | null; kind: "internal" | "collaborator"
  isFeatured: boolean; specialties: string[]
  // ...other fields
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create ArtistHeroBanner server component</name>
  <files>src/components/artists/artist-hero-banner.tsx</files>
  <read_first>
    - src/components/portfolio/portfolio-hero-banner.tsx (mirror this structure exactly — aspect container, gradient overlay, copy block positioning, fallback texture, CTA style)
    - src/types/index.ts (confirm TeamMember type — use for the prop interface)
  </read_first>
  <action>
    Create src/components/artists/artist-hero-banner.tsx with this implementation:

    ```typescript
    // src/components/artists/artist-hero-banner.tsx
    // Mirrors PortfolioHeroBanner structurally but wired to TeamMember.
    // Intentionally NOT generalizing PortfolioHeroBanner — see RESEARCH Q10.
    // TODO(Phase 14): if both banners converge, extract MediaHeroBanner abstraction.

    import Link from "next/link"
    import Image from "next/image"
    import type { TeamMember } from "@/types"

    interface ArtistHeroBannerProps {
      member: TeamMember | null
    }

    export function ArtistHeroBanner({ member }: ArtistHeroBannerProps) {
      if (!member) return null

      return (
        <section className="relative w-full bg-[#000000] border border-[#222222] overflow-hidden mb-6">
          <div className="relative aspect-video">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            ) : (
              // Fallback texture — scanlines + radial gradient (matches PostCardPlaceholder + VideoCardPlaceholder)
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: [
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
                    "radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)",
                  ].join(", "),
                }}
                aria-hidden="true"
              />
            )}
            {/* Dark gradient overlay for text legibility */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/0 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* Copy block — stacks below on mobile, overlays bottom-left on md+ */}
          <div className="relative md:absolute md:inset-x-0 md:bottom-0 px-6 md:px-12 py-6 md:py-12 flex flex-col gap-4 max-w-4xl">
            {/* Role badge */}
            <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start">
              {member.role.toUpperCase()}
            </span>

            {/* Name — plain h2, no GlitchHeading (site-wide rule: no GlitchHeading on multiline headings) */}
            <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] leading-tight text-[clamp(28px,5vw,48px)]">
              {member.name}
            </h2>

            {/* Bio — line-clamp-3 */}
            {member.bio && (
              <p className="font-sans text-[14px] text-[#888888] line-clamp-3 max-w-[640px] leading-relaxed">
                {member.bio}
              </p>
            )}

            {/* CTA */}
            <Link
              href={`/artists/${member.slug}`}
              className="inline-block self-start bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase tracking-wide px-6 py-3 mt-2 hover:bg-[#f5f5f0]/90 transition-colors"
            >
              VIEW PROFILE
            </Link>
          </div>
        </section>
      )
    }
    ```

    Run typecheck:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; test -f src/components/artists/artist-hero-banner.tsx &amp;&amp; grep -q 'ArtistHeroBanner' src/components/artists/artist-hero-banner.tsx &amp;&amp; grep -q 'VIEW PROFILE' src/components/artists/artist-hero-banner.tsx &amp;&amp; grep -q 'aspect-video' src/components/artists/artist-hero-banner.tsx &amp;&amp; grep -q 'from-black/90 via-black/50' src/components/artists/artist-hero-banner.tsx &amp;&amp; grep -q 'if.*member.*return null' src/components/artists/artist-hero-banner.tsx &amp;&amp; grep -q 'next/image' src/components/artists/artist-hero-banner.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at src/components/artists/artist-hero-banner.tsx
    - grep "ArtistHeroBanner" exits 0 (exported function name)
    - grep "VIEW PROFILE" exits 0 (CTA text differs from PortfolioHeroBanner's "VIEW WORK")
    - grep "aspect-video" exits 0 (image container uses same aspect ratio as portfolio banner)
    - grep "from-black/90 via-black/50" exits 0 (gradient overlay identical to PortfolioHeroBanner)
    - grep "if.*member.*return null" exits 0 (null-safety pattern)
    - File does NOT contain GlitchHeading import
    - File uses next/image Image component (not raw img)
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>ArtistHeroBanner server component created. Mirrors PortfolioHeroBanner structurally. Shows role badge, name (plain h2), bio (line-clamp-3), and VIEW PROFILE CTA. Falls back to scanline texture when photoUrl is null. Returns null when member prop is null.</done>
</task>

</tasks>

<verification>
- src/components/artists/artist-hero-banner.tsx exists
- grep "VIEW PROFILE" exits 0
- grep "aspect-video" exits 0
- grep "from-black/90 via-black/50" exits 0
- pnpm tsc --noEmit exits 0
- pnpm lint exits 0
</verification>

<success_criteria>
- ArtistHeroBanner server component exists and compiles
- Structurally mirrors PortfolioHeroBanner (same aspect container, gradient, copy block positioning)
- Returns null for null input (safe to use with optional featured member query result)
- CTA says "VIEW PROFILE" (not "VIEW WORK")
- No GlitchHeading import (site-wide rule)
</success_criteria>

<output>
After completion, create .planning/phases/12-artists-team/12-04-SUMMARY.md documenting:
- The structural pattern mirrored from PortfolioHeroBanner
- Key differences from PortfolioHeroBanner (no video URL logic, role badge instead of category, VIEW PROFILE CTA)
- pnpm tsc --noEmit pass/fail
</output>
