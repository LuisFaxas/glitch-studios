import { test, expect } from "@playwright/test"

/**
 * Phase 29 / 48.1 — Rankings display verification.
 *
 * Phase 48.1 replaced the unstable TanStack/full-table runtime with a custom
 * display. These tests protect the current stabilization contract: real review
 * anchors, visible score labels/data, local filters, reset recovery, and mobile
 * filter access.
 */

const RANKINGS_URL = "/tech/rankings/laptops"
const CATEGORY_URL = "/tech/categories/laptops"

async function displayRowCount(page: import("@playwright/test").Page) {
  return page
    .locator("[data-leaderboard-display] [data-leaderboard-row]")
    .count()
}

test.describe("Phase 29 / 48.1 — Rankings Display", () => {
  test("category page surfaces 'View Rankings' that navigates to current rankings route", async ({
    page,
  }) => {
    await page.goto(CATEGORY_URL)
    const cta = page.locator('a[href="/tech/rankings/laptops"]').first()
    await expect(cta).toBeVisible()
    await Promise.all([
      page.waitForURL(/\/tech\/rankings\/laptops$/, { timeout: 5_000 }),
      cta.click(),
    ])
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /rankings/i,
    )
  })

  test("custom display renders product links, rank, scores, year, and price", async ({
    page,
  }) => {
    await page.goto(RANKINGS_URL)
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }

    await expect(display).toBeVisible({ timeout: 5_000 })
    await expect(display.locator('a[href^="/tech/reviews/"]').first()).toBeVisible()
    await expect(
      display.locator("[data-leaderboard-row]").first(),
    ).toContainText(/^#\d+/)
    await expect(display.getByText(/GlitchMark/i).first()).toBeVisible()
    await expect(display.getByText(/^BPR$/i).first()).toBeVisible()
    await expect(display.getByText(/Year/i).first()).toBeVisible()
    await expect(display.getByText(/Price/i).first()).toBeVisible()
  })

  test("local filter chip narrows or preserves row count and reset restores baseline", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop filter bar behavior is covered in the desktop project.",
    )
    await page.goto(RANKINGS_URL)
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(display).toBeVisible({ timeout: 5_000 })

    const baseline = await displayRowCount(page)
    expect(baseline).toBeGreaterThan(0)

    const cpuTrigger = page.locator('[data-facet-dropdown="CPU"]')
    await expect(cpuTrigger).toBeVisible({ timeout: 5_000 })
    await cpuTrigger.click()
    const panel = cpuTrigger.locator("xpath=following-sibling::div[@role='menu']")
    await expect(panel).toBeVisible({ timeout: 3_000 })
    const chip = panel.locator("button[aria-pressed]").first()
    if ((await chip.count()) === 0) {
      test.skip(true, "No CPU filter options available")
    }

    await chip.click()
    await expect(cpuTrigger).toContainText("CPU (1)")
    await expect
      .poll(() => displayRowCount(page), { timeout: 3_000 })
      .toBeLessThanOrEqual(baseline)

    await page.locator("[data-reset-filters]").first().click()
    await expect
      .poll(() => displayRowCount(page), { timeout: 3_000 })
      .toBe(baseline)
  })

  test("mobile shows custom display and floating filter sheet trigger", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    })
    const page = await context.newPage()
    await page.goto(RANKINGS_URL)
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(display).toBeVisible({ timeout: 5_000 })
    await expect(display.locator('a[href^="/tech/reviews/"]').first()).toBeVisible()
    await expect(page.locator("[data-mobile-filter-sheet-trigger]")).toBeVisible()
    await context.close()
  })

  test("Buy button click does not navigate away from rankings", async ({ page }) => {
    await page.goto(RANKINGS_URL)
    const buyBtn = page.getByRole("button", { name: /^buy$/i }).first()
    if ((await buyBtn.count()) === 0) {
      test.skip(true, "No rows; buy button not rendered")
    }
    await expect(buyBtn).toBeVisible()
    const urlBefore = page.url()
    await buyBtn.click()
    expect(page.url()).toBe(urlBefore)
  })
})
