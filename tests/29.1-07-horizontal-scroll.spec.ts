import { test, expect } from "@playwright/test"

test.describe("29.1-07 — Desktop table horizontal-scroll fix (D-15/D-16)", () => {
  test.setTimeout(30_000)

  test("@1440: overflow engages on the table wrapper (scrollWidth > clientWidth)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const wrapper = page.locator('[data-leaderboard-table]')
    if ((await wrapper.count()) === 0) {
      test.skip(true, "No rows; table not rendered")
    }
    await expect(wrapper).toBeVisible({ timeout: 5_000 })
    const dims = await wrapper.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(dims.scrollWidth).toBeGreaterThan(dims.clientWidth)
    const tableWidth = await page
      .locator('[data-leaderboard-table] table')
      .evaluate((el) => (el as HTMLElement).getBoundingClientRect().width)
    expect(tableWidth).toBeGreaterThanOrEqual(1600)
  })

  test("table has explicit min-width 1600 inline style", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const table = page.locator('[data-leaderboard-table] table')
    if ((await table.count()) === 0) {
      test.skip(true, "No rows; table not rendered")
    }
    const minWidth = await table.evaluate(
      (el) => (el as HTMLElement).style.minWidth,
    )
    expect(minWidth).toBe("1600px")
  })

  test("@1440: scroll the wrapper right; sticky # and Product cells remain in viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const wrapper = page.locator('[data-leaderboard-table]')
    if ((await wrapper.count()) === 0) {
      test.skip(true, "No rows; table not rendered")
    }
    await expect(wrapper).toBeVisible({ timeout: 5_000 })

    await wrapper.evaluate((el) => {
      el.scrollLeft = el.scrollWidth
    })
    await page.waitForTimeout(150)

    const rankHeader = page.locator('[data-leaderboard-table] thead th').first()
    await expect(rankHeader).toBeInViewport()

    const productHeader = page.locator('[data-leaderboard-table] thead th').nth(1)
    await expect(productHeader).toBeInViewport()
  })
})
