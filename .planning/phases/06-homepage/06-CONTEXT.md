# Phase 6: Homepage - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the homepage so first-time visitors immediately understand what Glitch Studios offers and know exactly where to go next. Fix the current mess of scattered elements and placeholder content. No new backend features — restructure and polish existing sections using real data from the database.

</domain>

<decisions>
## Implementation Decisions

### Overall Approach
- **D-01:** Full Claude's Discretion — research industry-leading studio/agency homepages and make all layout, content, and flow decisions. User trusts Claude to make the right calls.
- **D-02:** Must follow Cyberpunk Metro aesthetic (locked from Phase 5 D-04) — monochrome palette, flat design, no rounded corners, glitch effects as character.

### Hero & Above-the-fold
- **D-03:** Claude's Discretion — hero content, tagline, CTAs, and visual treatment. Current: 90vh with "Music. Video. Vision." tagline and 2 CTAs. Must communicate what Glitch Studios is within 3 seconds.
- **D-04:** Must include CTAs to book a session, browse beats, and explore portfolio (from success criteria HOME-02).

### Section Flow
- **D-05:** Claude's Discretion — section order, content density, and what sections exist. Current: Hero → Featured Beats (placeholder) → Services → Portfolio → Testimonials. No blog section. Must flow logically with no scattered elements (HOME-03).
- **D-06:** Featured beats section currently shows 6 placeholder "Coming Soon" cards — must either show real seeded beats or be removed/redesigned.

### Admin Control
- **D-07:** Homepage sections are already admin-controlled via homepage_sections table (sort order, visibility, config). Preserve this capability — any section changes must work with the existing admin homepage editor.

### Claude's Discretion
- Hero layout, tagline, visual treatment
- Section order and content density
- Whether to add a blog/news section
- CTA design and placement
- Mobile layout approach
- Animation and scroll behavior

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Homepage Components
- `src/app/(public)/page.tsx` — Homepage route, data fetching (Promise.allSettled), section rendering
- `src/components/home/hero-section.tsx` — Hero with logo, tagline, CTAs, scanline bg
- `src/components/home/services-overview.tsx` — Service cards grid
- `src/components/home/featured-carousel.tsx` — Embla carousel, currently placeholder cards
- `src/components/home/video-portfolio-carousel.tsx` — Portfolio carousel with YouTube
- `src/components/home/testimonials-carousel.tsx` — Testimonials with autoplay
- `src/components/home/scroll-section.tsx` — Framer Motion scroll-reveal wrapper

### Admin Homepage Control
- `src/actions/admin-homepage.ts` — CRUD actions for homepage sections
- `src/components/admin/homepage-editor/` — Admin UI for reordering/configuring sections
- `src/db/schema.ts` — `homepage_sections` table (section_type, sort_order, is_visible, config)

### Design Language
- `.planning/DESIGN-LANGUAGE.md` — Cyberpunk Metro design system

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ScrollSection` wrapper: Framer Motion scroll-reveal animation for any section
- `GlitchLogo` component: available at sm/md/lg sizes
- Embla Carousel with autoplay plugin: used by featured beats, portfolio, testimonials
- `Promise.allSettled` pattern for resilient data fetching on homepage
- Scanline `repeating-linear-gradient` for texture

### Established Patterns
- Homepage sections are server components with data passed from page.tsx
- Admin homepage editor controls section order/visibility via DB
- Default fallback renders static order when no DB rows exist
- All headings: `font-mono uppercase tracking-[0.05em]`
- Section padding: `py-16 md:py-24`, content: `max-w-7xl mx-auto px-4`

### Integration Points
- Homepage fetches services, testimonials, portfolioItems, and homepageSections from DB
- Featured beats carousel needs to fetch real beats (currently hardcoded placeholder)
- Hero CTA links are configurable via admin (ctaLink in hero section config)

</code_context>

<specifics>
## Specific Ideas

- Research industry-leading studio/agency homepages for layout and flow inspiration
- Fix the placeholder "Coming Soon" cards in featured beats — show real seeded beats
- Ensure all 3 key CTAs are visible above the fold (book, beats, portfolio)
- Playwright screenshots at desktop (1440px) and mobile (375px) to verify layout
- Use the admin homepage editor to verify sections can be reordered after changes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-homepage*
*Context gathered: 2026-03-29*
