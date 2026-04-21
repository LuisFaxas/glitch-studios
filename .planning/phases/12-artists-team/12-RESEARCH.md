# Phase 12: Artists & Team - Research

**Researched:** 2026-04-20
**Domain:** Artists/Team public page — data model extension, UI composition, section split, mobile grid
**Confidence:** HIGH

---

## Summary

The v1 scaffold already delivered a working `/artists` route, `teamMembers` Drizzle table, `ArtistCard`, `ArtistProfile`, and full admin CRUD (`/admin/team`). Phase 12 is a quality overhaul of the existing implementation — not a greenfield build. The three gaps that prevent passing TEAM-01/02/03 are: (1) no `kind` discriminator on the table to split internal vs. collaborating artists, (2) the current `ArtistCard` only shows name + role + 2-line bio with a square photo — it does not surface specialties, social links, or a richer card surface, and (3) the list page is a plain CSS grid with no browsing mechanism (no section dividers, no chip filter, no hero banner). The plan needs to add one migration, refactor the card, and rebuild the page composition to match the Phase 10/11 visual language.

**Primary recommendation:** Add `kind` enum column to `teamMembers` via a single Drizzle migration, upgrade `ArtistCard` to a tall card with avatar + role badge + specialties chips + social icon row + truncated bio, split the page into two labeled sections (TEAM and COLLABORATORS), and use the `PortfolioGrid` chip-filter pattern as the filter mechanism — no carousel needed.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEAM-01 | Artists page shows both internal team and collaborating artists with clear sections | `kind` column migration + two labeled `<section>` blocks in page; chip filter scoped per section |
| TEAM-02 | Artist cards have rich content — role, specialties, social links, bio | ArtistCard refactor: specialties as `text[]` column (schema migration), social icon row in card, truncated bio (3 lines), role badge |
| TEAM-03 | Artists page has carousel or browsing mechanism similar to portfolio | Chip filter (client-side, same pattern as PortfolioGrid) satisfies "browsing mechanism consistent with portfolio page pattern" |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Package manager:** pnpm only — never npm or yarn
- **Stack locked:** Next.js App Router, Tailwind v4, Drizzle + Neon Postgres, Embla Carousel v8, shadcn/ui, Framer Motion
- **Mobile-first:** All pages mobile-first; desktop optimization second
- **No parallel builds:** Never run `next build` in parallel agents — prefer `tsc --noEmit` + `pnpm lint`
- **Palette:** `#000000 #0a0a0a #111111 #222222 #f5f5f0 #888888 #555555 #444444` — no other colors
- **Monochrome only:** Not neon-glow; cyberpunk metro flat black/white
- **Hover-glitch headers:** Every header uses hover-only RGB-split glitch; no auto-running animations on headings (from MEMORY.md)
- **Design quality:** Site was rated 4/10 overall — v2.0 must raise quality to industry standard, page by page
- **Playwright verification:** Use Playwright during dev so AI verifies visual output (from MEMORY.md)
- **No executor subagents:** Never use gsd-executor; work inline, verify with Playwright (from MEMORY.md)
- **Admin operability:** Admin dashboard must be simple enough for non-technical daily use

---

## Open Questions (Answered)

### Q1: Data model — does the schema need changes?

**Finding:** The `teamMembers` table exists (`src/db/schema.ts` lines 104–119). It has: `id`, `name`, `slug`, `role`, `bio`, `photoUrl`, `socialLinks` (JSON text), `credits` (JSON text), `featuredTrackUrl`, `sortOrder`, `isActive`. **Missing columns for TEAM-01/02:**

1. `kind` — discriminates "internal" vs "collaborator". Currently absent. All artists are treated identically.
2. `specialties` — an array of specialty tags (e.g. "Trap", "Mixing", "Editing") shown as chips on the card. Currently absent. `role` is a single freeform string — not chip-friendly.
3. `isFeatured` — to drive a hero banner for the featured internal member (optional, mirrors `portfolioItems.isFeatured` pattern).

**Recommendation:** One Drizzle migration adding three columns:
- `kind text NOT NULL DEFAULT 'internal'` (values: `'internal'` | `'collaborator'`)
- `specialties text[] DEFAULT '{}'`
- `is_featured boolean DEFAULT false`

