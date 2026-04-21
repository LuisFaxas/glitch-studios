---
phase: 14-global-polish
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/artists/artist-card.tsx
  - src/components/artists/artist-profile.tsx
  - src/lib/parse-social-links.ts
autonomous: true
requirements: [POLISH-01]
must_haves:
  truths:
    - "Artist card social links show recognizable brand icons (Instagram camera, YouTube play button, SoundCloud waveform, X logo) — not generic AtSign, Globe, or Music Lucide icons"
    - "Artist profile page social links show the same brand icons in the same w-5 h-5 size"
    - "The local SocialIcon function that mapped Lucide icons is deleted from both files — no dead code remains"
    - "parse-social-links.ts has its TODO comment removed (POLISH-01 done)"
    - "pnpm tsc --noEmit passes with no new errors"
  artifacts:
    - path: "src/components/artists/artist-card.tsx"
      provides: "ArtistCard with brand icon row using InstagramIcon/YouTubeIcon/SoundCloudIcon/XIcon"
      contains: "SocialBrandIcon"
    - path: "src/components/artists/artist-profile.tsx"
      provides: "ArtistProfile with brand icon row using same brand SVGs"
      contains: "SocialBrandIcon"
    - path: "src/lib/parse-social-links.ts"
      provides: "parseSocialLinks utility (logic unchanged, TODO comment removed)"
  key_links:
    - from: "src/components/artists/artist-card.tsx"
      to: "src/components/icons/social-icons.tsx"
      via: "Named imports of InstagramIcon, YouTubeIcon, SoundCloudIcon, XIcon"
      pattern: "from \"@/components/icons/social-icons\""
    - from: "src/components/artists/artist-profile.tsx"
      to: "src/components/icons/social-icons.tsx"
      via: "Named imports of InstagramIcon, YouTubeIcon, SoundCloudIcon, XIcon"
      pattern: "from \"@/components/icons/social-icons\""
---

<objective>
Retire the two local `SocialIcon` Lucide-based functions in `artist-card.tsx` and `artist-profile.tsx` and replace them with a `SocialBrandIcon` helper that imports from the already-existing `src/components/icons/social-icons.tsx`. Remove the TODO comments from both artist files and from `parse-social-links.ts`.

Purpose: POLISH-01 — social media links across the site must use actual platform brand icons. The footer, sidebar widget, and mobile overlay already use the shared brand SVGs. The two artist component files are the last holdouts with generic Lucide icons.

Output:
- Updated `src/components/artists/artist-card.tsx` — local `SocialIcon` function replaced with `SocialBrandIcon` using brand SVGs; TODO comment removed
- Updated `src/components/artists/artist-profile.tsx` — same replacement; TODO comment removed
- Updated `src/lib/parse-social-links.ts` — TODO comment at top removed; no logic changes
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@src/components/icons/social-icons.tsx
@src/components/artists/artist-card.tsx
@src/components/artists/artist-profile.tsx
@src/lib/parse-social-links.ts

<interfaces>
<!-- Key types and contracts the executor needs. -->

From src/components/icons/social-icons.tsx — all four brand icon exports:
```typescript
import type { SVGProps } from "react"
type IconProps = SVGProps<SVGSVGElement>

export function InstagramIcon(props: IconProps): JSX.Element
export function YouTubeIcon(props: IconProps): JSX.Element
export function SoundCloudIcon(props: IconProps): JSX.Element
export function XIcon(props: IconProps): JSX.Element
```
All four accept `className` as part of SVGProps. Pass `className="w-4 h-4"` for card, `className="w-5 h-5"` for profile.

From src/lib/parse-social-links.ts — platform key shape:
```typescript
export type SocialLink = { platform: string; url: string }
export function parseSocialLinks(json: string | null): SocialLink[]
```
Platform keys returned: "instagram", "youtube", "soundcloud", "twitter", "x" (any lowercase string).
The twitter/x duality must be preserved: both "twitter" and "x" map to XIcon.

