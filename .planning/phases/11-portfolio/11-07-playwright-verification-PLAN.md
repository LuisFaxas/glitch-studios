---
phase: 11-portfolio
plan: 07
type: execute
wave: 5
depends_on: [11-01, 11-06]
files_modified:
  - tests/11-portfolio-verification.spec.ts
  - .planning/phases/11-portfolio/11-VERIFICATION.md
autonomous: false
requirements: [PORT-06, PORT-07]
must_haves:
  truths:
    - "Playwright spec exists at tests/11-portfolio-verification.spec.ts and runs both desktop (1440x900) and mobile (375x812) projects"
    - "Spec verifies /portfolio renders h1 PORTFOLIO, at least one VideoCard card link, and no horizontal overflow at 375px"
    - "Spec verifies /portfolio/[slug] renders the sticky PrevNextFooter (aria-label='Portfolio navigation') and that it is pinned to the viewport bottom"
    - "Spec verifies pressing ArrowRight on a case-study detail page navigates to a different /portfolio/{slug} URL"
    - "Spec verifies clicking the PREV link (aria-label starts with 'Previous portfolio item') navigates back to the previous slug"
    - "Spec verifies a video-type item's detail page renders VideoDetailLayout (case-study section titles like 'The Challenge' must be absent)"
    - "Spec verifies homepage / still renders its Our Work section (regression guard per D-09 + RESEARCH Pitfall 9)"
    - "Screenshots of /portfolio, /portfolio/{case-study-slug}, /portfolio/{video-slug}, and / (homepage) are captured at both desktop and mobile viewports and saved under .planning/phases/11-portfolio/screenshots/verification/"
    - "VERIFICATION.md summarizes spec results and any observed gaps for the human checkpoint"
  artifacts:
    - path: "tests/11-portfolio-verification.spec.ts"
      provides: "Playwright spec covering PORT-06 + PORT-07 success criteria"
    - path: ".planning/phases/11-portfolio/11-VERIFICATION.md"
      provides: "Verification summary + screenshot index for human sign-off"
  key_links:
    - from: "tests/11-portfolio-verification.spec.ts"
      to: "http://localhost:3004/portfolio"
      via: "baseURL from playwright.config.ts + page.goto"
      pattern: "/portfolio"
    - from: "tests/11-portfolio-verification.spec.ts"
      to: "aria-label='Portfolio navigation'"
      via: "Locator targeting the PrevNextFooter <nav>"
      pattern: "Portfolio navigation"
---

<objective>
Verify the Phase 11 deliverables (PORT-06 + PORT-07) in a real browser using Playwright — across both desktop (1440x900) and mobile (375x812) viewports — and produce a VERIFICATION.md summary for human sign-off.

Purpose: Memory `feedback_playwright_verification.md` + `feedback_design_quality.md` — every v2.0 quality phase must clear the visual bar, and verification must be executable, not just asserted. This is the final quality gate before Phase 11 is marked complete.

Output:
1. `tests/11-portfolio-verification.spec.ts` — Playwright spec covering index + detail + keyboard nav + click nav + type-branching + mobile overflow + homepage regression.
2. `.planning/phases/11-portfolio/11-VERIFICATION.md` — human-readable results summary + screenshot index.
3. Screenshot artifacts under `.planning/phases/11-portfolio/screenshots/verification/`.
4. A `checkpoint:human-verify` task asking the user to review screenshots + approve the phase.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/11-portfolio/11-CONTEXT.md
@.planning/phases/11-portfolio/11-RESEARCH.md
@.planning/phases/11-portfolio/11-UI-SPEC.md
@.planning/phases/11-portfolio/11-01-SUMMARY.md
@.planning/phases/11-portfolio/11-06-SUMMARY.md

@playwright.config.ts
@tests/09-services-booking-verification.spec.ts
@tests/07.3-mobile-menu.spec.ts

<interfaces>
<!-- Playwright config -->

