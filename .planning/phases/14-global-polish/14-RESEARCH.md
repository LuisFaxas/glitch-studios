# Phase 14: Global Polish - Research

**Researched:** 2026-04-20
**Domain:** Site-wide brand icons, footer newsletter, persistent player widget
**Confidence:** HIGH

---

## Summary

Phase 14 has three discrete, low-risk polish tasks that each touch a distinct layer: (1) social icons in `ArtistCard` + `ArtistProfile` (the footer, sidebar, and mobile overlay are ALREADY using real brand SVGs from `src/components/icons/social-icons.tsx`), (2) the footer newsletter signup which is mechanically complete but visually undersized and contextually unlabeled, and (3) the player bar which is structurally solid but has a non-functional "License Beat" CTA that is not wired to the current beat slug. The investigation found that the brand icon infrastructure already exists — the task for POLISH-01 is narrower than expected: retire the two duplicated `SocialIcon` Lucide functions in `artist-card.tsx` and `artist-profile.tsx` and replace them with imports from the shared `social-icons.tsx`.

**Primary recommendation:** 3 plans. Plan 01 retires the Lucide `SocialIcon` duplicates in artist components, wiring them to the existing shared icon set. Plan 02 polishes the footer newsletter (label, sizing, mobile stacking). Plan 03 wires the "License Beat" CTA and adds any remaining player refinements. Playwright verification is folded into Plan 03 as a final gate rather than a standalone plan.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| POLISH-01 | Social media icons use actual platform brand icons, not generic Lucide icons | `src/components/icons/social-icons.tsx` already exists with Instagram, YouTube, SoundCloud, X SVGs. Footer + sidebar + mobile overlay already use it. Only `artist-card.tsx` + `artist-profile.tsx` remain on Lucide. One file edit each. |
| POLISH-02 | Footer signup is properly sized and positioned, not buried or undersized | `footer.tsx` renders `<NewsletterForm />` in a cramped right column with no label. Input has `flex-1` in a constrained parent — shows tiny on mobile. Needs a label ("Stay in the loop"), min-width on input, and mobile-first stacking. |
| POLISH-03 | Audio player widget is visually refined and clearly functional | Player bar controls are correct. The "License Beat" button (line 182 of `player-bar.tsx`) is a non-functional stub — `onClick` absent, not wired to `currentBeat.id`. Cover art uses raw `<img>` (not `next/image`). Mobile row height is hardcoded `36px` inline. These are the "bolted on" signals. |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Package manager:** pnpm only
- **Stack locked:** Next.js 16 App Router, Tailwind v4, monochrome palette only (`#000000 #0a0a0a #111111 #222222 #f5f5f0 #888888 #555555 #444444`)
- **No parallel builds:** Use `pnpm tsc --noEmit` + `pnpm lint`, never `next build` on CodeBox
- **Mobile-first:** All changes must verify at 375px
- **No GlitchHeading on blog/portfolio/artists headings:** Site-wide rule
- **Hover-glitch on headers only:** No auto-running animations on headings
- **Playwright verification:** Use Playwright during dev to verify visual output

---

## Inventory of Social Icon Usages

| File | Current Icon | Platform | Status |
|------|-------------|----------|--------|
| `src/components/artists/artist-card.tsx` | Lucide `AtSign` | Instagram, Twitter/X | **NEEDS FIX** |
| `src/components/artists/artist-card.tsx` | Lucide `Globe` | YouTube | **NEEDS FIX** |
| `src/components/artists/artist-card.tsx` | Lucide `Music` | SoundCloud | **NEEDS FIX** |
| `src/components/artists/artist-card.tsx` | Lucide `ExternalLink` | fallback | **NEEDS FIX** |
| `src/components/artists/artist-profile.tsx` | Lucide `AtSign` | Instagram, Twitter/X | **NEEDS FIX** |
| `src/components/artists/artist-profile.tsx` | Lucide `Globe` | YouTube | **NEEDS FIX** |
| `src/components/artists/artist-profile.tsx` | Lucide `Music` | SoundCloud | **NEEDS FIX** |
| `src/components/artists/artist-profile.tsx` | Lucide `ExternalLink` | fallback | **NEEDS FIX** |
| `src/components/layout/footer.tsx` | `InstagramIcon`, `YouTubeIcon`, `SoundCloudIcon`, `XIcon` from `@/components/icons/social-icons` | all 4 | Already correct |
| `src/components/tiles/widget-social.tsx` | `InstagramIcon`, `YouTubeIcon`, `SoundCloudIcon`, `XIcon` from `@/components/icons/social-icons` | all 4 | Already correct |
| `src/components/layout/mobile-nav-overlay.tsx` | `InstagramIcon`, `YouTubeIcon`, `SoundCloudIcon`, `XIcon` from `@/components/icons/social-icons` | all 4 | Already correct |
| `src/components/tiles/widget-social-tech.tsx` | Text-only "Soon" placeholder | all 4 | Tech is placeholder — out of scope for Phase 14 |

