---
phase: 27-media-video-strategy-foundation
plan: 03
subsystem: ui
tags: [react, youtube, media, hover-preview, accessibility, matchmedia]

requires:
  - phase: 27-media-video-strategy-foundation
    provides: i.ytimg.com whitelist (Plan 27-02) for thumbnail rendering via next/image
provides:
  - canonical <MediaEmbed> component (only YouTube iframe emitter in codebase)
  - <MediaEmbedThumbnail> leaf with hqdefault onError fallback
  - useFinePointer matchMedia hook
  - useReducedMotion matchMedia hook
  - mode='thumbnailOnly' for nested-Link cards
  - previewOnHover prop for portfolio cards
affects: [27-05, 27-06, 27-07]

tech-stack:
  added: []
  patterns:
    - youtube-nocookie.com only (no www.youtube.com/embed)
    - hover-preview iframe loads YouTube JS only on mouseenter, unmounts on mouseleave
    - canPreview gate combines pointer:fine + !reducedMotion + previewOnHover prop
    - matchMedia hooks live in src/lib/hooks/ (existing src/hooks/use-mobile.ts is parallel precedent)

key-files:
  created:
    - src/lib/hooks/use-fine-pointer.ts
    - src/lib/hooks/use-reduced-motion.ts
    - src/components/media/media-embed.tsx
    - src/components/media/media-embed-thumbnail.tsx
  modified: []

key-decisions:
  - "youtube-nocookie.com everywhere; explicitly verified zero plain youtube.com/embed strings in new files"
  - "loop=1 paired with playlist={id} (Pitfall 4 — solo loop requires self-referential playlist)"
  - "Thumbnail layer always mounted; iframes stack on top (no flash, acts as loading skeleton per UI-SPEC)"

patterns-established:
  - "matchMedia hooks return false until first paint to avoid SSR/hydration mismatch"
  - "Iframe layered on top of <Image> rather than swapped to avoid layout shift + double network round-trip on autoplay"

requirements-completed: [D-01, D-02, D-03, D-04, D-05]

duration: 5min
completed: 2026-04-25
---

# Phase 27-03: MediaEmbed Summary

**Canonical YouTube embed shipped — three render states (idle/preview/play), pointer + motion gated, youtube-nocookie everywhere, exposed thumbnail-only mode for nested-Link cards.**

## Performance

- **Duration:** ~5 min
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- useFinePointer + useReducedMotion mirror existing useIsMobile matchMedia pattern
- MediaEmbedThumbnail with hqdefault onError fallback for older YouTube uploads
- MediaEmbed canonical component with three render states + thumbnailOnly mode for cards
- canPreview = mode interactive + previewOnHover prop + pointer fine + !reducedMotion

## Task Commits

1. **Tasks 1-3 bundled:** `c35f6b7` (feat) — hooks, thumbnail, embed

## Files Created/Modified
- `src/lib/hooks/use-fine-pointer.ts` — created
- `src/lib/hooks/use-reduced-motion.ts` — created
- `src/components/media/media-embed-thumbnail.tsx` — created
- `src/components/media/media-embed.tsx` — created

## Decisions Made
None — plan executed exactly as written.

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
- Plan 05 (admin attach UX) can use MediaEmbed in attachment list previews
- Plan 06 (home features admin) can use MediaEmbed for reorderable list rows
- Plan 07 (public surfaces) can drop MediaEmbed in for the hero grid, video cards (thumbnailOnly), and review/portfolio detail pages

---
*Phase: 27-media-video-strategy-foundation*
*Completed: 2026-04-25*
