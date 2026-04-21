---
phase: 14-global-polish
plan: 03
type: execute
wave: 2
depends_on: [14-01, 14-02]
files_modified:
  - src/components/player/player-bar.tsx
  - src/components/player/audio-player-provider.tsx
  - tests/e2e/14-global-polish.spec.ts
autonomous: false
requirements: [POLISH-03]
must_haves:
  truths:
    - "The 'License Beat' button in the player bar is a clickable Next.js Link that navigates to /beats when pressed"
    - "Cover art in the player bar uses next/image <Image> component (not a raw <img> tag) on both desktop and mobile layouts"
    - "The mobile player bar first row no longer uses inline style={{ height: '36px' }} — it uses Tailwind class h-9 instead"
    - "A 'NOW PLAYING' micro-label in font-mono uppercase text-[#555555] appears above the track title on desktop"
    - "Playwright screenshots confirm no regressions on homepage, /blog, /portfolio, and /artists at desktop (1280px) and mobile (375px)"
    - "pnpm tsc --noEmit + pnpm lint pass with no new errors"
  artifacts:
    - path: "src/components/player/player-bar.tsx"
      provides: "PlayerBar with Link-wired License Beat CTA, next/image cover art, h-9 mobile row, NOW PLAYING label"
      contains: "NOW PLAYING"
    - path: "src/components/player/audio-player-provider.tsx"
      provides: "PlayerBeat type with slug field added"
      contains: "slug: string"
    - path: "tests/e2e/14-global-polish.spec.ts"
      provides: "Playwright spec covering 4 pages at desktop + mobile viewports with player bar interaction"
      exports: ["test"]
  key_links:
    - from: "src/components/player/player-bar.tsx"
      to: "next/link"
      via: "License Beat button replaced with <Link href='/beats'>"
      pattern: "href=\"/beats\""
    - from: "src/components/player/player-bar.tsx"
      to: "next/image"
      via: "Cover art <img> tags replaced with <Image> with explicit width/height"
      pattern: "import Image from \"next/image\""
---

<objective>
Deliver the final player bar polish items and verify all Phase 14 changes across the site with Playwright screenshots. The player bar has four specific "bolted on" signals to fix: a non-functional "License Beat" stub, raw `<img>` cover art tags, an inline height style, and missing "NOW PLAYING" orientation label.

Purpose: POLISH-03 — the audio player widget must look intentional, not bolted on. The License Beat CTA is the single biggest "unfinished" signal (it does nothing on click). This plan also closes Phase 14 with Playwright verification covering all changes from Plans 01 and 02 (social icons on /artists, footer newsletter, player bar).

Output:
- Updated `src/components/player/player-bar.tsx` — License Beat wired as a Next.js Link to /beats; cover art upgraded to next/image; inline style replaced with h-9; NOW PLAYING label added
- Updated `src/components/player/audio-player-provider.tsx` — PlayerBeat type gets `slug: string` field (used by License Beat Link; preserves id field for audio identity checks)
- New `tests/e2e/14-global-polish.spec.ts` — Playwright spec for site-wide regression check at desktop + mobile
- Human visual checkpoint to approve the player bar and verify no regressions

Note on beats route: Investigation confirmed there is no `/beats/[id]` or `/beats/[slug]` detail route — the beats catalog lives at the flat `/beats` route. The License Beat Link navigates to `/beats` (the catalog page where licensing happens), not a non-existent detail page.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/14-global-polish/14-RESEARCH.md

@src/components/player/player-bar.tsx
@src/components/player/audio-player-provider.tsx

<interfaces>
<!-- Key types and contracts the executor needs. -->

Current PlayerBeat interface (from audio-player-provider.tsx):
```typescript
export interface PlayerBeat {
  id: string
  title: string
  artist: string
  previewAudioUrl: string
  coverArtUrl: string | null
  waveformPeaks: number[] | null
}
```
After this plan, it becomes:
```typescript
export interface PlayerBeat {
  id: string
  slug: string         // NEW — used by License Beat Link href
  title: string
  artist: string
  previewAudioUrl: string
  coverArtUrl: string | null
  waveformPeaks: number[] | null
}
```
Adding `slug` is a breaking change: all call sites that call `play(beat)` must include `slug`. These call sites must be found and updated (see Task 1 action).