**Key finding:** POLISH-01 scope is limited to two artist component files. The shared icon infrastructure is complete. The task is: replace the local `SocialIcon` Lucide function in each file with direct imports from the shared `@/components/icons/social-icons` module, and update `parse-social-links.ts` to retire the TODO comment.

---

## Brand Icon Library Recommendation

**Verdict: No new library needed. Use the existing hand-rolled `src/components/icons/social-icons.tsx`.**

The file already contains production-quality inline SVGs for Instagram, YouTube, SoundCloud, and X (Twitter). All four match the `fill="currentColor"` + `viewBox="0 0 24 24"` convention and accept standard `SVGProps<SVGSVGElement>`.

**Why NOT to add `react-icons/si` or `simple-icons`:**
- `react-icons/si` imports `@iconify/json` as a dep, adds ~50kb to the bundle for 2000+ icons when you need 4.
- `simple-icons` npm is ~1.5MB of JSON — entirely unnecessary.
- The existing file is 36 lines, zero deps, tree-shakable, typed.

**If a 5th platform is needed later** (e.g., TikTok, Spotify): copy the SVG path from `simpleicons.org`, add a named export to `social-icons.tsx`. No library install needed.

**Installation:** None required.

---

## Footer + Newsletter Current State

**File:** `src/components/layout/footer.tsx`
**Newsletter form file:** `src/components/forms/newsletter-form.tsx`

**Current layout (as-coded):**

The footer is a single condensed row with two flex children:
- Left: `[Logo] [tagline] [nav links] | [social icons]`
- Right: `[NewsletterForm] [copyright]`

On desktop, the right side shrinks to `flex-shrink-0` and the newsletter form is `flex gap-2` with `flex-1` input + "Join" button. The button label is just "Join" — no context that this is a newsletter.

**What's wrong (POLISH-02):**

1. **No label.** The input placeholder says "Enter your email" but there's no heading like "Stay in the loop" or "Get new beats & updates". Visitors don't know what they're signing up for.
2. **Input width on mobile.** On mobile the footer collapses to `flex-col`, and the newsletter form is the full width — but `<NewsletterForm />` uses `flex gap-2` internally with `flex-1` on the input, which means the input competes with the "Join" button in an unconstrained parent. On a 375px screen the input renders narrower than it should because the parent flex column isn't stretching to the container width.
3. **"Join" button copy is generic.** For a music studio the button should say something like "Subscribe" or "Get Updates".
4. **Copyright is inline with the form.** On mobile, `© 2026 Glitch Studios` appears right after the button — cramped.

**Concrete changes needed:**

- Add a `<p>` or `<span>` label above the form: `"Stay in the loop"` in `font-mono text-[11px] uppercase tracking-wide text-[#888888]`
- Give `NewsletterForm` a `className` prop (or `size` variant) so it can take `w-full` in the footer
- Move copyright to its own row in the footer (bottom border row), removing it from the newsletter inline grouping
- On mobile the newsletter block should be `w-full` with `mt-4`
- Button copy: change "Join" to "Subscribe"

**No structural overhaul needed.** The footer is intentionally minimal (single condensed row). The fix is additive: a label + layout adjustment. Don't redesign the footer — the cyberpunk minimal condensed row is correct for the aesthetic.

---

## Player Widget Current State

**File:** `src/components/player/player-bar.tsx`

**What currently works:**
- Framer Motion slide-in/out animations (correct)
- `Waveform` canvas with interactive scrubbing on desktop + mobile (correct)
- `ElasticSlider` volume control (correct)
- `formatTime()` display for `currentTime / duration` (correct)
- Minimize/restore bar pattern (correct)
- CSS variable `--player-bar-height` published for layout compensation (correct)
- Stacks above tab bar on mobile via `bottom-[calc(var(--tab-bar-height,0px)+...)]` (correct)

**What reads as "bolted on" (POLISH-03):**

