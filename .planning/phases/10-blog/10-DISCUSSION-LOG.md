# Phase 10: Blog - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 10-blog
**Areas discussed:** Featured/hero post, Card consistency, Pagination behavior, Reading time + category nav

---

## Featured/hero post

### Selection mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Admin flags one as featured | Add `is_featured` boolean; admin toggles; one at a time | ✓ |
| Latest published auto-featured | Newest published post always hero; zero admin work | |
| Most viewed / most engaged | Needs view tracking; extra infra | |
| Editor pick via sortOrder | Reuse sortOrder; manual but no new field | |

**User's choice:** Admin flags one as featured

### Visual layout

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width hero banner above grid | Large image + big GlitchHeading title + excerpt + CTA spanning full content width | ✓ |
| Wide 2-column card inside grid | Hero spans 2 grid columns; less dominant | |
| Magazine split: image left, text right | Editorial look; landscape split | |
| Same size, distinct styling | Same card size with FEATURED badge + accent border | |

**User's choice:** Full-width hero banner above grid

---

## Card consistency (BLOG-01)

### Uniform sizing strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed structure: image 16:9 + clamp 2/3 lines | aspect-video image + title line-clamp-2 + excerpt line-clamp-3 + metadata | ✓ |
| CSS grid row sync | `grid-template-rows: auto 1fr auto` — natural height equalization | |
| Fixed pixel height card | Hard-coded card height; inflexible | |

**User's choice:** Fixed structure with clamps

### No-cover placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| Post title on glitchy dark gradient | Title in GlitchHeading mono on dark radial gradient | ✓ |
| Category color block | Per-category accent color block with category name | |
| Keep current "No Image" placeholder | Existing repeating-lines + "NO IMAGE" label | |
| Require all posts to have cover images | Block publishing without cover; admin burden | |

**User's choice:** Post title on glitchy dark gradient

---

## Pagination behavior (BLOG-03)

| Option | Description | Selected |
|--------|-------------|----------|
| "Load More" button | Initial 9 + button appends next 9; URL updates `?offset=N`; SEO-friendly | ✓ |
| Infinite scroll | Auto-load on scroll via IntersectionObserver; no bottom feel | |
| Numeric pagination with smooth transitions | Current nav but client-side fetch (no reload) | |
| Infinite scroll + Back to top button | Endless scroll with floating back-to-top escape | |

**User's choice:** "Load More" button

---

## Reading time + category nav (BLOG-02)

### Reading time

| Option | Description | Selected |
|--------|-------------|----------|
| Auto from word count at 225 wpm + everywhere | Compute from content; show on card + hero + detail page | ✓ |
| Auto compute, card only | Same compute; card-only display | |
| Manual admin field | `readingTimeMinutes` column; admin types a number | |
| Don't show reading time | Skip entirely; conflicts with BLOG-02 | |

**User's choice:** Auto 225 wpm, everywhere

### Category navigation style

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal chips row under h1 | Current CategoryFilter polish; not sticky; horizontal scroll on mobile | ✓ |
| Sticky horizontal nav | Always-visible; can feel intrusive | |
| Sidebar filter desktop, dropdown mobile | Editorial-magazine split; bigger lift | |
| Dropdown selector only | Compact; categories less discoverable | |

**User's choice:** Horizontal chips row under h1

---

## Claude's Discretion

- Hero gradient overlay exact color values (within locked palette)
- `nuqs` vs `history.replaceState` for `?offset=N`
- Transition animation when "Load More" appends
- Server Action vs fetch route for load-more request
- Reading-time badge placement on detail page
- HTML stripping library for word-count
- Empty-state polish (in or out of phase)

## Deferred Ideas

- Author display / bio
- Related posts at bottom of post detail
- Social share buttons
- Comments / reactions
- RSS feed / newsletter signup on blog
- Admin blog post composer polish (beyond `is_featured` toggle)
- Post detail page redesign (only reading-time badge lands this phase)
- Infinite scroll + back-to-top button
- Per-category color accents