No enum needed for `kind` — a plain `text` with application-level check keeps it simple and avoids a new pgEnum. Use `pgEnum("artist_kind", ["internal", "collaborator"])` if you want DB-level enforcement (marginally more correct for a two-value discriminator — recommended).

**Migration plan:** `drizzle-kit generate` then `drizzle-kit push`. Admin form needs two new fields: Kind dropdown (Internal / Collaborator) and Specialties multi-tag input (comma-separated stored as `text[]`).

---

### Q2: Internal vs. collab split — how to structure the page?

**Finding:** The phase success criterion says "clear visual separation." Approaches:
- Two tabs with client-side tab state
- Two labeled `<section>` blocks stacked vertically with a visual divider
- Two chips ("TEAM" / "COLLABORATORS") that filter the grid (like PortfolioGrid but scoped to kind)

**Recommendation:** Two labeled `<section>` blocks stacked vertically. Rationale: (a) Both sections are always visible without interaction — visitors get context at a glance. (b) Tabs hide content behind interaction — bad for skimmability. (c) Chips that filter would hide one group entirely, which contradicts the success criterion ("clear visual separation" implies both are visible simultaneously). Each section gets a `<h2>` divider line: `TEAM` and `COLLABORATORS`, styled as a mono uppercase label with a horizontal rule — matching the visual weight of section labels seen in the homepage services section.

If a chip filter is also desired (within a section, to filter by specialty), it can be layered on top of the section split as a secondary filter. Keep section split as the primary structure.

---

### Q3: Carousel vs. grid — what does criterion #3 actually mean?

**Finding:** The roadmap says "carousel or horizontal browsing mechanism consistent with the portfolio page pattern." The portfolio page (`/portfolio`) uses a **responsive grid with chip filter** — NOT a carousel. The carousel exists on the **homepage** (`video-portfolio-carousel.tsx` + Embla) only. The portfolio page's "browsing mechanism" is the chip filter + grid.

**Recommendation:** Mirror the portfolio page pattern: chip filter (client-side, same chipBase/chipActive/chipInactive classes from PortfolioGrid) that filters by specialty or by kind. This satisfies criterion #3 honestly — it is "consistent with the portfolio page pattern." Do NOT add Embla carousel to the artists list page; it adds complexity and the portfolio precedent is grid-based. If a horizontal scroll of featured artists is desired for visual flair, that is Phase 14/design-discretion territory.

---

### Q4: Detail page yes/no?

**Finding:** The detail page (`/artists/[slug]`) already exists with `ArtistProfile` component. It shows a two-column layout (photo + bio + social + credits), which is well-suited for the full profile. The success criterion #2 says cards must include role, specialties, social links, AND bio — but the bio on a card will be truncated (3 lines). The full bio and credits list logically belong on the detail page.

**Recommendation:** Keep the detail page. It already exists and adds value — it is where full credits, featured track, and complete bio live. The card surfaces a preview; the detail page is the deep dive. The existing `ArtistProfile` component needs a visual upgrade (it uses plain `text-white` instead of `text-[#f5f5f0]`, and uses raw `<img>` instead of `next/image`) but does not need a structural redesign.

---

### Q5: Admin authoring — what changes?

**Finding:** Admin CRUD already exists at `/admin/team` (list), `/admin/team/new`, `/admin/team/[id]/edit`. The `TeamMemberForm` handles name, role, bio, photoUrl, credits, featuredTrackUrl, instagram, youtube, soundcloud, sortOrder. The form does NOT currently have fields for `kind` or `specialties`.

**Recommendation:** Extend `TeamMemberForm` with:
1. A `kind` select/radio: "Internal Team Member" / "Collaborating Artist" — defaults to Internal
2. A `specialties` tag input: comma-separated text that saves as `text[]`
3. A `isFeatured` checkbox (optional, for hero banner on the artists page)

These are additive-only changes to the form. The admin server actions (`createTeamMember`, `updateTeamMember`) need to be updated to accept the three new fields and pass them to the DB insert/update.

---

### Q6: Social links — Lucide or brand icons?

**Finding:** The existing `ArtistProfile` already uses Lucide icons (`AtSign`, `Globe`, `Music`, `ExternalLink`) as stand-ins. The STATE.md blockers note explicitly: "Social icons need brand SVGs or react-icons (Lucide dropped brand icons in v1.6+)." Phase 14 (Global Polish) requires real brand icons (POLISH-01).