Current player-bar.tsx cover art pattern (two locations to change):
```tsx
// Desktop (line ~113):
<img
  src={currentBeat.coverArtUrl}
  alt={`${currentBeat.title} cover`}
  className="h-12 w-12 rounded-none object-cover flex-shrink-0"
/>

// Mobile (line ~204):
<img
  src={currentBeat.coverArtUrl}
  alt={`${currentBeat.title} cover`}
  className="h-10 w-10 rounded-none object-cover flex-shrink-0"
/>
```

Current "License Beat" stub (line ~181):
```tsx
<button
  type="button"
  className="flex-shrink-0 px-4 py-2 bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase tracking-[0.05em] hover:bg-white transition-colors rounded-none"
>
  License Beat
</button>
```

Current mobile row height (line ~202):
```tsx
<div className="flex items-center px-3 gap-3" style={{ height: "36px" }}>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add slug to PlayerBeat and update all play() call sites</name>
  <files>src/components/player/audio-player-provider.tsx</files>
  <read_first>
    - src/components/player/audio-player-provider.tsx (full file — understand PlayerBeat interface and play() signature)
    - Run this grep to find all play(beat) call sites that must be updated:
      `grep -rn "play(" src/components/beats/ src/components/player/ --include="*.tsx" | grep -v "audio\|Audio\|isPlaying\|\.play\b\|pause\|setIsPlaying"`
  </read_first>
  <action>
    **Step 1: Add `slug` to `PlayerBeat` interface** in `src/components/player/audio-player-provider.tsx`:

    Find the `export interface PlayerBeat` block and add `slug: string` after `id: string`:
    ```typescript
    export interface PlayerBeat {
      id: string
      slug: string         // NEW — used by License Beat Link to navigate to /beats
      title: string
      artist: string
      previewAudioUrl: string
      coverArtUrl: string | null
      waveformPeaks: number[] | null
    }
    ```

    **Step 2: Find all call sites that construct a `PlayerBeat` object and pass it to `play()`**.

    Run the grep command shown in `read_first` to locate them. Common locations based on the codebase structure:
    - `src/components/beats/beat-card.tsx` — likely has `play({ id: beat.id, title: beat.title, ... })`
    - `src/components/beats/beat-catalog.tsx` — may proxy the play call
    - Beats hero carousel or list row components

    For EACH call site found, add `slug: beat.slug` (or the appropriate field from the beat object) to the PlayerBeat object being passed to `play()`. Example:
    ```typescript
    // Before:
    play({ id: beat.id, title: beat.title, artist: ..., previewAudioUrl: ..., coverArtUrl: ..., waveformPeaks: ... })

    // After:
    play({ id: beat.id, slug: beat.slug, title: beat.title, artist: ..., previewAudioUrl: ..., coverArtUrl: ..., waveformPeaks: ... })
    ```

    If a call site uses a spread like `play(beat)` where `beat` is already typed as `BeatSummary`, and `BeatSummary` has `slug: string` (confirmed it does), then no change is needed at that call site since TypeScript structural typing will pass the slug through.

    If a call site constructs the PlayerBeat object manually from individual fields and does NOT include `slug`, add it. Pull `slug` from the source beat's `slug` field (all beat data types have slug — confirmed in `BeatSummary`).

    **Step 3: Run `pnpm tsc --noEmit`** to confirm all call sites are updated. Fix any remaining TypeScript errors about missing `slug` property.
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && grep -q 'slug: string' src/components/player/audio-player-provider.tsx && pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `PlayerBeat` interface in `audio-player-provider.tsx` has `slug: string` field (grep confirms `slug: string`)
    - `pnpm tsc --noEmit` exits 0 — no "Property 'slug' is missing" TypeScript errors anywhere in the project
    - The `play()` function signature is unchanged (still accepts `PlayerBeat`) — only the interface definition changed
    - `id`-based identity check in the `play()` implementation (`currentBeat?.id === beat.id`) is unchanged
  </acceptance_criteria>
  <done>PlayerBeat has slug field and all call sites have been updated to pass slug. TypeScript confirms no missing property errors.</done>
</task>

<task type="auto">
  <name>Task 2: Polish player-bar.tsx — wire License Beat Link, swap img to Image, h-9, NOW PLAYING label</name>
  <files>src/components/player/player-bar.tsx</files>
  <read_first>
    - src/components/player/player-bar.tsx (full current file — understand the full layout before editing)
    - src/components/player/audio-player-provider.tsx (Task 1 output — confirm slug is now on PlayerBeat)
  </read_first>
  <action>
    Make the following six targeted changes to `src/components/player/player-bar.tsx`:

    **Change 1: Add next/image import and Link import**

    Add to the top of the file (after the existing imports):
    ```typescript
    import Image from "next/image"
    import Link from "next/link"
    ```

    **Change 2: Replace the "License Beat" `<button>` stub with a `<Link>`**

    Find the non-functional button (search for `License Beat` in the file):
    ```tsx
    <button
      type="button"
      className="flex-shrink-0 px-4 py-2 bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase tracking-[0.05em] hover:bg-white transition-colors rounded-none"
    >
      License Beat
    </button>
    ```

    Replace with:
    ```tsx
    <Link
      href="/beats"
      className="flex-shrink-0 px-4 py-2 bg-[#f5f5f0] text-[#000000] font-mono text-[13px] font-bold uppercase tracking-[0.05em] hover:bg-white transition-colors rounded-none"
    >
      License Beat
    </Link>
    ```
    Note: Links to `/beats` (flat catalog page) — there is no `/beats/[id]` or `/beats/[slug]` detail route in this codebase.

    **Change 3: Replace desktop `<img>` with `<Image>`**

    Find the desktop cover art block (search for `h-12 w-12`):
    ```tsx
    {currentBeat.coverArtUrl ? (
      <img
        src={currentBeat.coverArtUrl}
        alt={`${currentBeat.title} cover`}
        className="h-12 w-12 rounded-none object-cover flex-shrink-0"
      />
    ) : (
      <div className="h-12 w-12 rounded-none bg-[#222222] flex-shrink-0" />
    )}
    ```

    Replace the `<img>` with:
    ```tsx
    {currentBeat.coverArtUrl ? (
      <Image
        src={currentBeat.coverArtUrl}
        alt={`${currentBeat.title} cover`}
        width={48}
        height={48}
        className="rounded-none object-cover flex-shrink-0"
        unoptimized
      />
    ) : (
      <div className="h-12 w-12 rounded-none bg-[#222222] flex-shrink-0" />
    )}
    ```
    Note: Use `unoptimized` because cover art URLs may be external (Uploadthing, S3) and next/image's optimization requires domain config. `unoptimized` bypasses the optimizer and renders the image without needing next.config domain allowlist changes.

    **Change 4: Replace mobile `<img>` with `<Image>`**

    Find the mobile cover art block (search for `h-10 w-10` within the mobile layout section):
    ```tsx
    {currentBeat.coverArtUrl ? (
      <img
        src={currentBeat.coverArtUrl}
        alt={`${currentBeat.title} cover`}
        className="h-10 w-10 rounded-none object-cover flex-shrink-0"
      />
    ) : (
      <div className="h-10 w-10 rounded-none bg-[#222222] flex-shrink-0" />
    )}
    ```

    Replace the `<img>` with:
    ```tsx
    {currentBeat.coverArtUrl ? (
      <Image
        src={currentBeat.coverArtUrl}
        alt={`${currentBeat.title} cover`}
        width={40}
        height={40}
        className="rounded-none object-cover flex-shrink-0"
        unoptimized
      />
    ) : (
      <div className="h-10 w-10 rounded-none bg-[#222222] flex-shrink-0" />
    )}
    ```

    **Change 5: Remove inline style and replace with Tailwind class**

    Find the mobile row div:
    ```tsx
    <div className="flex items-center px-3 gap-3" style={{ height: "36px" }}>
    ```

    Replace with:
    ```tsx
    <div className="flex items-center px-3 gap-3 h-9">
    ```
    Note: `h-9` = `2.25rem` = `36px` in Tailwind v4 — exact same rendered size, no visual change.

    **Change 6: Add "NOW PLAYING" micro-label above track title on desktop**

    Find the desktop track info div (search for `flex flex-col min-w-0 flex-shrink-0 max-w-[160px]`):
    ```tsx
    <div className="flex flex-col min-w-0 flex-shrink-0 max-w-[160px]">
      <span className="font-mono text-[15px] font-bold text-[#f5f5f0] truncate">
        {currentBeat.title}
      </span>
      <span className="font-sans text-[11px] font-normal text-[#888888] truncate">
        {currentBeat.artist}
      </span>
    </div>
    ```

    Replace with:
    ```tsx
    <div className="flex flex-col min-w-0 flex-shrink-0 max-w-[160px]">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mb-0.5">
        NOW PLAYING
      </span>
      <span className="font-mono text-[15px] font-bold text-[#f5f5f0] truncate">
        {currentBeat.title}
      </span>
      <span className="font-sans text-[11px] font-normal text-[#888888] truncate">
        {currentBeat.artist}
      </span>
    </div>
    ```
    Note: "NOW PLAYING" is a plain `<span>`, never a `<GlitchHeading>` (site-wide rule: no auto-running animations on headings).

    Do NOT change the Waveform, ElasticSlider, minimize/restore logic, time display, or play/pause buttons.
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && grep -q 'NOW PLAYING' src/components/player/player-bar.tsx && grep -q 'href="/beats"' src/components/player/player-bar.tsx && grep -q 'import Image from "next/image"' src/components/player/player-bar.tsx && grep -q 'import Link from "next/link"' src/components/player/player-bar.tsx && ! grep -q '<img' src/components/player/player-bar.tsx && ! grep -q 'style={{ height: "36px" }}' src/components/player/player-bar.tsx && grep -q 'h-9' src/components/player/player-bar.tsx && grep -q 'unoptimized' src/components/player/player-bar.tsx && pnpm tsc --noEmit && pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - `player-bar.tsx` imports `Image` from `"next/image"` (grep confirms)
    - `player-bar.tsx` imports `Link` from `"next/link"` (grep confirms)
    - `player-bar.tsx` contains `href="/beats"` on the License Beat Link (grep confirms)
    - `player-bar.tsx` contains literal string `"NOW PLAYING"` as a `<span>` (grep confirms; must NOT be a GlitchHeading)
    - No raw `<img` tags remain in `player-bar.tsx` (grep for `<img` must find zero matches)
    - No `style={{ height: "36px" }}` in `player-bar.tsx` (grep must find zero matches)
    - `h-9` class present on the mobile row div (grep confirms)
    - Both Image uses have `unoptimized` prop (grep confirms)
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0 (or warnings-only)
  </acceptance_criteria>
  <done>Player bar renders NOW PLAYING label, cover art via next/image, License Beat as a functional Link to /beats, and mobile row height via h-9 Tailwind class.</done>
</task>

<task type="auto">
  <name>Task 3: Write Playwright spec for site-wide regression verification</name>
  <files>tests/e2e/14-global-polish.spec.ts</files>
  <read_first>
    - tests/e2e/ directory listing (confirm directory exists; check existing spec file patterns from Phase 11/12 for test structure reference)
    - playwright.config.ts (confirm baseURL, screenshot dir, viewport defaults)
    - .planning/phases/11-portfolio/11-07-playwright-verification-PLAN.md (reference spec structure for this project)
  </read_first>
  <action>
    Create `tests/e2e/14-global-polish.spec.ts` with the following content.

    The spec covers four pages at two viewports (desktop 1280x800, mobile 375x812):
    - `/` (homepage) — verify footer is visible with "Stay in the loop" label
    - `/blog` — verify footer renders, no regression from brand icon changes
    - `/portfolio` — verify footer renders, no regression
    - `/artists` — verify artist cards render social icon links (the replaced brand icons)

    Additionally: test player bar appearance by navigating to `/beats`, playing a beat if seed data exists, and verifying the player bar slides up with "NOW PLAYING" label and "License Beat" link.

    ```typescript
    import { test, expect } from "@playwright/test"
    import fs from "fs"
    import path from "path"

    const SCREENSHOTS_DIR = path.join(
      process.cwd(),
      ".planning/phases/14-global-polish/screenshots"
    )

    const DESKTOP = { width: 1280, height: 800 }
    const MOBILE = { width: 375, height: 812 }

    const PAGES = [
      { name: "homepage", path: "/" },
      { name: "blog", path: "/blog" },
      { name: "portfolio", path: "/portfolio" },
      { name: "artists", path: "/artists" },
    ]

    test.describe("Phase 14: Global Polish — site-wide regression", () => {
      test.beforeAll(() => {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
      })

      for (const viewport of [
        { label: "desktop", ...DESKTOP },
        { label: "mobile", ...MOBILE },
      ]) {
        test.describe(`${viewport.label} (${viewport.width}x${viewport.height})`, () => {
          for (const page of PAGES) {
            test(`${page.name} renders without layout errors`, async ({ page: pw }) => {
              await pw.setViewportSize({ width: viewport.width, height: viewport.height })
              await pw.goto(page.path)
              await pw.waitForLoadState("networkidle")

              // Screenshot for human review
              await pw.screenshot({
                path: path.join(SCREENSHOTS_DIR, `${viewport.label}-${page.name}.png`),
                fullPage: true,
              })

              // Footer is visible
              const footer = pw.locator("footer")
              await expect(footer).toBeVisible()

              // "Stay in the loop" label is in the footer
              await expect(pw.locator("text=Stay in the loop")).toBeVisible()

              // "Subscribe" button (not "Join") exists in the footer
              const subscribeBtn = pw.locator('footer button[type="submit"]')
              await expect(subscribeBtn).toBeVisible()
              await expect(subscribeBtn).toHaveText(/subscribe/i)
            })
          }

          test("artists page has social icon links in artist cards", async ({ page: pw }) => {
            await pw.setViewportSize({ width: viewport.width, height: viewport.height })
            await pw.goto("/artists")
            await pw.waitForLoadState("networkidle")

            await pw.screenshot({
              path: path.join(SCREENSHOTS_DIR, `${viewport.label}-artists-social-icons.png`),
              fullPage: false,
            })

            // Artist cards should render (if any team members exist in seed data)
            const cards = pw.locator("article")
            const cardCount = await cards.count()
            // If no cards exist (empty DB), the page should still render without errors
            if (cardCount > 0) {
              await expect(cards.first()).toBeVisible()
            }
          })
        })
      }

      test("player bar: License Beat link points to /beats", async ({ page: pw }) => {
        await pw.setViewportSize(DESKTOP)
        await pw.goto("/beats")
        await pw.waitForLoadState("networkidle")

        // Try to play the first beat by clicking its play button
        const playButton = pw.locator('[aria-label*="Play"]').first()
        const playButtonExists = await playButton.isVisible().catch(() => false)

        if (playButtonExists) {
          await playButton.click()
          // Wait for player bar to animate in
          await pw.waitForTimeout(500)

          // Player bar should be visible
          const playerBar = pw.locator('[class*="fixed"][class*="z-40"]').last()
          const playerVisible = await playerBar.isVisible().catch(() => false)

          if (playerVisible) {
            // NOW PLAYING label should be visible
            await expect(pw.locator("text=NOW PLAYING")).toBeVisible()

            // License Beat link must be an <a> element (not a button) pointing to /beats
            const licenseBeatLink = pw.locator('a:has-text("License Beat")')
            await expect(licenseBeatLink).toBeVisible()
            const href = await licenseBeatLink.getAttribute("href")
            expect(href).toContain("/beats")

            await pw.screenshot({
              path: path.join(SCREENSHOTS_DIR, "desktop-player-bar-active.png"),
              fullPage: false,
            })
          }
        } else {
          // No beats in DB — take a screenshot of the empty beats page
          await pw.screenshot({
            path: path.join(SCREENSHOTS_DIR, "desktop-beats-empty.png"),
            fullPage: false,
          })
          test.info().annotations.push({
            type: "note",
            description: "No beats found in DB — player bar test skipped",
          })
        }
      })
    })
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && test -f tests/e2e/14-global-polish.spec.ts && grep -q 'Stay in the loop' tests/e2e/14-global-polish.spec.ts && grep -q 'subscribe' tests/e2e/14-global-polish.spec.ts && grep -q 'NOW PLAYING' tests/e2e/14-global-polish.spec.ts && grep -q 'License Beat' tests/e2e/14-global-polish.spec.ts && grep -q '/beats' tests/e2e/14-global-polish.spec.ts && pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `tests/e2e/14-global-polish.spec.ts`
    - Tests cover all 4 pages (`/`, `/blog`, `/portfolio`, `/artists`) at both desktop and mobile viewports
    - Tests assert that footer has "Stay in the loop" label visible
    - Tests assert that the Subscribe button exists in the footer (not "Join")
    - Tests assert that the License Beat link has href containing "/beats" when player is active
    - Tests assert that "NOW PLAYING" text is visible when player is active
    - Screenshots are saved to `.planning/phases/14-global-polish/screenshots/`
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Playwright spec written covering 4 pages at 2 viewports, footer newsletter assertions, and player bar Link + NOW PLAYING verification.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: Human visual verification of Phase 14 changes</name>
  <files>(human-only — no files written by this task; reviewer inspects screenshots under .planning/phases/14-global-polish/screenshots/)</files>
  <action>
    Present the following to the user for visual approval. This is a PAUSE task — agent halts until the user responds.

    WHAT WAS BUILT:
    All three Phase 14 polish concerns are implemented:
    1. POLISH-01 — Artist card and artist profile social links now use real brand SVGs (Instagram, YouTube, SoundCloud, X) from src/components/icons/social-icons.tsx. No more generic Lucide AtSign/Globe/Music icons.
    2. POLISH-02 — Footer newsletter has a "STAY IN THE LOOP" label, the button reads "Subscribe", the input is full-width on mobile, and the copyright is in its own bottom row.
    3. POLISH-03 — Player bar has a "NOW PLAYING" label above the track title (desktop), cover art uses next/image, mobile row uses h-9 instead of inline style, and the License Beat CTA is a functional Link to /beats.

    Run the Playwright spec to generate screenshots:
    ```
    cd /home/faxas/workspaces/projects/personal/glitch_studios
    pnpm exec playwright test tests/e2e/14-global-polish.spec.ts --reporter=list
    ```

    HOW TO VERIFY:
    1. Open screenshots under .planning/phases/14-global-polish/screenshots/:
       - desktop-homepage.png — confirm: footer visible with "Stay in the loop" label above input, "Subscribe" button visible, copyright in separate row below
       - mobile-homepage.png — confirm: footer newsletter input is full-width (not cramped), label visible, copyright below
       - desktop-artists.png — confirm: artist cards visible; social icon row shows brand icons (Instagram/YouTube/SoundCloud/X), not generic symbols
       - mobile-artists.png — same check at 375px
       - desktop-player-bar-active.png (if beats exist in DB) — confirm: "NOW PLAYING" micro-label above track title, "License Beat" renders as a link not a dead button

    2. Visit http://glitch-studios.codebox.local/artists — click an artist card, confirm brand icons in profile social row.

    3. Visit http://glitch-studios.codebox.local/beats — play a beat, confirm:
       - "NOW PLAYING" label appears above track title on desktop
       - "License Beat" button navigates to /beats when clicked (not a no-op)
       - Cover art renders correctly (no broken image icons)

    4. Scroll to footer on any page — confirm "Stay in the loop" label is above the input, button reads "SUBSCRIBE", copyright is in its own bottom section.
  </action>
  <verify>
    <automated>echo "checkpoint:human-verify — no automated verification; human reviewer approves via resume-signal"</automated>
  </verify>
  <acceptance_criteria>
    - User has opened the screenshots referenced in action and confirmed each matches the expected output
    - User has visited /artists in a browser and confirmed brand icons are visible in artist card social rows
    - User has visited /beats, played a beat, and confirmed NOW PLAYING label + functional License Beat link
    - User has scrolled to the footer and confirmed the newsletter label + Subscribe button + copyright layout
    - User types "approved" to resume, OR describes specific visual issues found
  </acceptance_criteria>
  <done>User has reviewed all screenshots + live behavior and either approved Phase 14 or flagged specific issues for follow-up.</done>
