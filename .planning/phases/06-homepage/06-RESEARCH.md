# Phase 6: Homepage Redesign - Research

**Researched:** 2026-03-30
**Domain:** Homepage UX/UI redesign, creative studio homepage patterns, Cyberpunk Metro design system
**Confidence:** HIGH

## Summary

The current homepage is rated 4/10 with scattered elements, no clear value proposition above the fold, placeholder beat cards, and only 2 CTAs (missing portfolio). The fix is structural, not additive -- the components exist but are poorly organized, poorly weighted, and the featured beats section shows dummy data despite 6 published beats in the database.

Industry-leading studio and creative agency homepages follow a consistent pattern: a bold hero with a clear identity statement and 2-3 CTAs, followed by a logical section flow that builds credibility (services, portfolio/work, social proof/testimonials). The Cyberpunk Metro design language is already defined and locked -- the task is applying it properly to a homepage that currently ignores most of its principles (tiles, tight gaps, glitch hover, monochrome hierarchy through size/weight not color).

**Primary recommendation:** Restructure the homepage into 5-6 well-defined sections with a redesigned hero that immediately communicates "music and video production studio" with 3 clear CTAs, replace placeholder featured beats with real DB-fetched beats, and ensure every section follows the Cyberpunk Metro tile language from DESIGN-LANGUAGE.md.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Full Claude's Discretion -- research industry-leading studio/agency homepages and make all layout, content, and flow decisions. User trusts Claude to make the right calls.
- D-02: Must follow Cyberpunk Metro aesthetic (locked from Phase 5 D-04) -- monochrome palette, flat design, no rounded corners, glitch effects as character.
- D-04: Must include CTAs to book a session, browse beats, and explore portfolio (from success criteria HOME-02).
- D-06: Featured beats section currently shows 6 placeholder "Coming Soon" cards -- must either show real seeded beats or be removed/redesigned.
- D-07: Homepage sections are already admin-controlled via homepage_sections table (sort order, visibility, config). Preserve this capability -- any section changes must work with the existing admin homepage editor.

### Claude's Discretion
- Hero layout, tagline, visual treatment
- Section order and content density
- Whether to add a blog/news section
- CTA design and placement
- Mobile layout approach
- Animation and scroll behavior

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HOME-01 | Homepage has clear visual hierarchy with compelling above-the-fold content | Hero redesign with bold identity statement, size-based hierarchy, scanline texture. Research on above-the-fold best practices confirms: headline + subheadline + 1 primary CTA + 2 secondary CTAs. |
| HOME-02 | Homepage has obvious CTAs guiding visitors to book services, browse beats, and explore portfolio | Current hero has only 2 CTAs (Book a Session, Browse Beats). Must add Portfolio CTA. Research confirms 1 primary + 2-3 secondary CTAs is optimal -- prevents choice paralysis while covering all user intents. |
| HOME-03 | Homepage content sections flow logically and are not cluttered with scattered elements | Recommended section flow: Hero -> Services -> Featured Beats -> Portfolio -> Testimonials. Each section is a self-contained tile-based block with consistent spacing and the ScrollSection reveal animation. |
</phase_requirements>

## Architecture Patterns

### Current Homepage Structure (What Exists)
```
src/app/(public)/page.tsx           -- Server component, Promise.allSettled data fetching
src/components/home/
  hero-section.tsx                  -- 90vh hero, logo + tagline + 2 CTAs (client component)
  services-overview.tsx             -- Service cards grid (server component via props)
  featured-carousel.tsx             -- Embla carousel, HARDCODED PLACEHOLDER CARDS
  video-portfolio-carousel.tsx      -- Embla carousel for portfolio items
  testimonials-carousel.tsx         -- Embla carousel with autoplay
  scroll-section.tsx                -- Framer Motion scroll-reveal wrapper
```

### Current Problems Diagnosed

