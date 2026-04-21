---
phase: 12-artists-team
plan: 06
type: execute
wave: 4
depends_on: [12-04, 12-05]
files_modified:
  - src/app/(public)/artists/page.tsx
  - src/components/artists/artist-profile.tsx
autonomous: true
requirements: [TEAM-01, TEAM-02, TEAM-03]
must_haves:
  truths:
    - "The /artists page renders h1 ARTISTS (not 'Our Team') in monochrome typography matching /portfolio"
    - "The /artists page renders ArtistHeroBanner for the featured internal member above the TEAM section"
    - "The /artists page renders ArtistsSection for TEAM members (kind=internal)"
    - "The /artists page renders ArtistsSection for COLLABORATORS members (kind=collaborator) with mt-16 pt-8 border-t border-[#222222] visual separation"
    - "Page metadata title is 'Artists' (not 'Our Team')"
    - "ArtistProfile uses next/image instead of raw img and text-[#f5f5f0] instead of text-white"
    - "ArtistProfile imports parseSocialLinks from @/lib/parse-social-links"
  artifacts:
    - path: "src/app/(public)/artists/page.tsx"
      provides: "Rewritten /artists page: h1 ARTISTS + hero + TEAM section + COLLABORATORS section"
      contains: "ARTISTS"
    - path: "src/components/artists/artist-profile.tsx"
      provides: "ArtistProfile upgraded to next/image + brand token colors + shared parseSocialLinks"
      contains: "parse-social-links"
  key_links:
    - from: "src/app/(public)/artists/page.tsx"
      to: "src/components/artists/artist-hero-banner.tsx"
      via: "import { ArtistHeroBanner } from '@/components/artists/artist-hero-banner' + members.find(isFeatured)"
      pattern: "ArtistHeroBanner"
    - from: "src/app/(public)/artists/page.tsx"
      to: "src/components/artists/artists-section.tsx"
      via: "import { ArtistsSection } from '@/components/artists/artists-section' + members.filter(kind)"
      pattern: "ArtistsSection"
    - from: "src/components/artists/artist-profile.tsx"
      to: "src/lib/parse-social-links.ts"
      via: "import { parseSocialLinks } from '@/lib/parse-social-links'"
      pattern: "parse-social-links"
---

<objective>
Rewrite /artists/page.tsx to the Phase 12 composition: h1 ARTISTS + ArtistHeroBanner (featured internal) + ArtistsSection TEAM + ArtistsSection COLLABORATORS. Also upgrade ArtistProfile to use next/image and brand color tokens, and switch it to the shared parseSocialLinks utility.

Purpose: This plan wires together all the components built in Plans 12-03 through 12-05 into a coherent page. It is the integration step that makes TEAM-01, TEAM-02, and TEAM-03 observable end-to-end. Also upgrades ArtistProfile which was using text-white (v1 color) and raw img tags.

Output:
1. src/app/(public)/artists/page.tsx — rewritten with new composition (verbatim from RESEARCH.md code example)
2. src/components/artists/artist-profile.tsx — upgraded to next/image + brand tokens + shared parseSocialLinks
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/12-artists-team/12-RESEARCH.md
@.planning/phases/12-artists-team/12-04-SUMMARY.md
@.planning/phases/12-artists-team/12-05-SUMMARY.md

<interfaces>
From src/app/(public)/portfolio/page.tsx (page wrapper pattern to mirror):
```typescript
export default async function PortfolioPage() {
  // Promise.all for parallel queries
  const [items, featuredRows] = await Promise.all([...])
  const featured = featuredRows[0] ?? null
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]">
        PORTFOLIO
      </h1>
      {featured && <div className="mt-8"><PortfolioHeroBanner item={featured} /></div>}
      <PortfolioGrid items={items} />
    </div>
  )
}
```

ArtistHeroBanner interface (Plan 12-04):
```typescript
export function ArtistHeroBanner({ member }: { member: TeamMember | null })
// Returns null when member is null — safe to call unconditionally
```

ArtistsSection interface (Plan 12-05):
```typescript
export function ArtistsSection({ title, members, className }: ArtistsSectionProps)
// className is applied to the <section> element
// Use className="mt-16 pt-8 border-t border-[#222222]" for COLLABORATORS section
```