1. **"License Beat" button is a non-functional stub.** Line 182: `<button type="button" className="...">License Beat</button>` — no `onClick`, no href, no link to current beat. Clicking does nothing. This is the single biggest "unfinished" signal.
2. **Cover art uses raw `<img>` tag** (lines 113, 204), not `next/image`. The project standard established in Phase 11/12 is `next/image` with `fill` + `sizes`. The cover art in the player bar is `h-12 w-12` (desktop) and `h-10 w-10` (mobile) — not a large image, so the visual difference is small, but it's inconsistent.
3. **Mobile row height is inline style `style={{ height: "36px" }}`** (line 202). This should be a Tailwind class (`h-9`). Minor but a signal of rushed implementation.
4. **No "now playing" label.** On desktop, the track title and artist are shown but there's no "NOW PLAYING" micro-label above them to orient first-time visitors who may not realize the bar is a persistent player. A `text-[10px] font-mono uppercase text-[#555555]` label above the title would make it read as intentional.

**Concrete changes for Plan 03:**

- Wire "License Beat" button: `<Link href={/beats/${currentBeat.id}}` or add `slug` to `PlayerBeat` type and use `href={/beats/${currentBeat.slug}}`
- Swap `<img>` for `<Image>` from `next/image` with `width={48} height={48}` (desktop) and `width={40} height={40}` (mobile)
- Replace `style={{ height: "36px" }}` with `className="h-9"`
- Add `NOW PLAYING` micro-label above track title on desktop
- Verify mobile layout at 375px after changes

**No structural changes to waveform, ElasticSlider, or minimize/restore pattern.** Those are working correctly.

---

## Pitfalls

### Pitfall 1: SoundCloud icon intrinsic SVG aspect ratio
**What goes wrong:** The `SoundCloudIcon` SVG has a wide aspect ratio (the waveform cloud shape). When forced into `w-4 h-4` with `fill` it renders correctly, but without `viewBox` preservation it clips. The existing `social-icons.tsx` already includes `viewBox="0 0 24 24"` which solves this. In `artist-card.tsx` and `artist-profile.tsx`, pass explicit `className="w-4 h-4"` (card) and `className="w-5 h-5"` (profile) — the existing SoundCloud size exception in footer/sidebar (`size-5` vs `size-3.5`) documents the asymmetry, but for artist icons all sizes can be uniform since they're in a row at the same weight.
**How to avoid:** Import the named export directly and pass `className="w-4 h-4"` consistently. The footer uses `social.label === "SoundCloud" ? "size-5" : "size-3.5"` — artist card does NOT need this exception since context is different (icon row, not standalone social tiles).

### Pitfall 2: `SocialIcon` function is defined in BOTH artist-card.tsx and artist-profile.tsx — delete both
**What goes wrong:** If you add the import from `social-icons.tsx` but don't delete the local `function SocialIcon()`, TypeScript will still use the local one (it shadows the import). The old Lucide icons won't go away.
**How to avoid:** Delete the entire local `function SocialIcon({ platform })` block in each file. Replace call sites with a new `<SocialBrandIcon platform={link.platform} className="w-4 h-4" />` helper or inline switch.

### Pitfall 3: X (Twitter) has no icon for "twitter" platform key
**What goes wrong:** `parseSocialLinks()` returns `platform: "twitter"` for legacy stored links. `XIcon` is used in the footer for `label: "X"`. If the artist record has `{ twitter: "url" }` in their stored JSON, the platform key returned is `"twitter"`, not `"x"`. The switch in `artist-card.tsx` handles this: `p.includes("twitter") || p.includes("x")`. This logic must be preserved in the new `SocialBrandIcon` helper.
**How to avoid:** The platform-to-icon mapping must match both `"twitter"` and `"x"` to `XIcon`. Document this in the helper function.

### Pitfall 4: `PlayerBeat` type does not have `slug` — License Beat CTA needs it
**What goes wrong:** `PlayerBeat` in `audio-player-provider.tsx` has `id: string` but no `slug`. `<Link href={/beats/${currentBeat.id}}>` would navigate to a non-existent route if beats routes are slug-based (check `/beats/[slug]` vs `/beats/[id]`).
**How to avoid:** Before implementing, check whether the beats detail route is `/beats/[id]` or `/beats/[slug]`. If slug-based, add `slug: string` to `PlayerBeat` and update all `play(beat)` call sites (beat card, list row) to pass slug. If id-based, use `currentBeat.id` directly. Do not hardcode — verify the route param name first.

### Pitfall 5: Footer changes affect every public page — screenshot regression risk
**What goes wrong:** The footer renders on every `(public)` layout page. A CSS change that pushes the newsletter block to a new line can shift the footer height, which affects page layout on every page (specifically: pages where the footer is close to the tab bar on mobile).
**How to avoid:** Run Playwright screenshots on at least homepage + blog + artists after footer change. The footer height change on mobile is the regression vector.

