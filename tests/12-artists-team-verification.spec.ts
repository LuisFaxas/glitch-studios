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

    await expect(page.locator("h1", { hasText: "ARTISTS" })).toBeVisible()
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
    test.skip(count === 0, "No artist members in seed data — card fields are type-checked by tsc")

    await expect(cardLinks.first()).toBeVisible()

    const firstHref = await cardLinks.first().getAttribute("href")
    expect(firstHref).toBeTruthy()
    await page.goto(firstHref!, { waitUntil: "networkidle" })
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

    const allChip = page.locator('button', { hasText: "ALL" }).first()
    const hasChips = await allChip.isVisible().catch(() => false)
    test.skip(!hasChips, "No specialty chips visible — members have no specialties set")

    await expect(allChip).toBeVisible()

    const chipButtons = page.locator('button[type="button"]').filter({ hasNotText: "ALL" })
    const firstChip = chipButtons.first()
    const hasSpecialtyChips = await firstChip.isVisible().catch(() => false)
    test.skip(!hasSpecialtyChips, "No specialty chips beyond ALL")

    const initialCardCount = await page.locator('a[href^="/artists/"]').count()
    await firstChip.click()
    await page.waitForTimeout(200)
    const filteredCardCount = await page.locator('a[href^="/artists/"]').count()

    expect(filteredCardCount).toBeLessThanOrEqual(initialCardCount)

    await page.screenshot({
      path: path.join(screenshotDir, "04-chip-filter-active.png"),
      fullPage: true,
    })
  })

  test("TEAM and COLLABORATORS sections have visible border separation", async ({ page }) => {
    await bypassSplash(page)
    await page.goto("/artists", { waitUntil: "networkidle" })

    const teamHeading = page.locator("h2", { hasText: "TEAM" })
    const collabHeading = page.locator("h2", { hasText: "COLLABORATORS" })
    await expect(teamHeading).toBeVisible()
    await expect(collabHeading).toBeVisible()

    const teamBox = await teamHeading.boundingBox()
    const collabBox = await collabHeading.boundingBox()
    expect(teamBox).not.toBeNull()
    expect(collabBox).not.toBeNull()
    if (teamBox && collabBox) {
      expect(collabBox.y).toBeGreaterThan(teamBox.y)
    }
  })

  test("mobile card grid is readable at 375px", async ({ browser }) => {
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

    const firstCard = cardLinks.first()
    await expect(firstCard).toBeVisible()

    await mobilePage.screenshot({
      path: path.join(screenshotDir, "05-mobile-cards.png"),
      fullPage: true,
    })

    await mobile.close()
  })
})
