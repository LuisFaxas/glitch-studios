import { test, expect } from "@playwright/test"

test.describe("29.2-03 — /tech/about discipline cards grid", () => {
  test.setTimeout(30_000)

  test("disciplines section renders as cards (not table)", async ({ page }) => {
    await page.goto("/tech/about")
    const section = page.locator("#disciplines")
    await expect(section).toBeVisible({ timeout: 5_000 })

    await expect(section.locator("table")).not.toBeVisible()

    const cards = section.locator("div.group")
    await expect(cards).toHaveCount(13)
  })

  test("7 BPR ELIGIBLE badges are present", async ({ page }) => {
    await page.goto("/tech/about")
    const section = page.locator("#disciplines")
    await expect(section).toBeVisible({ timeout: 5_000 })

    const badges = section.getByText("BPR ELIGIBLE")
    await expect(badges).toHaveCount(7)
  })

  test("BPR-eligible discipline names are present as card headings", async ({ page }) => {
    await page.goto("/tech/about")
    const section = page.locator("#disciplines")
    await expect(section).toBeVisible()

    for (const name of ["CPU", "GPU", "LLM", "Video", "Dev", "Python", "Games"]) {
      await expect(section.getByText(name, { exact: false }).first()).toBeVisible()
    }
  })

  test("Non-eligible disciplines appear without BPR badge", async ({ page }) => {
    await page.goto("/tech/about")
    const section = page.locator("#disciplines")
    await expect(section).toBeVisible()

    await expect(section.getByText("Memory", { exact: false }).first()).toBeVisible()
    const badges = section.getByText("BPR ELIGIBLE")
    await expect(badges).toHaveCount(7)
  })

  test("#disciplines anchor still works from jump nav", async ({ page }) => {
    await page.goto("/tech/about")
    await page.getByRole("link", { name: "Disciplines" }).click()
    const section = page.locator("#disciplines")
    await expect(section).toBeInViewport({ timeout: 3_000 })
  })
})
