import { test, expect } from "@playwright/test"

test.describe("29.1-06 — Top filter bar (D-12/D-13/D-14) — dropdown facets (post-rebuild)", () => {
  test.setTimeout(30_000)

  test("desktop @1280: bar visible, 5+ facet dropdown triggers + Price + Reset", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const bar = page.locator('[data-leaderboard-filters][data-layout="bar"]')
    if ((await bar.count()) === 0) {
      test.skip(true, "No rows; bar not rendered")
    }
    await expect(bar).toBeVisible({ timeout: 5_000 })

    await expect(bar.locator('[data-price-popover-trigger]')).toBeVisible()
    for (const label of ["Year", "CPU", "RAM", "Storage", "Medal"]) {
      await expect(bar.locator(`[data-facet-dropdown="${label}"]`)).toBeVisible()
    }
    await expect(bar.locator('[data-reset-filters]')).toBeVisible()
  })

  test("desktop: CPU chip toggles local active state and reset clears it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const bar = page.locator('[data-leaderboard-filters][data-layout="bar"]')
    if ((await bar.count()) === 0) {
      test.skip(true, "No rows; bar not rendered")
    }
    await expect(bar).toBeVisible({ timeout: 5_000 })
    const cpuTrigger = bar.locator('[data-facet-dropdown="CPU"]')
    await expect(cpuTrigger).toContainText(/^CPU$/)
    await cpuTrigger.click()
    const panel = cpuTrigger.locator("xpath=following-sibling::div[@role='menu']")
    await expect(panel).toBeVisible({ timeout: 3_000 })
    await panel.locator("button[aria-pressed]").first().click()
    await expect(cpuTrigger).toContainText("CPU (1)")
    await bar.locator("[data-reset-filters]").click()
    await expect(cpuTrigger).toContainText(/^CPU$/)
  })

  test("desktop: opening the CPU dropdown shows pressed chip for local selected value", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const bar = page.locator('[data-leaderboard-filters][data-layout="bar"]')
    if ((await bar.count()) === 0) {
      test.skip(true, "No rows; bar not rendered")
    }
    const cpuTrigger = bar.locator('[data-facet-dropdown="CPU"]')
    await expect(cpuTrigger).toBeVisible({ timeout: 5_000 })
    await cpuTrigger.click()
    const panel = cpuTrigger.locator("xpath=following-sibling::div[@role='menu']")
    await expect(panel).toBeVisible({ timeout: 3_000 })
    const chip = panel.locator("button[aria-pressed]").first()
    await chip.click()
    await expect(chip).toHaveAttribute("aria-pressed", "true")
  })

  test("desktop: price popover opens on click, contains a slider", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const trigger = page.locator('[data-price-popover-trigger]')
    if ((await trigger.count()) === 0) {
      test.skip(true, "No rows; bar not rendered")
    }
    await expect(trigger).toBeVisible({ timeout: 5_000 })
    await trigger.click()
    await expect(
      page.locator('[data-slot="slider-thumb"]').first(),
    ).toBeVisible({ timeout: 3_000 })
  })

  test("mobile @375: filter Sheet opens via floating button, contains the same component in vertical layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/tech/rankings/laptops")

    const sheetTrigger = page.locator('[data-mobile-filter-sheet-trigger]')
    if ((await sheetTrigger.count()) === 0) {
      test.skip(true, "No rows; sheet trigger not rendered")
    }
    await expect(sheetTrigger).toBeVisible({ timeout: 5_000 })
    await sheetTrigger.dispatchEvent("click")

    const verticalFilters = page.locator('[data-leaderboard-filters][data-layout="vertical"]')
    await expect(verticalFilters).toBeVisible({ timeout: 3_000 })
    // Vertical layout uses inline chip groups.
    for (const label of ["Year", "CPU", "RAM", "Storage", "Medal"]) {
      await expect(verticalFilters.locator(`[data-chip-group="${label}"]`)).toBeVisible()
    }
  })
})
