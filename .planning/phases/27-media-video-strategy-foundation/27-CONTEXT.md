# Phase 27: Media/Video Strategy Foundation - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the canonical pattern for embedding media — primarily YouTube — across the site. Deliverables:

1. A single embed component used everywhere video appears (review, portfolio, beat detail, home hero, future surfaces)
2. A polymorphic `media_item` table that lets any entity have one or many attached videos
3. An admin flow that makes "attach a video to this thing" routine
4. A redesigned home "Our Work" carousel that actually has a real interaction model

Not in scope (deferred):
- Instagram short-form embeds (revisit when IG content actually exists; cleaner pattern when oEmbed/post-URL friction is real, not theoretical)
- Self-hosted video player (YouTube-first locked in Phase 22 audit)
- Conversational/AI overlays on video (Glitchy mascot phase territory)

</domain>

<decisions>
## Implementation Decisions

### Embed Implementation
- **D-01:** Click-to-play thumbnail is the default render. Show `https://img.youtube.com/vi/{id}/maxresdefault.jpg` as a static `<Image>` with a play-icon overlay. Click → swap in `<iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1">`. Zero YouTube JS until interaction, no CLS, fastest LCP, full-bleed look.
- **D-02:** Desktop hover preview = muted autoplay swap. On `mouseenter` over a thumbnail, swap the thumbnail for `<iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist={id}">`. On `mouseleave`, revert to thumbnail. Click → full play with sound (controls visible). Mimics YouTube/Instagram hover-preview behavior.
- **D-03:** Mobile naturally degrades to tap-only (no hover available). Tap on thumbnail = full play with sound.
- **D-04:** Use `youtube-nocookie.com` host always (privacy-friendly embed, no third-party cookies until interaction).
- **D-05:** Reduced-motion users (`prefers-reduced-motion: reduce`) skip the hover-autoplay swap. Static thumbnail + click-to-play only.

### Schema Shape
- **D-06:** New polymorphic `media_item` table replaces ad-hoc `videoUrl` columns:
  ```
  id            uuid pk
  kind          enum('youtube_video', 'instagram_post')   // future-extensible
  external_id   text not null    // e.g. YouTube video ID '2nDCJqYBkUk'
  external_url  text not null    // canonical URL — source of truth for re-fetching metadata
  title         text             // editable; defaults from oEmbed
  description   text             // editable; defaults from oEmbed
  thumbnail_url text             // override; defaults to maxresdefault for YouTube
  duration_sec  integer          // optional; from oEmbed when available
  attached_to_type  text not null   // 'beat' | 'portfolio_item' | 'service' | 'tech_review' | 'home_feature'
  attached_to_id    uuid not null
  is_primary    boolean default false  // for entities that conceptually have a 'main' video
  sort_order    integer default 0
  created_by    text references user.id
  created_at    timestamp default now
  updated_at    timestamp default now
  ```
  Indices on `(attached_to_type, attached_to_id)` and `(kind, external_id)`.
- **D-07:** Migration: copy existing `videoUrl` values from `beats`, `portfolio_items`, `services`, `tech_reviews` into `media_item` rows, mark `is_primary=true`. Existing `videoUrl` columns deprecated (keep for one release with read-time fallback, then drop in a follow-up cleanup phase).
- **D-08:** Multiple videos per entity supported via `sort_order`. Single primary video per entity enforced by app-level invariant (not DB constraint) so admin can shuffle without a transaction.

