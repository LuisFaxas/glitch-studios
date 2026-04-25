# Phase 27: Media/Video Strategy Foundation — Research

**Researched:** 2026-04-25
**Domain:** Polymorphic media schema + canonical YouTube embed component + admin paste-URL flow + home featured grid
**Confidence:** HIGH (everything below is grounded in repo files; external claims cite official YouTube docs)

---

## Summary

Phase 27 introduces the project's first **polymorphic attachment table** (`media_item.attached_to_type + attached_to_id`) and a single canonical `<MediaEmbed>` component that replaces three pre-existing one-off video implementations. Almost every dependency the phase needs is already present:

- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` are installed and have a working precedent in `src/components/admin/homepage-editor.tsx` (drag-to-reorder + keyboard arrow fallback).
- shadcn primitives `dialog`, `button`, `input`, `label`, `tooltip`, `skeleton`, `sonner` are already in `src/components/ui/`. **Three are missing: `alert-dialog`, `aspect-ratio`, and the toast/`use-toast` hook (the project uses `sonner` directly instead — see Pitfall 5)**.
- Phase 26's migration (`0006_phase26_auth.sql`) is the canonical pattern for the schema migration: `DO $$ … EXCEPTION WHEN duplicate_object` for enums, `IF NOT EXISTS` everywhere, `phase26_migration_meta` row-guard for one-shot data ops, plus a standalone `scripts/run-phaseNN-migration.ts` runner using `postgres-js`.
- `extractYouTubeId()` at `src/lib/tech/youtube.ts` already covers the URL formats we need to parse server-side.
- `next.config.ts` already whitelists `i.ytimg.com`'s parent `img.youtube.com` as a remote image pattern. **Important gap: `i.ytimg.com` (the actual host of `maxresdefault.jpg` when YouTube CDN responds) is NOT in the list.** Both hosts work for thumbnails, but the embed should be deterministic — recommend adding `i.ytimg.com` and `i9.ytimg.com` to keep `next/image` from 502'ing.
- No CSP / Permissions-Policy is configured anywhere (no `headers()` block in `next.config.ts`, no security headers in `src/middleware.ts`). YouTube iframes will not be blocked. **No CSP work required for this phase.**

**Primary recommendation:** Treat this as 5 small concerns: (1) schema + idempotent migration mirroring 0006; (2) `<MediaEmbed>` as a single client component with three render states keyed by hover/focus/active; (3) server-side oEmbed fetch at attach-time, cached into `media_item` columns so the public surface never makes a runtime network call; (4) per-entity admin attachment list reusing the existing `dnd-kit` precedent verbatim; (5) home grid is a server-component reading `media_item WHERE attached_to_type='home_feature'` directly — no extra abstraction.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Embed Implementation**
- **D-01:** Click-to-play thumbnail is the default render. Show `https://img.youtube.com/vi/{id}/maxresdefault.jpg` as a static `<Image>` with a play-icon overlay. Click → swap in `<iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1">`. Zero YouTube JS until interaction, no CLS, fastest LCP, full-bleed look.
- **D-02:** Desktop hover preview = muted autoplay swap. On `mouseenter` over a thumbnail, swap the thumbnail for `<iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist={id}">`. On `mouseleave`, revert to thumbnail. Click → full play with sound (controls visible). Mimics YouTube/Instagram hover-preview behavior.
- **D-03:** Mobile naturally degrades to tap-only (no hover available). Tap on thumbnail = full play with sound.
- **D-04:** Use `youtube-nocookie.com` host always (privacy-friendly embed, no third-party cookies until interaction).
- **D-05:** Reduced-motion users (`prefers-reduced-motion: reduce`) skip the hover-autoplay swap. Static thumbnail + click-to-play only.

**Schema Shape**
- **D-06:** New polymorphic `media_item` table replaces ad-hoc `videoUrl` columns. Indices on `(attached_to_type, attached_to_id)` and `(kind, external_id)`.
- **D-07:** Migration: copy existing `videoUrl` values from `beats`, `portfolio_items`, `services`, `tech_reviews` into `media_item` rows, mark `is_primary=true`. Existing `videoUrl` columns deprecated for one release with read-time fallback, then dropped in a follow-up cleanup phase.
- **D-08:** Multiple videos per entity supported via `sort_order`. Single primary video per entity enforced by app-level invariant (not DB constraint).

**Home "Our Work" Carousel**
- **D-09:** Replace empty hero player with 3-up grid on desktop (1-stacked on mobile). Each tile uses click-to-play + hover-preview from D-01/02.
- **D-10:** Admin picks `media_item`s as "home_feature" attached + sort order. No auto-cycling, no autoplay, no slideshow.
- **D-11:** Below grid: `See all work →` CTA that links to `/portfolio`. Single CTA, prominent.
- **D-12:** Empty state: when no `home_feature` items exist, hide the section entirely. Home page reflows naturally.
- **D-13:** Trap Snyder making-a-beat video is the first content drop into this grid.

**Admin Add-Video UX**
- **D-14:** Per-entity "Attach video" UI on each existing edit form (beat / portfolio item / service / tech review). No central media library this phase.
- **D-15:** Paste-YouTube-URL flow: server-side oEmbed call to `https://www.youtube.com/oembed?url={url}&format=json` → auto-fetch title, author, thumbnail, duration. Admin sees preview card and can edit title/description before saving.
- **D-16:** Validate the URL is a real YouTube link with a parseable video ID before hitting oEmbed (use existing `extractYouTubeId()`).
- **D-17:** "Home features" attachment lives at a separate admin surface — exact path is planner discretion. Drag-to-reorder. Hard cap at 3 visible on desktop, 1 on mobile.
- **D-18:** Multiple videos per entity: admin can attach more than one. UI shows them in a list with reorder + remove. First by `sort_order` is the public primary.

### Claude's Discretion

- Exact file paths for new components (`<MediaEmbed>` location, hooks, etc.)
- oEmbed timeout handling, retry logic, cache strategy
- Skeleton/loading state visuals during the thumbnail-to-iframe swap (must respect reduced-motion)
- Migration script vs Drizzle migration vs split — must be idempotent like Phase 26
- Whether `media_item.attached_to_type` is a Postgres enum or a `text` column with app-level enum (precedent: `tech_review_status` is enum, but `home_feature` extending later is easier with `text`)

### Deferred Ideas (OUT OF SCOPE)

- **Instagram short-form embeds** — the schema's `kind` enum should be extensible so `instagram_post` can be added later. Do NOT scaffold IG handling now.
- **Central media library** (`/admin/media-library`) — deferred until reuse pressure emerges.
- **Captions / transcripts** — defer to SEO phase 45.
- **Video chapters / timestamps** — defer.
- **`videoUrl` column drop** — keep deprecated columns for one release with read-time fallback. Schedule follow-up cleanup phase.
- **AI-generated thumbnails / preview clips** — defer to AI Agents phase 43.

---

## Phase Requirements

> No formal REQ-IDs were ever allocated for Phase 27 in `REQUIREMENTS.md` (the table at line 176 explicitly says "media foundation, no REQ-IDs yet — derived from pivots #2, #9"). The CONTEXT.md decisions D-01..D-18 ARE the requirement set. The table below maps each decision to the research finding the planner uses.