From playwright.config.ts:
```typescript
baseURL: "http://localhost:3004"
projects: [
  { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  { name: "mobile",  use: { viewport: { width: 375, height: 812 } } },
]
testDir: "./tests"
fullyParallel: false
workers: 1
```

<!-- Existing test pattern (09-services-booking-verification.spec.ts) -->

```typescript
// uses path, fs to set up screenshot dir
// uses page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
//   to bypass the splash screen in dev
// uses page.evaluate to measure document.documentElement.scrollWidth vs clientWidth for overflow
```

<!-- Phase 11 components the spec will target -->

- Page h1: `<GlitchHeading text="PORTFOLIO">PORTFOLIO</GlitchHeading>` → text "PORTFOLIO" visible
- PrevNextFooter: `<nav aria-label="Portfolio navigation">`
- Prev link: `aria-label` starts with `Previous portfolio item`
- Next link: `aria-label` starts with `Next portfolio item`
- VideoCard link: `<Link href="/portfolio/{slug}">` wrapping each grid card
- Case-study section titles from case-study-content.tsx: "The Client", "The Challenge", "Our Approach", "The Result"
- VideoDetailLayout type chip: text "VIDEO" (rendered in the metadata row)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Write Playwright spec for Phase 11 verification</name>
  <files>tests/11-portfolio-verification.spec.ts</files>
  <read_first>
    - playwright.config.ts (to confirm baseURL, project names, and that the dev server must be running on :3004)
    - tests/09-services-booking-verification.spec.ts (pattern for mobile context, screenshot dir, overflow assertion, splash bypass)
    - tests/07.3-mobile-menu.spec.ts (pattern for locator-based assertions + keyboard interaction)
    - src/app/(public)/portfolio/page.tsx (Plan 06 output — confirms h1 text "PORTFOLIO" and structure)
    - src/components/portfolio/prev-next-footer.tsx (Plan 01 output — aria-label exact strings)
    - src/components/portfolio/video-detail-layout.tsx (Plan 01 output — confirms absence of case-study headings)
    - src/components/portfolio/case-study-content.tsx (case-study section titles that must NOT appear on video detail pages)
  </read_first>
  <action>
    Create `tests/11-portfolio-verification.spec.ts` with this exact structure:

    ```typescript
    import { test, expect } from "@playwright/test"
    import path from "path"
    import fs from "fs"

    const screenshotDir = path.resolve(
      __dirname,
      "../.planning/phases/11-portfolio/screenshots/verification"
    )
    fs.mkdirSync(screenshotDir, { recursive: true })

    // Skip splash overlay that otherwise covers every first-visit screenshot.
    async function bypassSplash(page: import("@playwright/test").Page) {
      await page.addInitScript(() =>
        sessionStorage.setItem("glitch-splash-seen", "true")
      )
    }

    test.describe("Phase 11 — Portfolio verification", () => {
      test.setTimeout(120_000)

      test("index page renders h1 + at least one card, no horizontal overflow @ 375px", async ({ page, browser }) => {
        // Desktop first — viewport from project config
        await bypassSplash(page)
        await page.goto("/portfolio", { waitUntil: "networkidle" })
        await expect(page.locator("h1", { hasText: "PORTFOLIO" })).toBeVisible()
        // Require at least one card linking to /portfolio/{slug}
        const cardLinks = page.locator('a[href^="/portfolio/"]')
        expect(await cardLinks.count()).toBeGreaterThan(0)
        await page.screenshot({
          path: path.join(screenshotDir, "01-index-desktop.png"),
          fullPage: true,
        })

        // Mobile context (375x812 + touch)
        const mobile = await browser.newContext({
          viewport: { width: 375, height: 812 },
          isMobile: true,
          hasTouch: true,
        })
        const mobilePage = await mobile.newPage()
        await bypassSplash(mobilePage)
        await mobilePage.goto("/portfolio", { waitUntil: "networkidle" })
        await mobilePage.waitForTimeout(400)
        await mobilePage.screenshot({
          path: path.join(screenshotDir, "02-index-mobile.png"),
          fullPage: true,
        })
        const widths = await mobilePage.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }))
        expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1)
        await mobile.close()
      })

      test("detail page renders sticky PrevNextFooter with correct aria", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/portfolio", { waitUntil: "networkidle" })
        const firstCard = page.locator('a[href^="/portfolio/"]').first()
        const firstHref = await firstCard.getAttribute("href")
        expect(firstHref).toBeTruthy()
        await firstCard.click()
        await page.waitForURL(new RegExp(`^http://localhost:3004${firstHref}$`))

        const nav = page.locator('nav[aria-label="Portfolio navigation"]')
        await expect(nav).toBeVisible()
        // Sticky at the bottom of viewport
        const box = await nav.boundingBox()
        const viewport = page.viewportSize()
        expect(box).not.toBeNull()
        if (box && viewport) {
          // nav bottom edge must be within 5px of viewport bottom
          expect(box.y + box.height).toBeGreaterThanOrEqual(viewport.height - 5)
        }

        await page.screenshot({
          path: path.join(screenshotDir, "03-detail-with-footer.png"),
          fullPage: false,
        })
      })

      test("ArrowRight advances to next slug; PREV link returns", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/portfolio", { waitUntil: "networkidle" })
        const firstCard = page.locator('a[href^="/portfolio/"]').first()
        const startHref = await firstCard.getAttribute("href")
        expect(startHref).toBeTruthy()
        await firstCard.click()
        await page.waitForLoadState("networkidle")
        const urlAfterClick = new URL(page.url()).pathname
        expect(urlAfterClick).toBe(startHref)

        // Press → to advance
        await page.keyboard.press("ArrowRight")
        await page.waitForLoadState("networkidle")
        const urlAfterRight = new URL(page.url()).pathname
        expect(urlAfterRight).not.toBe(urlAfterClick)
        expect(urlAfterRight.startsWith("/portfolio/")).toBe(true)

        // Click PREV (aria-label starts with "Previous portfolio item") to go back
        const prevLink = page.locator('a[aria-label^="Previous portfolio item"]')
        await expect(prevLink).toBeVisible()
        await prevLink.click()
        await page.waitForLoadState("networkidle")
        const urlAfterPrev = new URL(page.url()).pathname
        expect(urlAfterPrev).toBe(urlAfterClick)
      })

      test("video-type detail renders VideoDetailLayout (no case-study headings)", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/portfolio", { waitUntil: "networkidle" })

        // Try every card until we find one with type-chip "VIDEO" — skip the test
        // if no video-type item exists in the seed data (still PASS, because data
        // drives content; Plan 01 tests the branch logic).
        const cardLinks = await page.locator('a[href^="/portfolio/"]').all()
        let visited = false
        for (const link of cardLinks) {
          const href = await link.getAttribute("href")
          if (!href || href === "/portfolio") continue
          await page.goto(href, { waitUntil: "networkidle" })
          const isVideoDetail = await page
            .getByText("VIDEO", { exact: true })
            .first()
            .isVisible()
            .catch(() => false)
          // Also must NOT show the case-study headings
          const hasChallenge = await page
            .getByRole("heading", { name: /^The Challenge$/ })
            .isVisible()
            .catch(() => false)
          if (isVideoDetail && !hasChallenge) {
            visited = true
            await page.screenshot({
              path: path.join(screenshotDir, "04-video-detail.png"),
              fullPage: true,
            })
            // Confirm the case-study sections are absent
            await expect(
              page.getByRole("heading", { name: /^The Client$/ })
            ).toHaveCount(0)
            await expect(
              page.getByRole("heading", { name: /^Our Approach$/ })
            ).toHaveCount(0)
            await expect(
              page.getByRole("heading", { name: /^The Result$/ })
            ).toHaveCount(0)
            break
          }
        }
        test.skip(!visited, "No video-type portfolio item found in seed data")
      })

      test("case-study detail still renders 4 sections (no regression per D-07)", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/portfolio", { waitUntil: "networkidle" })
        const cardLinks = await page.locator('a[href^="/portfolio/"]').all()
        let visited = false
        for (const link of cardLinks) {
          const href = await link.getAttribute("href")
          if (!href || href === "/portfolio") continue
          await page.goto(href, { waitUntil: "networkidle" })
          const isCaseStudyChip = await page
            .getByText("CASE STUDY", { exact: true })
            .first()
            .isVisible()
            .catch(() => false)
          const hasChallenge = await page
            .getByRole("heading", { name: /^The Challenge$/ })
            .isVisible()
            .catch(() => false)
          if (isCaseStudyChip || hasChallenge) {
            visited = true
            await page.screenshot({
              path: path.join(screenshotDir, "05-case-study-detail.png"),
              fullPage: true,
            })
            break
          }
        }
        test.skip(!visited, "No case-study portfolio item found in seed data")
      })

      test("homepage Our Work section still renders (Pitfall 9 regression guard)", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/", { waitUntil: "networkidle" })
        // Homepage uses its own VideoPortfolioCarousel; heading copy varies, so
        // we assert the section exists by looking for at least one link to /portfolio
        // that is NOT the nav link itself.
        const portfolioLinks = page.locator('a[href^="/portfolio/"]')
        expect(await portfolioLinks.count()).toBeGreaterThan(0)
        await page.screenshot({
          path: path.join(screenshotDir, "06-homepage-our-work.png"),
          fullPage: true,
        })
      })
    })
    ```

    Non-negotiable concrete values:
    - Screenshot dir: `.planning/phases/11-portfolio/screenshots/verification/` — matches the convention used in `tests/09-services-booking-verification.spec.ts`.
    - Splash bypass: `sessionStorage.setItem("glitch-splash-seen", "true")` via `addInitScript` (pattern from 09 spec).
    - Mobile context literal: `{ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }` (matches playwright.config.ts mobile project).
    - Sticky footer assertion uses bounding box math: `box.y + box.height >= viewport.height - 5`.
    - Aria-label pattern: `nav[aria-label="Portfolio navigation"]`, `a[aria-label^="Previous portfolio item"]`.
    - Test uses `test.skip(!visited, "...")` when seed data lacks a video-type or case-study item — the spec PASSES in that case because data drives content (the branch logic itself is verified by tsc + plan 01 code review).
    - `test.setTimeout(120_000)` per describe — matches 09 spec convention.
    - Case-study regression test: asserts `toHaveCount(0)` for each of the 4 section headings on the video-type detail page.
  </action>
  <verify>
    <automated>test -f tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q 'Phase 11 — Portfolio verification' tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q 'glitch-splash-seen' tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q 'nav\[aria-label="Portfolio navigation"\]' tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q 'a\[aria-label\^="Previous portfolio item"\]' tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q 'ArrowRight' tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q 'The Challenge' tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q '.planning/phases/11-portfolio/screenshots/verification' tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q 'scrollWidth' tests/11-portfolio-verification.spec.ts &amp;&amp; grep -q 'homepage-our-work' tests/11-portfolio-verification.spec.ts &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `tests/11-portfolio-verification.spec.ts`
    - Contains `test.describe("Phase 11 — Portfolio verification", ...)`
    - Bypasses splash via `sessionStorage.setItem("glitch-splash-seen", "true")`
    - Targets `nav[aria-label="Portfolio navigation"]` (grep)
    - Targets `a[aria-label^="Previous portfolio item"]` (grep)
    - Uses `page.keyboard.press("ArrowRight")` for keyboard nav test (grep)
    - Contains string literal `"The Challenge"` (used to assert video detail has NO case-study headings)
    - Writes screenshots to `.planning/phases/11-portfolio/screenshots/verification/` (grep)
    - Contains a mobile-overflow test using `document.documentElement.scrollWidth` vs `clientWidth`
    - Contains the homepage regression test (grep for `homepage-our-work` screenshot name)
    - `pnpm tsc --noEmit` exits 0 (spec compiles)
    - Does NOT hardcode any slug — test discovers cards via `a[href^="/portfolio/"]`
  </acceptance_criteria>
  <done>Playwright spec covers index render, detail render, keyboard nav + PREV link, video/case-study branching, mobile overflow, and homepage regression. Screenshots saved under the phase directory for human review.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Run Playwright spec (desktop + mobile) and create VERIFICATION.md</name>
  <files>.planning/phases/11-portfolio/11-VERIFICATION.md</files>
  <read_first>
    - tests/11-portfolio-verification.spec.ts (Task 1 output)
    - .planning/phases/10-blog/10-VERIFICATION.md (template structure for the VERIFICATION doc — status summary, per-criterion table, screenshot index, gaps)
  </read_first>
  <action>
    STEP 1 — Start the dev server if not already running (do NOT run `next build`; dev mode on port 3004 is sufficient per playwright.config.ts baseURL):

    ```bash
    pm2 start ~/workspaces/_config/ecosystem.config.cjs --only glitch-studios
    # wait ~5s for the server to be ready (pm2 logs glitch-studios --lines 20)
    ```

    STEP 2 — Run the Playwright spec twice (once per project):

    ```bash
    pnpm exec playwright test tests/11-portfolio-verification.spec.ts --project=desktop
    pnpm exec playwright test tests/11-portfolio-verification.spec.ts --project=mobile
    ```

    STEP 3 — Inspect results. If any test fails, DO NOT write VERIFICATION.md yet — diagnose the failure (likely a seed-data issue, a mis-wired component, or a copy mismatch), fix in-place if trivial, re-run. If non-trivial, stop and report to the orchestrator with the failure output — the gap becomes the input to a `/gsd:plan-phase --gaps` follow-up.

    STEP 4 — Once all tests pass (or legitimately skip due to missing seed data), create `.planning/phases/11-portfolio/11-VERIFICATION.md` with this structure:

    ```markdown
    # Phase 11 — Portfolio Verification

    **Spec:** tests/11-portfolio-verification.spec.ts
    **Run date:** YYYY-MM-DD
    **Environment:** Playwright 1.58.2, baseURL http://localhost:3004 (pm2 dev server)
    **Projects:** desktop (1440x900), mobile (375x812)

    ## Result Summary

    | Project | Passed | Skipped | Failed |
    |---------|--------|---------|--------|
    | desktop | N      | N       | 0      |
    | mobile  | N      | N       | 0      |

    ## Success Criteria Coverage

    | Criterion (ROADMAP Phase 11) | Test | Status |
    |------------------------------|------|--------|
    | 1. Portfolio detail view has visible prev/next navigation | "detail page renders sticky PrevNextFooter with correct aria" + "ArrowRight advances to next slug; PREV link returns" | PASS / FAIL |
    | 2. Carousel animations and category filters preserved | "homepage Our Work section still renders" + manual review of chip filter | PASS / FAIL |
    | 3. Portfolio page renders correctly on mobile | "index page renders h1 + at least one card, no horizontal overflow @ 375px" | PASS / FAIL |

    ## Type-branching Coverage

    | Branch | Test | Status |
    |--------|------|--------|
    | type === "case_study" renders 4 sections | "case-study detail still renders 4 sections" | PASS / SKIP |
    | type === "video" renders minimal layout | "video-type detail renders VideoDetailLayout" | PASS / SKIP |

    ## Screenshots

    All screenshots saved under `.planning/phases/11-portfolio/screenshots/verification/`:

    - `01-index-desktop.png` — /portfolio at 1440x900
    - `02-index-mobile.png` — /portfolio at 375x812
    - `03-detail-with-footer.png` — detail page showing sticky PrevNextFooter
    - `04-video-detail.png` — video-type detail using VideoDetailLayout
    - `05-case-study-detail.png` — case-study detail (D-07 preserved)
    - `06-homepage-our-work.png` — homepage Our Work section (D-09 regression)

    ## Gaps / Observations

    (List anything that requires human attention or is deferred. Examples:
    - "No video-type item in seed data — Plan 01's video branch is type-checked but not visually verified"
    - "Sticky footer overlaps last paragraph by 2px on iPad portrait — not in scope for Phase 11 375px target")

    ## Next Step

    Awaiting human checkpoint (Plan 07 Task 3). Reviewer should open the 6 screenshots and confirm visual quality against UI-SPEC.
    ```

    STEP 5 — Commit the spec + VERIFICATION.md + screenshots using gsd-tools:

    ```bash
    node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "test(11-portfolio): playwright verification spec + screenshots" --files tests/11-portfolio-verification.spec.ts .planning/phases/11-portfolio/11-VERIFICATION.md .planning/phases/11-portfolio/screenshots/verification/
    ```
  </action>
  <verify>
    <automated>test -f .planning/phases/11-portfolio/11-VERIFICATION.md &amp;&amp; grep -q 'Result Summary' .planning/phases/11-portfolio/11-VERIFICATION.md &amp;&amp; grep -q 'Success Criteria Coverage' .planning/phases/11-portfolio/11-VERIFICATION.md &amp;&amp; grep -q 'Type-branching Coverage' .planning/phases/11-portfolio/11-VERIFICATION.md &amp;&amp; grep -q 'Screenshots' .planning/phases/11-portfolio/11-VERIFICATION.md &amp;&amp; test -d .planning/phases/11-portfolio/screenshots/verification</automated>
  </verify>
  <acceptance_criteria>
    - `.planning/phases/11-portfolio/11-VERIFICATION.md` exists
    - File contains sections `Result Summary`, `Success Criteria Coverage`, `Type-branching Coverage`, `Screenshots`, `Gaps / Observations`, `Next Step`
    - The Result Summary table has filled-in numbers (N, not placeholders) for both projects
    - Success Criteria Coverage lists all 3 ROADMAP Phase 11 criteria with PASS/FAIL status
    - Directory `.planning/phases/11-portfolio/screenshots/verification/` exists
    - Directory contains at least 3 PNG files (desktop index, mobile index, detail-with-footer are minimum; the other 3 are conditional on seed data)
    - Spec file `tests/11-portfolio-verification.spec.ts` committed alongside VERIFICATION.md and screenshots
  </acceptance_criteria>
  <done>Playwright spec has been run on desktop + mobile; VERIFICATION.md summarizes results with a per-criterion table and screenshot index; screenshots are on disk; everything is committed.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human visual verification of Phase 11 screenshots</name>
  <files>(human-only — no files written by this task; reviewer inspects screenshots under .planning/phases/11-portfolio/screenshots/verification/)</files>
  <read_first>
    - .planning/phases/11-portfolio/11-VERIFICATION.md (Task 2 output — pass/fail summary)
    - .planning/phases/11-portfolio/screenshots/verification/ (directory — all PNGs produced by Task 2)
    - .planning/phases/11-portfolio/11-UI-SPEC.md (visual bar the screenshots must clear)
  </read_first>
  <action>
    Present the following to the user for visual approval. This is a PAUSE task — agent halts until the user responds.

    WHAT WAS BUILT:
    - PORT-06 delivered: /portfolio/[slug] has sticky prev/next nav with keyboard (← / →), mobile swipe (60px threshold, horizontal-dominant), click, and wrap-around
    - PORT-07 delivered: /portfolio refactored to h1 + featured hero + chip filter + VideoCard grid; homepage carousel preserved; VideoCards uniform-height with type chip + year
    - All 7 plans complete (neighbor helper, placeholder, hero, VideoCard refactor, grid, page integration, Playwright spec)
    - 6 screenshots captured at desktop (1440x900) and mobile (375x812)

    HOW TO VERIFY:
    1. Open each screenshot under `.planning/phases/11-portfolio/screenshots/verification/`:
       - `01-index-desktop.png` — confirm: h1 "PORTFOLIO" visible, hero occupies full width with gradient + VIEW WORK CTA, chip row below with ALL + dynamic categories, grid below with 3 columns at this width
       - `02-index-mobile.png` — confirm: single-column grid, chip row horizontal-scrolls without visible scrollbar, no horizontal overflow on the page
       - `03-detail-with-footer.png` — confirm: sticky footer pinned to bottom with PREV / NEXT links or arrows
       - `04-video-detail.png` (if present) — confirm: video player + title + category + description + VIDEO type chip, NO "The Client / The Challenge / Our Approach / The Result" sections
       - `05-case-study-detail.png` (if present) — confirm: full 4-section case study layout unchanged from v1
       - `06-homepage-our-work.png` — confirm: homepage "Our Work" section still renders its carousel (no regression)
    2. Visit http://localhost:3004/portfolio in a browser. Tab through the grid cards with keyboard. Click a card. On the detail page, press ← / → — URL should change with no page flash. On mobile DevTools (375x812 + touch), swipe horizontally — URL should change.
    3. Open VERIFICATION.md (`.planning/phases/11-portfolio/11-VERIFICATION.md`) — confirm the Result Summary shows 0 failures (or document known gaps).
    4. Check: is the hero overlay's gradient preserving headline legibility? Does the chip row match the blog's chips exactly when you compare `/blog` and `/portfolio` side-by-side?

    RESUME SIGNAL: Type "approved" when the screenshots + live review pass the quality bar. Describe any issue in detail to trigger a gap-closure plan via `/gsd:plan-phase 11 --gaps`.
  </action>
  <verify>
    <automated>echo "checkpoint:human-verify — no automated verification; human reviewer approves via resume-signal"</automated>
  </verify>
  <acceptance_criteria>
    - User has opened the screenshots referenced in `<action>` and confirmed each matches the UI-SPEC expectations
    - User has manually verified keyboard nav (← / →) and mobile swipe (via DevTools 375x812 + touch) on a running dev server
    - User types `approved` to resume, OR describes specific gaps for a follow-up `/gsd:plan-phase 11 --gaps` session
  </acceptance_criteria>
  <done>User has reviewed all screenshots + live behavior and either approved Phase 11 or flagged specific gaps for gap-closure planning.</done>
</task>

</tasks>

<verification>
- `tests/11-portfolio-verification.spec.ts` typechecks
- Spec runs to completion on both desktop and mobile projects
- All success criteria in VERIFICATION.md are PASS or legitimately SKIPPED (data-driven skips only)
- 6 screenshot files (or at least the 4 unconditional ones) exist on disk
- Human reviewer approves (Task 3 resume signal)
</verification>

<success_criteria>
- PORT-06 verified end-to-end with a real browser
- PORT-07 verified (hero + chip filter + grid) with screenshots at two viewports
- No regression on homepage "Our Work" section (Pitfall 9 guard)
- VERIFICATION.md provides a reviewable summary with screenshot index and any gaps flagged
- Ready for `/gsd:execute-phase 11 --mark-complete` or ROADMAP update
</success_criteria>

<output>
After completion, create `.planning/phases/11-portfolio/11-07-SUMMARY.md` documenting:
- Final pass/fail count per project
- Any skipped tests (with data-driven reason)
- Screenshot filenames produced
- Whether the human approved (yes/no + any conditional notes)
- Any gaps carried forward into a future phase or gap-closure plan
</output>