**Recommendation:** For Phase 12, use Lucide icons on the artist card (matching the current `ArtistProfile` pattern) with a `// TODO(Phase 14): replace with brand SVGs` comment. Do NOT pre-empt Phase 14's scope — adding react-icons or brand SVGs now would duplicate work Phase 14 will do globally. The card social row should show platform-appropriate Lucide: `AtSign` for Instagram, `Music` for SoundCloud/Spotify, `Globe` for YouTube, `ExternalLink` as fallback.

---

### Q7: Routing — `/artists` or `/team`? Is it in nav?

**Finding:** The public route is `/artists` (already exists). The `publicNavItems` in `public-nav-config.ts` already includes Artists: `{ label: "Artists", href: "/artists", icon: User, desktopSize: "medium", mobileSpan: "col-span-5" }`. It is in the sidebar nav but NOT in `mobileTabItems` (which contains only `/beats`, `/services`, `/portfolio`, `/blog`). It IS in `mobileMenuItems` alongside `/book` and `/contact` — accessible via the mobile menu overlay.

**Recommendation:** No routing changes needed. `/artists` is correct. The navigation is already wired. The page title (`"Our Team"`) should be updated to `"Artists"` to match the nav label and the route slug.

---

### Q8: Image handling — next/image, placeholder?

**Finding:** The existing `ArtistCard` uses a raw `<img>` tag (`src={member.photoUrl}`). The `ArtistProfile` also uses `<img>`. Neither uses `next/image`. The `VideoCard` and `PostCard` both use `next/image` with `fill` and explicit `sizes` — that is the project standard.

**Recommendation:** Upgrade both `ArtistCard` and `ArtistProfile` to use `next/image` with `fill` + `sizes`. For the avatar placeholder (when `photoUrl` is null), keep the existing monogram initials pattern — it is on-brand and already implemented. No need for a new `ArtistCardPlaceholder` component; the initials div IS the placeholder.

---

### Q9: Empty states?

**Finding:** The current page already handles the all-empty case with a "Team coming soon" message. There is no handling for the partial case (e.g., internal team has members but collaborators section is empty, or vice versa).

**Recommendation:** Per section: if a section has zero members, render a brief empty state within that section only (not a full-page empty state). Example: a single `<p>` in the collaborators section saying "Collaborating artists coming soon." This prevents the visual confusion of a missing section heading with no content below it.

---

### Q10: Reuse — generalize PortfolioHeroBanner or duplicate verbatim?

**Finding:** `PortfolioHeroBanner` is tightly coupled to `PortfolioItem` (uses `item.videoUrl`, `item.isYouTubeEmbed`, YouTube thumbnail extraction). Generalizing it into a `MediaHeroBanner` would require abstracting the image source logic and removing video-specific concerns. The artists hero would show a featured artist's photo (not a video thumbnail), with different metadata (role vs. category, social links vs. "VIEW WORK" CTA).

**Recommendation:** Do NOT generalize `PortfolioHeroBanner`. At this project scale, premature abstraction creates more drift than it prevents. Build a standalone `ArtistHeroBanner` component that follows the same structural pattern (section + aspect container + gradient overlay + bottom-left copy + CTA) but is wired to `TeamMember` props. Structural similarity keeps the visual language consistent. A comment at the top can note the parallel to `PortfolioHeroBanner` for future consolidation if needed.

---

## Patterns to Reuse

All paths are relative to `/home/faxas/workspaces/projects/personal/glitch_studios/`.