| ID | Description | Research Support |
|----|-------------|------------------|
| D-01 | Click-to-play thumbnail default | "Click-to-Play + Hover-Preview Pattern" code example below; `next.config.ts` already permits `img.youtube.com` |
| D-02 | Hover-preview muted-autoplay | YouTube embed parameters confirmed in [YouTube IFrame Player API parameters](https://developers.google.com/youtube/player_parameters) — `autoplay=1&mute=1&controls=0&loop=1&playlist={id}` is the canonical recipe (loop requires `playlist={id}` for single videos) |
| D-03 | Mobile tap-only | Detected via `(pointer: coarse)` matchMedia — see `useFinePointer` hook spec |
| D-04 | `youtube-nocookie.com` always | Verified: [YouTube embed privacy mode](https://support.google.com/youtube/answer/171780) — same player API, same iframe params, no cookies until user clicks |
| D-05 | Reduced-motion skip | `useReducedMotion` hook spec below; site uses `motion-reduce:` Tailwind utilities and `motion`/Framer's automatic respect today (verified in `splash-overlay.tsx`) |
| D-06 | Polymorphic `media_item` schema | "Polymorphic Schema in Drizzle" section — recommend `pgEnum` for `kind` (extensible additively), plain `text` for `attached_to_type` (so `home_feature` is just another value) |
| D-07 | Migrate existing `videoUrl`s | Only **two** tables hold `video_url` columns today: `portfolio_items` (line 147) and `tech_reviews` (line 821). `beats` and `services` do NOT have a `video_url` column despite the CONTEXT mention — see "Existing videoUrl Columns" below |
| D-08 | Multiple videos via `sort_order` | App-level invariant — no DB constraint needed; precedent in `tech_review_pros.sortOrder` (rows 850, 859) |
| D-09 | 3-up home grid | UI-SPEC §Layout — `<HomeFeaturedWorkGrid>` server component shown below |
| D-10..D-13 | Home features pinning + Trap Snyder content | New table row: `media_item WHERE attached_to_type='home_feature' AND attached_to_id` set to a sentinel UUID per Discretion item below — OR a dedicated `home_feature_media` join. Recommend the sentinel approach for consistency |
| D-14..D-16 | Per-entity attach-video flow | "oEmbed Server Action" code example below; `extractYouTubeId` reused at `src/lib/tech/youtube.ts:3` |
| D-17 | `/admin/homepage` features picker, drag-to-reorder, cap 3 | dnd-kit precedent at `src/components/admin/homepage-editor.tsx` lines 65-110 |
| D-18 | List with reorder + remove on entity edit | Same dnd-kit pattern; first-by-sort-order is the primary on public surfaces |

---

## Project Constraints (from CLAUDE.md)

- **pnpm only** — never `npm` or `yarn` in scripts/install commands
- **No emoji in code or commits**
- **Next.js 16 App Router** — Server Components by default, `"use client"` only where needed
- **Drizzle ORM 0.45.x + Postgres** — Neon serverless via `@/lib/db`; migrations are SQL files in `src/db/migrations/`
- **Better Auth 1.5.x** — sessions via `auth.api.getSession({ headers: await headers() })`
- **Tailwind v4 + base-nova shadcn preset** — preset locked, no greenfield design choices in this phase
- **font-mono UPPERCASE for all H1/H2/H3** — wrap in `<GlitchHeading text="...">…</GlitchHeading>` (the existing `src/components/ui/glitch-heading.tsx`); no auto-running animations
- **No `next build` in CI/agents** — 8 cores / 19 GB shared, build runs hit OOM. Verify with `pnpm tsc --noEmit` and `pnpm lint`
- **Server actions pattern** — `"use server"`, top of file; one of `await requirePermission("manage_content")` or the inline `requireAdmin()` (see Pitfall 6); always `revalidatePath(...)` after mutation

---

## Standard Stack

### Core (already installed — verified in `package.json`)

| Library | Version (installed) | Purpose | Why Standard |
|---------|---------------------|---------|--------------|
| `next` | 16.2.1 | Framework | Phase 26 baseline |
| `react` | 19.2.4 | UI runtime | Required by Next 16 |
| `drizzle-orm` | 0.45.1 | ORM | Project-wide |
| `postgres` | 3.4.8 | Driver for migration runner | Phase 26 precedent |
| `@dnd-kit/core` | 6.3.1 | Drag-drop primitives | Used in `homepage-editor.tsx` already |
| `@dnd-kit/sortable` | 10.0.0 | Sortable lists with keyboard sensor | Same |
| `@dnd-kit/utilities` | 3.2.2 | CSS.Transform helper | Same |
| `lucide-react` | 1.11.0 | Icons (`Play`, `GripVertical`, `Trash2`, `Plus`, `Loader2`, `Link2`, `X`) | UI-SPEC explicitly calls these |
| `sonner` | 2.0.7 | Toast — uses `toast.success/error` | The project's only toast tool; see Pitfall 5 |
| `zod` | 4.3.6 | Schema validation | URL validation in oEmbed action — note Zod v4 uses `.issues` not `.errors` (Phase 16 lesson) |
| `next/image` | (built-in) | Thumbnail rendering | Already used by `<VideoCard>` |

**No new npm dependencies are required** for this phase. Everything maps to packages already on disk.

### shadcn Primitives — Audit Against `src/components/ui/`

| Primitive needed | Already installed? | Action |
|------------------|--------------------|--------|
| `dialog` | ✅ `dialog.tsx` exists | reuse |
| `button` | ✅ `button.tsx` | reuse |
| `input` | ✅ `input.tsx` | reuse |
| `label` | ✅ `label.tsx` | reuse |
| `tooltip` | ✅ `tooltip.tsx` | reuse |
| `skeleton` | ✅ `skeleton.tsx` | reuse if used in AddVideoDialog loading state |
| `toast` (sonner) | ✅ `sonner.tsx` | reuse — call `toast(...)` from `sonner` directly, no `useToast` hook in this project |
| `alert-dialog` | ❌ **MISSING** | run `pnpm dlx shadcn@latest add alert-dialog` |
| `aspect-ratio` | ❌ **MISSING** | optional — `aspect-video` Tailwind utility is already used everywhere; only add the component if planner wants the named primitive. Recommend: SKIP, use `className="aspect-video"` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| YouTube oEmbed (no duration) | YouTube Data API v3 `videos.list?part=contentDetails` | Returns ISO 8601 `PT4M13S` duration. Cost: requires API key + quota (10K units/day free, 1 unit per call). Not worth it for v4.0 — drop `duration_sec` from initial migration or fetch best-effort and store NULL on failure. **Recommend: keep `duration_sec` column nullable, do not fetch from YouTube Data API in Phase 27. Future enhancement.** |
| `noembed.com` proxy (returns duration) | — | Third-party uptime risk. Reject. |
| Polymorphic single table (`media_item`) | One join table per entity | Join-tables-per-entity is type-safer (FK, joinable) but explodes to 5+ tables for the same shape. The project has zero polymorphic tables today; introducing the pattern here for the explicit purpose of "one schema for many entities" is the lower-cost call given that future entities (artist profiles, blog posts) will plug in for free. |
| `pgEnum` for `attached_to_type` | `text` with app-level enum | `text` wins — adding a new attached entity (e.g., `home_feature`, future `artist_profile`) does not need a migration. Precedent for `text + app-validation`: `homepage_sections.section_type` (line 556). Precedent for `pgEnum` is `tech_review_status` but those values rarely change. |
| Built-in `useReducedMotion` from `motion`/Framer | Custom `matchMedia` hook | The project already has `motion@12.23.12` installed and `splash-overlay.tsx` confirms motion's `prefers-reduced-motion` automatic respect. **For the iframe-swap decision (which is NOT a motion library animation but a DOM swap)**, write a tiny `useReducedMotion()` matchMedia hook locally — see code below. |

**Installation:**
```bash
pnpm dlx shadcn@latest add alert-dialog
```

That is the **only** install command this phase needs.

**Version verification (`pnpm view ...`):**
- `lucide-react@1.11.0` (installed) is current
- `@radix-ui/react-alert-dialog@1.1.15` is the latest as of 2026-04-25 (will be pulled transitively by shadcn)
- `@dnd-kit/sortable@10.0.0` is current; the project is on it

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── media/                       # NEW — phase 27 lives here
│   │   ├── media-embed.tsx                  # client component, the canonical embed
│   │   ├── media-embed-thumbnail.tsx        # extracted thumbnail leaf
│   │   ├── media-item-attachment-list.tsx   # admin per-entity dnd list
│   │   ├── add-video-dialog.tsx             # admin paste-URL dialog
│   │   └── home-featured-work-grid.tsx      # the public 3-up grid
│   ├── tech/
│   │   └── review-video-embed.tsx           # REFACTOR: thin wrapper around <MediaEmbed>
│   ├── portfolio/
│   │   └── video-card.tsx                   # REFACTOR: inner thumbnail uses <MediaEmbed previewOnHover={false}>
│   └── home/
│       └── video-portfolio-carousel.tsx     # OBSOLETE — delete after home page edit lands
├── lib/
│   ├── media/
│   │   ├── youtube-oembed.ts                # NEW — server-only oEmbed fetcher
│   │   └── youtube.ts                       # extend existing src/lib/tech/youtube.ts? OR move to media/
│   └── hooks/
│       ├── use-fine-pointer.ts              # NEW — `(pointer: fine)` matchMedia hook
│       └── use-reduced-motion.ts            # NEW — `(prefers-reduced-motion: reduce)` hook
├── actions/
│   └── admin-media-items.ts                 # NEW — attachMediaItem / removeMediaItem / reorderMediaItems / setHomeFeatures
└── db/
    ├── schema.ts                            # ADD media_item table + relations
    └── migrations/
        └── 0007_phase27_media.sql           # NEW — schema + idempotent backfill
```

**Note on `src/lib/tech/youtube.ts`:** Recommend keeping `extractYouTubeId` where it is to avoid touching `<ReviewVideoEmbed>` and `<VideoCard>` import paths. Add a thin re-export from `src/lib/media/youtube.ts` if you want one canonical media import root, but it's optional.

### Pattern 1: Click-to-Play + Hover-Preview Pattern

**What:** A single client component with three internal states — `idle` (thumbnail), `previewing` (muted iframe on hover), `playing` (full iframe with sound after click). The thumbnail stays mounted under the iframe so it acts as the loading skeleton (UI-SPEC §Interaction States explicitly says "no skeleton flash; the thumbnail IS the skeleton").

**When to use:** Every public surface that renders a YouTube video. Three render modes are needed:
- `previewOnHover={true}` (default) — used on the home grid
- `previewOnHover={false}` — used on `<VideoCard>` (portfolio grid is click-to-navigate, not click-to-play)
- A "static iframe always" mode is achievable by passing the playing state as initial — but the existing review video page should keep click-to-play behavior, so probably not needed.

**Example:**

```tsx
// src/components/media/media-embed.tsx
// Source: project convention + YouTube IFrame Player Parameters
// https://developers.google.com/youtube/player_parameters
"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { useFinePointer } from "@/lib/hooks/use-fine-pointer"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

interface MediaEmbedProps {
  externalId: string                  // YouTube video id (11 chars)
  title: string                       // for aria-label + iframe title
  thumbnailUrl?: string | null        // override; default: maxresdefault on YT CDN
  previewOnHover?: boolean            // default true; pass false for portfolio cards
  className?: string                  // wrapper className (the aspect-video frame)
}

export function MediaEmbed({
  externalId,
  title,
  thumbnailUrl,
  previewOnHover = true,
  className,
}: MediaEmbedProps) {
  const [state, setState] = useState<"idle" | "preview" | "play">("idle")
  const finePointer = useFinePointer()
  const reducedMotion = useReducedMotion()
  const canPreview = previewOnHover && finePointer && !reducedMotion

  const thumb =
    thumbnailUrl ??
    `https://i.ytimg.com/vi/${externalId}/maxresdefault.jpg`
  const previewSrc =
    `https://www.youtube-nocookie.com/embed/${externalId}` +
    `?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${externalId}` +
    `&rel=0&playsinline=1`
  const playSrc =
    `https://www.youtube-nocookie.com/embed/${externalId}` +
    `?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`

  return (
    <div
      className={`relative aspect-video overflow-hidden border border-[#222] bg-[#0a0a0a] ${className ?? ""}`}
      onMouseEnter={canPreview && state === "idle" ? () => setState("preview") : undefined}
      onMouseLeave={canPreview && state === "preview" ? () => setState("idle") : undefined}
    >
      {/* Thumbnail layer — always mounted; iframes stack on top */}
      <Image
        src={thumb}
        alt=""                          // decorative; aria-label is on the button
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        // Fall back to hqdefault if maxresdefault 404s — see Pitfall 1
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement
          if (!img.src.includes("hqdefault")) {
            img.src = `https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`
          }
        }}
        priority={false}
      />

      {state === "preview" && (
        <iframe
          src={previewSrc}
          title={`${title} — silent preview`}
          aria-hidden="true"
          tabIndex={-1}
          allow="autoplay"
          className="absolute inset-0 h-full w-full pointer-events-none"
        />
      )}

      {state === "play" && (
        <iframe
          src={playSrc}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}

      {/* Click target — the entire frame. Hidden under the iframe once playing. */}
      {state !== "play" && (
        <button
          type="button"
          onClick={() => setState("play")}
          aria-label={`Play video: ${title}`}
          className="absolute inset-0 flex items-center justify-center group focus-visible:outline-2 focus-visible:outline-[#f5f5f0]/40 focus-visible:outline-offset-2"
        >
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full bg-[#0a0a0a]/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
          >
            <Play className="size-6 text-[#f5f5f0]" />
          </span>
        </button>
      )}
    </div>
  )
}
```

**Three correctness notes embedded above:**
1. The thumbnail Image uses `onError` to fall back from `maxresdefault.jpg` (1280×720) to `hqdefault.jpg` (480×360). YouTube only generates `maxresdefault` if the uploader uploaded ≥720p; older videos 404 silently.
2. `playlist={id}` is REQUIRED to make `loop=1` work for a single video — confirmed in YouTube IFrame Player Parameters doc.
3. `playsinline=1` prevents iOS Safari from forcing fullscreen on autoplay (otherwise the silent hover preview is broken on iPad).

### Pattern 2: `useFinePointer` and `useReducedMotion` Hooks

**What:** Two tiny media-query-listening hooks. Both follow the existing `useIsMobile` pattern at `src/hooks/use-mobile.ts:5` (`matchMedia` + `addEventListener('change')` cleanup).

**Code:**

```tsx
// src/lib/hooks/use-fine-pointer.ts
"use client"

import { useEffect, useState } from "react"

/**
 * `true` when the primary input is mouse/trackpad (`pointer: fine`).
 * Returns `false` until the first paint to avoid SSR/hydration mismatch
 * — falsey for the first frame is the safer default (no hover preview).
 */
export function useFinePointer(): boolean {
  const [isFine, setIsFine] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia("(pointer: fine)")
    const onChange = () => setIsFine(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return isFine
}
```

```tsx
// src/lib/hooks/use-reduced-motion.ts
"use client"

import { useEffect, useState } from "react"

/**
 * `true` when user has `prefers-reduced-motion: reduce` set.
 * Mirrors what `motion`/Framer's `useReducedMotion` returns, but works
 * for plain DOM/iframe-swap logic that isn't going through Framer.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return reduced
}
```

### Pattern 3: oEmbed Server Action (with cache-on-attach)

**What:** The oEmbed call happens **once**, server-side, when the admin attaches the video. Title / author / thumbnail_url / duration_sec are persisted to `media_item`. Public render reads from `media_item` directly — no oEmbed at request time. This is the same pattern as `tech_reviews.bprScore` (computed once on ingest, cached on the row).

**When to use:** Every admin "Attach video" save.

**Code:**

```ts
// src/lib/media/youtube-oembed.ts
import "server-only"

export interface YouTubeOEmbedResponse {
  title: string
  author_name: string
  thumbnail_url: string
  // Note: standard oEmbed does NOT return duration. Always undefined.
  // duration_sec must come from YouTube Data API v3 (deferred to a future phase)
  // or from the user editing it manually.
}

const OEMBED_URL = "https://www.youtube.com/oembed"

/**
 * Fetch oEmbed metadata for a YouTube video.
 * - Times out at 5s (oEmbed is normally <500ms; treat anything slow as failure)
 * - Returns null on any error so callers can degrade gracefully (per UI-SPEC
 *   error copy "Couldn't load video info from YouTube. The link is saved...")
 * - No retry — admin can re-paste the URL if it fails.
 */
export async function fetchYouTubeOEmbed(
  url: string,
): Promise<YouTubeOEmbedResponse | null> {
  const target = new URL(OEMBED_URL)
  target.searchParams.set("url", url)
  target.searchParams.set("format", "json")

  const ctl = new AbortController()
  const timeout = setTimeout(() => ctl.abort(), 5000)
  try {
    const res = await fetch(target.toString(), {
      signal: ctl.signal,
      // Server action context — cache off (we cache in DB instead)
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as YouTubeOEmbedResponse
    return data
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
```

```ts
// src/actions/admin-media-items.ts
"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq, and, asc, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { mediaItems } from "@/db/schema"
import { extractYouTubeId } from "@/lib/tech/youtube"
import { fetchYouTubeOEmbed } from "@/lib/media/youtube-oembed"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = session?.user?.role ?? ""
  if (!session?.user || !["owner", "admin", "editor"].includes(role)) {
    throw new Error("Unauthorized")
  }
  return session
}

const ATTACH_TYPES = [
  "beat",
  "portfolio_item",
  "service",
  "tech_review",
  "home_feature",
] as const
type AttachType = (typeof ATTACH_TYPES)[number]

const attachSchema = z.object({
  attachedToType: z.enum(ATTACH_TYPES),
  attachedToId: z.string().uuid(),
  url: z.string().url(),
})

export async function attachMediaItem(input: z.infer<typeof attachSchema>) {
  const session = await requireAdmin()
  const parsed = attachSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  const externalId = extractYouTubeId(parsed.data.url)
  if (!externalId) {
    throw new Error("That URL doesn't look like a YouTube link.")
  }

  const meta = await fetchYouTubeOEmbed(parsed.data.url)
  // Determine sortOrder = max(existing) + 1 for this attachment
  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${mediaItems.sortOrder}), -1)` })
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.attachedToType, parsed.data.attachedToType),
        eq(mediaItems.attachedToId, parsed.data.attachedToId),
      ),
    )

  const [inserted] = await db
    .insert(mediaItems)
    .values({
      kind: "youtube_video",
      externalId,
      externalUrl: parsed.data.url,
      title: meta?.title ?? "Untitled video",
      description: null,
      thumbnailUrl: meta?.thumbnail_url ?? null,
      durationSec: null,
      attachedToType: parsed.data.attachedToType,
      attachedToId: parsed.data.attachedToId,
      isPrimary: maxOrder === -1,           // first attachment → primary
      sortOrder: maxOrder + 1,
      createdBy: session.user.id,
    })
    .returning({ id: mediaItems.id })

  revalidateForType(parsed.data.attachedToType)
  return { id: inserted.id }
}

export async function removeMediaItem(id: string) {
  await requireAdmin()
  const [row] = await db
    .delete(mediaItems)
    .where(eq(mediaItems.id, id))
    .returning({
      attachedToType: mediaItems.attachedToType,
    })
  if (row) revalidateForType(row.attachedToType as AttachType)
}

export async function reorderMediaItems(
  attachedToType: AttachType,
  attachedToId: string,
  orderedIds: string[],
) {
  await requireAdmin()
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(mediaItems)
      .set({ sortOrder: i, updatedAt: new Date() })
      .where(eq(mediaItems.id, orderedIds[i]))
  }
  revalidateForType(attachedToType)
}

export async function setHomeFeatures(orderedIds: string[]) {
  // orderedIds are mediaItem IDs (already attached to entities).
  // We "feature" by inserting a separate media_item row with
  // attached_to_type='home_feature' that REFERENCES the underlying
  // video by externalId. See "Home Features Modeling" pitfall below
  // for why this is the recommended approach over a separate table.
  // ... full implementation in plan
}

function revalidateForType(t: AttachType) {
  revalidatePath("/")
  switch (t) {
    case "portfolio_item":
      revalidatePath("/portfolio")
      revalidatePath("/portfolio/[slug]", "page")
      break
    case "tech_review":
      revalidatePath("/tech")
      revalidatePath("/tech/reviews/[slug]", "page")
      break
    case "beat":
      revalidatePath("/beats")
      revalidatePath("/beats/[slug]", "page")
      break
    case "service":
      revalidatePath("/services")
      break
    case "home_feature":
      // already revalidates "/" above
      break
  }
}
```

### Anti-Patterns to Avoid

- **Calling oEmbed at render time** — every public page render would hit `youtube.com`, blow up TTFB, and break offline rendering. Cache on attach.
- **Using `youtube.com/embed/...` directly** — D-04 mandates `youtube-nocookie.com`. Site-wide grep gate already proposed in UI-SPEC §Verification Hooks #2.
- **Hand-rolling reduced-motion detection inside the embed** — extract to `useReducedMotion` so other components reuse.
- **Building a "media library" UI** — explicitly deferred. Per-entity attach only.
- **Adding a separate `home_features` table** — keep schema flat. `home_feature` is just another value of `attached_to_type`. See "Home Features Modeling" pitfall.
- **Querying YouTube Data API v3** for duration — out of scope; requires API key + quota management. Keep `duration_sec` nullable, leave admin-editable.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL → video ID parsing | new regex | `extractYouTubeId()` at `src/lib/tech/youtube.ts:3` | Already battle-tested, handles `youtube.com/watch?v=`, `youtube.com/embed/`, `youtu.be/`, mobile host, validates 11-char ID |
| Drag-and-drop list reorder | new dnd library | `@dnd-kit/core` + `@dnd-kit/sortable` (already installed); use the EXACT pattern at `src/components/admin/homepage-editor.tsx:65-110` (sensors with PointerSensor + KeyboardSensor + `sortableKeyboardCoordinates`) | Working precedent, accessibility-tested |
| Toast notifications | wrap sonner | `import { toast } from "sonner"` directly | Project convention; no `useToast` hook exists |
| Reduced-motion detection in animation lib | matchMedia in every component | `useReducedMotion` hook (specced above) | One source of truth |
| Pointer-fine detection | userAgent sniff | `useFinePointer` matchMedia hook (specced above) | UA strings lie; `(pointer: fine)` is what CSS uses internally |
| Server-side YouTube duration | fetch HTML and regex `<meta itemprop=duration>` | **Don't fetch.** Make `duration_sec` nullable + admin-editable | YouTube Data API requires key/quota; HTML scraping breaks every time YouTube redesigns |
| Custom thumbnail fallback chain | preflight HEAD request to maxresdefault | `<img onError>` falls back to `hqdefault` | Saves a roundtrip; works in `next/image` as shown in code example above |
| Polymorphic FK enforcement in Postgres | trigger-based check | App-level type discriminator + index | DB-enforced polymorphism is overkill for a 5-value enum; trust the Drizzle types + zod validation in actions |

**Key insight:** This phase is mostly about composing primitives the project already owns. The only genuinely new abstraction is the polymorphic schema, and even that is `text + uuid + index` — three Postgres features, no extension.

---

## Polymorphic Schema in Drizzle (deep dive)

### Decision: `pgEnum('media_kind', ...)` for `kind` + plain `text` for `attached_to_type`

**`kind` should be a `pgEnum`** because:
- Values are tied to the embed component's render switch (`youtube_video`, `instagram_post`, future `vimeo_video`). Catching invalid kinds at the DB level matches the strictness of `tech_review_status`.
- Adding values is `ALTER TYPE … ADD VALUE` — additive, non-breaking.

**`attached_to_type` should be plain `text`** because:
- New attachment targets (`home_feature`, future `artist_profile`, future `blog_post`) appear MUCH more often than new media kinds. Each one would otherwise need a migration.
- Validation lives in the zod schema in `attachMediaItem` — same pattern as `homepage_sections.section_type` (line 556 of schema.ts), which is intentionally plain `text`.

### Drizzle definition

```ts
// Add to src/db/schema.ts (place near the other "Phase 26" block at line 1092)

export const mediaKindEnum = pgEnum("media_kind", [
  "youtube_video",
  "instagram_post",  // forward-declared, not implemented this phase
])

export const mediaItems = pgTable(
  "media_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: mediaKindEnum("kind").notNull(),
    externalId: text("external_id").notNull(),
    externalUrl: text("external_url").notNull(),
    title: text("title"),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    durationSec: integer("duration_sec"),
    attachedToType: text("attached_to_type").notNull(),
    attachedToId: uuid("attached_to_id").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_media_item_attachment").on(t.attachedToType, t.attachedToId),
    index("idx_media_item_kind_external").on(t.kind, t.externalId),
  ],
)

export const mediaItemsRelations = relations(mediaItems, ({ one }) => ({
  creator: one(user, {
    fields: [mediaItems.createdBy],
    references: [user.id],
  }),
}))
```

**Compile-time joins:** Because there is no FK on `attached_to_id`, joins must be application-level. For each entity-scoped query, write a helper:

```ts
// src/lib/media/queries.ts
import { db } from "@/lib/db"
import { mediaItems } from "@/db/schema"
import { and, asc, eq } from "drizzle-orm"

export async function getMediaForEntity(
  attachedToType: string,
  attachedToId: string,
) {
  return db
    .select()
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.attachedToType, attachedToType),
        eq(mediaItems.attachedToId, attachedToId),
      ),
    )
    .orderBy(asc(mediaItems.sortOrder))
}
```

This pattern is identical to how `tech_review_pros` is queried in `src/actions/admin-tech-reviews.ts:75-91`.

---

## Existing `videoUrl` Columns — Migration Backfill

**Verified by grep over `src/db/schema.ts`:** Only TWO tables have `video_url` columns today.

| Table | Column | Schema line | Has any rows with values? |
|-------|--------|-------------|--------------------------|
| `portfolio_items` | `video_url` (`text`) | 147 | Seeded values exist in `src/db/seed.ts:240,252,264,275` (placeholder Rick Roll URL × 4). Live row count NOT queried (production DB read denied). |
| `tech_reviews` | `video_url` (`text`) | 821 | Likely sparse — only the MBP flagship review in production has a video at present. |

**`beats` and `services` do NOT have `video_url` columns** — CONTEXT.md D-07 mentions them as candidates but they don't exist. The migration only needs to backfill from `portfolio_items` and `tech_reviews`. (Future "making-of" videos for beats become new `media_item` rows directly, not a backfill.)

### Migration Strategy: Single SQL file with idempotent backfill

**Recommendation: Option (a) — schema + backfill in one migration**, mirroring Phase 26's `0006_phase26_auth.sql` pattern. Why this over splitting:

1. The backfill is small (≤ ~10 rows max in production based on seed evidence).
2. Idempotency is already achievable via `phase27_migration_meta` row guard.
3. A separate `scripts/run-phase27-migration.ts` runner mirrors `scripts/run-phase26-migration.ts` and uses the same DATABASE_URL flow.
4. Splitting introduces a temporal window where the schema exists but data is missing — bad for the read-time fallback (Pitfall 7).

### Migration skeleton (`src/db/migrations/0007_phase27_media.sql`)

```sql
-- Phase 27 — Media/Video Strategy Foundation
-- Adds polymorphic media_item table + backfills existing video_url values.

-- 1. Enum (idempotent)
DO $$ BEGIN
  CREATE TYPE "media_kind" AS ENUM ('youtube_video', 'instagram_post');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Table
CREATE TABLE IF NOT EXISTS "media_item" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "kind" "media_kind" NOT NULL,
  "external_id" text NOT NULL,
  "external_url" text NOT NULL,
  "title" text,
  "description" text,
  "thumbnail_url" text,
  "duration_sec" integer,
  "attached_to_type" text NOT NULL,
  "attached_to_id" uuid NOT NULL,
  "is_primary" boolean NOT NULL DEFAULT false,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_media_item_attachment"
  ON "media_item" ("attached_to_type", "attached_to_id");
CREATE INDEX IF NOT EXISTS "idx_media_item_kind_external"
  ON "media_item" ("kind", "external_id");

-- 3. One-shot backfill guard
CREATE TABLE IF NOT EXISTS "phase27_migration_meta" (
  "key" text PRIMARY KEY,
  "value" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

DO $$
DECLARE
  already_ran text;
BEGIN
  SELECT value INTO already_ran
    FROM "phase27_migration_meta"
    WHERE key = 'backfill_video_url';
  IF already_ran IS NULL THEN
    -- portfolio_items.video_url → media_item
    INSERT INTO "media_item"
      (kind, external_id, external_url, attached_to_type, attached_to_id, is_primary)
    SELECT
      'youtube_video',
      -- Pre-validated YouTube ID — anything that doesn't parse via the
      -- regex below is left behind (admin re-attaches manually).
      substring(p.video_url FROM '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})'),
      p.video_url,
      'portfolio_item',
      p.id,
      true
    FROM "portfolio_items" p
    WHERE p.video_url IS NOT NULL
      AND p.video_url <> ''
      AND p.video_url ~ '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})';

    -- tech_reviews.video_url → media_item
    INSERT INTO "media_item"
      (kind, external_id, external_url, attached_to_type, attached_to_id, is_primary)
    SELECT
      'youtube_video',
      substring(r.video_url FROM '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})'),
      r.video_url,
      'tech_review',
      r.id,
      true
    FROM "tech_reviews" r
    WHERE r.video_url IS NOT NULL
      AND r.video_url <> ''
      AND r.video_url ~ '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})';

    INSERT INTO "phase27_migration_meta" (key, value)
      VALUES ('backfill_video_url', now()::text);
  END IF;
END $$;

-- 4. NOTE: video_url columns on portfolio_items and tech_reviews are
-- intentionally NOT dropped here. Read-time fallback for one release
-- per CONTEXT D-07; drop scheduled for follow-up cleanup phase.
```

### Standalone runner (`scripts/run-phase27-migration.ts`)

Verbatim copy of `scripts/run-phase26-migration.ts` with `0006_phase26_auth.sql` → `0007_phase27_media.sql` and the assertion checks updated to look for `media_item` table + `phase27_migration_meta` row. Add `pnpm` script:

```json
"db:migrate:phase27": "tsx --env-file=.env.local scripts/run-phase27-migration.ts"
```

---

## Server Actions Auth Pattern — Recommendation

The codebase has TWO distinct admin auth helpers in active use:

| Helper | Source | Used by |
|--------|--------|---------|
| `requirePermission("manage_content")` | `src/lib/permissions.ts:29` | All `admin-tech-*.ts`, `admin-homepage.ts`, `admin-blog.ts`, `admin-services.ts` |
| Inline `requireAdmin()` (Better Auth role check) | Defined inline at `src/actions/admin-artist-applications.ts:16` | Only `admin-artist-applications.ts` |

**Recommendation for `admin-media-items.ts`: use `requirePermission("manage_content")`.** Rationale:
1. It's the dominant pattern (5 files vs 1).
2. Media attachments are content, not user-account actions.
3. It supports the granular role system (editors can attach videos without being owners).

The `requireAdmin` inline pattern from artist-applications was correct for that case because applications affect identity/auth, not content — different blast radius.

### Revalidation pattern

Every admin server action ends with explicit `revalidatePath(...)` calls covering both the admin edit page and the public surface(s). See `revalidateForType()` switch in the action skeleton above. Precedent: `publishReview` at `src/actions/admin-tech-reviews.ts:217-232`.

### Form return shape

Project convention is **throw on error**, **return `{ id }` on insert**, **return void on update/delete**. Verified in `upsertReview` (returns `{ id }`), `publishReview` (void), `deleteReview` (void). No `Result<T, E>` wrapper. Errors bubble to the client as `Error` and are caught with `try/catch` + `toast.error(...)` from `sonner`.

---

## Home Grid Mount Point — Surgical Replacement

Current home page is a server component at `src/app/(public)/page.tsx`. The carousel is mounted **twice** (defensive duplication):

- Line 97: `portfolio: () => <VideoPortfolioCarousel portfolioItems={portfolioList} />` inside the `sectionRenderers` map (rendered when `homepage_sections` table is populated)
- Line 143: `<VideoPortfolioCarousel portfolioItems={portfolioList} />` inside the static fallback (when `homepage_sections` is empty)

Both call sites pass `portfolioList`. Phase 27 swaps both to a new `<HomeFeaturedWorkGrid />` that fetches its own data:

```tsx
// In src/app/(public)/page.tsx
import { HomeFeaturedWorkGrid } from "@/components/media/home-featured-work-grid"

// Replace BOTH carousel mount points (line 97 and line 143).
// HomeFeaturedWorkGrid is a server component — no props needed; it queries
// media_item internally. Empty state returns null per D-12.
```

```tsx
// src/components/media/home-featured-work-grid.tsx
import { db } from "@/lib/db"
import { mediaItems } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import Link from "next/link"
import { MediaEmbed } from "./media-embed"
import { GlitchHeading } from "@/components/ui/glitch-heading"

export async function HomeFeaturedWorkGrid() {
  const items = await db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.attachedToType, "home_feature"))
    .orderBy(asc(mediaItems.sortOrder))
    .limit(3)                              // hard cap per D-17

  if (items.length === 0) return null      // D-12

  return (
    <section className="py-12 md:py-16 border-t border-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="mb-12 font-mono text-2xl font-bold uppercase tracking-tight text-[#f5f5f0]">
          <GlitchHeading text="Our Work">Our Work</GlitchHeading>
        </h2>
        <p className="mb-8 text-sm text-[#888]">Selected videos from the studio.</p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {items.map((item) => (
            <article key={item.id} className="bg-[#111] border border-[#222]">
              <MediaEmbed
                externalId={item.externalId}
                title={item.title ?? "Glitch Studios video"}
                thumbnailUrl={item.thumbnailUrl}
              />
              <div className="p-4">
                <h3 className="text-lg font-mono font-bold uppercase text-[#f5f5f0]">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-2 text-sm text-[#888] line-clamp-2">{item.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center md:mt-16">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 border border-[#222] px-6 py-3 font-mono text-sm uppercase tracking-wide text-[#f5f5f0] transition-colors hover:border-[#f5f5f0] hover:bg-[#f5f5f0] hover:text-[#0a0a0a]"
          >
            See all work →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

Server-component fetching at render time is acceptable here because the public homepage already runs four `db.select()` calls in parallel via `Promise.allSettled` (lines 30-54). Adding a fifth is consistent and Neon's serverless driver handles them concurrently.

---

## Home Features Modeling (Discretion item)

CONTEXT D-17 says admin pins existing `media_item`s as home features. Two ways to model it:

**Option A (recommended): "home_feature" is just another `attached_to_type`**

The admin "Pin to home" action **inserts a NEW `media_item` row** with `attached_to_type='home_feature'` and `attached_to_id` set to a fixed sentinel UUID (e.g., the all-zero UUID `00000000-0000-0000-0000-000000000000`, or a row in `site_settings` with the home_feature root ID). The original `media_item` (e.g., the one attached to a portfolio_item) stays in place. Pin and unpin are pure inserts/deletes against `media_item` rows where `attached_to_type='home_feature'`.

**Pros:** No new schema, no joins, dnd-kit reorder works identically to per-entity lists, hard-cap-at-3 is `LIMIT 3` in the query.

**Cons:** The same YouTube video can appear in two `media_item` rows (once as the canonical attach to e.g. a portfolio item, once as a home_feature). Title/description edits on the home-feature row don't propagate back. **This is acceptable per UI-SPEC** ("admin sees a preview card and can edit title/description before saving" — both rows are separately editable).

**Option B: Separate `home_features (media_item_id, sort_order)` join table**

Cleaner relationally, but introduces a 4th table for what is effectively "another attach point." The polymorphic table was specifically built so we don't need bespoke join tables.

**Decision: go with Option A.** It is consistent with the polymorphic philosophy and requires no schema changes beyond the base `media_item`.

---

## Common Pitfalls

### Pitfall 1: `maxresdefault.jpg` 404s for older / low-res videos
**What goes wrong:** YouTube only generates `maxresdefault.jpg` if the source upload is ≥720p. Older or lower-quality uploads return 404 — `next/image` shows the broken-image fallback.
**Why it happens:** YouTube CDN behavior, undocumented but consistent since 2015.
**How to avoid:** `<Image>` `onError` handler swaps to `hqdefault.jpg` (always exists for any public video). See `<MediaEmbed>` code above.
**Warning signs:** Black/empty thumbnails on legacy content; ChromeDevTools Network shows 404 for `i.ytimg.com/vi/{id}/maxresdefault.jpg`.

### Pitfall 2: `youtube-nocookie.com` thumbnail host is `i.ytimg.com`, not `img.youtube.com`
**What goes wrong:** `next.config.ts` whitelists `img.youtube.com` (which works) but YouTube serves the actual file from `i.ytimg.com`. Both work; sometimes YouTube redirects between them. If `next/image` ever follows the redirect, it will refuse the new host.
**How to avoid:** Add `i.ytimg.com` to `next.config.ts` `images.remotePatterns`. **Required** if `<MediaEmbed>` uses `i.ytimg.com` in the URL (it does, in the code above).
**Diff:**
```ts
// next.config.ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "img.youtube.com" },
    { protocol: "https", hostname: "i.ytimg.com" },        // ADD
    // ... existing entries
  ],
},
```

### Pitfall 3: oEmbed does NOT return duration
**What goes wrong:** Plan/code that assumes `oembed.duration_sec` exists silently writes `undefined` to the DB.
**How to avoid:** Make `duration_sec` nullable. Either skip it entirely in v1 OR allow admin to type it manually in the AddVideoDialog. Confirmed by inspecting the [YouTube oEmbed response shape](https://oembed.com/#section7.4) — fields returned are `title`, `author_name`, `author_url`, `type`, `height`, `width`, `version`, `provider_name`, `provider_url`, `thumbnail_height`, `thumbnail_width`, `thumbnail_url`, `html`. No duration.

### Pitfall 4: `loop=1` only works with `playlist={id}` for single-video iframes
**What goes wrong:** `?autoplay=1&mute=1&loop=1` on a single video plays once and stops. Admin reports "hover preview only plays for 5 seconds."
**How to avoid:** Always include `&playlist={externalId}` in the preview URL (same ID as the video). Documented in [YouTube IFrame Player Parameters: loop](https://developers.google.com/youtube/player_parameters#loop).

### Pitfall 5: `useToast` hook does NOT exist in this project
**What goes wrong:** Planner copies a typical shadcn-docs example that imports `useToast` from `@/hooks/use-toast`. That file does not exist; the project's only toast tool is `sonner` (`src/components/ui/sonner.tsx`).
**How to avoid:** Always `import { toast } from "sonner"` and call `toast.success("Video attached.")` / `toast.error("Couldn't save.")`. Pattern verified in `homepage-editor.tsx:84-87,103-104` etc.

### Pitfall 6: Two distinct admin auth patterns — pick one consciously
**What goes wrong:** A new file using `requirePermission("manage_content")` at the top, but the rest of the file calls `auth.api.getSession({...})` directly midway. Inconsistent enforcement.
**How to avoid:** Use `requirePermission("manage_content")` at the top of every exported action. Don't duplicate the inline `requireAdmin` pattern from `admin-artist-applications.ts` — that file is the outlier.

### Pitfall 7: Read-time fallback during the deprecation window
**What goes wrong:** After the migration, the public surface still has both `media_item` rows AND `portfolio_items.video_url` populated. If query helpers don't prefer `media_item`, the old `<VideoCard>` keeps reading from `videoUrl` and ignores any new admin-attached videos.
**How to avoid:** Explicit precedence rule in the public render path:
```ts
// Pseudocode
const primary = mediaForEntity[0]
const fallback = portfolioItem.videoUrl ? extractYouTubeId(portfolioItem.videoUrl) : null
const externalId = primary?.externalId ?? fallback
```
Document this in code comments referencing CONTEXT D-07.

### Pitfall 8: Hover preview iframe leaks YouTube tracking despite `youtube-nocookie.com`
**What goes wrong:** Even nocookie-domain iframes load JavaScript and ping back stats once they autoplay. UI-SPEC says "zero YouTube JS until interaction" (D-01) — but D-02 hover preview violates that for desktop users.
**How to avoid:** This is **intentional** per D-02 — hover preview is acknowledged interaction. Document the trade-off in `<MediaEmbed>` code comments. Don't preload the iframe; only mount it after `mouseenter`. Don't render it under `pointer: coarse` or reduced motion (the code above respects this).

### Pitfall 9: Hard cap at 3 home_features must be enforced at write AND read
**What goes wrong:** Admin pins 5 videos to home; query returns 5; UI breaks layout.
**How to avoid:** Both `LIMIT 3` in `<HomeFeaturedWorkGrid>` AND warning copy in admin (UI-SPEC: "Only the top 3 by sort order appear on the home page"). Don't enforce at insert time — admin should be allowed to over-pin and then reorder, per the copy.

---

## Common Pitfalls — Schema Edge Cases

### Pitfall 10: `created_by` references `user.id` (text), not uuid
The `user` table primary key is `text` (Better Auth convention), so `media_item.created_by` must also be `text`. Verified at schema.ts line 19 (`id: text("id").primaryKey()`). The schema definition above already gets this right; flag it because TS auto-complete might suggest `uuid`.

### Pitfall 11: `attachedToId` is `uuid`, but `beats.id`, `portfolio_items.id`, `tech_reviews.id`, `services.id` are all `uuid` ✓
Confirmed by reading schema.ts: every entity that will receive media attachments uses `uuid("id").defaultRandom()`. No mismatch.

---

## Code Examples

### oEmbed response shape (verified from official docs)

```json
// Source: https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json
{
  "title": "Rick Astley - Never Gonna Give You Up (Official Video)",
  "author_name": "Rick Astley",
  "author_url": "https://www.youtube.com/@RickAstleyYT",
  "type": "video",
  "height": 113,
  "width": 200,
  "version": "1.0",
  "provider_name": "YouTube",
  "provider_url": "https://www.youtube.com/",
  "thumbnail_height": 360,
  "thumbnail_width": 480,
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "html": "<iframe ...></iframe>"
}
```

Note: `thumbnail_url` from oEmbed is `hqdefault` (480×360). For higher-quality thumbnails on the home grid, swap to `maxresdefault` by string replacement on the URL — same path structure.

### dnd-kit reorder pattern (reference: `homepage-editor.tsx:65-110`)

The canonical project pattern. Reuse verbatim. Drop into `<MediaItemAttachmentList>`:

```tsx
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
)
// ... DndContext + SortableContext with verticalListSortingStrategy
```

The keyboard sensor automatically wires arrow keys to move the focused item — D-17 accessibility requirement is satisfied for free.

---

## State of the Art

| Old Approach (pre-Phase 27) | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-table `videoUrl` text columns | Polymorphic `media_item` table | Phase 27 | Any entity can have many videos; admin UX standardized |
| `<iframe src="https://www.youtube.com/embed/...">` direct embed | `<MediaEmbed>` with `youtube-nocookie.com` + click-to-play + hover-preview | Phase 27 | Privacy + LCP improvements; consistent UX |
| `extractYouTubeId` regex inlined inside `<VideoCard>` | Single shared util at `src/lib/tech/youtube.ts` (already exists) | Phase 27 (refactor) | DRY; removes the duplicated regex at `video-card.tsx:9-14` and `video-portfolio-carousel.tsx:23-28` |
| Empty-state placeholder card on home "Our Work" | Section returns `null` if no `home_feature` rows | Phase 27 | D-12 — page reflows naturally |

**Deprecated/outdated this phase:**
- `src/components/home/video-portfolio-carousel.tsx` — DELETE after replacement lands (still imported in `app/(public)/page.tsx:10`)
- `portfolio_items.video_url` column — kept for one release per D-07; cleanup phase later
- `tech_reviews.video_url` column — kept for one release per D-07; cleanup phase later
- Inline `extractYouTubeId` regexes in `video-card.tsx` and `video-portfolio-carousel.tsx`

---

## Test Surfaces

The project's test infrastructure:
- **Playwright** 1.58.2 (`@playwright/test`) — E2E browser tests; 50+ specs in `tests/`
- **Vitest** 4.1.5 — unit tests; `vitest.config.ts` exists at project root

Phase 27 is mostly UI/integration. Recommended test surfaces (the planner can scope):

| What | Test Type | Tool | Notes |
|------|-----------|------|-------|
| `extractYouTubeId` already covers parsing | unit | Vitest | already covered; verify no regression |
| `fetchYouTubeOEmbed` happy path + timeout | unit | Vitest | mock `fetch` |
| `attachMediaItem` server action | unit | Vitest | mock `db` + `extractYouTubeId` |
| `<MediaEmbed>` thumbnail → preview swap on `mouseenter` | E2E | Playwright | use `page.emulateMedia({ reducedMotion: 'no-preference' })` and dispatch `mouseenter` |
| `<MediaEmbed>` no swap under `prefers-reduced-motion: reduce` | E2E | Playwright | `page.emulateMedia({ reducedMotion: 'reduce' })` + grep DOM for absence of `<iframe>` |
| `<MediaEmbed>` mobile tap-only | E2E | Playwright | use `browser.newContext({ hasTouch: true, isMobile: true })` per the precedent in `tests/07.2-*.spec.ts` (mobile context) |
| Home `<HomeFeaturedWorkGrid>` returns null when empty | E2E or RSC test | Playwright | seed empty `media_item` for `home_feature`, expect no section in DOM |
| `<AddVideoDialog>` with non-YouTube URL surfaces error copy | E2E | Playwright | type `https://example.com/bad`, expect "That URL doesn't look like..." |
| Detach AlertDialog confirms before delete | E2E | Playwright | click trash icon → expect "Remove this video?" modal |

Existing precedent for mobile emulation is `tests/07.2-mobile-*` (per STATE.md: "Mobile audit uses browser.newContext() with isMobile/hasTouch for true mobile emulation"). Reuse that fixture pattern.

**Nyquist validation note:** `.planning/config.json` has `workflow.nyquist_validation: false`. **Validation Architecture section is intentionally omitted from this RESEARCH.md per init guidance.**

---

## CSP / Permissions-Policy / Image Hosts — Audit

**`next.config.ts`:**
- ✅ `img.youtube.com` already whitelisted
- ❌ `i.ytimg.com` NOT whitelisted — recommend adding
- No `headers()` block — no CSP, no Permissions-Policy
- No `frame-src` / `connect-src` policy

**`src/middleware.ts`:**
- No security headers added; only routing/auth gates
- Runs path-based rewrites for `glitchtech.io` and the apparel domain

**Conclusion:** No CSP changes needed. YouTube iframes from `youtube-nocookie.com` will not be blocked. Just add `i.ytimg.com` to `images.remotePatterns`.

---

## Environment Availability

This phase is purely code/config. No new external services, no new daemons. The only "external" dependency is reaching `https://www.youtube.com/oembed` from the Next.js server — which is the standard outbound HTTPS that the app already does for Resend, Stripe, and Better Auth OAuth callbacks. No infra change.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node 24 + pnpm | Build | ✅ | per CLAUDE.md | — |
| Neon Postgres | Schema migration + runtime queries | ✅ (existing) | — | — |
| Outbound HTTPS to youtube.com | oEmbed fetch on attach | ✅ (assumed; same path as Stripe/Resend) | — | UI degrades to "Couldn't load video info..." copy + admin types title manually |
| `pnpm dlx shadcn@latest add alert-dialog` | adds the missing primitive | ✅ shadcn 4.4.0 latest verified via `pnpm view shadcn version` | 4.4.0 | — |

**No blocking missing dependencies.** No fallback gymnastics needed.

---

## Open Questions

1. **Where does the AddVideoDialog mount in each entity edit form?** — UI-SPEC describes the dialog but each of the four entity edit pages (`/admin/beats/[id]/edit`, `/admin/portfolio/[id]/edit`, `/admin/services/[id]/edit`, `/admin/tech/reviews/[id]/edit`) has different layout. Recommendation: planner reads each page once and adds a "Videos" section block with `<MediaItemAttachmentList attachedToType={...} attachedToId={...} />` in a consistent slot (probably below the main form, above the "Save" CTA). Not a research blocker — five small file edits.

2. **Is the `home_feature` admin surface `/admin/homepage` (existing) or a new path?** — UI-SPEC §Component Inventory says "exact path lives in planner's scope." `src/components/admin/homepage-editor.tsx` already exists and edits homepage sections; recommend adding a "Featured Videos" tab/section there rather than a new top-level path. Keeps the admin nav simple. Decision is a planner/UX call.

3. **Does the existing `tech_reviews.video_url` need to surface as a `media_item` AT migration time or only when admin re-edits?** — D-07 says backfill at migration. Recommendation honored in the migration SQL above. Edge case: if the migration runs but the public render component isn't yet swapped to `<MediaEmbed>`, the old `<ReviewVideoEmbed>` keeps reading `tech_reviews.video_url` and shows the same video. Both rows coexist; no conflict. Confirmed safe.

4. **What does `<VideoCard>` (portfolio grid) do post-refactor?** — UI-SPEC says inner thumbnail becomes `<MediaEmbed previewOnHover={false}>`. But `<VideoCard>` is wrapped in a `<Link href="/portfolio/[slug]">` so the click navigates rather than plays. With a `<button>` inside a `<Link>`, the inner click handler steals the navigation event. Recommendation: pass a third prop `<MediaEmbed mode="thumbnailOnly">` that renders ONLY the static thumbnail (no `<button>`, no click-to-play). The card-wide `<Link>` handles navigation. The planner should note this so executor doesn't naively drop in `<MediaEmbed>` and break navigation.

---

## Sources

### Primary (HIGH confidence)
- `src/db/schema.ts` — full read; line numbers verified (147 portfolio_items.video_url, 821 tech_reviews.video_url)
- `src/db/migrations/0006_phase26_auth.sql` — full read; idempotent migration pattern reference
- `scripts/run-phase26-migration.ts` — full read; runner pattern reference
- `src/components/admin/homepage-editor.tsx` — full read; dnd-kit precedent (lines 65-110)
- `src/components/tech/review-video-embed.tsx` — full read; current iframe markup
- `src/components/portfolio/video-card.tsx` — full read; inline regex confirmed
- `src/components/home/video-portfolio-carousel.tsx` — full read; mount points confirmed
- `src/app/(public)/page.tsx` — full read; mount points at lines 97, 143
- `src/lib/tech/youtube.ts` — full read; `extractYouTubeId` signature verified
- `src/lib/permissions.ts` — full read; `requirePermission` pattern
- `src/actions/admin-tech-reviews.ts` — full read; server action shape + `revalidatePath` pattern
- `src/actions/admin-artist-applications.ts` — partial read; alternate inline auth pattern noted
- `src/actions/admin-homepage.ts` — full read; admin homepage action precedent
- `next.config.ts` — full read; image remote patterns confirmed
- `src/middleware.ts` — partial read; no CSP confirmed
- `package.json` — full read; all versions verified
- `components.json` — full read; shadcn registry config
- `src/hooks/use-mobile.ts` — full read; matchMedia pattern
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` — partial read; pivots #2 and #9 confirmed
- [YouTube oEmbed (RFC + spec)](https://oembed.com/#section7.4) — response shape, no duration field
- [YouTube IFrame Player Parameters](https://developers.google.com/youtube/player_parameters) — `loop=1 + playlist={id}`, `mute`, `controls`, `modestbranding`, `playsinline`
- [YouTube embed privacy mode](https://support.google.com/youtube/answer/171780) — `youtube-nocookie.com` behavior

### Secondary (MEDIUM confidence)
- npm registry probes via `pnpm view`: `lucide-react@1.11.0`, `@radix-ui/react-alert-dialog@1.1.15`, `@dnd-kit/sortable@10.0.0`, `shadcn@4.4.0` — all live as of 2026-04-25
- Existing project memory `feedback_glitch_headers.md` — site-wide hover-glitch heading rule

### Tertiary (LOW confidence)
- Live row counts for `portfolio_items.video_url` and `tech_reviews.video_url` — production DB read denied. Inferred from seed file (`src/db/seed.ts` shows 4 portfolio_items with placeholder URL) and STATE.md context (1 published tech review). Migration's WHERE-not-null guards make exact count irrelevant — backfill is idempotent regardless.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every dep verified in `package.json`
- Architecture / schema: HIGH — Drizzle patterns directly mirror existing project conventions; polymorphic decision argued from precedent
- Hooks (`useFinePointer`, `useReducedMotion`): HIGH — patterns verified against existing `useIsMobile`
- oEmbed shape: HIGH — confirmed from official spec
- Migration approach: HIGH — Phase 26 precedent is one file at `0006_phase26_auth.sql`
- Production row counts for video_url: LOW — could not query prod DB. Mitigated: idempotent migration handles any count.
- CSP / image hosts: HIGH — full file reads of `next.config.ts` and `middleware.ts`
- Pitfalls: HIGH for documented YouTube quirks (loop, maxresdefault), MEDIUM for project-specific (toast pattern, auth helper)

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (stable stack; YouTube embed API is multi-year stable)
