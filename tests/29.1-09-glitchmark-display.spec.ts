import { test, expect } from "@playwright/test"

test.describe("29.1-09 — GlitchMark display in custom rankings rows", () => {
  test.setTimeout(30_000)

  test("desktop @1440: custom display shows 1000 / 1425 / 842 / dash states", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(display).toBeVisible({ timeout: 5_000 })
    await expect(display).toContainText("1000")
    await expect(display).toContainText("1425")
    await expect(display).toContainText("842")
    await expect(display).toContainText("-")
    await expect(display).not.toContainText("100.00")
    await expect(display).not.toContainText("142.50")
  })

  test("mobile @375: custom display preserves GlitchMark scale", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/tech/rankings/laptops")
    const display = page.locator("[data-leaderboard-display]")
    if ((await display.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    await expect(display).toBeVisible({ timeout: 5_000 })
    await expect(display).toContainText("1000")
    await expect(display).toContainText("1425")
    await expect(display).toContainText("842")
    await expect(display).not.toContainText("142.50")
    await expect(display).not.toContainText("100.00")
  })

  test("default server order remains GlitchMark descending regardless of display format", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/tech/rankings/laptops")
    const rows = page.locator("[data-leaderboard-row]")
    if ((await rows.count()) === 0) {
      test.skip(true, "No rows; custom display not rendered")
    }
    const rowTexts = await rows.evaluateAll((els) =>
      els.map((el) => el.textContent ?? ""),
    )
    const indexOf = (needle: string) =>
      rowTexts.findIndex((text) => text.includes(needle))
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
