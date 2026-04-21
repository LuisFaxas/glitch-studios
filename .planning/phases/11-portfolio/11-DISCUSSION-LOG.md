# Phase 11: Portfolio - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 11-portfolio
**Areas discussed:** Prev/next nav design, Index layout direction, Detail page for video-only items, Category filter + card polish

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Prev/next nav design | Placement, gestures, wrap behavior, mobile swipe | ✓ |
| Index layout direction | Keep Embla carousel, grid, or featured hero + grid | ✓ |
| Detail page for video-only items | Whether videos get their own detail page | ✓ |
| Category filter + card polish | Align with Phase 10 chip pattern, card uniformity | ✓ |

---

## Prev/Next Nav Design

### Q1: Where should prev/next navigation sit on the portfolio detail page?

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky footer bar | Pinned bar with ← PREV TITLE / NEXT TITLE → | ✓ |
| Inline at bottom of content | Two big tiles at end of case study with thumb + title | |
| Floating side rails | Arrow buttons on left/right edges, no titles | |

**User's choice:** Sticky footer bar (Recommended)

### Q2: How should prev/next items be ordered?

| Option | Description | Selected |
|--------|-------------|----------|
| Global sortOrder | Admin-controlled sortOrder column, same as /portfolio | ✓ |
| Filtered-view order | Scope to category the user arrived from, ?from=... | |
| Featured first, then rest | isFeatured items first, then rest by sortOrder | |

**User's choice:** Global sortOrder (Recommended)

### Q3: What happens at the ends (first/last item)?

| Option | Description | Selected |
|--------|-------------|----------|
| Wrap around | NEXT on last loops to first; PREV on first loops to last | ✓ |
| Grey out and stop | Dead-end: disabled arrows at edges | |
| Hide the missing side | Asymmetric: hide whichever arrow is unavailable | |

**User's choice:** Wrap around (Recommended)

### Q4: Any keyboard / swipe shortcuts?

| Option | Description | Selected |
|--------|-------------|----------|
| Keyboard + mobile swipe | ← / → on desktop, horizontal swipe on mobile | ✓ |
| Keyboard only | Arrow keys on desktop, tap buttons on mobile | |
| No shortcuts | Click/tap only | |

**User's choice:** Keyboard + mobile swipe (Recommended)

---

## Detail Page for Video-Only Items

### Q1: What's the target for video-only detail pages?

| Option | Description | Selected |
|--------|-------------|----------|
| Universal detail page | Every active item gets /portfolio/[slug]; videos get minimal layout | ✓ |
| Keep videos inline, case studies only | Prev/next limited to case studies | |
| Videos get detail but cards still play inline | Dual affordance on every card | |

**User's choice:** Universal detail page (Recommended)

### Q2: How does prev/next fit the video-only content?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal single-column | Embed → title → category → description → metadata, no case-study sections | ✓ |
| Same case-study template | Sections collapse when empty | |
| Richer video page with related items | More-like-this strip below video | |

**User's choice:** Minimal single-column (Recommended)

### Q3: Should video items still play inline on the index, or route to detail?

| Option | Description | Selected |
|--------|-------------|----------|
| Route to detail page | Clicking any card → /portfolio/[slug], inline play removed | ✓ |
| Keep inline play for videos | Videos play in-card, title/link → detail | |
| Inline play stays, card is the link | Thumb click → detail; no play button on card | |

**User's choice:** Route to detail page (Recommended)

---

## Index Layout Direction

### Q1: What's the index layout direction?

| Option | Description | Selected |
|--------|-------------|----------|
| Featured hero + grid below | Featured item hero on top, responsive grid below | ✓ |
| Keep single carousel, just refine | Preserve Embla carousel exactly, refine chrome | |
| Pure grid, no carousel | Replace carousel with grid, removes brand differentiator | |

**User's choice:** Featured hero + grid below (Recommended)

### Q2: How does PORT-07 'preserve carousel animations' apply?

