import { test, expect } from "@playwright/test"

test.describe("29.1-08 / 48.1 — Mobile custom rankings display", () => {
  test.setTimeout(30_000)

  test.use({ viewport: { width: 375, height: 812 } })

  test("mobile default renders the custom display with no view URL state", async ({
    page,
  }) => {
    await page.goto("/tech/rankings/laptops")
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(page).not.toHaveURL(/view=/)
    await expect(display).toBeVisible({ timeout: 5_000 })
    await expect(display.locator("[data-leaderboard-row]").first()).toBeVisible()
  })

  test("mobile ignores legacy view query while keeping one custom display", async ({
    page,
  }) => {
    await page.goto("/tech/rankings/laptops?view=table")
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(display).toHaveCount(1)
    await expect(page.locator("[data-leaderboard-view-toggle]")).toHaveCount(0)
    await expect(page.locator("[data-leaderboard-table-mobile]")).toHaveCount(0)
  })

  test("mobile filter trigger remains available with custom rows", async ({
    page,
  }) => {
    await page.goto("/tech/rankings/laptops")
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(display.locator("[data-leaderboard-row]").first()).toBeVisible()
    await expect(page.locator("[data-mobile-filter-sheet-trigger]")).toBeVisible()
  })
})
