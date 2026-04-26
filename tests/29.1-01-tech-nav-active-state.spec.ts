import { test, expect } from "@playwright/test"

test.describe("29.1-01 — Tech nav active-state regression (D-23/D-24/D-25)", () => {
  test.setTimeout(30_000)

  const ROUTES_TO_TEST: Array<{ url: string; expectedActiveLabel: RegExp }> = [
    { url: "/tech/reviews", expectedActiveLabel: /Reviews/i },
    { url: "/tech/categories", expectedActiveLabel: /Categories/i },
    { url: "/tech/compare", expectedActiveLabel: /Compare/i },
    { url: "/tech", expectedActiveLabel: /Home/i },
  ]

  test.describe("desktop tile-nav (1440x900)", () => {
    test.use({ viewport: { width: 1440, height: 900 } })
    for (const route of ROUTES_TO_TEST) {
      // Skip Home on desktop — sidebar tile-nav uses techNavItems which
      // does not include a Home item. Home is mobile-tab-only.
      if (route.url === "/tech") continue
      test(`${route.url} highlights the matching tile`, async ({ page }) => {
        await page.goto(route.url)
        await expect(
          page.locator('aside a[data-active]').first(),
        ).toBeVisible({ timeout: 10_000 })
        const activeLink = page.locator('aside a[data-active="true"]')
        await expect(activeLink).toHaveCount(1)
        await expect(activeLink).toContainText(route.expectedActiveLabel)
      })
    }
  })

  test.describe("mobile bottom-tab-bar (375x812)", () => {
    test.use({ viewport: { width: 375, height: 812 } })
    for (const route of ROUTES_TO_TEST) {
      test(`${route.url} highlights the matching tab`, async ({ page }) => {
        await page.goto(route.url)
        await expect(
          page.locator('[data-tab-bar] a[data-active]').first(),
        ).toBeVisible({ timeout: 10_000 })
        const activeTab = page.locator('[data-tab-bar] a[data-active="true"]')
        await expect(activeTab).toHaveCount(1)
        await expect(activeTab).toContainText(route.expectedActiveLabel)
      })
    }
  })

  test("Home tab is NOT active on a leaf path", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/tech/reviews")
    await expect(
      page.locator('[data-tab-bar] a[data-active]').first(),
    ).toBeVisible({ timeout: 10_000 })
    const homeTab = page
      .locator('[data-tab-bar] a')
      .filter({ has: page.locator('[aria-label="Home"], [aria-hidden]') })
      .filter({ hasText: /Home/i })
    await expect(homeTab.first()).toHaveAttribute("data-active", "false")
  })
})