</task>

</tasks>

<verification>
Run phase-wide TypeScript + lint check:
```
cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit && pnpm lint
```

Run Playwright spec:
```
pnpm exec playwright test tests/e2e/14-global-polish.spec.ts --reporter=list
```

Key grep checks:
```bash
# Confirm no raw img tags remain in player bar
grep -n '<img' src/components/player/player-bar.tsx  # must be empty

# Confirm License Beat is a Link not a button
grep -n 'License Beat' src/components/player/player-bar.tsx  # must show href="/beats"

# Confirm NOW PLAYING is a span not a GlitchHeading
grep -n 'NOW PLAYING' src/components/player/player-bar.tsx  # must show <span

# Confirm slug added to PlayerBeat
grep -n 'slug' src/components/player/audio-player-provider.tsx  # must show slug: string
```
</verification>

<success_criteria>
- POLISH-03 delivered: player bar has NOW PLAYING label, functional License Beat Link, next/image cover art, and h-9 mobile row
- PlayerBeat type has slug field and all call sites compile without errors
- Playwright spec runs and generates screenshots for all 4 pages at desktop + mobile
- Footer newsletter changes (POLISH-02) and social icon changes (POLISH-01) are verified by Playwright with no regressions
- Human checkpoint approved — no visual issues from Phase 14 changes
- `pnpm tsc --noEmit` + `pnpm lint` exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/14-global-polish/14-03-SUMMARY.md` documenting:
- Confirmation that beats route is flat `/beats` (no detail route) — License Beat links to `/beats`
- Which PlayerBeat call sites were updated to include slug (list the files)
- Whether player bar test ran with real beats in DB or was skipped (empty DB)
- Playwright screenshot paths generated
- Human checkpoint outcome (approved / issues found)
- Final `pnpm tsc --noEmit` + `pnpm lint` status
</output>