### Home "Our Work" Carousel
- **D-09:** Replace the empty hero video player with a 3-up grid of featured videos on desktop (1-stacked on mobile). Each tile uses the click-to-play + hover-preview pattern from D-01/02.
- **D-10:** Admin picks which `media_item`s are "home_feature" attached and the sort order. No auto-cycling, no autoplay, no slideshow. Static grid that responds to user interaction.
- **D-11:** Below the grid: `See all work →` CTA that links to `/portfolio`. Single CTA, prominent.
- **D-12:** Empty state: when no `media_item`s are attached as home_feature, hide the section entirely (don't render placeholder slots). The home page reflows naturally.
- **D-13:** Trap Snyder making-a-beat video is the first content drop into this grid (per Phase 22 audit content note).

### Admin Add-Video UX
- **D-14:** Per-entity "Attach video" UI on each existing edit form (beat edit, portfolio item edit, service edit, tech review edit). No new central media library in this phase (deferred to a follow-up if reuse pressure emerges).
- **D-15:** Paste-YouTube-URL flow: admin pastes URL → server-side oEmbed call to `https://www.youtube.com/oembed?url={url}&format=json` → auto-fetch title, author, thumbnail, duration. Admin sees a preview card and can edit title/description before saving.
- **D-16:** Validate the URL is a real YouTube link with a parseable video ID before hitting oEmbed (use existing `extractYouTubeId()` in `src/lib/tech/youtube.ts`).
- **D-17:** "Home features" attachment: a separate admin surface (`/admin/homepage` or similar — exact path lives in planner's scope) where admin picks which existing `media_item`s appear in the home grid. Drag-to-reorder. Hard cap at 3 visible at a time on desktop, 1 on mobile.
- **D-18:** Multiple videos per entity: an admin can attach more than one. UI shows them in a list with reorder + remove. The first one (by `sort_order`) is the displayed primary on public surfaces unless the surface explicitly renders a list.

### Claude's Discretion
- Exact file paths for new components (`<MediaEmbed>` location, hooks, etc.) — planner picks
- oEmbed timeout handling, retry logic, cache strategy — planner picks
- Skeleton/loading state visuals during the thumbnail-to-iframe swap — planner picks (must respect reduced-motion)
- Migration script vs Drizzle migration vs split — planner picks (must be idempotent like the Phase 26 grandfather migration)
- Whether `media_item.attached_to_type` is a Postgres enum or a `text` column with app-level enum — planner picks (precedent: `tech_review_status` is an enum, but `home_feature` extending later is easier with `text`)

### Folded Todos
None — `gsd-tools todo match-phase 27` returned no relevant pending todos.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 22 audit decisions (source of truth for media direction)
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` § "PIVOT: YouTube as primary video host" — the canonical-on-YouTube-with-site-embedding decision
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` § "Made by hand videos on beat detail" — the beat-detail use case feeding the polymorphic table requirement
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` § "Our Work carousel" — the home-page surface this phase rebuilds
- `.planning/phases/22-visual-audit-discovery/22-SUMMARY.md` — high-level phase derivation

### Existing reusable code
- `src/lib/tech/youtube.ts` — `extractYouTubeId(url)` utility, reused by `<VideoCard>` and `<ReviewVideoEmbed>`. Embed component should reuse this.
- `src/components/tech/review-video-embed.tsx` — current iframe-only embed pattern; will be replaced/refactored to use the new component
- `src/components/portfolio/video-card.tsx` — current `maxresdefault.jpg` thumbnail pattern; will be replaced to use the new component
- `src/components/home/video-portfolio-carousel.tsx` — current empty-state home carousel; will be rebuilt against the 3-up grid

### Schema reference patterns
- `src/db/schema.ts` § `tech_review_pros` / `tech_review_gallery` — existing patterns for entity-attached child rows with `sort_order`
- `src/db/schema.ts` § `artistApplications` (Phase 26) — recent pattern for new entity tables with `pgEnum` + `defaultRandom uuid` + indices

### Migration pattern reference
- `src/db/migrations/0006_phase26_auth.sql` — Phase 26 migration as the pattern reference: `DO $$ EXCEPTION` enum guard, `IF NOT EXISTS` table, `phase26_migration_meta` row guard for one-shot data ops
- `scripts/run-phase26-migration.ts` — pattern for the standalone postgres-js runner if Phase 27 needs one

### YouTube oEmbed
- No internal spec — use the public YouTube oEmbed API at `https://www.youtube.com/oembed?url={video-url}&format=json`. Documented at https://developers.google.com/youtube/iframe_api_reference (informational; not required for embed via iframe).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`extractYouTubeId(url)`** at `src/lib/tech/youtube.ts` — already battle-tested for the URL formats we accept. The new `<MediaEmbed>` should import this rather than duplicate the regex.
- **`<Image>` from next/image** — the maxresdefault thumbnail pattern in `<VideoCard>` already uses it correctly with `fill` + `sizes`. Reuse the same approach.
- **`youtube-nocookie.com`** is already supported by Better Auth/CSP defaults; existing `<ReviewVideoEmbed>` uses `youtube.com` though — switch all surfaces to `youtube-nocookie.com` as part of this phase.

### Established Patterns
- **Polymorphic-ish entity_attachment pattern doesn't exist yet** — `tech_review_pros`/`tech_review_gallery` are mono-entity (always attach to `tech_reviews`). `media_item.attached_to_type + attached_to_id` is a new pattern. Document it for future reuse.
- **Drizzle enums via `pgEnum`** are the project convention; the migration generator already supports them (Phase 26 used `artist_application_status` and `artist_application_brand`).
- **Admin edit forms use server actions** consistent across `src/actions/admin-*.ts` files — the new "Attach video" + "Save media item" actions should fit that style.

### Integration Points
- Replace `<ReviewVideoEmbed>` usage at `src/app/(tech)/tech/reviews/[slug]/page.tsx` (or wherever it's rendered) with the new `<MediaEmbed>`.
- Replace `<VideoCard>` usage in portfolio with the new component (or wrap the new embed inside it).
- Build the new home grid component, replacing `<video-portfolio-carousel>` import on the home page.
- Beat detail page (`src/app/(public)/beats/[slug]/page.tsx`) gets a new "making-of video" section conditional on `media_item` rows.

</code_context>

<specifics>
## Specific Ideas

- "Implementation of what YouTube does when it comes to, like, you know, like hover any place type shit" — user wants the muted-autoplay-on-hover preview, the thing YouTube and Instagram both do where hovering a thumbnail kicks off a silent preview. D-02 captures this.
- 3-up grid feels right for the home page — not a single hero, not a flashy carousel, just three pieces of work side-by-side.
- Per-entity "Attach video" beats a central media library for v4.0 — videos won't be reused across many entities yet, so the central library would be over-engineering.

</specifics>

<deferred>
## Deferred Ideas

- **Instagram short-form embeds** — out of scope for v4.0. The schema's `kind` column is enum-extensible so adding `instagram_post` later is additive. Revisit when actual IG content is queued.
- **Central media library** (`/admin/media-library`) — deferred. Add it once we feel the pain of re-pasting the same URL across entities, which we won't until volume grows.
- **Captions / transcripts surfacing** — YouTube hosts captions natively in the player. Surfacing them on-site (e.g., scrollable transcript next to embed) is its own polish phase, possibly tied to SEO Phase 45.
- **Video chapters / timestamps** — not needed for the 3-up grid or beat detail. Defer until any single video gets long enough to need them.
- **`videoUrl` column drop** — keep the deprecated columns for one release as read-time fallback. Schedule a follow-up cleanup phase to drop them after migrate confidence period.
- **AI-generated thumbnails / preview clips** — future-future, ties into the AI Agents phase (43).

### Reviewed Todos (not folded)
None — no pending todos matched Phase 27 scope.

</deferred>

---

*Phase: 27-media-video-strategy-foundation*
*Context gathered: 2026-04-25*