RESEARCH.md page composition code (use verbatim):
```typescript
export default async function ArtistsPage() {
  const members = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
    .orderBy(asc(teamMembers.sortOrder))

  const team = members.filter((m) => m.kind === "internal")
  const collabs = members.filter((m) => m.kind === "collaborator")
  const featured = team.find((m) => m.isFeatured) ?? null

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]">
        ARTISTS
      </h1>
      {featured && <ArtistHeroBanner member={featured} />}
      <ArtistsSection title="TEAM" members={team} />
      <ArtistsSection title="COLLABORATORS" members={collabs} className="mt-16 pt-8 border-t border-[#222222]" />
    </div>
  )
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Rewrite /artists/page.tsx with new composition</name>
  <files>src/app/(public)/artists/page.tsx</files>
  <read_first>
    - src/app/(public)/artists/page.tsx (current file — understand imports and empty-state fallback to preserve)
    - src/components/artists/artist-hero-banner.tsx (Plan 12-04 output — confirm import path)
    - src/components/artists/artists-section.tsx (Plan 12-05 output — confirm import path)
    - src/db/schema.ts (confirm teamMembers is exported + isFeatured/kind columns exist from Plan 12-01)
  </read_first>
  <action>
    Completely replace src/app/(public)/artists/page.tsx with this implementation:

    ```typescript
    export const dynamic = "force-dynamic"

    import { db } from "@/lib/db"
    import { teamMembers } from "@/db/schema"
    import { eq, asc } from "drizzle-orm"
    import { ArtistHeroBanner } from "@/components/artists/artist-hero-banner"
    import { ArtistsSection } from "@/components/artists/artists-section"
    import type { Metadata } from "next"

    export const metadata: Metadata = {
      title: "Artists",
      description:
        "Meet the producers, engineers, and creatives behind Glitch Studios — and the collaborating artists in our network.",
    }

    export default async function ArtistsPage() {
      const members = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.isActive, true))
        .orderBy(asc(teamMembers.sortOrder))

      const team = members.filter((m) => m.kind === "internal")
      const collabs = members.filter((m) => m.kind === "collaborator")
      const featured = team.find((m) => m.isFeatured) ?? null

      // Total-empty fallback (both sections empty)
      if (members.length === 0) {
        return (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <h1 className="font-mono font-bold text-4xl uppercase mb-4 text-[#f5f5f0]">
              Artists coming soon
            </h1>
            <p className="text-[#888888] text-lg">
              We are assembling our roster. Check back shortly.
            </p>
          </div>
        )
      }

      return (
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          {/* Page heading — plain h1, no GlitchHeading (site-wide rule: no GlitchHeading on multiline headings) */}
          <h1 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]">
            ARTISTS
          </h1>

          {/* Featured internal member hero (null-safe — returns null when no featured member) */}
          <ArtistHeroBanner member={featured} />

          {/* TEAM section */}
          <ArtistsSection title="TEAM" members={team} />

          {/* COLLABORATORS section — visual separation via mt-16 pt-8 border-t (Research Pitfall 6) */}
          <ArtistsSection
            title="COLLABORATORS"
            members={collabs}
            className="mt-16 pt-8 border-t border-[#222222]"
          />
        </div>
      )
    }
    ```

    Run typecheck:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; grep -q 'ARTISTS' src/app/(public)/artists/page.tsx &amp;&amp; grep -q 'ArtistHeroBanner' src/app/(public)/artists/page.tsx &amp;&amp; grep -q 'ArtistsSection' src/app/(public)/artists/page.tsx &amp;&amp; grep -q 'TEAM' src/app/(public)/artists/page.tsx &amp;&amp; grep -q 'COLLABORATORS' src/app/(public)/artists/page.tsx &amp;&amp; grep -q 'title.*Artists' src/app/(public)/artists/page.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep "ARTISTS" src/app/(public)/artists/page.tsx exits 0 (h1 text, not "Our Team")
    - grep "ArtistHeroBanner" exits 0 (imported and used)
    - grep "ArtistsSection" exits 0 (imported and used)
    - grep "TEAM" exits 0 (section title)
    - grep "COLLABORATORS" exits 0 (section title)
    - grep "title.*Artists" exits 0 (metadata title updated)
    - File does NOT contain "Our Team" (old title removed)
    - File does NOT import ScrollSection (removed from old v1 page)
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>/artists/page.tsx rewritten with h1 ARTISTS, ArtistHeroBanner (featured internal), ArtistsSection TEAM, ArtistsSection COLLABORATORS with border-t separator. Metadata updated to title "Artists".</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Upgrade ArtistProfile to next/image and brand tokens</name>
  <files>src/components/artists/artist-profile.tsx</files>
  <read_first>
    - src/components/artists/artist-profile.tsx (full file — identify all raw img tags, text-white usages, and the local parseSocialLinks function to replace)
    - src/lib/parse-social-links.ts (Plan 12-03 output — import path and exported types)
  </read_first>
  <action>
    Make these targeted changes to src/components/artists/artist-profile.tsx:

    CHANGE 1 — Add next/image import at the top:
    ```typescript
    import Image from "next/image"
    ```

    CHANGE 2 — Replace the local parseSocialLinks function (lines ~26-42) with an import from the shared utility:
    ```typescript
    import { parseSocialLinks } from "@/lib/parse-social-links"
    ```
    (Remove the local function definition entirely — it is now in src/lib/parse-social-links.ts)

    CHANGE 3 — Replace the raw img tag in the photo container with next/image:
    Find the existing:
    ```typescript
    <img
      src={member.photoUrl}
      alt={member.name}
      className="absolute inset-0 w-full h-full object-cover"
    />
    ```
    Replace with:
    ```typescript
    <Image
      src={member.photoUrl}
      alt={member.name}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 384px"
    />
    ```

    CHANGE 4 — Replace all instances of text-white with text-[#f5f5f0] (brand token):
    - h1 class: `text-white` -> `text-[#f5f5f0]`
    - Featured Track span: `text-white` -> `text-[#f5f5f0]`
    - Credits h2: `text-white` -> `text-[#f5f5f0]`
    - Credits credit.title span: `text-white` -> `text-[#f5f5f0]`
    - Bio p: `text-white` -> `text-[#f5f5f0]` (currently shows full bio text in white)

    CHANGE 5 — Run typecheck:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; grep -q 'parse-social-links' src/components/artists/artist-profile.tsx &amp;&amp; grep -q 'next/image' src/components/artists/artist-profile.tsx &amp;&amp; grep -q 'f5f5f0' src/components/artists/artist-profile.tsx &amp;&amp; ! grep -q '"text-white"' src/components/artists/artist-profile.tsx &amp;&amp; ! grep -q "'text-white'" src/components/artists/artist-profile.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep "parse-social-links" src/components/artists/artist-profile.tsx exits 0 (using shared util)
    - grep "next/image" src/components/artists/artist-profile.tsx exits 0 (Image import)
    - grep "f5f5f0" src/components/artists/artist-profile.tsx exits 0 (brand token used)
    - grep "text-white" src/components/artists/artist-profile.tsx exits 1 (no raw text-white remaining)
    - File does NOT contain a local parseSocialLinks function definition
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>ArtistProfile upgraded: raw img replaced with next/image, all text-white replaced with text-[#f5f5f0], local parseSocialLinks replaced with import from shared utility.</done>
</task>

</tasks>

<verification>
- grep "ARTISTS" src/app/(public)/artists/page.tsx exits 0
- grep "ArtistHeroBanner" src/app/(public)/artists/page.tsx exits 0
- grep "COLLABORATORS" src/app/(public)/artists/page.tsx exits 0
- grep "text-white" src/components/artists/artist-profile.tsx exits 1 (no regressions)
- grep "parse-social-links" src/components/artists/artist-profile.tsx exits 0
- pnpm tsc --noEmit exits 0
- pnpm lint exits 0
</verification>

<success_criteria>
- /artists renders with h1 ARTISTS, hero for featured member, TEAM section, and COLLABORATORS section
- Page metadata title is "Artists" (not "Our Team")
- Visual separation between TEAM and COLLABORATORS is a top border + 16 units margin
- ArtistProfile uses next/image and text-[#f5f5f0] throughout
- pnpm tsc --noEmit passes
</success_criteria>

<output>
After completion, create .planning/phases/12-artists-team/12-06-SUMMARY.md documenting:
- The final page composition structure (imports + query + filter logic + JSX shape)
- ArtistProfile changes: list all text-white -> text-[#f5f5f0] replacements made
- Whether ScrollSection was cleanly removed from the import
- pnpm tsc --noEmit pass/fail
</output>