From src/components/artists/artist-card.tsx — current local function to DELETE:
```typescript
function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  if (p.includes("instagram")) return <AtSign className="w-4 h-4" />
  if (p.includes("twitter") || p.includes("x")) return <AtSign className="w-4 h-4" />
  if (p.includes("youtube")) return <Globe className="w-4 h-4" />
  if (p.includes("soundcloud") || p.includes("music")) return <Music className="w-4 h-4" />
  return <ExternalLink className="w-4 h-4" />
}
```

From src/components/artists/artist-profile.tsx — current local function to DELETE:
```typescript
function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  if (p.includes("instagram")) return <AtSign className="w-5 h-5" />
  if (p.includes("twitter") || p.includes("x")) return <AtSign className="w-5 h-5" />
  if (p.includes("youtube")) return <Globe className="w-5 h-5" />
  if (p.includes("soundcloud") || p.includes("music")) return <Music className="w-5 h-5" />
  return <ExternalLink className="w-5 h-5" />
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace SocialIcon with SocialBrandIcon in artist-card.tsx</name>
  <files>src/components/artists/artist-card.tsx</files>
  <read_first>
    - src/components/artists/artist-card.tsx (current file — understand the full structure before editing)
    - src/components/icons/social-icons.tsx (confirm InstagramIcon/YouTubeIcon/SoundCloudIcon/XIcon export names)
  </read_first>
  <action>
    Make the following changes to `src/components/artists/artist-card.tsx`:

    1. **Remove the TODO comment** on line 1: delete the entire line `// TODO(Phase 14): replace Lucide social icons with brand SVGs (POLISH-01)`.

    2. **Replace the Lucide icon imports**: remove `AtSign, Globe, Music, ExternalLink` from the lucide-react import. Keep `Link` from `next/link` and `Image` from `next/image` (these are NOT lucide). If the lucide-react import line becomes empty after removing those 4, delete the entire import statement.

    3. **Add brand icon imports** after the existing imports:
    ```typescript
    import {
      InstagramIcon,
      YouTubeIcon,
      SoundCloudIcon,
      XIcon,
    } from "@/components/icons/social-icons"
    import { ExternalLink } from "lucide-react"
    ```
    Note: Keep `ExternalLink` from lucide-react as the fallback for unknown platforms.

    4. **Delete the entire local `SocialIcon` function** (lines 18-25 in current file).

    5. **Add a `SocialBrandIcon` helper** in its place (before `ArtistCard`):
    ```typescript
    function SocialBrandIcon({ platform, className }: { platform: string; className?: string }) {
      const p = platform.toLowerCase()
      if (p.includes("instagram")) return <InstagramIcon className={className} />
      if (p.includes("youtube")) return <YouTubeIcon className={className} />
      if (p.includes("soundcloud")) return <SoundCloudIcon className={className} />
      if (p.includes("twitter") || p.includes("x")) return <XIcon className={className} />
      return <ExternalLink className={className} />
    }
    ```
    Note: "twitter" and "x" both map to XIcon (Pitfall 3 from research — legacy stored links use "twitter" key).

    6. **Update the call site** in the social links map from:
    ```tsx
    <SocialIcon platform={link.platform} />
    ```
    to:
    ```tsx
    <SocialBrandIcon platform={link.platform} className="w-4 h-4" />
    ```

    Do NOT change anything else in the file — the card layout, hover effects, Image component, Link, role badge, bio, specialty chips are all correct and must remain untouched.
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && grep -q 'from "@/components/icons/social-icons"' src/components/artists/artist-card.tsx && grep -q 'InstagramIcon' src/components/artists/artist-card.tsx && grep -q 'YouTubeIcon' src/components/artists/artist-card.tsx && grep -q 'SoundCloudIcon' src/components/artists/artist-card.tsx && grep -q 'XIcon' src/components/artists/artist-card.tsx && grep -q 'SocialBrandIcon' src/components/artists/artist-card.tsx && ! grep -q 'AtSign' src/components/artists/artist-card.tsx && ! grep -q 'Globe' src/components/artists/artist-card.tsx && ! grep -q 'Music' src/components/artists/artist-card.tsx && ! grep -q 'TODO(Phase 14)' src/components/artists/artist-card.tsx && grep -q 'p.includes("twitter") || p.includes("x")' src/components/artists/artist-card.tsx && pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File imports `InstagramIcon, YouTubeIcon, SoundCloudIcon, XIcon` from `@/components/icons/social-icons`
    - File has a `SocialBrandIcon` function that accepts `{ platform: string; className?: string }`
    - `SocialBrandIcon` maps "instagram" → InstagramIcon, "youtube" → YouTubeIcon, "soundcloud" → SoundCloudIcon, "twitter"/"x" → XIcon, fallback → ExternalLink
    - No `AtSign` import or usage (grep must find zero matches)
    - No `Globe` import or usage (grep must find zero matches)
    - No `Music` import or usage from lucide-react (grep must find zero matches for the icon — `Music` is a different concern)
    - No `// TODO(Phase 14)` comment
    - Call site uses `<SocialBrandIcon platform={link.platform} className="w-4 h-4" />`
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>ArtistCard renders Instagram/YouTube/SoundCloud/X brand SVG icons in the social link row instead of generic Lucide placeholders.</done>
</task>

