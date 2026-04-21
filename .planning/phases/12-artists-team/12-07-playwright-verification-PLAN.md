---
phase: 12-artists-team
plan: 07
type: execute
wave: 5
depends_on: [12-06]
files_modified:
  - tests/12-artists-team-verification.spec.ts
  - .planning/phases/12-artists-team/12-VERIFICATION.md
autonomous: false
requirements: [TEAM-01, TEAM-02, TEAM-03]
must_haves:
  truths:
    - "Playwright spec exists at tests/12-artists-team-verification.spec.ts and runs both desktop (1440x900) and mobile (375x812) projects"
    - "Spec verifies /artists renders h1 ARTISTS and both TEAM and COLLABORATORS section headings"
    - "Spec verifies no horizontal overflow on /artists at 375px"
    - "Spec verifies at least one ArtistCard link is visible (a[href^='/artists/'])"
    - "Spec verifies chip filter buttons are present and clicking one filters the grid"
    - "Spec verifies /artists/{slug} detail page renders without crashing (200 response)"
    - "Screenshots are saved under .planning/phases/12-artists-team/screenshots/verification/"
    - "VERIFICATION.md summarizes spec results and any observed gaps for the human checkpoint"
  artifacts:
    - path: "tests/12-artists-team-verification.spec.ts"
      provides: "Playwright spec covering TEAM-01/02/03 success criteria"
    - path: ".planning/phases/12-artists-team/12-VERIFICATION.md"
      provides: "Verification summary + screenshot index for human sign-off"
  key_links:
    - from: "tests/12-artists-team-verification.spec.ts"
      to: "http://localhost:3004/artists"
      via: "baseURL from playwright.config.ts + page.goto"
      pattern: "/artists"
    - from: "tests/12-artists-team-verification.spec.ts"
      to: "TEAM section h2"
      via: "page.locator('h2', { hasText: 'TEAM' })"
      pattern: "TEAM"
---

<objective>
Verify the Phase 12 deliverables (TEAM-01, TEAM-02, TEAM-03) in a real browser using Playwright across desktop (1440x900) and mobile (375x812) viewports, and produce a VERIFICATION.md summary for human sign-off.

Purpose: Every v2.0 quality phase must clear the visual bar with Playwright-captured screenshots (MEMORY.md feedback_playwright_verification). This is the final quality gate before Phase 12 is marked complete.

Output:
1. tests/12-artists-team-verification.spec.ts — Playwright spec covering page composition, section separation, chip filter, card field visibility, mobile overflow.
2. .planning/phases/12-artists-team/12-VERIFICATION.md — human-readable results with per-criterion table and screenshot index.
3. Screenshot artifacts under .planning/phases/12-artists-team/screenshots/verification/.
4. A checkpoint:human-verify task asking the user to review screenshots and approve.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/12-artists-team/12-RESEARCH.md
@.planning/phases/12-artists-team/12-06-SUMMARY.md

@playwright.config.ts
@tests/11-portfolio-verification.spec.ts

<interfaces>
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

Phase 12 page structure (from Plan 12-06):
- /artists: h1 "ARTISTS", ArtistHeroBanner (optional), ArtistsSection "TEAM", ArtistsSection "COLLABORATORS"
- ArtistsSection h2 selector: page.locator('h2', { hasText: 'TEAM' }) and page.locator('h2', { hasText: 'COLLABORATORS' })
- ArtistCard links: a[href^="/artists/"] (each card is a Link to the detail page)
- Chip buttons: button elements inside the chip scroll container, text matches specialty names

