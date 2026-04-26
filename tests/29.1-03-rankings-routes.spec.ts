import { test, expect } from "@playwright/test"

test.describe("29.1-03 — Rankings routes + redirect (D-04/D-05/D-06/D-07)", () => {
  test.setTimeout(30_000)

  test("/tech/rankings hub renders heading + 'More categories coming soon'", async ({ page }) => {
    await page.goto("/tech/rankings")
    await expect(
      page.getByRole("heading", { level: 1, name: /^RANKINGS$/i }),
    ).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/More categories coming soon/i)).toBeVisible()
    // Tiles render only for level-1 categories that have at least one
    // PUBLISHED review (D-05). In a freshly-seeded dev DB there may be
    // none yet — the hub gracefully degrades to "More categories coming
    // soon". When reviews exist, a Laptops tile links to /tech/rankings/laptops.
    const laptopsTile = page.locator('a[href="/tech/rankings/laptops"]')
    const tileCount = await laptopsTile.count()
    if (tileCount > 0) {
      await expect(laptopsTile.first()).toBeVisible()
    }
  })

  test("/tech/rankings/laptops renders the leaderboard heading + table or empty state", async ({ page }) => {
    await page.goto("/tech/rankings/laptops")
    await expect(
      page.getByRole("heading", { level: 1, name: /LAPTOPS RANKINGS/i }),
    ).toBeVisible({ timeout: 5_000 })
    const tableOrEmpty = page.locator('table, [data-empty-state]')
    await expect(tableOrEmpty.first()).toBeVisible({ timeout: 5_000 })
  })

  test("/tech/categories/laptops/rankings redirects to /tech/rankings/laptops", async ({ page }) => {
    const response = await page.goto("/tech/categories/laptops/rankings", {
      waitUntil: "domcontentloaded",
    })
    // Next.js 16 permanentRedirect emits 308; some hosting layers normalize to 301.
    // Accept 200 too if server fast-forwards through the redirect transparently.
    expect([200, 301, 308]).toContain(response?.status() ?? 0)
    await expect(page).toHaveURL(/\/tech\/rankings\/laptops$/)
  })

  test("'View Rankings' CTA on /tech/categories/laptops points at /tech/rankings/laptops", async ({ page }) => {
    await page.goto("/tech/categories/laptops")
    const cta = page.locator('a[href="/tech/rankings/laptops"]').first()
    await expect(cta).toBeVisible({ timeout: 5_000 })
    await Promise.all([
      page.waitForURL(/\/tech\/rankings\/laptops$/, { timeout: 5_000 }),
      cta.click(),
    ])
  })
})
