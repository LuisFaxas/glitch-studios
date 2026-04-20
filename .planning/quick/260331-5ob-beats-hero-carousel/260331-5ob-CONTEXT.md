# Quick Task 260331-5ob: Beats Hero Carousel - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Task Boundary

Replace the dead zone above the search bar on the beats page (plain "BEATS" heading + lonely bundle card with 60% empty black space) with a full-width auto-looping hero carousel.

</domain>

<decisions>
## Implementation Decisions

### Hero Layout
- Full-width auto-looping carousel (like e-commerce hero banners)
- Each slide is a different CTA: promotions, bundles, subscriptions, etc.
- Replaces both the "BEATS" heading and the separate BundleSection component

### Slide Content (3 slides)
1. **Bundle promo** — Starter Pack, 3 beats, 20% off, [Add to Cart]
2. **Beat licensing pitch** — "License beats from $29", [Browse Catalog]
3. **Studio booking CTA** — "Book a session at Glitch", [Book Now]

### Carousel Height
- ~200px — prominent storefront banner without pushing catalog too far down

### Bundles
- Integrated into the carousel as slide 1 — no separate "BUNDLES" section
- Bundle data still fetched server-side and passed to the carousel

### Visual Style
- Subtle gradient (#0a0a0a to #111) with noise texture
- On-brand with glitch aesthetic without being loud
- Each slide can have its own accent color/gradient for variety

### Technical
- Use Embla Carousel (already in the project, locked in tech stack)
- Auto-play with pause on hover
- Dot indicators for slide position

</decisions>

<specifics>
## Specific Ideas

- Embla Carousel is already used in the homepage video portfolio carousel
- Bundle data comes from `getPublishedBundles()` server action
- The "BEATS" h1 heading should move into the carousel or sit above it as a thin label

</specifics>
