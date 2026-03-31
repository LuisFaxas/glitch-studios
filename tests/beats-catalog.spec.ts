import { test, expect } from "@playwright/test"

const SCREENSHOT_DIR = ".planning/audit-screenshots"

test.describe("Beats Catalog Visual Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for deterministic screenshots
    await page.emulateMedia({ reducedMotion: "reduce" })
  })

  test("desktop card view (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/beats")
    await page.waitForLoadState("networkidle")

    // Verify filter bar is visible via stable selector
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible()
    // Verify beat card grid is visible
    await expect(page.locator('[data-testid="beat-card-grid"]')).toBeVisible()
    // Verify at least one beat card exists
    await expect(page.locator('[data-testid="beat-card"]').first()).toBeVisible()
    // Verify search input placeholder
    await expect(page.locator('input[placeholder="Search beats..."]')).toBeVisible()
    // Verify view toggle
    await expect(page.locator('[data-testid="view-toggle"]')).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-beats-card-1440.png`,
      fullPage: true,
    })
  })

  test("desktop list view (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/beats?view=list")
    await page.waitForLoadState("networkidle")

    // Verify list view renders
    await expect(page.locator('[data-testid="beat-list"]')).toBeVisible()
    // Verify column headers
    await expect(page.locator('[data-testid="list-headers"]')).toBeVisible()
    // Verify at least one beat row
    await expect(page.locator('[data-testid="beat-row"]').first()).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-beats-list-1440.png`,
      fullPage: true,
    })
  })

  test("mobile card view (375px) - no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/beats")
    await page.waitForLoadState("networkidle")

    // Verify filter bar renders
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible()

    // Capture screenshot before overflow assertion so we always get the visual artifact
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-beats-card-375.png`,
      fullPage: true,
    })

    // Check horizontal overflow (soft assertion -- log overflow details for debugging)
    const overflowInfo = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth
      const clientW = document.documentElement.clientWidth
      return { scrollW, clientW, hasOverflow: scrollW > clientW }
    })
    // Use soft assertion so screenshot is always captured
    expect.soft(overflowInfo.hasOverflow, `Horizontal overflow detected: scrollWidth=${overflowInfo.scrollW} > clientWidth=${overflowInfo.clientW}. Fix: add min-w-0 and overflow-x-hidden to main element in public layout.`).toBe(false)
  })

  test("mobile list view (375px) - no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/beats?view=list")
    await page.waitForLoadState("networkidle")

    // Capture screenshot before overflow assertion
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-beats-list-375.png`,
      fullPage: true,
    })

    // Check horizontal overflow (soft assertion)
    const overflowInfo = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth
      const clientW = document.documentElement.clientWidth
      return { scrollW, clientW, hasOverflow: scrollW > clientW }
    })
    expect.soft(overflowInfo.hasOverflow, `Horizontal overflow detected: scrollWidth=${overflowInfo.scrollW} > clientWidth=${overflowInfo.clientW}. Fix: add min-w-0 and overflow-x-hidden to main element in public layout.`).toBe(false)
  })

  test("filtered view (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/beats?genre=Hip-Hop")
    await page.waitForLoadState("networkidle")

    // Verify filter bar shows active state
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-beats-filtered-1440.png`,
      fullPage: true,
    })
  })

  test("empty state (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/beats?genre=NonExistentGenre12345")
    await page.waitForLoadState("networkidle")

    // Verify empty state text per UI-SPEC
    await expect(page.getByText("NO BEATS FOUND")).toBeVisible()
    await expect(page.getByText("No beats match your filters")).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-beats-empty-1440.png`,
      fullPage: true,
    })
  })
})