<task type="auto">
  <name>Task 2: Replace SocialIcon with SocialBrandIcon in artist-profile.tsx and clean parse-social-links.ts</name>
  <files>src/components/artists/artist-profile.tsx, src/lib/parse-social-links.ts</files>
  <read_first>
    - src/components/artists/artist-profile.tsx (current file — understand full structure before editing)
    - src/lib/parse-social-links.ts (confirm current TODO comment text to remove)
  </read_first>
  <action>
    **File 1: `src/components/artists/artist-profile.tsx`**

    1. **Replace the Lucide icon imports**: In the current import `import { ArrowLeft, Globe, AtSign, ExternalLink, Music } from "lucide-react"`, remove `Globe, AtSign, Music`. Keep `ArrowLeft` and `ExternalLink` from lucide-react (ArrowLeft is used on the back link; ExternalLink is the fallback for unknown social platforms).
       New lucide import: `import { ArrowLeft, ExternalLink } from "lucide-react"`

    2. **Add brand icon imports** after the `import Link from "next/link"` line:
    ```typescript
    import {
      InstagramIcon,
      YouTubeIcon,
      SoundCloudIcon,
      XIcon,
    } from "@/components/icons/social-icons"
    ```

    3. **Delete the entire local `SocialIcon` function** (lines 33-42 in current file).

    4. **Add a `SocialBrandIcon` helper** in its place (before `ArtistProfile`):
    ```typescript
    function SocialBrandIcon({ platform, className }: { platform: string; className?: string }) {
      const p = platform.toLowerCase()
      if (p.includes("instagram")) return <InstagramIcon className={className} />
      if (p.includes("youtube")) return <YouTubeIcon className={className} />
      if (p.includes("soundcloud")) return <SoundCloudIcon className={className} />
      if (p.includes("twitter") || p.includes("x")) return <XIcon className={className} />
      return <ExternalLink className={className} />
    }
    ```

    5. **Update the call site** in the social links map from:
    ```tsx
    <SocialIcon platform={link.platform} />
    ```
    to:
    ```tsx
    <SocialBrandIcon platform={link.platform} className="w-5 h-5" />
    ```
    Note: profile uses `w-5 h-5` (larger than card's `w-4 h-4`).

    6. The `Music` icon is also used inside the "Featured Track" block (line ~109):
    ```tsx
    <Music className="w-5 h-5 text-[#888888]" />
    ```
    This is a decorative music note icon for the featured track section — it is NOT a social link icon. Remove the `Music` import from lucide-react (since it was imported as part of the social icon set), but to keep this feature working, replace that decorative `<Music />` usage with a simple text label or another Lucide icon that is already imported. The easiest swap: use `<span className="font-mono text-[#888888]">♪</span>` as the decorative note — this removes the need for the Music import entirely and maintains the visual intent.

    Do NOT change anything else in the file — back link, photo section, credits table, bio, role text must remain untouched.

    ---

    **File 2: `src/lib/parse-social-links.ts`**

    Remove the TODO comment on line 1: delete the entire line `// TODO(Phase 14): replace Lucide icon map with brand SVGs (POLISH-01)`.

    The rest of the file is correct — do not touch `parseSocialLinks` logic.
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && grep -q 'from "@/components/icons/social-icons"' src/components/artists/artist-profile.tsx && grep -q 'InstagramIcon' src/components/artists/artist-profile.tsx && grep -q 'YouTubeIcon' src/components/artists/artist-profile.tsx && grep -q 'SoundCloudIcon' src/components/artists/artist-profile.tsx && grep -q 'XIcon' src/components/artists/artist-profile.tsx && grep -q 'SocialBrandIcon' src/components/artists/artist-profile.tsx && ! grep -q 'AtSign' src/components/artists/artist-profile.tsx && ! grep -q 'Globe' src/components/artists/artist-profile.tsx && grep -q 'className="w-5 h-5"' src/components/artists/artist-profile.tsx && ! grep -q 'TODO(Phase 14)' src/lib/parse-social-links.ts && ! grep -q 'TODO(Phase 14)' src/components/artists/artist-profile.tsx && pnpm tsc --noEmit && pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - `artist-profile.tsx` imports `InstagramIcon, YouTubeIcon, SoundCloudIcon, XIcon` from `@/components/icons/social-icons`
    - `artist-profile.tsx` has a `SocialBrandIcon` function with the same twitter/x dual mapping as Task 1
    - `artist-profile.tsx` call site uses `<SocialBrandIcon platform={link.platform} className="w-5 h-5" />` (profile size)
    - No `AtSign` or `Globe` usage in `artist-profile.tsx` (grep must find zero matches)
    - `ArrowLeft` import is still present in `artist-profile.tsx` (back link preserved)
    - No `// TODO(Phase 14)` in `parse-social-links.ts` (grep must find zero matches)
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0 (or warnings-only)
  </acceptance_criteria>
  <done>ArtistProfile renders brand SVG icons in the social link row. parse-social-links.ts TODO comment removed. All Lucide generic icon placeholders for social links are gone from both artist components.</done>
</task>

</tasks>

<verification>
Run phase-wide checks after both tasks complete:
```
cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit && pnpm lint
```
Spot-check: grep for any remaining Lucide social icon imports in artist components:
```
grep -n "AtSign\|Globe" src/components/artists/artist-card.tsx src/components/artists/artist-profile.tsx
```
Should return empty (zero matches). Grep for brand icons to confirm they're present:
```
grep -n "InstagramIcon\|YouTubeIcon\|SoundCloudIcon\|XIcon" src/components/artists/artist-card.tsx src/components/artists/artist-profile.tsx
```
Should show imports + usage in both files.
</verification>

<success_criteria>
- POLISH-01 delivered: artist card + artist profile social links use real platform brand SVGs
- No new TypeScript errors introduced (`pnpm tsc --noEmit` exits 0)
- The four brand icons (Instagram camera, YouTube play button, SoundCloud waveform, X logo) render wherever an artist has social links configured
- parse-social-links.ts TODO comment gone — no Phase 14 debt markers remain
- Footer, sidebar widget, mobile overlay are unchanged (they already used brand icons)
</success_criteria>

<output>
After completion, create `.planning/phases/14-global-polish/14-01-SUMMARY.md` documenting:
- Confirmation that both artist files now import from `@/components/icons/social-icons`
- Whether the `Music` icon in artist-profile.tsx featured track section was replaced and with what
- Any TypeScript errors encountered and how they were resolved
- Status of TODO comments removed
</output>
