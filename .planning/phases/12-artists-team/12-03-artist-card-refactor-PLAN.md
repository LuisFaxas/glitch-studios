---
phase: 12-artists-team
plan: 03
type: execute
wave: 2
depends_on: [12-01]
files_modified:
  - src/lib/parse-social-links.ts
  - src/components/artists/artist-card.tsx
autonomous: true
requirements: [TEAM-02]
must_haves:
  truths:
    - "ArtistCard shows the member's avatar using next/image with aspect-[4/3] crop (not raw img, not aspect-square)"
    - "ArtistCard shows a role badge chip (dark pill: bg-[#222222] text-[#888888])"
    - "ArtistCard shows up to 3 specialty chips in a flex-wrap row (hidden when specialties is empty)"
    - "ArtistCard shows social icon links (Lucide icons, one per platform) parsed via parseSocialLinks"
    - "ArtistCard shows a bio truncated to 3 lines via line-clamp-3"
    - "ArtistCard has a glitch hover overlay (group-hover pattern matching VideoCard)"
    - "parseSocialLinks shared utility exists at src/lib/parse-social-links.ts"
  artifacts:
    - path: "src/lib/parse-social-links.ts"
      provides: "Shared parseSocialLinks utility + SocialLink type"
      contains: "parseSocialLinks"
    - path: "src/components/artists/artist-card.tsx"
      provides: "Upgraded ArtistCard with image, role badge, specialties chips, social icons, bio clamp"
      contains: "aspect-[4/3]"
  key_links:
    - from: "src/components/artists/artist-card.tsx"
      to: "src/lib/parse-social-links.ts"
      via: "import { parseSocialLinks } from '@/lib/parse-social-links'"
      pattern: "parse-social-links"
    - from: "src/components/artists/artist-card.tsx"
      to: "/artists/{slug}"
      via: "Next.js Link wrapping the card"
      pattern: "/artists/"
---

<objective>
Rebuild ArtistCard to meet the TEAM-02 rich-content requirement: next/image avatar (aspect-[4/3]), role badge, specialty chips (up to 3), social icon row, and line-clamped bio. Also extract parseSocialLinks into a shared utility so ArtistCard and ArtistProfile import from the same source.

Purpose: The current ArtistCard only shows name + role + 2-line bio with a raw img square avatar. It must be upgraded to match the visual richness of VideoCard (Phase 11) and PostCard (Phase 10). TEAM-02.

Output:
1. src/lib/parse-social-links.ts — shared utility (verbatim from RESEARCH.md code example)
2. src/components/artists/artist-card.tsx — rebuilt card with all TEAM-02 required fields
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
From src/components/portfolio/video-card.tsx (pattern to mirror for card shell):
```typescript
// Card shell pattern
<article className="relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]">
  {/* Glitch hover overlay */}
  <div className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity" style={{ animationDuration: "100ms" }} aria-hidden="true" />
  {/* Image */}
  <div className="aspect-video relative">
    <Image src={thumbnailUrl} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
  </div>
  {/* Content */}
  <div className="p-4 flex flex-col flex-1">
    {/* ... */}
    <div className="mt-auto pt-3 ..."> {/* pinned bottom row */}
  </div>
</article>
```

From src/components/artists/artist-profile.tsx (SocialIcon logic to mirror):
```typescript
function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  if (p.includes("instagram")) return <AtSign className="w-4 h-4" />
  if (p.includes("twitter") || p.includes("x")) return <AtSign className="w-4 h-4" />
  if (p.includes("youtube")) return <Globe className="w-4 h-4" />
  if (p.includes("soundcloud") || p.includes("music")) return <Music className="w-4 h-4" />
  return <ExternalLink className="w-4 h-4" />
}
```

