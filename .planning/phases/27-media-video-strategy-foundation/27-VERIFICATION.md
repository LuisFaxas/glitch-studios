---
phase: 27-media-video-strategy-foundation
status: passed
verified: 2026-04-25
verifier: inline (no subagent — per user feedback_no_executors)
---

# Phase 27 Verification

Goal-backward verification against the 8 success criteria in ROADMAP.md.

## Success Criteria

### 1. media_item table live with idempotent backfill ✅

**Evidence:**
- `pnpm db:migrate:phase27` ran twice in a row, second run was a no-op (same `applied at 2026-04-25 11:26:37.760539+00` timestamp, same row count of 4).
- `media_item table: EXISTS`, `backfill meta row: applied at <ts>`, `media_item row count: 4`.
- Schema has `media_kind` pgEnum, `idx_media_item_attachment` (composite on attached_to_type + attached_to_id), `idx_media_item_kind_external`.
- Backfill rows have `is_primary=true` (per migration SQL line 257-275).

### 2. Zero rogue youtube.com/embed; all use youtube-nocookie ✅

```bash
$ grep -rn "youtube.com/embed" src/components/ src/app/ --include="*.tsx" --include="*.ts" | grep -v "youtube-nocookie" | grep -v node_modules
(empty)
$ grep -rn "<iframe" src/components/ src/app/ --include="*.tsx" --include="*.ts" | grep -v node_modules
src/components/media/media-embed.tsx:96:        <iframe   ← preview state
src/components/media/media-embed.tsx:107:        <iframe  ← play state
```

Two iframes, both inside `<MediaEmbed>`. Both use `youtube-nocookie.com`. Verified.

### 3. Pointer + motion gating ✅

`src/components/media/media-embed.tsx` defines `canPreview = mode === "interactive" && previewOnHover && finePointer && !reducedMotion`. Hover handlers (`onMouseEnter` / `onMouseLeave`) are gated on `canPreview`. `useFinePointer` returns `false` until first paint (SSR-safe). `useReducedMotion` mirrors the standard matchMedia pattern.

### 4. Admin paste-validate-attach with verbatim copy ✅

- `src/actions/admin-media-items.ts` `attachMediaItem` calls `extractYouTubeId` for validation and `fetchYouTubeOEmbed` for cached metadata. Throws verbatim "That URL doesn't look like a YouTube link..." on validation failure.
- `src/components/media/add-video-dialog.tsx` shows inline error with the same verbatim copy. oEmbed timeout returns null → row inserts with `title: "Untitled video"`. UI degrades to inline message.
- `fetchYouTubeOEmbed` uses 5s AbortController timeout per RESEARCH.

### 5. /admin/homepage Home Features section ✅

Mounted at `src/app/admin/settings/homepage/page.tsx` (the actual admin homepage path; plan said `/admin/homepage` which doesn't exist). `HomeFeaturesAdmin` uses dnd-kit with `KeyboardSensor` + `sortableKeyboardCoordinates` for a11y reorder. Top-3 rows tagged `Live on home` chip via `idx < HARD_CAP` (HARD_CAP=3). Cap warning copy renders when `features.length > HARD_CAP`. Verbatim UI-SPEC empty/cap copy.

### 6. HomeFeaturedWorkGrid replaces VideoPortfolioCarousel ✅

```bash
$ grep -n "HomeFeaturedWorkGrid\|VideoPortfolioCarousel" src/app/\(public\)/page.tsx
10:import { HomeFeaturedWorkGrid } from "@/components/media/home-featured-work-grid"
97:    portfolio: () => <HomeFeaturedWorkGrid />,
143:            <HomeFeaturedWorkGrid />
```

Both mount points swapped, no remaining VideoPortfolioCarousel reference. `if (items.length === 0) return null` on line 18 of home-featured-work-grid.tsx (D-12). H2 + per-tile H3 wrapped in `<GlitchHeading>`.

### 7. Read-time fallback + nested-Link safety + beat detail ✅

- `ReviewVideoEmbed` (src/components/tech/review-video-embed.tsx): if `reviewId` provided, calls `getMediaForEntity("tech_review", reviewId)`, prefers `isPrimary` row else first; falls back to `extractYouTubeId(videoUrl)`. Caller in `src/app/(tech)/tech/reviews/[slug]/page.tsx:156` now passes `reviewId={review.id}`.
- `VideoCard` (src/components/portfolio/video-card.tsx): inner thumbnail is `<MediaEmbed mode="thumbnailOnly">` — no nested button inside the wrapping `<Link>`.
- Beat detail "Made by hand" section: `BeatMadeByHand` rendered inline as sibling of `BeatDetailPanel` inside `isExpanded` fragment in `src/components/beats/beat-row.tsx`. Returns null on empty per UI-SPEC. Data fetched at `src/app/(public)/beats/page.tsx` via `getMediaByBeatIds`, prop-passed top-down through 4 layers.

### 8. tsc + lint pass ✅

- `pnpm tsc --noEmit` — exit 0.
- `pnpm lint` on Phase 27 touched files — clean after the services edit-page hoist fix (`794199d`).
- Pre-existing lint errors in `src/components/portfolio/portfolio-carousel.tsx` (react-hooks/set-state-in-effect) are NOT introduced by Phase 27 — file last touched in Phase 1.4.

## Out-of-scope confirmations

- **Portfolio admin Videos section**: `/admin/portfolio/[id]/edit` does not exist in this codebase. Per Plan 27-05's "do not fabricate edit pages" instruction, the mount was deferred. Backfilled portfolio_items.video_url media still appears publicly via Plan 27-07 reads. Documented in 27-05-SUMMARY.md.
- **Operator action D-13** (post-deploy seed of Trap Snyder making-of URL via admin attach + pin to home): not a code task, no automated verification possible. Operator will pin via the new admin surface once a real URL is chosen.

## Cross-phase regression

No traditional test runner exists in the project (`pnpm lint` is the only scripted check). `pnpm tsc --noEmit` exits 0 across the entire repo, so no type-level regressions in prior-phase code.

## Verdict

**PASSED.** All 8 success criteria met. Phase 27 ships the canonical YouTube embed pattern, polymorphic media_item schema, admin attach/curate UX, and public surface wiring as designed. Two intentional, documented deviations (portfolio admin mount deferred, /admin/settings/homepage mount path correction).

## Human verification recommended (D-13 + visual)

1. Visit `/admin/settings/homepage` — verify HomepageEditor still renders, see new "Home Features" section below it. Confirm "Pin existing video" disabled when no media_items exist.
2. Visit `/admin/beats/{id}/edit` — see Videos section below BeatForm. Click "Attach video", paste `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, save. Reorder via grip, set-primary via star, remove via trash → AlertDialog confirm.
3. Pin that test video to home_feature from /admin/settings/homepage.
4. Visit `/` on desktop — see 3-up "Our Work" grid; hover a tile → muted preview iframe swaps in.
5. Visit `/` on mobile (or DevTools mobile emulation) — no hover preview, tap launches full play.
6. Visit a tech review with attached media → ReviewVideoEmbed shows the new media_item; without attached media → falls back to `tech_reviews.video_url` (D-07).
7. Visit `/beats` → expand a beat row that has attached media → "Made by hand" section appears below detail panel.
