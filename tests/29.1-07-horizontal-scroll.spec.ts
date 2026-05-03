import { test, expect } from "@playwright/test"

test.describe("29.1-07 / 48.1 — Custom display viewport fit", () => {
  test.setTimeout(30_000)

  test("@1440: custom display renders without page-level horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(display).toBeVisible({ timeout: 5_000 })
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth + 2)
  })

  test("@1440: first rank and product link stay in viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const firstRow = page.locator("[data-leaderboard-row]").first()
    if ((await firstRow.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(firstRow).toBeVisible({ timeout: 5_000 })
    await expect(firstRow.getByText(/^#1$/)).toBeInViewport()
    await expect(firstRow.locator('a[href^="/tech/reviews/"]')).toBeInViewport()
  })

  test("@1024: custom display keeps each row inside the viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto("/tech/rankings/laptops")
    const firstRow = page.locator("[data-leaderboard-row]").first()
    if ((await firstRow.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(firstRow).toBeVisible({ timeout: 5_000 })
    const box = await firstRow.boundingBox()
    expect(box?.x ?? 0).toBeGreaterThanOrEqual(0)
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(1024)
  })
})