| Component | File | What to Mirror |
|-----------|------|----------------|
| Page composition | `src/app/(public)/portfolio/page.tsx` | `max-w-7xl mx-auto px-4 py-16 md:py-24` wrapper, h1 with `text-[clamp(28px,5vw,48px)]`, hero banner + grid sequence |
| Hero banner structure | `src/components/portfolio/portfolio-hero-banner.tsx` | `section > div.aspect-video > Image + gradient + overlay copy` — mirror structurally for `ArtistHeroBanner` |
| Chip filter | `src/components/portfolio/portfolio-grid.tsx` | `chipBase`, `chipActive`, `chipInactive` class strings; `flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none]` scroll container; `useState<string|null>` active state |
| Card shell | `src/components/portfolio/video-card.tsx` | `bg-[#111111] border border-[#222222] rounded-none overflow-hidden h-full flex flex-col group-hover:border-[#444444]` + glitch hover overlay div |
| Card placeholder | `src/components/portfolio/video-card-placeholder.tsx` | Identical scanline + radial gradient background for `ArtistCardPlaceholder` (if ever needed; initials div is preferred) |
| Section divider | `src/app/(public)/blog/page.tsx` | h1 typography: `font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]` |
| Grid layout | `src/app/(public)/blog/page.tsx` line 128 | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8` |
| h2 section label | `src/app/(public)/portfolio/page.tsx` | Match h1 typography but at `text-[clamp(20px,3vw,32px)]` with a `border-b border-[#222222] pb-4 mb-8` divider |
| Admin form | `src/components/admin/team-member-form.tsx` | Same `inputClass`, `labelClass`, `errorClass` pattern for the two new fields |

---

## Pitfalls

### Pitfall 1: `kind` column default breaks existing admin records
**What goes wrong:** Adding `kind text NOT NULL DEFAULT 'internal'` backfills all existing rows as 'internal', which is correct — but if drizzle-kit generates `ALTER TABLE ... ADD COLUMN kind text NOT NULL` without the DEFAULT clause, the migration fails on a non-empty table.
**How to avoid:** Explicitly include `.default("internal")` in the Drizzle schema definition. Verify the generated SQL includes `DEFAULT 'internal'` before running `drizzle-kit push`.

### Pitfall 2: `socialLinks` is a JSON-serialized text string, not structured columns
**What goes wrong:** The social links are stored as `JSON.stringify({ instagram: url, youtube: url, soundcloud: url })`. The card's social icon row must parse this at render time. Rendering raw `member.socialLinks` as a string will show `{"instagram":"..."}` instead of icons.
**How to avoid:** Use the existing `parseSocialLinks()` helper already in `ArtistProfile`. Extract it into a shared utility at `src/lib/parse-social-links.ts` so both `ArtistCard` and `ArtistProfile` import from the same source.

### Pitfall 3: `specialties` is a `text[]` column but Drizzle returns it as `string[] | null`
**What goes wrong:** If `specialties` is null (old records before migration), mapping over it with `.map()` crashes.
**How to avoid:** Always coerce: `(member.specialties ?? [])` before rendering chips. The chip row should render nothing (not an empty row) when the array is empty.

### Pitfall 4: `aspect-square` photo container on cards is inconsistent with the card grid
**What goes wrong:** The current `ArtistCard` uses `aspect-square` for the photo, which makes artist cards taller than `VideoCard` (which uses `aspect-video`). In a mixed grid with `h-full flex-col`, the tallest card in a row forces all cards to the same height — no problem. But `aspect-square` at `1:1` on mobile (full-width card) results in a photo that is very tall before the text content, pushing bio/social links far below the fold.
**How to avoid:** Use `aspect-[4/3]` or `aspect-[3/2]` instead of `aspect-square` for the avatar area. This is a more horizontal crop that works better in a 3-column grid at desktop AND in a single column at mobile. Alternatively, use a fixed `h-48 md:h-56` height on the image container.

### Pitfall 5: Long bios break uniform card height
**What goes wrong:** Artist cards in a grid should have consistent height per row. A bio that varies from 1 sentence to 6 sentences breaks this if you don't clamp it.
**How to avoid:** `line-clamp-3` on the bio in the card. The full bio is always accessible on the detail page. The card's bio is a teaser only.

### Pitfall 6: Section divider between TEAM and COLLABORATORS is not enough visual separation
**What goes wrong:** A thin `border-b` between two grids looks like a page fold, not a clear section distinction. On mobile, it is easy to miss.
**How to avoid:** Use a labeled section header with a `<h2>` that includes a mono uppercase label AND a `text-[#555555]` count in parentheses, e.g., `TEAM (3)`. Add `mt-16 pt-8 border-t border-[#222222]` above the COLLABORATORS section to force visible whitespace separation.

### Pitfall 7: Admin form `specialties` tag input not saving as `text[]`
**What goes wrong:** If the tag input saves as a comma-separated string, Drizzle insert will try to write a `string` into a `text[]` column and throw a type error.
**How to avoid:** Split on commas before submitting: `specialties.split(",").map(s => s.trim()).filter(Boolean)`. Accept this as the input format in the form and document it in the field label.

### Pitfall 8: `isFeatured` on `teamMembers` — multiple featured members
**What goes wrong:** If multiple members have `isFeatured = true`, the hero banner will pick one arbitrarily. An invariant must enforce at most one featured internal member (like `blogPosts.isFeatured`).
**How to avoid:** In `updateTeamMember` server action, if `isFeatured = true` is being set, first run `UPDATE team_members SET is_featured = false WHERE kind = 'internal'` before setting the new featured member. Or: only show `isFeatured` for `kind = 'internal'` in the admin form.

---

## Code Examples

### Schema Addition (Drizzle)
```typescript
// src/db/schema.ts — additions to teamMembers table
export const artistKindEnum = pgEnum("artist_kind", ["internal", "collaborator"])

export const teamMembers = pgTable("team_members", {
  // ... existing columns unchanged ...
  kind: artistKindEnum("kind").default("internal").notNull(),
  specialties: text("specialties").array().default([]).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  // ... rest unchanged ...
})
```

### Page Composition Pattern
```typescript
// src/app/(public)/artists/page.tsx — new structure
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

### ArtistsSection Client Wrapper (chip filter)
```typescript
// src/components/artists/artists-section.tsx
"use client"
import { useMemo, useState } from "react"
import clsx from "clsx"
import { ArtistCard } from "./artist-card"
import type { TeamMember } from "@/types"

interface ArtistsSectionProps {
  title: string
  members: TeamMember[]
  className?: string
}

export function ArtistsSection({ title, members, className }: ArtistsSectionProps) {
  const [active, setActive] = useState<string | null>(null)

  const specialties = useMemo(
    () => Array.from(new Set(members.flatMap((m) => m.specialties ?? []))).filter(Boolean),
    [members]
  )

  const filtered = useMemo(
    () => (active ? members.filter((m) => (m.specialties ?? []).includes(active)) : members),
    [members, active]
  )

  const chipBase = "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200"
  const chipActive = "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
  const chipInactive = "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"

  return (
    <section className={className}>
      <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] text-[clamp(20px,3vw,32px)] leading-[1.1] border-b border-[#222222] pb-4 mb-6">
        {title} <span className="text-[#555555]">({members.length})</span>
      </h2>
      {specialties.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-2 mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" onClick={() => setActive(null)}
            className={clsx(chipBase, !active ? chipActive : chipInactive)}>ALL</button>
          {specialties.map((s) => (
            <button key={s} type="button" onClick={() => setActive(s)}
              className={clsx(chipBase, active === s ? chipActive : chipInactive)}>{s.toUpperCase()}</button>
          ))}
        </div>
      )}
      {members.length === 0 ? (
        <p className="text-[#555555] font-sans text-sm">Coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filtered.map((m) => <ArtistCard key={m.id} member={m} />)}
        </div>
      )}
    </section>
  )
}
```

### parseSocialLinks Shared Utility
```typescript
// src/lib/parse-social-links.ts
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