### Pitfall 6: Player bar mobile height — `style={{ height: "36px" }}` removal
**What goes wrong:** The inline `style={{ height: "36px" }}` targets the first mobile row of the player bar. Replacing it with `className="h-9"` (`9 * 4 = 36px`) is safe, but if `h-9` is not recognized by Tailwind v4 (e.g., a custom height utility was needed), the row collapses to `0px`.
**How to avoid:** `h-9` is a standard Tailwind v4 utility (2.25rem = 36px). Safe replacement.

### Pitfall 7: Don't add GlitchHeading to any text in the player bar
**Site-wide rule from MEMORY.md:** Every header uses hover-only RGB-split glitch — no auto-running animations on headings. The "NOW PLAYING" micro-label must be a plain `<span>`, never a `<GlitchHeading>`.

---

## Code Examples

### SocialBrandIcon helper (replaces both local SocialIcon functions)
```typescript
// Insert at top of artist-card.tsx and artist-profile.tsx (or extract to src/lib/social-brand-icon.tsx)
import {
  InstagramIcon,
  YouTubeIcon,
  SoundCloudIcon,
  XIcon,
} from "@/components/icons/social-icons"

function SocialBrandIcon({ platform, className }: { platform: string; className?: string }) {
  const p = platform.toLowerCase()
  if (p.includes("instagram")) return <InstagramIcon className={className} />
  if (p.includes("youtube")) return <YouTubeIcon className={className} />
  if (p.includes("soundcloud")) return <SoundCloudIcon className={className} />
  if (p.includes("twitter") || p.includes("x")) return <XIcon className={className} />
  // Fallback: generic external link icon (keep Lucide ExternalLink for unknowns only)
  return <ExternalLink className={className} />
}
```

### Footer newsletter label + layout (POLISH-02 patch)
```tsx
{/* Right: Newsletter + copyright */}
<div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
  <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#888888]">
    Stay in the loop
  </p>
  <div className="flex gap-2 w-full md:w-[280px]">
    <input
      name="email"
      type="email"
      placeholder="Enter your email"
      className="flex-1 min-w-0 h-8 bg-[#111111] border border-[#333333] rounded-none px-3 text-xs text-[#f5f5f0] font-sans placeholder:text-[#555555] focus:border-[#f5f5f0] focus:outline-none transition-colors"
    />
    <button
      type="submit"
      className="shrink-0 bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] rounded-none px-4 h-8 font-mono font-bold text-[10px] uppercase tracking-[0.05em] hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors whitespace-nowrap"
    >
      Subscribe
    </button>
  </div>
</div>
```
Note: The actual implementation should keep `NewsletterForm` as the form component — pass it a `compact` prop or `className` rather than rewriting the form inline. The label lives in `Footer`, not in `NewsletterForm`.

### License Beat CTA wiring (POLISH-03 patch)
```tsx
// In player-bar.tsx — check beat route param first (id vs slug)
// If beats route is /beats/[id]:
<Link
  href={`/beats/${currentBeat.id}`}
  className="flex-shrink-0 px-4 py-2 bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase tracking-[0.05em] hover:bg-white transition-colors rounded-none"
>
  License Beat
</Link>

// If beats route is /beats/[slug] — add slug to PlayerBeat interface:
// export interface PlayerBeat { id: string; slug: string; ... }
```

---

## Recommended Plan Breakdown

3 plans. Lean. Each plan is a single focused concern that fits in one context window.

| # | Plan ID | Objective | Wave | Key Files |
|---|---------|-----------|------|-----------|
| 1 | 14-01-brand-social-icons | Retire Lucide `SocialIcon` in `artist-card.tsx` + `artist-profile.tsx`. Replace with shared `SocialBrandIcon` helper using existing `src/components/icons/social-icons.tsx`. Remove TODO from `parse-social-links.ts`. | Wave 1 | `artist-card.tsx`, `artist-profile.tsx`, `parse-social-links.ts` |
| 2 | 14-02-footer-newsletter-polish | Add "Stay in the loop" label above newsletter input in footer; give input a `min-w-0 w-full md:w-[280px]` constraint; move copyright to its own bottom row; rename button copy from "Join" to "Subscribe"; verify mobile 375px stacking | Wave 1 | `footer.tsx`, `newsletter-form.tsx` |
| 3 | 14-03-player-widget-polish | Wire "License Beat" CTA to `currentBeat` route; swap `<img>` for `<Image>` in player cover art (desktop + mobile); replace `style={{ height: "36px" }}` with `h-9`; add "NOW PLAYING" micro-label; Playwright screenshots at desktop + mobile on `/beats` + homepage + artists to catch regressions | Wave 2 | `player-bar.tsx`, `audio-player-provider.tsx` (if slug needed) |

