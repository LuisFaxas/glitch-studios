# Phase 27: Media/Video Strategy Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 27-media-video-strategy-foundation
**Areas discussed:** Embed implementation, Schema shape, Home "Our Work" carousel, Admin add-video UX

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Embed implementation | Native iframe vs lite-youtube-embed vs custom click-to-play with thumbnail | ✓ |
| Schema shape | Polymorphic media_item table OR keep per-domain videoUrl columns | ✓ |
| Home "Our Work" carousel | Hero player with no real content — decide cycling, swappable, muted autoplay, click-to-play, mobile/desktop | ✓ |
| Admin add-video UX | Paste URL → oEmbed auto-fetch vs manual fields; per-entity vs central media library | ✓ |
| Instagram short-form scope | (not selected) | |

**User choice:** All four selected. Instagram explicitly deferred.

---

## Embed Implementation

### Q1: Embed strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Click-to-play thumbnail (Recommended) | Show maxresdefault.jpg with play overlay. Click swaps in iframe with autoplay=1. Zero JS until interaction, fastest LCP, no CLS. | (initial pick) |
| lite-youtube-embed (Paul Irish) | Web component. Renders as thumbnail, swaps to iframe on click. ~2KB JS upfront. | |
| Native iframe (current pattern) | What `<ReviewVideoEmbed>` uses today. Lazy-loaded but ~300KB YouTube player JS per embed at first paint. | |

**User's choice:** Click-to-play thumbnail BUT with YouTube-style hover preview behavior added on top.
**Notes:** "Okay, so this is interesting. I like the click to play thumbnail situation because obviously it's faster. But, like, I would really like the implementation of what YouTube does when it comes to, like, you know, like hover any place type shit."

### Q2: Hover preview aggressiveness

| Option | Description | Selected |
|--------|-------------|----------|
| Muted autoplay on hover (Recommended) | Hover → swap thumbnail for muted iframe playing the video. Mouseleave → swap back. Click → full sound. | ✓ |
| Animated WebP thumbnail (lighter) | Hover → swap to short animated preview (~3 sec WebP loop). No video API call. Requires generating WebP at ingest. | |
| Visual reaction only (lightest) | Hover → brighten thumbnail, scale play icon, slide in title overlay. No actual video preview. | |

**User's choice:** Muted autoplay on hover.
**Notes:** Mobile naturally degrades to tap-only (no hover). Reduced-motion users get static thumbnail + click-to-play.

---

## Schema Shape

### Q3: Schema for video attachments

| Option | Description | Selected |
|--------|-------------|----------|
| Polymorphic media_item table (Recommended) | New table: id, kind, external_id, attached_to_type, attached_to_id, title, sort_order. Migrate existing videoUrl columns. | ✓ |
| Keep per-domain videoUrl columns | Don't refactor schema. Standardize embed component, reuse it everywhere. Simpler now, repetitive later. | |
| Hybrid: media_item for new, leave existing | New table for future attachments. Existing columns stay until rewritten naturally. No big-bang migration. | |

**User's choice:** Polymorphic media_item table.
**Notes:** Migration path: copy existing videoUrl values into media_item rows with is_primary=true; keep deprecated columns one release as read-time fallback, drop in follow-up cleanup phase.

---

## Home "Our Work" Carousel

### Q4: Home carousel behavior

| Option | Description | Selected |
|--------|-------------|----------|
| 3-up grid w/ hover preview (Recommended) | Show 3 videos at once on desktop (1 stacked on mobile). Each tile uses click-to-play + hover-preview. No auto-cycling. | ✓ |
| Embla carousel (one focal video) | Single video as hero, swipeable carousel of thumbnails underneath. Heavier, more "showreel" feel. | |
| Single hero video, admin-picked | One canonical hero video. Admin picks in /admin/homepage. Simplest. | |

**User's choice:** 3-up grid with hover preview.
**Notes:** Admin picks featured videos; no auto-cycling. Empty state hides the section entirely. Trap Snyder making-a-beat is the first content drop.

---

## Admin Add-Video UX

### Q5: Admin attachment UI

| Option | Description | Selected |
|--------|-------------|----------|
| Per-entity 'Attach video' field (Recommended) | Each edit page (beat, portfolio, service, review) gets an "Attach video" field. Paste URL → oEmbed auto-fetch. No central media library. | ✓ |
| Central media library + attachment flow | /admin/media-library lists all media_items. Per-entity edit pages "Pick from library" → multi-select dialog. | |
| Both — per-entity quick-add + central library | Per-entity attach + separate /admin/media-library for browsing. Most flexible. | |

**User's choice:** Per-entity "Attach video" field.
**Notes:** Paste URL → server-side oEmbed call to fetch title/thumbnail. Admin can edit. Central library deferred until reuse pressure emerges.

---

## Wrap-Up

### Q6: Continue or write context?

| Option | Description | Selected |
|--------|-------------|----------|
| Write CONTEXT.md (Recommended) | Decisions are clear: click-to-play+hover-preview embed, polymorphic media_item table, 3-up grid hero, per-entity attach field. | ✓ |
| Explore more gray areas | Other things to weigh in on — Instagram scope, video privacy mode, mobile inline policies, accessibility, "Made by hand" surfacing, error states. | |

**User's choice:** Write CONTEXT.md.

---

## Claude's Discretion

- Exact file paths for new components
- oEmbed timeout / retry / cache strategy
- Skeleton/loading state visuals during thumbnail-to-iframe swap
- Migration script vs Drizzle migration vs split
- Whether `media_item.attached_to_type` is a Postgres enum or text column

## Deferred Ideas

- Instagram short-form embeds (kind enum is extensible — additive later)
- Central media library `/admin/media-library` (deferred until reuse pressure)
- Captions / transcripts surfacing (its own polish phase, possibly with SEO Phase 45)
- Video chapters / timestamps (defer until any single video needs them)
- `videoUrl` column drop (deprecate one release, drop in cleanup phase)
- AI-generated thumbnails / preview clips (ties to AI Agents Phase 43)