1. **Hero is generic:** "Music. Video. Vision." tagline is vague. Logo is centered with no supporting context. Only 2 CTAs -- no portfolio link.
2. **Featured Beats is broken:** Hardcoded `placeholderBeats` array with 6 dummy items showing "Coming Soon". The DB has 6 published beats. The component accepts `beatIds` prop but never fetches real data even when IDs are passed.
3. **No visual hierarchy between sections:** Every section uses the same `py-16 md:py-24` padding and `max-w-7xl` container. No variation in density, background shade, or visual weight to create rhythm.
4. **Services section is a plain grid:** Generic cards with no tile-language alignment. Uses `gap-6` (too wide for Metro's tight 2-4px gap principle).
5. **Testimonials use rounded avatars:** `rounded-full` on avatar images violates "no rounded corners" rule.
6. **No social proof near hero:** Client logos, testimonial snippet, or "trusted by" element that builds instant credibility is missing.

### Recommended Section Flow

Based on studio/agency homepage best practices and the Cyberpunk Metro design language:

```
1. HERO              -- Full viewport, identity + 3 CTAs + optional social proof line
2. SERVICES          -- "What We Do" tile grid (tight gaps, Metro-style)
3. FEATURED BEATS    -- Real beats from DB with cover art, play preview
4. PORTFOLIO         -- Video/work showcase carousel
5. TESTIMONIALS      -- Client quotes with ratings
6. (OPTIONAL) BLOG   -- Latest 2-3 posts as tiles (Claude's Discretion: include it)
```

**Rationale:** Hero establishes identity. Services immediately answers "what do they offer?" Featured Beats shows product. Portfolio shows proof of work. Testimonials provide social proof. Blog adds freshness/SEO value.

### Pattern: Hero Section Redesign

**What:** Replace the current centered-everything hero with a more impactful layout.

**Recommended approach:**
- Keep full-viewport height (90vh or 100dvh)
- Bold headline: "GLITCH STUDIOS" (already via GlitchLogo component)
- Descriptive subheadline that actually says what they do: "Music Production // Video // Creative Services" or similar (not the vague "Music. Video. Vision.")
- 3 CTAs: Primary (Book a Session -- inverted white), Secondary (Browse Beats -- outline), Tertiary (View Portfolio -- outline or text link)
- Scanline background texture (already exists)
- Optional: small social proof line ("50+ artists served" or client count)

**CTA hierarchy (from research):**
- 1 primary CTA (largest, inverted colors -- white bg, black text)
- 2 secondary CTAs (outline style -- border only)
- All 3 visible without scrolling on both desktop and mobile (375px)

### Pattern: Featured Beats Fix

**What:** The `FeaturedCarousel` component must fetch real beats from the database instead of rendering hardcoded placeholders.

**Current flow:** `page.tsx` passes `beatIds` from admin config -> `FeaturedCarousel` ignores them and renders dummy data.

**Fix:** Add a server-side data fetch in `page.tsx` that queries published beats (either admin-selected IDs or latest 6) and passes full beat data to the carousel. The carousel renders real cover art, title, genre, BPM, and a play button.

### Pattern: Admin Compatibility

**Critical constraint:** The `homepage_sections` table controls section order and visibility via the admin homepage editor. The current section types are: `hero`, `featured_beats`, `services`, `portfolio`, `testimonials`.

**Rules for maintaining compatibility:**
1. Any new section type must be added to the `sectionRenderers` map in `page.tsx`
2. Any new section type must be handled in the admin homepage editor's edit panel
3. The `DEFAULT_SECTIONS` array in `admin-homepage.ts` must be updated if new section types are added
4. Section configs are stored as JSON strings -- any new config fields must be optional with defaults

If adding a blog section: add `blog` as a new section type, register it in `sectionRenderers`, and add a minimal admin editor entry (blog section renders automatically from latest posts, no config needed).

### Anti-Patterns to Avoid
- **Don't break admin homepage editor:** Every section must remain manageable via the existing drag-and-drop editor. Don't hardcode sections that bypass the DB-driven layout system.
- **Don't use color for hierarchy:** The design language forbids accent colors. Use size, weight, background shade (#0a0a0a vs #111 vs #1a1a1a), and borders for visual hierarchy.
- **Don't add rounded corners:** Avatar images currently use `rounded-full` -- this must be fixed to square or `rounded-none`.
- **Don't use wide gaps:** Metro style demands tight 2-4px gaps between tiles. Current `gap-6` (24px) is too loose.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Carousel | Custom scroll-based slider | Embla Carousel (already installed) | Already used across all homepage sections. Consistent API, mobile swipe support. |
| Scroll animations | Custom IntersectionObserver | ScrollSection wrapper (already exists) | Framer Motion `whileInView` with correct viewport margins and `once: true` already configured. |
| Section ordering | Hardcoded section array | `homepage_sections` DB table + admin editor | Already built. Supports drag-and-drop reordering, visibility toggles, and per-section config. |
| Beat data fetching | Client-side API calls | Server-side Drizzle query in page.tsx | Pattern already established with `Promise.allSettled` for services, testimonials, and portfolio. |

## Common Pitfalls

### Pitfall 1: Breaking the Admin Homepage Editor
**What goes wrong:** Adding new sections or changing section types without updating the `sectionRenderers` map, `DEFAULT_SECTIONS`, and the admin editor UI causes the homepage to silently drop sections.
**Why it happens:** The rendering pipeline is: DB rows -> filter by `sectionType` -> look up in `sectionRenderers` map -> render or return `null`. Unknown section types are silently skipped.
**How to avoid:** For every section type change: update `sectionRenderers` in `page.tsx`, update `DEFAULT_SECTIONS` in `admin-homepage.ts`, and add an editor panel in `homepage-editor.tsx`.
**Warning signs:** Section disappears from homepage but shows in admin editor.

### Pitfall 2: Featured Beats Still Showing Placeholders
**What goes wrong:** The `FeaturedCarousel` component has hardcoded `placeholderBeats` that render even when `beatIds` are passed.
**Why it happens:** The component was built as a placeholder during Phase 1 and never updated. Even when admin selects beat IDs, the component ignores them.
**How to avoid:** The fix requires: (1) server-side beat data fetching in `page.tsx`, (2) passing full beat objects (not just IDs) to the carousel, (3) removing the hardcoded placeholder array entirely.
**Warning signs:** "Coming Soon" text visible on any beat card.

### Pitfall 3: Mobile CTA Visibility
**What goes wrong:** 3 CTAs stack vertically on mobile and push below the fold, failing HOME-02.
**Why it happens:** Desktop layout uses `flex gap-4` which works for 2 buttons but not 3.
**How to avoid:** On mobile (375px), CTAs can use full-width stacking or a 2+1 grid. Verify with Playwright screenshot at 375px width that all 3 CTAs are visible without scrolling.
**Warning signs:** Playwright screenshot shows only 1-2 CTAs visible on mobile viewport.

### Pitfall 4: Ignoring Design Language Tile System
**What goes wrong:** Sections look like generic cards instead of the Metro tile language defined in DESIGN-LANGUAGE.md.
**Why it happens:** Existing components use standard card patterns (wide gaps, inconsistent borders) instead of the tile system (tight 2-4px gaps, #111 bg, #222 borders, glitch hover).
**How to avoid:** Every card/tile in homepage sections must follow: `bg-[#111] border border-[#222] rounded-none` with `gap-[2px]` or `gap-1` between items. Hover state must include glitch animation or at minimum `hover:border-[#444] hover:bg-[#1a1a1a]`.
**Warning signs:** Visual inconsistency between sidebar tiles and homepage content cards.

### Pitfall 5: ScrollSection + Client Component Nesting
**What goes wrong:** `ScrollSection` uses Framer Motion (`"use client"`). Wrapping server components in `ScrollSection` forces them to become client components, losing server-side rendering benefits.
**Why it happens:** React Server Components cannot be children of client components in the traditional sense -- they get serialized across the boundary.
**How to avoid:** This is already handled correctly in the existing code -- `ScrollSection` wraps pre-rendered content. Keep this pattern: data fetching in `page.tsx` (server), pass data as props, wrap rendered output in `ScrollSection`.

## Code Examples

### Hero with 3 CTAs (Recommended Pattern)
```tsx
// Three CTAs with clear hierarchy
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  {/* Primary CTA -- inverted (white bg) */}
  <Link
    href="/services"
    className="bg-[#f5f5f0] text-[#000] border border-[#f5f5f0] px-8 py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-sm hover:bg-[#000] hover:text-[#f5f5f0] transition-colors"
  >
    Book a Session
  </Link>
  {/* Secondary CTAs -- outline style */}
  <Link
    href="/beats"
    className="bg-transparent text-[#f5f5f0] border border-[#444] px-8 py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors"
  >
    Browse Beats
  </Link>
  <Link
    href="/portfolio"
    className="bg-transparent text-[#f5f5f0] border border-[#444] px-8 py-3 rounded-none font-mono font-bold uppercase tracking-[0.05em] text-sm hover:bg-[#1a1a1a] hover:border-[#666] transition-colors"
  >
    View Portfolio
  </Link>
</div>
```

### Fetching Real Beats for Featured Section
```tsx
// In page.tsx -- add beats query to Promise.allSettled
import { beats } from "@/db/schema"
import { eq, asc, desc } from "drizzle-orm"

// Inside HomePage():
const [servicesResult, testimonialsResult, portfolioResult, homepageSectionsResult, beatsResult] =
  await Promise.allSettled([
    // ...existing queries...
    db.select().from(beats)
      .where(eq(beats.status, "published"))
      .orderBy(desc(beats.createdAt))
      .limit(6),
  ])

const beatsList = beatsResult.status === "fulfilled" ? beatsResult.value : []

// Pass to carousel:
// featured_beats: (config) => <FeaturedCarousel beats={beatsList} />,
```

### Metro Tile Grid for Services
```tsx
// Tight gap grid following DESIGN-LANGUAGE.md tile system
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px]">
  {services.map((service) => (
    <div
      key={service.id}
      className="bg-[#111] border border-[#222] rounded-none p-6 hover:bg-[#1a1a1a] hover:border-[#444] transition-colors group"
    >
      {/* Content */}
    </div>
  ))}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Placeholder beat cards | Real DB-fetched beats | Phase 6 (now) | Featured section shows actual product instead of "Coming Soon" |
| 2 hero CTAs | 3 hero CTAs (book, beats, portfolio) | Phase 6 (now) | All three core user journeys accessible from hero |
| Generic card grid (gap-6) | Metro tile grid (gap-[2px]) | Phase 6 (now) | Visual consistency with sidebar tile language |
| Rounded testimonial avatars | Square avatars (rounded-none) | Phase 6 (now) | Design language compliance |

## Open Questions

1. **Hero background treatment**
   - What we know: Current hero has scanline texture on `#0a0a0a`. Admin can set a background image via media picker.
   - What's unclear: Should the hero use a static image, a subtle video loop, or just the scanline texture?
   - Recommendation: Keep scanline texture as default. The monochrome aesthetic works better with texture than photos. If a background image is set via admin, overlay it with a dark scrim + scanline.

2. **Blog section on homepage**
   - What we know: No blog section currently exists on homepage. CONTEXT.md lists this as Claude's Discretion.
   - Recommendation: Add a minimal blog section showing 2-3 latest posts as tiles. This adds freshness and SEO value. Register as `blog` section type in the admin homepage editor. Keep it simple -- title, date, optional excerpt.

3. **Social proof near hero**
   - What we know: No client count, logos, or trust signals near the hero.
   - Recommendation: Add a small line below CTAs: "Trusted by 50+ artists" or similar stat. This can be hardcoded initially and made admin-configurable later. Low effort, high trust-building impact.

## Project Constraints (from CLAUDE.md)

- **Package manager:** pnpm only
- **Stack:** Next.js + Tailwind + Embla + Framer Motion (all already in use)
- **Deployment:** Vercel
- **Design:** Cyberpunk Metro -- monochrome, flat, no rounded corners, glitch effects
- **Admin:** Homepage sections admin-controlled via DB (already built)
- **Verification:** Use Playwright screenshots at 1440px and 375px to verify layout
- **Resource:** Do not run `next build` -- use `next lint` or `tsc --noEmit` for verification
- **GSD:** All work through GSD workflow

## Sources

### Primary (HIGH confidence)
- Codebase audit: `src/app/(public)/page.tsx`, `src/components/home/*.tsx`, `src/actions/admin-homepage.ts`, `src/db/schema.ts`, `src/db/seed.ts` -- full understanding of current implementation
- `.planning/DESIGN-LANGUAGE.md` -- Cyberpunk Metro design system specification
- `.planning/V2-ASSESSMENT.md` -- User's 4/10 rating with specific issues

### Secondary (MEDIUM confidence)
- [Prismic: Website Hero Section Best Practices](https://prismic.io/blog/website-hero-section) -- hero layout patterns
- [CXL: Above the Fold](https://cxl.com/blog/above-the-fold/) -- CTA placement research
- [LandingPageFlow: CTA Placement Strategies 2026](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages) -- 1 primary + 2-4 secondary CTAs
- [Awwwards: Music & Sound websites](https://www.awwwards.com/websites/music-sound/) -- studio homepage design patterns
- [Draggen: Neo-Brutalist Cyberpunk Design Guide](https://draggen.io/styles/neo-brutalist-cyberpunk) -- dark brutalist design patterns
- [Webflow: Brutalist Website Design Guide](https://webflow.com/blog/10-brutalist-websites) -- brutalist web design examples

### Tertiary (LOW confidence)
- General web search trends on studio homepage section ordering -- verified against multiple sources but no single authoritative reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use, no new dependencies needed
- Architecture: HIGH -- full codebase audit completed, all components and data flow understood
- Pitfalls: HIGH -- identified from direct code inspection, not speculation

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable -- no framework changes expected)
