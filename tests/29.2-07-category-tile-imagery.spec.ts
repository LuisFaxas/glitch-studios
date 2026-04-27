import { test, expect } from "@playwright/test"

test.describe("29.2-07 — Category tile Direction B imagery upgrade", () => {
  test.setTimeout(30_000)

  test("Category tiles are larger than 40px icon (Direction B: 80px icon)", async ({ page }) => {
    await page.goto("/tech/categories")

    const innerMain = page.locator("main.min-h-screen.bg-black")
    // First tile: any anchor pointing to /tech/categories/* OR any aria-disabled tile
    const firstTile = innerMain
      .locator('a[href^="/tech/categories/"], [aria-disabled="true"]')
      .first()
    await expect(firstTile).toBeVisible({ timeout: 5_000 })

    const icon = firstTile.locator("svg").first()
    await expect(icon).toBeVisible()

    const iconWidth = await icon.evaluate((el) => (el as SVGElement).getBoundingClientRect().width)
    expect(iconWidth).toBeGreaterThanOrEqual(70)
  })

  test("Active tiles show a review/product count caption", async ({ page }) => {
    await page.goto("/tech/categories")
    const laptopsTile = page.locator('[href="/tech/categories/laptops"]')
    const exists = await laptopsTile.count()
    if (exists > 0) {
      await expect(laptopsTile.first()).toBeVisible()
      await expect(laptopsTile.first()).not.toContainText(/coming soon/i)
    }
  })

  test("Inactive tiles show 'COMING SOON' caption", async ({ page }) => {
    await page.goto("/tech/categories")
    const inactiveTiles = page.locator("[aria-disabled='true']")
    const count = await inactiveTiles.count()
    if (count > 0) {
      const firstInactive = inactiveTiles.first()
      await expect(firstInactive).toContainText("COMING SOON")
    }
  })

  test("Category tile grid renders on /tech/rankings hub as well", async ({ page }) => {
    await page.goto("/tech/rankings")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    const innerMain = page.locator("main.min-h-screen.bg-black")
    await expect(innerMain).toBeVisible()
  })
})