TeamMember type (after Plan 12-01):
```typescript
type TeamMember = {
  id: string; name: string; slug: string; role: string; bio: string
  photoUrl: string | null; socialLinks: string | null
  kind: "internal" | "collaborator"; specialties: string[]; isFeatured: boolean
  sortOrder: number | null; isActive: boolean; createdAt: Date; updatedAt: Date
  credits: string | null; featuredTrackUrl: string | null
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create shared parseSocialLinks utility</name>
  <files>src/lib/parse-social-links.ts</files>
  <read_first>
    - src/components/artists/artist-profile.tsx (has a local parseSocialLinks function at line 26 — the new util should match its logic but use the verbatim RESEARCH.md version which handles the array case and filters empty URLs)
  </read_first>
  <action>
    Create src/lib/parse-social-links.ts with the exact code from RESEARCH.md:

    ```typescript
    // src/lib/parse-social-links.ts
    // Shared utility for parsing the socialLinks JSON text column on teamMembers.
    // Used by both ArtistCard and ArtistProfile.
    // TODO(Phase 14): replace Lucide icon map with brand SVGs (POLISH-01)

    export type SocialLink = { platform: string; url: string }

    export function parseSocialLinks(json: string | null): SocialLink[] {
      if (!json) return []
      try {
        const parsed = JSON.parse(json)
        if (Array.isArray(parsed)) return parsed
        if (typeof parsed === "object") {
          return Object.entries(parsed)
            .filter(([, url]) => Boolean(url))
            .map(([platform, url]) => ({ platform, url: url as string }))
        }
        return []
      } catch { return [] }
    }
    ```

    Run typecheck after creating:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; test -f src/lib/parse-social-links.ts &amp;&amp; grep -q 'export function parseSocialLinks' src/lib/parse-social-links.ts &amp;&amp; grep -q 'export type SocialLink' src/lib/parse-social-links.ts &amp;&amp; grep -q 'filter.*url.*Boolean' src/lib/parse-social-links.ts &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at src/lib/parse-social-links.ts
    - grep "export function parseSocialLinks" exits 0
    - grep "export type SocialLink" exits 0
    - grep "filter.*url.*Boolean" exits 0 (filters empty URLs — RESEARCH pitfall guard)
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>Shared parseSocialLinks utility created. Both ArtistCard and ArtistProfile can import from @/lib/parse-social-links.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Rebuild ArtistCard with image, role badge, specialties chips, social icons, bio clamp</name>
  <files>src/components/artists/artist-card.tsx</files>
  <read_first>
    - src/components/artists/artist-card.tsx (current implementation — understand what to replace)
    - src/lib/parse-social-links.ts (Task 1 output — import path)
    - src/components/portfolio/video-card.tsx (card shell pattern: group-hover overlay, h-full flex-col, p-4 flex flex-col flex-1, mt-auto bottom row)
  </read_first>
  <action>
    Completely replace src/components/artists/artist-card.tsx with this implementation:

    ```typescript
    // src/components/artists/artist-card.tsx
    // NOTE: Does NOT wrap name in GlitchHeading — per site rule, GlitchHeading was removed
    // from blog and portfolio headings due to jankiness on multiline titles.
    // Plain h3 used here for the same reason.
    // TODO(Phase 14): replace Lucide social icons with brand SVGs (POLISH-01)

    import Link from "next/link"
    import Image from "next/image"
    import { AtSign, Globe, Music, ExternalLink } from "lucide-react"
    import { parseSocialLinks } from "@/lib/parse-social-links"
    import type { TeamMember } from "@/types"

    function getInitials(name: string): string {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }

    function SocialIcon({ platform }: { platform: string }) {
      const p = platform.toLowerCase()
      if (p.includes("instagram")) return <AtSign className="w-4 h-4" />
      if (p.includes("twitter") || p.includes("x")) return <AtSign className="w-4 h-4" />
      if (p.includes("youtube")) return <Globe className="w-4 h-4" />
      if (p.includes("soundcloud") || p.includes("music")) return <Music className="w-4 h-4" />
      return <ExternalLink className="w-4 h-4" />
    }

    export function ArtistCard({ member }: { member: TeamMember }) {
      const socialLinks = parseSocialLinks(member.socialLinks)
      // Coerce specialties to avoid null crash (Research Pitfall 3)
      const specialties = (member.specialties ?? []).slice(0, 3)

      return (
        <Link href={`/artists/${member.slug}`} className="group block h-full">
          <article className="relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]">
            {/* Glitch hover overlay — matches VideoCard pattern */}
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity"
              style={{ animationDuration: "100ms" }}
              aria-hidden="true"
            />

            {/* Avatar — aspect-[4/3] avoids over-tall square on mobile (Research Pitfall 4) */}
            <div className="relative aspect-[4/3] bg-[#111111]">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono font-bold text-4xl text-[#555555]">
                    {getInitials(member.name)}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              {/* Role badge */}
              <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start mb-2">
                {member.role}
              </span>

              {/* Name — plain h3, no GlitchHeading (site-wide rule: no GlitchHeading on multiline headings) */}
              <h3 className="font-mono font-bold text-lg text-[#f5f5f0] leading-tight mb-2">
                {member.name}
              </h3>

              {/* Bio — line-clamp-3 (Research Pitfall 5: prevents row height divergence) */}
              {member.bio && (
                <p className="text-[#888888] font-sans text-[13px] leading-relaxed line-clamp-3 mb-3">
                  {member.bio}
                </p>
              )}

              {/* Specialties chips — up to 3, hidden when empty */}
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {specialties.map((s) => (
                    <span
                      key={s}
                      className="bg-[#0a0a0a] border border-[#222222] text-[#555555] text-[10px] font-mono uppercase tracking-wide px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Social icon row — pinned to bottom */}
              {socialLinks.length > 0 && (
                <div className="mt-auto pt-3 flex gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#555555] hover:text-[#f5f5f0] transition-colors"
                      aria-label={link.platform}
                    >
                      <SocialIcon platform={link.platform} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </article>
        </Link>
      )
    }
    ```

    Run typecheck:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; grep -q 'aspect-\[4/3\]' src/components/artists/artist-card.tsx &amp;&amp; grep -q 'parse-social-links' src/components/artists/artist-card.tsx &amp;&amp; grep -q 'line-clamp-3' src/components/artists/artist-card.tsx &amp;&amp; grep -q 'specialties.*slice.*3' src/components/artists/artist-card.tsx &amp;&amp; grep -q 'next/image' src/components/artists/artist-card.tsx &amp;&amp; grep -q 'group-hover:animate-glitch-hover' src/components/artists/artist-card.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep "aspect-[4/3]" src/components/artists/artist-card.tsx exits 0 (not aspect-square)
    - grep "parse-social-links" src/components/artists/artist-card.tsx exits 0 (uses shared util, not local function)
    - grep "line-clamp-3" src/components/artists/artist-card.tsx exits 0
    - grep "specialties.*slice.*3" src/components/artists/artist-card.tsx exits 0 (max 3 chips)
    - grep "next/image" src/components/artists/artist-card.tsx exits 0 (not raw img)
    - grep "group-hover:animate-glitch-hover" src/components/artists/artist-card.tsx exits 0 (glitch overlay)
    - Card does NOT contain GlitchHeading import
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>ArtistCard rebuilt with next/image avatar (aspect-[4/3]), role badge chip, specialties chips (max 3), social icon row using shared parseSocialLinks, bio line-clamp-3, and glitch hover overlay matching VideoCard pattern.</done>
</task>

</tasks>

<verification>
- src/lib/parse-social-links.ts exists with exported parseSocialLinks function
- ArtistCard uses next/image, aspect-[4/3], line-clamp-3, parseSocialLinks from shared util
- ArtistCard does NOT use raw img tag, aspect-square, or local parseSocialLinks function
- ArtistCard does NOT import GlitchHeading
- pnpm tsc --noEmit exits 0
- pnpm lint exits 0
</verification>

<success_criteria>
- Artist cards show avatar (or initials fallback) in a 4:3 container
- Role badge chip rendered below the image
- Bio is clamped to 3 lines
- Up to 3 specialty chips shown as small mono uppercase tags
- Social icon links (Lucide) shown in a pinned bottom row
- Glitch hover overlay fires on card hover
- pnpm tsc --noEmit passes
</success_criteria>

<output>
After completion, create .planning/phases/12-artists-team/12-03-SUMMARY.md documenting:
- parseSocialLinks extract: new file path and exported types
- ArtistCard changes: before vs after for key structural differences (aspect ratio, image tag, social row)
- Whether ArtistProfile still compiles (it has its own local parseSocialLinks — that is acceptable in Plan 12-03; Plan 12-06 will update ArtistProfile to use the shared util)
- pnpm tsc --noEmit pass/fail
</output>
