import { test, expect } from "@playwright/test"

test.describe("29.1-04 — GlitchTech nav order (D-01)", () => {
  test.setTimeout(30_000)

  const EXPECTED_DESKTOP_ORDER = [
    "Reviews",
    "Rankings",
    "Categories",
    "Compare",
    "Benchmarks",
    "Blog",
    "About",
  ]

  test("desktop tile-nav renders items in D-01 order", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech")
    await expect(page.locator("aside nav a").first()).toBeVisible({ timeout: 5_000 })

    // Tile-nav can render either collapsed (icon-only) or expanded (labels).
    // Use aria-label which is set unconditionally on every nav Link in both modes.
    const techNavLinks = page.locator('aside nav a[href^="/tech"]')
    const ariaLabels = await techNavLinks.evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label") ?? ""),
    )
    const trimmed = ariaLabels.map((s) => s.trim().toLowerCase()).filter(Boolean)

    const indices = EXPECTED_DESKTOP_ORDER.map((label) =>
      trimmed.findIndex((t) => t === label.toLowerCase()),
    )
    for (let i = 0; i < EXPECTED_DESKTOP_ORDER.length; i++) {
      expect(
        indices[i],
        `Expected to find "${EXPECTED_DESKTOP_ORDER[i]}" in tile-nav`,
      ).toBeGreaterThanOrEqual(0)
    }
    for (let i = 1; i < indices.length; i++) {
      expect(
        indices[i],
        `Expected "${EXPECTED_DESKTOP_ORDER[i]}" to come after "${EXPECTED_DESKTOP_ORDER[i - 1]}"`,
      ).toBeGreaterThan(indices[i - 1])
    }
  })

  test("mobile overlay menu shows Rankings first, About last", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/tech")

    const menuTrigger = page.locator("[data-mobile-menu-trigger]")
    await expect(menuTrigger).toBeVisible({ timeout: 5_000 })
    await menuTrigger.click()

    const overlay = page.locator("[data-mobile-overlay]")
    await expect(overlay).toBeVisible({ timeout: 3_000 })

    const overlayItems = overlay.locator('a[href^="/tech"]')
    await expect(overlayItems.first()).toBeVisible({ timeout: 3_000 })

    const labels = (await overlayItems.allInnerTexts()).map((s) => s.trim().toLowerCase())
    expect(labels[0]).toContain("rankings")
    expect(labels[labels.length - 1]).toContain("about")
  })
})