---

## Recommended Plan Breakdown

7 plans, ordered by dependency, with proposed wave assignments:

| # | Plan ID | Objective | Wave | Depends on |
|---|---------|-----------|------|------------|
| 1 | 12-01-schema-migration | Add `kind` pgEnum, `specialties text[]`, `isFeatured boolean` columns to `teamMembers`; generate + push migration; update `TeamMember` type; update admin server actions to accept new fields | Wave 0 | — |
| 2 | 12-02-admin-form-upgrade | Extend `TeamMemberForm` with Kind select, Specialties tag input, isFeatured checkbox; update `/admin/team/new` and `/admin/team/[id]/edit` | Wave 1 | 12-01 |
| 3 | 12-03-artist-card-refactor | Rebuild `ArtistCard`: next/image avatar (aspect-[4/3]), role badge chip, specialties chips row (up to 3 shown), social icon row (parseSocialLinks), bio line-clamp-3, glitch hover overlay | Wave 2 | 12-01 |
| 4 | 12-04-artist-hero-banner | Build `ArtistHeroBanner` server component mirroring `PortfolioHeroBanner` structure — wired to `TeamMember`, shows featured internal artist with photo + role + bio + "VIEW PROFILE" CTA | Wave 2 | 12-01 |
| 5 | 12-05-artists-section | Build `ArtistsSection` client component: section h2 + count, specialty chip filter, responsive grid, per-section empty state | Wave 3 | 12-03 |
| 6 | 12-06-artists-page-integration | Rewrite `/artists/page.tsx`: h1 ARTISTS + hero banner + ArtistsSection TEAM + ArtistsSection COLLABORATORS; update page title metadata; update `ArtistProfile` to use next/image and `text-[#f5f5f0]` token; fix `parseSocialLinks` extraction into shared util | Wave 4 | 12-04, 12-05 |
| 7 | 12-07-playwright-verification | Playwright spec (desktop + mobile at 375px): artists page renders two sections, chip filter works, card shows role/specialties/social, mobile stack is readable; VERIFICATION.md; human checkpoint | Wave 5 | 12-06 |