**Wave structure:**
- Wave 1: Plans 01 and 02 are independent (different files, different concerns) — can run in parallel
- Wave 2: Plan 03 runs after 01 + 02 so Playwright verification covers all three concerns in one pass

**No Plan 04.** Playwright verification is the final task inside Plan 03, not a standalone plan. The three plans above are each small (3-6 file touches). If the beat route needs `slug` added to `PlayerBeat`, Plan 03 may touch 4-6 additional beat card files — that is still within one context window.

---

## Out-of-scope / Defer

| Item | Reason | Defer to |
|------|--------|----------|
| `WidgetSocialTech` ("Soon" placeholder) | Glitch Tech social accounts don't exist yet — the placeholder is intentional | Phase 999.1 or when accounts are created |
| Adding TikTok / Spotify / Bandcamp to `social-icons.tsx` | No requirement, no accounts in codebase URLs | Admin enhancement backlog |
| Contact page social icons (CONTACT-03) | Phase 13 scope — Phase 14 assumes Phase 13 will add social links to contact page using the same `social-icons.tsx` shared component | Phase 13 |
| Player bar "next/previous" track controls | No requirement, no `queue` in `AudioPlayerProvider`. Adding a queue is a non-trivial data model change. | Future enhancement backlog |
| Animated waveform color pulse on `isPlaying` | Would be visually nice but conflicts with MEMORY.md rule against auto-running animations; no POLISH requirement drives it | Design discretion sprint |
| Footer redesign / multi-column footer | The condensed single-row footer is intentional per cyberpunk metro aesthetic. POLISH-02 is sizing/labeling only — not a structural redesign | Never unless user requests |
| Connecting "License Beat" to actual license modal | The CTA wiring (Plan 03) navigates to the beats detail page; the full license modal is Beat Store territory, already built in v1 | Already exists at `/beats/[id]` |

---

## Environment Availability

Step 2.6: SKIPPED — this phase is code-only. No new tools, services, or runtimes required. All dependencies (Next.js, Tailwind, Framer Motion, Lucide, `next/image`) are already installed and operational.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/components/icons/social-icons.tsx` — confirmed brand SVGs already exist for Instagram, YouTube, SoundCloud, X
- Direct code inspection: `src/components/artists/artist-card.tsx` — confirmed Lucide `AtSign`/`Globe`/`Music` usage with `// TODO(Phase 14)` comment
- Direct code inspection: `src/components/artists/artist-profile.tsx` — confirmed same Lucide usage
- Direct code inspection: `src/components/layout/footer.tsx` — confirmed already uses brand icons, newsletter form in constrained right column
- Direct code inspection: `src/components/forms/newsletter-form.tsx` — confirmed button copy "Join", no label, form structure
- Direct code inspection: `src/components/player/player-bar.tsx` — confirmed non-functional "License Beat" stub (line 182), raw `<img>` tags (lines 113, 204), inline `style={{ height: "36px" }}`
- Direct code inspection: `src/components/player/audio-player-provider.tsx` — confirmed `PlayerBeat` type has `id` but no `slug`
- Direct code inspection: `src/lib/parse-social-links.ts` — confirmed `// TODO(Phase 14)` comment at top
- Direct code inspection: `src/components/tiles/widget-social.tsx` — confirmed already uses shared brand icons
- Direct code inspection: `src/components/layout/mobile-nav-overlay.tsx` — confirmed already uses shared brand icons

### Secondary (MEDIUM confidence)
- REQUIREMENTS.md — POLISH-01/02/03 requirement text
- ROADMAP.md Phase 14 success criteria — interpreted "looks intentional rather than bolted on" as targeting the non-functional CTA + raw img tags

---

## Metadata

**Confidence breakdown:**
- POLISH-01 scope (icon audit): HIGH — every social icon usage found via grep, confirmed by file inspection
- POLISH-02 footer state: HIGH — footer.tsx read in full, current layout described verbatim from code
- POLISH-03 player state: HIGH — player-bar.tsx read in full, specific line numbers cited for each defect
- Brand icon library decision: HIGH — existing file confirmed sufficient, no new install needed

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable stack — 30 days)
