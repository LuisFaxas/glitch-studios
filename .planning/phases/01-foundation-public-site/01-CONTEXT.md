# Phase 1: Foundation + Public Site - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold (Next.js + Tailwind + Embla + Framer Motion), cyberpunk/glitch visual identity system, authentication (Better Auth with admin + client roles), and all public-facing pages: homepage, service pages, portfolio, artist profiles, blog, contact form, newsletter signup. Deployed on Vercel with Caddy configured for local dev. Mobile-first architecture.

</domain>

<decisions>
## Implementation Decisions

### Homepage Layout
- **D-01:** Hero section is a hybrid — video showreel background with split text overlay and dual CTAs (Book a Session + Browse Beats), both equally prominent
- **D-02:** Hero viewport height — Claude's discretion (pick what looks best)
- **D-03:** Below hero sections in order: Services overview → Featured beats carousel → Video portfolio carousel → Testimonials
- **D-04:** Sections use contained card panels (max-width container), not full-width blocks
- **D-05:** Scroll behavior: Framer Motion scroll-in animations + parallax background layers + subtle glitch effects on section transitions

### Visual Identity
- **D-06:** GLITCH logo must be recreated in CSS/SVG (not from PNG — it's low quality). Best approximation of the distorted/fragmented text style from Capture.PNG. Animates with glitch effect on page load, then settles into subtle continuous conservative glitch
- **D-07:** Color palette: Pure black and white + off-white + white glow effects for depth. NO neon, NO color accents, NO glassmorphic panels. Flat design
- **D-08:** Typography: Monospace tech direction — JetBrains Mono or similar monospace for headings/display, clean sans-serif for body text
- **D-09:** Design references: faxas.net/design (component quality, not glassmorphic style), Graphite.com (dark elegance), Resend (minimal), Feastables (bold type contrast)

### Navigation
- **D-10:** Desktop: Collapsible side navigation — toggles between icon-only (slim) and full labels + icons (wider). User controls the toggle
- **D-11:** Mobile: Fixed bottom tab bar (app-like navigation)
- **D-12:** Nav items: Beats, Services, Portfolio, About
- **D-13:** Persistent audio player will share space with navigation (player lives in root layout, established in this phase as placeholder for Phase 2)

### Page Structure
- **D-14:** Services page: Single page with tabs/sections switching between service types (studio sessions, mixing/mastering, video production, SFX, graphic design). Each tab shows description, pricing, and CTA to book
- **D-15:** Portfolio page: Embla carousel as primary navigation through projects. Swipe/click through video work with thumbnails, titles, descriptions, embedded players
- **D-16:** Artist/producer profiles: Full page per artist with bio, photo, role, credits/work list, social links, and embedded audio (their featured tracks)
- **D-17:** Blog: Database-driven (stored in Neon Postgres via Drizzle). Rich text editor for admin comes in Phase 4. Phase 1 seeds with sample content
- **D-18:** Contact form: Simple form (name, email, service interest, message). Routes to admin inbox (email delivery in Phase 4)
- **D-19:** Newsletter signup: Email capture form on homepage and footer. Subscriber storage in database. Actual sending in Phase 4

### Content & Media
- **D-20:** Media hosting: Cloudflare R2 for all images, audio, and video files
- **D-21:** Portfolio videos: YouTube embeds for public showcase + self-hosted (R2) for premium/exclusive content
- **D-22:** Blog images: Uploaded to R2, referenced from database

### Claude's Discretion
- Hero section viewport height (D-02) — pick what creates the best first impression
- Exact monospace font selection — JetBrains Mono recommended but open to alternatives that fit the aesthetic
- Scroll animation timing and intensity — tasteful, not overwhelming
- Side nav width in expanded/collapsed states
- Footer design and content

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, core value, constraints, design references
- `.planning/REQUIREMENTS.md` — Full v1 requirements with phase traceability
- `.planning/ROADMAP.md` — Phase structure and success criteria

### Research
- `.planning/research/STACK.md` — Recommended technologies (Next.js 16, Tailwind 4, Better Auth, Drizzle, Neon)
- `.planning/research/ARCHITECTURE.md` — System structure, route groups, component boundaries
- `.planning/research/FEATURES.md` — Feature landscape, table stakes, dependencies
- `.planning/research/PITFALLS.md` — Critical pitfalls (Vercel limits, iOS audio, auth architecture)
- `.planning/research/SUMMARY.md` — Research synthesis and phase ordering rationale

### Design Inspiration
- `Capture.PNG` — GLITCH logo reference (fragmented/distorted text style)
- `Capture1.PNG` — Black Circle / Glitch in the Matrix event flyer (dark aesthetic, bold typography, matrix undertones)
- External: https://faxas.net/design — Owner's design portfolio (component quality reference)
- External: https://graphite.com — Dark elegance, clean type
- External: https://resend.com — Minimal developer aesthetic
- External: https://feastables.com — Bold type contrast

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes all foundational patterns

### Integration Points
- Root layout must accommodate: side nav (desktop), bottom tab bar (mobile), persistent audio player placeholder (for Phase 2), auth provider, Framer Motion AnimatePresence
- Database schema must include: users (auth), blog_posts, services, team_members, testimonials, newsletter_subscribers, contact_submissions

</code_context>

<specifics>
## Specific Ideas

- GLITCH logo: Recreate the fragmented/distorted text effect from Capture.PNG in CSS/SVG. The text should look like it's experiencing a digital artifact/screen glitch. Animate on load (dramatic glitch), then settle to subtle continuous glitch
- The "Black Circle / A Glitch in the Matrix" flyer (Capture1.PNG) shows the broader aesthetic: dark, clean, bold type, matrix-style subtle background elements
- Owner's faxas.net/design shows high-quality component craftsmanship — flip cards, hover animations, constellation effects. Pull the QUALITY level from there, not necessarily the glassmorphic style
- Off-white is a key color — not pure #FFFFFF but a warmer/softer white for text and elements against black backgrounds
- Bottom tab bar on mobile should feel like a native app — this is a mobile-first site

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-public-site*
*Context gathered: 2026-03-25*