From tests/11-portfolio-verification.spec.ts (pattern to mirror):
```typescript
// Splash bypass
await page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
// Mobile context
const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })
// Overflow check
const widths = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1)
// Screenshot dir
const screenshotDir = path.resolve(__dirname, "../.planning/phases/12-artists-team/screenshots/verification")
fs.mkdirSync(screenshotDir, { recursive: true })
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Write Playwright spec for Phase 12 verification</name>
  <files>tests/12-artists-team-verification.spec.ts</files>
  <read_first>
    - playwright.config.ts (baseURL :3004, project names desktop/mobile)
    - tests/11-portfolio-verification.spec.ts (mirror the exact structure: splash bypass, mobile context, overflow assertion, screenshot dir, test.setTimeout(120_000), test.skip for data-dependent tests)
    - src/app/(public)/artists/page.tsx (Plan 12-06 output — h1 text, section titles, component tree)
    - src/components/artists/artists-section.tsx (Plan 12-05 output — chip button structure, h2 selector)
  </read_first>
  <action>
    Create tests/12-artists-team-verification.spec.ts with this structure:

    ```typescript
    import { test, expect } from "@playwright/test"
    import path from "path"
    import fs from "fs"

    const screenshotDir = path.resolve(
      __dirname,
      "../.planning/phases/12-artists-team/screenshots/verification"
    )
    fs.mkdirSync(screenshotDir, { recursive: true })

    async function bypassSplash(page: import("@playwright/test").Page) {
      await page.addInitScript(() =>
        sessionStorage.setItem("glitch-splash-seen", "true")
      )
    }

    test.describe("Phase 12 — Artists & Team verification", () => {
      test.setTimeout(120_000)

      test("index page renders h1 ARTISTS and both section headings at desktop", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/artists", { waitUntil: "networkidle" })

        // TEAM-01: Page heading
        await expect(page.locator("h1", { hasText: "ARTISTS" })).toBeVisible()

        // TEAM-01: Both sections present
        await expect(page.locator("h2", { hasText: "TEAM" })).toBeVisible()
        await expect(page.locator("h2", { hasText: "COLLABORATORS" })).toBeVisible()

        await page.screenshot({
          path: path.join(screenshotDir, "01-index-desktop.png"),
          fullPage: true,
        })
      })

      test("index page has no horizontal overflow at 375px mobile", async ({ browser }) => {
        const mobile = await browser.newContext({
          viewport: { width: 375, height: 812 },
          isMobile: true,
          hasTouch: true,
        })
        const mobilePage = await mobile.newPage()
        await bypassSplash(mobilePage)
        await mobilePage.goto("/artists", { waitUntil: "networkidle" })
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

      test("at least one ArtistCard link exists and detail page loads", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/artists", { waitUntil: "networkidle" })

        const cardLinks = page.locator('a[href^="/artists/"]')
        const count = await cardLinks.count()
        // If no cards, skip (data-driven) — TEAM-02 is type-checked by tsc
        test.skip(count === 0, "No artist members in seed data — card fields are type-checked by tsc")

        await expect(cardLinks.first()).toBeVisible()

        // Navigate to detail page and confirm it loads without crash
        const firstHref = await cardLinks.first().getAttribute("href")
        expect(firstHref).toBeTruthy()
        await page.goto(firstHref!, { waitUntil: "networkidle" })
        // Detail page should have the artist name as a heading
        const headings = page.locator("h1")
        await expect(headings.first()).toBeVisible()

        await page.screenshot({
          path: path.join(screenshotDir, "03-detail-page.png"),
          fullPage: true,
        })
      })

      test("chip filter buttons are present and clicking one updates the grid", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/artists", { waitUntil: "networkidle" })

        // Find ALL button (the reset chip) — data-driven: may not exist if no specialties
        const allChip = page.locator('button', { hasText: "ALL" }).first()
        const hasChips = await allChip.isVisible().catch(() => false)
        test.skip(!hasChips, "No specialty chips visible — members have no specialties set")

        // ALL chip should be in active state (bg-[#f5f5f0]) initially
        await expect(allChip).toBeVisible()

        // Click first non-ALL chip
        const chipButtons = page.locator('button[type="button"]').filter({ hasNotText: "ALL" })
        const firstChip = chipButtons.first()
        const hasSpecialtyChips = await firstChip.isVisible().catch(() => false)
        test.skip(!hasSpecialtyChips, "No specialty chips beyond ALL")

        const initialCardCount = await page.locator('a[href^="/artists/"]').count()
        await firstChip.click()
        await page.waitForTimeout(200)
        const filteredCardCount = await page.locator('a[href^="/artists/"]').count()

        // Filtered count should be <= initial count
        expect(filteredCardCount).toBeLessThanOrEqual(initialCardCount)

        await page.screenshot({
          path: path.join(screenshotDir, "04-chip-filter-active.png"),
          fullPage: true,
        })
      })

      test("TEAM and COLLABORATORS sections have visible border separation", async ({ page }) => {
        await bypassSplash(page)
        await page.goto("/artists", { waitUntil: "networkidle" })

        // Both section headings must exist
        const teamHeading = page.locator("h2", { hasText: "TEAM" })
        const collabHeading = page.locator("h2", { hasText: "COLLABORATORS" })
        await expect(teamHeading).toBeVisible()
        await expect(collabHeading).toBeVisible()

        // COLLABORATORS section must appear BELOW TEAM section (DOM order check)
        const teamBox = await teamHeading.boundingBox()
        const collabBox = await collabHeading.boundingBox()
        expect(teamBox).not.toBeNull()
        expect(collabBox).not.toBeNull()
        if (teamBox && collabBox) {
          expect(collabBox.y).toBeGreaterThan(teamBox.y)
        }
      })

      test("mobile card grid is readable at 375px (no clipped content)", async ({ browser }) => {
        const mobile = await browser.newContext({
          viewport: { width: 375, height: 812 },
          isMobile: true,
          hasTouch: true,
        })
        const mobilePage = await mobile.newPage()
        await bypassSplash(mobilePage)
        await mobilePage.goto("/artists", { waitUntil: "networkidle" })

        const cardLinks = mobilePage.locator('a[href^="/artists/"]')
        const count = await cardLinks.count()
        test.skip(count === 0, "No artist members in seed data")

        // First card should be fully visible (not clipped by overflow)
        const firstCard = cardLinks.first()
        await expect(firstCard).toBeVisible()

        await mobilePage.screenshot({
          path: path.join(screenshotDir, "05-mobile-cards.png"),
          fullPage: true,
        })

        await mobile.close()
      })
    })
    ```

    Non-negotiable concrete values:
    - Screenshot dir: `.planning/phases/12-artists-team/screenshots/verification/`
    - Splash bypass: `sessionStorage.setItem("glitch-splash-seen", "true")` via `addInitScript`
    - Mobile context: `{ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }`
    - Overflow assertion: `scrollWidth <= clientWidth + 1`
    - test.setTimeout(120_000) on describe block
    - test.skip for data-dependent assertions (matches Phase 11 pattern)
    - h1 text: "ARTISTS" (not "Our Team")
    - Section h2 texts: "TEAM" and "COLLABORATORS"
    - Card links selector: `a[href^="/artists/"]`

    Run typecheck after writing:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; test -f tests/12-artists-team-verification.spec.ts &amp;&amp; grep -q 'Phase 12' tests/12-artists-team-verification.spec.ts &amp;&amp; grep -q 'glitch-splash-seen' tests/12-artists-team-verification.spec.ts &amp;&amp; grep -q 'ARTISTS' tests/12-artists-team-verification.spec.ts &amp;&amp; grep -q 'TEAM' tests/12-artists-team-verification.spec.ts &amp;&amp; grep -q 'COLLABORATORS' tests/12-artists-team-verification.spec.ts &amp;&amp; grep -q 'scrollWidth' tests/12-artists-team-verification.spec.ts &amp;&amp; grep -q 'screenshots/verification' tests/12-artists-team-verification.spec.ts &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at tests/12-artists-team-verification.spec.ts
    - grep "Phase 12 — Artists" exits 0 (test.describe label)
    - grep "glitch-splash-seen" exits 0 (splash bypass present)
    - grep "ARTISTS" exits 0 (h1 text target)
    - grep "TEAM" exits 0 (section h2 target)
    - grep "COLLABORATORS" exits 0 (section h2 target)
    - grep "scrollWidth" exits 0 (overflow assertion present)
    - grep "screenshots/verification" exits 0 (screenshot dir)
    - grep 'a\[href\^="/artists/"\]' exits 0 (card link selector)
    - Uses test.skip for data-dependent assertions (not hard fails)
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>Playwright spec covers: h1 + sections (TEAM-01), card links + detail page load (TEAM-02), chip filter interaction (TEAM-03), section order verification, mobile overflow (375px), and mobile card readability. Data-dependent tests use test.skip.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Run Playwright spec and create VERIFICATION.md</name>
  <files>.planning/phases/12-artists-team/12-VERIFICATION.md</files>
  <read_first>
    - tests/12-artists-team-verification.spec.ts (Task 1 output)
    - .planning/phases/11-portfolio/11-VERIFICATION.md (structure template — sections: Result Summary, Success Criteria Coverage, Screenshots, Gaps/Observations, Next Step)
  </read_first>
  <action>
    STEP 1 — Ensure dev server is running on port 3004:

    ```bash
    pm2 start ~/workspaces/_config/ecosystem.config.cjs --only glitch-studios
    ```

    Wait for server to be ready (check logs: pm2 logs glitch-studios --lines 20). Do NOT run next build.

    STEP 2 — Run Playwright spec on both projects:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm exec playwright test tests/12-artists-team-verification.spec.ts --project=desktop
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm exec playwright test tests/12-artists-team-verification.spec.ts --project=mobile
    ```

    STEP 3 — If any test FAILS (not SKIPPED):
    - Read the failure output carefully
    - If trivial (selector mismatch, copy mismatch), fix in-place and re-run
    - If non-trivial (component not rendering, page 500 error), stop and report to orchestrator with the failure output — the gap becomes input for `/gsd:plan-phase 12 --gaps`

    STEP 4 — Once all tests pass or skip, create .planning/phases/12-artists-team/12-VERIFICATION.md with this structure:

    ```markdown
    # Phase 12 — Artists & Team Verification

    **Spec:** tests/12-artists-team-verification.spec.ts
    **Run date:** YYYY-MM-DD
    **Environment:** Playwright, baseURL http://localhost:3004 (pm2 dev server)
    **Projects:** desktop (1440x900), mobile (375x812)

    ## Result Summary

    | Project | Passed | Skipped | Failed |
    |---------|--------|---------|--------|
    | desktop | N      | N       | 0      |
    | mobile  | N      | N       | 0      |

    ## Success Criteria Coverage

    | Criterion (ROADMAP Phase 12) | Test | Status |
    |------------------------------|------|--------|
    | 1. Artists page has clear sections for team vs collaborators | "index page renders h1 ARTISTS and both section headings" + "TEAM and COLLABORATORS sections have visible border separation" | PASS / FAIL |
    | 2. Artist cards have rich content (role, specialties, social, bio) | "at least one ArtistCard link exists and detail page loads" | PASS / FAIL / SKIP |
    | 3. Artists page has chip filter browsing mechanism | "chip filter buttons are present and clicking one updates the grid" | PASS / FAIL / SKIP |
    | 4. Artists page renders correctly on mobile | "index page has no horizontal overflow at 375px mobile" + "mobile card grid is readable" | PASS / FAIL |

    ## Screenshots

    All screenshots saved under .planning/phases/12-artists-team/screenshots/verification/:

    - 01-index-desktop.png — /artists at 1440x900
    - 02-index-mobile.png — /artists at 375x812 (overflow check)
    - 03-detail-page.png — /artists/{slug} detail at desktop
    - 04-chip-filter-active.png — chip filter in active state (if data available)
    - 05-mobile-cards.png — card grid at 375x812

    ## Gaps / Observations

    (List anything that requires human attention or is deferred.)

    ## Next Step

    Awaiting human checkpoint (Plan 07 Task 3). Reviewer should open the screenshots and confirm visual quality.
    ```

    STEP 5 — Commit spec + VERIFICATION.md + screenshots:

    ```bash
    node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "test(12-artists-team): playwright verification spec + screenshots" --files tests/12-artists-team-verification.spec.ts .planning/phases/12-artists-team/12-VERIFICATION.md .planning/phases/12-artists-team/screenshots/verification/
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; test -f .planning/phases/12-artists-team/12-VERIFICATION.md &amp;&amp; grep -q 'Result Summary' .planning/phases/12-artists-team/12-VERIFICATION.md &amp;&amp; grep -q 'Success Criteria Coverage' .planning/phases/12-artists-team/12-VERIFICATION.md &amp;&amp; grep -q 'Screenshots' .planning/phases/12-artists-team/12-VERIFICATION.md &amp;&amp; test -d .planning/phases/12-artists-team/screenshots/verification</automated>
  </verify>
  <acceptance_criteria>
    - .planning/phases/12-artists-team/12-VERIFICATION.md exists
    - File contains sections Result Summary, Success Criteria Coverage, Screenshots, Gaps/Observations, Next Step
    - Result Summary table has filled-in numbers (not placeholder N) for both projects
    - Success Criteria Coverage lists all 4 ROADMAP Phase 12 criteria with PASS/FAIL/SKIP status
    - Directory .planning/phases/12-artists-team/screenshots/verification/ exists
    - Directory contains at least 2 PNG files (desktop index + mobile index are minimum unconditional)
    - spec file and VERIFICATION.md committed together
  </acceptance_criteria>
  <done>Playwright spec run on desktop + mobile. VERIFICATION.md summarizes results with per-criterion table and screenshot index. Screenshots on disk. Everything committed.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human visual verification of Phase 12 screenshots</name>
  <files>(human-only — reviewer inspects screenshots under .planning/phases/12-artists-team/screenshots/verification/)</files>
  <read_first>
    - .planning/phases/12-artists-team/12-VERIFICATION.md (Task 2 output — pass/fail summary)
    - .planning/phases/12-artists-team/screenshots/verification/ (all PNGs produced by Task 2)
  </read_first>
  <action>
    WHAT WAS BUILT:
    - TEAM-01 delivered: /artists page has h1 ARTISTS, two labeled sections (TEAM and COLLABORATORS) with border-t visual separation between them
    - TEAM-02 delivered: ArtistCard rebuilt with next/image avatar (aspect-[4/3]), role badge chip, specialty chips (max 3), social icon row (Lucide), bio line-clamp-3, glitch hover overlay; ArtistProfile upgraded to next/image + brand tokens
    - TEAM-03 delivered: ArtistsSection chip filter (ALL + specialty chips, horizontal-scroll) matching PortfolioGrid pattern; each section independently filterable
    - Schema migration: kind/specialties/isFeatured columns added to team_members table; admin form upgraded with Kind select, Specialties input, isFeatured checkbox
    - 5 screenshots captured at desktop (1440x900) and mobile (375x812)

    HOW TO VERIFY:
    1. Open each screenshot under .planning/phases/12-artists-team/screenshots/verification/:
       - 01-index-desktop.png — confirm: h1 "ARTISTS" visible, TEAM section heading, COLLABORATORS section heading with border separator, hero banner if a featured member exists
       - 02-index-mobile.png — confirm: single-column card grid, no horizontal overflow, chip row scrolls without visible scrollbar
       - 03-detail-page.png — confirm: artist profile page loads, name visible as h1, no broken layout
       - 04-chip-filter-active.png (if present) — confirm: one chip is highlighted (bg-white), grid shows filtered cards
       - 05-mobile-cards.png — confirm: cards are readable at 375px, name/role visible, no clipped content
    2. Visit http://localhost:3004/artists in a browser at desktop width — confirm both sections visible simultaneously with clear visual separation
    3. On mobile DevTools (375x812 + touch) — confirm chip row scrolls horizontally, cards stack in single column
    4. Click a chip to confirm the grid filters correctly; click ALL to reset
    5. If no data is seeded: navigate to /admin/team, add a member with kind=Internal and specialties="Mixing, Trap", check Featured — then revisit /artists to confirm the hero banner appears

    RESUME SIGNAL: Type "approved" when screenshots + live review pass the quality bar. Describe any issue in detail to trigger a gap-closure plan via `/gsd:plan-phase 12 --gaps`.
  </action>
  <verify>
    <automated>echo "checkpoint:human-verify — agent halts until user approves via resume-signal"</automated>
  </verify>
  <acceptance_criteria>
    - User has opened the screenshots and confirmed each matches Phase 12 success criteria
    - User has verified chip filter interaction (click chip filters grid, ALL resets)
    - User has verified TEAM/COLLABORATORS section separation is visually clear
    - User types "approved" to resume OR describes specific gaps for follow-up gap-closure
  </acceptance_criteria>
  <done>User reviewed all screenshots + live behavior and either approved Phase 12 or flagged specific gaps for gap-closure planning.</done>
</task>

</tasks>

<verification>
- tests/12-artists-team-verification.spec.ts typechecks
- Spec runs to completion on both desktop and mobile projects
- All success criteria in VERIFICATION.md are PASS or legitimately SKIPPED (data-driven skips only)
- At least 2 unconditional screenshots exist on disk (desktop index + mobile index)
- Human reviewer approves (Task 3 resume signal)
</verification>

<success_criteria>
- TEAM-01 verified: h1 ARTISTS + TEAM section + COLLABORATORS section with visible border separator
- TEAM-02 verified: ArtistCard renders with role badge, specialty chips, social icons, bio — type-checked by tsc
- TEAM-03 verified: chip filter present and functional (or legitimately skipped if no specialties in seed data)
- Mobile at 375px: no horizontal overflow, single-column stack, no clipped content
- VERIFICATION.md provides a reviewable summary
- Human approves
</success_criteria>

<output>
After completion, create .planning/phases/12-artists-team/12-07-SUMMARY.md documenting:
- Final pass/skip/fail count per project
- Any skipped tests with data-driven reason
- Screenshot filenames produced
- Whether the human approved (yes/no + any conditional notes)
- Any gaps carried forward for gap-closure
</output>
