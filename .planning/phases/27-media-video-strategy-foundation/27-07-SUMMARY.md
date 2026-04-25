---
phase: 27-media-video-strategy-foundation
plan: 07
subsystem: ui
tags: [public, home, beats, portfolio, tech-review, media-embed, drizzle, batch-read]

requires:
  - phase: 27-media-video-strategy-foundation
    provides: MediaEmbed (Plan 27-03), getHomeFeatureMedia + getMediaForEntity (Plan 27-04), HomeFeaturesAdmin curates which rows render here (Plan 27-06)
provides:
  - HomeFeaturedWorkGrid server component (3-up; returns null on empty per D-12)
  - getMediaByBeatIds batch-read helper (single query for entire beats catalog)
  - BeatMadeByHand presentational client component
  - ReviewVideoEmbed media_item-first with video_url fallback (D-07)
  - VideoCard inner thumbnail via MediaEmbed thumbnailOnly mode
  - VideoDetailLayout + CaseStudyContent migrated to MediaEmbed (site-wide iframe gate compliance)
affects: []

tech-stack:
  added: []
  patterns:
    - top-down prop-pass for client-only render chains where async data must originate at the route file
    - 'Awaited<ReturnType<typeof getMediaForEntity>>' return-type lockstep with single source of truth

key-files:
  created:
    - src/components/media/home-featured-work-grid.tsx
    - src/components/beats/beat-made-by-hand.tsx
  modified:
    - src/lib/media/queries.ts (added getMediaByBeatIds)
    - src/app/(public)/page.tsx (swapped both VideoPortfolioCarousel mount points)
    - src/app/(public)/beats/page.tsx (added getMediaByBeatIds + prop pass)
    - src/components/beats/beat-catalog.tsx (mediaByBeatId prop forward)
    - src/components/beats/beat-list.tsx (per-row slice with empty-array default)
    - src/components/beats/beat-row.tsx (renders BeatMadeByHand inline as sibling of BeatDetailPanel)
    - src/components/tech/review-video-embed.tsx (media_item-first read)
    - src/components/portfolio/video-card.tsx (MediaEmbed thumbnailOnly)
    - src/components/portfolio/video-detail-layout.tsx (MediaEmbed for hero — fixes rogue iframe)
    - src/components/portfolio/case-study-content.tsx (MediaEmbed for hero — fixes rogue iframe)
    - src/app/(tech)/tech/reviews/[slug]/page.tsx (passes reviewId to ReviewVideoEmbed)

key-decisions:
  - "Refactored video-detail-layout.tsx + case-study-content.tsx beyond plan scope — they had rogue youtube.com/embed iframes that violate the site-wide verification gate. MediaEmbed handles both the hover-preview/click-to-play state and youtube-nocookie compliance, replacing inline state machines."
  - "Beat data fetch happens once at the page (force-dynamic route) with inArray, then prop-passed top-down through 4 client components to BeatRow. Documented at the page so a future architectural change is traceable."

patterns-established:
  - "Site-wide zero-rogue-iframe gate is enforced by grep — when adding any new video embed, route through MediaEmbed (not raw iframe to youtube.com)."
  - "When a server-only fetch must reach a client tree, do it at the route file and prop-pass — do not put async server components downstream of client components."

requirements-completed: [D-01, D-02, D-04, D-09, D-10, D-11, D-12]

duration: 25min
completed: 2026-04-25
---

# Phase 27-07: Public Surfaces Wiring Summary

**Every public YouTube embed on the site now flows through canonical MediaEmbed (youtube-nocookie.com only); home grid renders admin-curated home_feature rows; beat detail panel gains conditional 'Made by hand' section via top-down batch-read.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 4
- **Files modified:** 12

## Accomplishments
- HomeFeaturedWorkGrid renders 3-up grid or null (D-12 empty-state-is-null)
- ReviewVideoEmbed reads media_item first, falls back to legacy video_url
- VideoCard uses MediaEmbed thumbnailOnly to avoid nested interactive elements
- BeatMadeByHand renders inline as sibling of BeatDetailPanel inside expanded BeatRow; data fetched at page via getMediaByBeatIds and prop-passed top-down
- video-detail-layout.tsx + case-study-content.tsx refactored to MediaEmbed (closing rogue iframe gate)
- Site-wide grep confirms 0 rogue youtube.com/embed and 0 iframes outside MediaEmbed

## Task Commits

1. **Tasks 1-4 + scope-creep cleanups bundled:** `aec16bc` (feat) — all public surface wiring + iframe-gate fixes

## Files Created/Modified
See frontmatter `key-files` block above.

## Decisions Made
- Closed two rogue-iframe surfaces beyond plan scope (`video-detail-layout.tsx`, `case-study-content.tsx`) because the site-wide verification gate would otherwise fail. Both were straightforward: replace inline play state + raw iframe with `<MediaEmbed>` which handles the same UX more correctly.

## Deviations from Plan
- **Scope expansion:** plan listed 10 file modifications; this plan touched 12 (added the two portfolio detail layouts). Necessary for site-wide verification gates. Not a regression — they used the same pattern as the rest of the codebase before this phase.

## Issues Encountered
None.

## Next Phase Readiness
- Phase 27 user-visible payoff is live.
- Operator action D-13 (post-deploy): paste a Trap-Snyder making-of YouTube URL via admin attach on a portfolio item / beat / review, then pin to home_feature with sort_order=0 in /admin/settings/homepage.
- Future cleanup phase: drop deprecated portfolio_items.video_url + tech_reviews.video_url columns and remove the ReviewVideoEmbed `videoUrl` fallback path. Tracked in CONTEXT D-07.

---
*Phase: 27-media-video-strategy-foundation*
*Completed: 2026-04-25*
