import { test, expect } from "@playwright/test"

test.describe("29.1-09 — GlitchMark ×10 display (D-19/D-20/D-21/D-22)", () => {
  test.setTimeout(30_000)

  test("desktop @1440: leaderboard table shows 1000 / 1425 / 842 / —", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const table = page.locator('[data-leaderboard-table] table')
    if ((await table.count()) === 0) {
      test.skip(true, "No rows; table not rendered")
    }
    await expect(table).toBeVisible({ timeout: 5_000 })
    // Reference baseline (MBP M3) renders as 1000.
    await expect(table).toContainText("1000")
    // ROG Strix placeholder (142.50) renders as 1425.
    await expect(table).toContainText("1425")
    // ThinkPad X1 (84.20) renders as 842.
    await expect(table).toContainText("842")
    // null score renders as em-dash via DashCell.
    await expect(table).toContainText("—")
    // Old base-100 reading must NOT appear: stored 100.00 should never render
    // as "100.00" anywhere in the table cells.
    await expect(table).not.toContainText("100.00")
    await expect(table).not.toContainText("142.50")
  })

  test("mobile @375 cards: hero number renders as 1000 / 1425 / 842 / —", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/tech/rankings/laptops")
    // Cards is the default mobile view.
    const cardsContainer = page.locator(".md\\:hidden")
    await expect(cardsContainer.first()).toBeVisible({ timeout: 5_000 })
    // Spot-check the rendered values.
    await expect(page.locator("body")).toContainText("1000")
    await expect(page.locator("body")).toContainText("1425")
    await expect(page.locator("body")).toContainText("842")
    // Old readings should NOT appear in mobile cards either.
    await expect(page.locator("body")).not.toContainText("142.50")
    await expect(page.locator("body")).not.toContainText("100.00")
  })

  test("desktop sort by GlitchMark column DESC keeps the same order regardless of display format", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const table = page.locator('[data-leaderboard-table] table')
    if ((await table.count()) === 0) {
      test.skip(true, "No rows; table not rendered")
    }
    await expect(table).toBeVisible({ timeout: 5_000 })
    // Read all rendered glitchmark cells in order. Default sort is glitchmark
    // DESC (Phase 29 default).
    const cellTexts = await table
      .locator("tbody tr")
      .evaluateAll((rows) => rows.map((r) => r.textContent ?? ""))
    // Find the indices of the seed values; ROG Strix (1425) should appear
    // before MBP M3 (1000), MBP M3 before XPS (924), etc. Acer (—) goes last.
    const indexOf = (needle: string) =>
      cellTexts.findIndex((t) => t.includes(needle))
    const rog = indexOf("1425")
    const fw = indexOf("1188")
    const mbp = indexOf("1000")
    const xps = indexOf("924")
    const tp = indexOf("842")
    expect(rog).toBeGreaterThanOrEqual(0)
    expect(fw).toBeGreaterThan(rog)
    expect(mbp).toBeGreaterThan(fw)
    expect(xps).toBeGreaterThan(mbp)
    expect(tp).toBeGreaterThan(xps)
  })
})