| Option | Description | Selected |
|--------|-------------|----------|
| Reserve carousel for homepage portfolio section | Carousel lives on homepage; /portfolio is grid | ✓ |
| Secondary 'Featured' strip above the grid | Embla strip of 5-8 featured items on /portfolio | |
| Single-card featured hero IS the carousel | Hero auto-rotates through isFeatured via Embla | |

**User's choice:** Reserve carousel for homepage portfolio section (Recommended)

### Q3: Card variants in the grid?

| Option | Description | Selected |
|--------|-------------|----------|
| One card, subtle type badge | Uniform template + 'CASE STUDY' / 'VIDEO' chip | ✓ |
| Two distinct card designs | Case studies get richer card, videos simpler | |
| One card, no type differentiation | Fully uniform, type revealed on click | |

**User's choice:** One card, subtle type badge (Recommended)

---

## Category Filter + Card Polish

### Q1: Category filter styling alignment with Phase 10 D-07?

| Option | Description | Selected |
|--------|-------------|----------|
| Match Phase 10 exactly | ALL first, inverse active, mono uppercase, mobile horizontal scroll | ✓ |
| Keep current styling, just polish | Tighten spacing, add mobile scroll only | |

**User's choice:** Match Phase 10 exactly (Recommended)

### Q2: Card metadata row?

| Option | Description | Selected |
|--------|-------------|----------|
| Type chip + year | CASE STUDY / VIDEO chip + year from createdAt | ✓ |
| Type chip + client name | Client name visible, but half-empty for video-only items | |
| Just type chip, no additional metadata | Type chip only | |
| You decide | Planner picks | |

**User's choice:** Type chip + year (Recommended)

### Q3: Featured hero fallback when nothing is flagged?

| Option | Description | Selected |
|--------|-------------|----------|
| Hide hero, show grid only | Mirror Phase 10 D-01 zero-feature fallback | ✓ |
| Auto-pick newest item | Most recent createdAt becomes implicit hero | |
| Auto-pick first item by sortOrder | First in sortOrder is de-facto hero | |

**User's choice:** Hide hero, show grid only (Recommended)

### Q4: Admin work in scope?

| Option | Description | Selected |
|--------|-------------|----------|
| No admin changes this phase | Public-side polish only | ✓ |
| Add/verify isFeatured toggle + invariant | Audit admin form, mirror Phase 10 D-01 guard | |
| Defer single-feature invariant | Allow multiple featured; pick first by sortOrder | |

**User's choice:** No admin changes this phase (Recommended)

**Notes:** Surfaced during context write-up that there is no `/admin/portfolio` route at all — `isFeatured` must be set via direct DB access until a future phase adds admin portfolio CRUD. The hide-when-nothing-flagged hero fallback (D-10) makes this acceptable.

---

## Final Confirmation

| Option | Description | Selected |
|--------|-------------|----------|
| Create context | Write 11-CONTEXT.md and commit | ✓ |
| Revisit an area | Follow-up questions before writing | |

**User's choice:** Create context

---

## Claude's Discretion

- Exact gradient ramp for hero overlay (within locked dark palette)
- Whether card clicks use <Link> on whole card or preserve inner button
- Whether video detail autoplays on mount
- Swipe threshold for mobile prev/next gesture
- Whether to add `?from=category` URL state later
- Sticky footer's relationship to the existing back-to-portfolio link
- Page-to-page transition animation on prev/next
- Exact copy of type chip labels

## Deferred Ideas

- Admin portfolio CRUD (candidate for its own inserted phase)
- Single-featured invariant (needed once admin UI exists)
- Related-items strip on detail page
- Filter-scoped prev/next navigation
- Featured hero auto-rotator
- Year-filter or sort controls
- Autoplay on video detail page
- Case-study content-model enrichment
- Preserve grid scroll position on back navigation
- Dual-card variants per type (rejected in favor of uniform + chip)
- Pure grid without hero (rejected)
