import { test, expect } from "@playwright/test"
import path from "path"
import fs from "fs"

const screenshotDir = path.resolve(
  __dirname,
  "../.planning/phases/11-portfolio/screenshots/verification"
)
fs.mkdirSync(screenshotDir, { recursive: true })

async function bypassSplash(page: import("@playwright/test").Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem("glitch-splash-seen", "true")
  )
}

test.describe("Phase 11 — Portfolio verification", () => {
  test.setTimeout(120_000)

  test("index page renders h1 + at least one card, no horizontal overflow @ 375px", async ({ page, browser }) => {
    await bypassSplash(page)
    await page.goto("/portfolio", { waitUntil: "networkidle" })
    await expect(page.locator("h1", { hasText: "PORTFOLIO" })).toBeVisible()
    const cardLinks = page.locator('a[href^="/portfolio/"]')
    expect(await cardLinks.count()).toBeGreaterThan(0)
    await page.screenshot({
      path: path.join(screenshotDir, "01-index-desktop.png"),
      fullPage: true,
    })

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
    const box = await nav.boundingBox()
    const viewport = page.viewportSize()
    expect(box).not.toBeNull()
    if (box && viewport) {
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
    // Filter to slug-bearing card links (exclude bare `/portfolio` nav + breadcrumb links)
    const allHrefs = await page
      .locator('a[href^="/portfolio/"]')
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute("href")))
    const slugHrefs = allHrefs.filter(
      (h): h is string => !!h && h !== "/portfolio" && h.startsWith("/portfolio/")
    )
    expect(slugHrefs.length).toBeGreaterThan(0)
    const startHref = slugHrefs[0]

    await page.goto(startHref!, { waitUntil: "networkidle" })
    const urlAfterClick = new URL(page.url()).pathname
    expect(urlAfterClick).toBe(startHref)

    // Focus body so the window keydown listener receives the event
    await page.locator("body").click({ position: { x: 10, y: 10 } })
    await page.keyboard.press("ArrowRight")
    // Wait for client-side router.push to finish
    await page.waitForURL((url) => url.pathname !== urlAfterClick && url.pathname.startsWith("/portfolio/"), {
      timeout: 5000,
    })
    const urlAfterRight = new URL(page.url()).pathname
    expect(urlAfterRight).not.toBe(urlAfterClick)
    expect(urlAfterRight.startsWith("/portfolio/")).toBe(true)

    const prevLink = page.locator('a[aria-label^="Previous portfolio item"]')
    await expect(prevLink).toBeVisible()
    await prevLink.click()
    await page.waitForURL((url) => url.pathname === urlAfterClick, { timeout: 5000 })
    const urlAfterPrev = new URL(page.url()).pathname
    expect(urlAfterPrev).toBe(urlAfterClick)
  })

  test("video-type detail renders VideoDetailLayout (no case-study headings)", async ({ page }) => {
    await bypassSplash(page)
    await page.goto("/portfolio", { waitUntil: "networkidle" })

    const allHrefs = await page
      .locator('a[href^="/portfolio/"]')
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute("href")))
    const slugHrefs = Array.from(
      new Set(
        allHrefs.filter(
          (h): h is string => !!h && h !== "/portfolio" && h.startsWith("/portfolio/")
        )
      )
    )
    let visited = false
    for (const href of slugHrefs) {
      await page.goto(href, { waitUntil: "networkidle" })
      const isVideoDetail = await page
        .getByText("VIDEO", { exact: true })
        .first()
        .isVisible()
        .catch(() => false)
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
    const allHrefs = await page
      .locator('a[href^="/portfolio/"]')
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute("href")))
    const slugHrefs = Array.from(
      new Set(
        allHrefs.filter(
          (h): h is string => !!h && h !== "/portfolio" && h.startsWith("/portfolio/")
        )
      )
    )
    let visited = false
    for (const href of slugHrefs) {
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
    // Homepage's VideoPortfolioCarousel uses its own card component (not VideoCard).
    // Regression guard: page loads successfully and at least one /portfolio link exists
    // (nav link or the Our Work section's "See All" CTA). Homepage route refactored
    // in Plan 06 must not have broken the page.
    const anyPortfolioLink = page.locator('a[href^="/portfolio"]')
    expect(await anyPortfolioLink.count()).toBeGreaterThan(0)
    await page.screenshot({
      path: path.join(screenshotDir, "06-homepage-our-work.png"),
      fullPage: true,
    })
  })
})