**Wave summary:**
- Wave 0: Data layer (migration, types, actions) — prerequisite for everything
- Wave 1: Admin (form upgrade) — admin can seed data before public page is built
- Wave 2: Components (card + hero banner) — independent parallel work
- Wave 3: Section wrapper — depends on ArtistCard
- Wave 4: Page integration — depends on hero + section
- Wave 5: Verification + human sign-off

---

## Out-of-scope / Defer

These items MUST NOT land in Phase 12:

| Item | Reason | Defer to |
|------|--------|----------|
| Brand social icons (Instagram, YouTube, SoundCloud SVGs / react-icons) | Phase 14 (POLISH-01) does this globally; doing it now creates duplicate work | Phase 14 |
| PrevNextFooter / keyboard navigation between artist detail pages | Phase 11 built this for portfolio items; there is no requirement for it on artists | Never / backlog |
| Embla carousel on the artists list page | Portfolio page does NOT use Embla — it uses a chip-filter grid. The homepage carousel is a different context. No requirement drives an Embla carousel here. | If ever needed: design discretion phase |
| "Blog posts by this artist" cross-linking | Interesting feature but zero requirements for it in Phase 12 | Phase 999.1 (GlitchTek blog) or future |
| TikTok / Spotify / Bandcamp social link fields | Admin form currently handles Instagram, YouTube, SoundCloud. Adding all possible platforms is scope creep; Phase 14 brand icons will handle rendering. The current 3-field form is sufficient for v2.0. | Phase 14 or admin enhancement backlog |
| Animated artist card flip / 3D hover effects | Mentioned in PROJECT.md design reference (faxas.net flip card interactions) — would be high-impact but is out-of-scope for a v2.0 quality overhaul plan. Flag as an idea for a design polish sprint. | Design discretion sprint |
| Seed data for artists | The admin form (Plan 12-02) is how Josh adds real data. No seed script is needed — there may be real data already in production. | Admin-driven |

---

## Environment Availability

Step 2.6: SKIPPED (no external tools needed — this phase is code/migration only, using existing Drizzle + Neon stack that is already confirmed operational from previous phases).

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/db/schema.ts` — confirmed teamMembers table structure, missing kind/specialties/isFeatured columns
- Direct code inspection: `src/app/(public)/artists/page.tsx` — confirmed v1 scaffold, missing hero/section split/chip filter
- Direct code inspection: `src/components/artists/artist-card.tsx` — confirmed card gaps (no specialties, no social row, no next/image)
- Direct code inspection: `src/components/portfolio/portfolio-grid.tsx` — confirmed chip filter pattern to mirror
- Direct code inspection: `src/components/layout/public-nav-config.ts` — confirmed Artists nav item exists, mobileTabItems excludes Artists (correct)
- Direct code inspection: `src/app/admin/team/page.tsx`, `src/components/admin/team-member-form.tsx` — confirmed admin CRUD exists, needs 3 new fields
- REQUIREMENTS.md — TEAM-01/02/03 requirements text

### Secondary (MEDIUM confidence)
- ROADMAP.md Phase 12 success criteria — "carousel or horizontal browsing mechanism consistent with the portfolio page pattern" interpreted as chip-filter grid, not Embla, based on portfolio page code evidence

---

## Metadata

**Confidence breakdown:**
- Data model gaps: HIGH — direct schema inspection, no inference
- Architecture / page composition: HIGH — existing Phase 10/11 code examined, patterns fully documented
- Admin form changes: HIGH — form code examined, gaps confirmed
- Pitfalls: HIGH — sourced from code-level inspection of actual behavior
- Carousel vs. grid disambiguation: HIGH — portfolio page code is definitive

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable stack — 30 days)
