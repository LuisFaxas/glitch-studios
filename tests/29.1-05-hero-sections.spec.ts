import { test, expect } from "@playwright/test"

test.describe("29.1-05 — TechHero per surface (D-08/D-09/D-10/D-11)", () => {
  test.setTimeout(30_000)

  test("/tech/rankings hub hero — RANKINGS / Rankings / Read methodology / cyan", async ({ page }) => {
    await page.goto("/tech/rankings")
    const hero = page.locator('[data-tech-hero]').first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "cyan")
    await expect(hero).toContainText("RANKINGS")
    await expect(
      page.getByRole("heading", { level: 1, name: /^Rankings$/i }),
    ).toBeVisible()
    const cta = hero.locator('a[href="/tech/about#methodology"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/Read methodology/i)
  })

  test("/tech/rankings/laptops leaderboard hero — RANKINGS / Laptops Rankings / Read methodology / cyan", async ({ page }) => {
    await page.goto("/tech/rankings/laptops")
    const hero = page.locator('[data-tech-hero]').first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "cyan")
    await expect(
      page.getByRole("heading", { level: 1, name: /Laptops Rankings/i }),
    ).toBeVisible()
    const cta = hero.locator('a[href="/tech/about#methodology"]')
    await expect(cta).toBeVisible()
  })

  test("/tech/categories/laptops hero — CATEGORY / Laptops / View Rankings / amber", async ({ page }) => {
    await page.goto("/tech/categories/laptops")
    const hero = page.locator('[data-tech-hero]').first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "amber")
    await expect(hero).toContainText("CATEGORY")
    await expect(
      page.getByRole("heading", { level: 1, name: /^Laptops$/i }),
    ).toBeVisible()
    const cta = hero.locator('a[href="/tech/rankings/laptops"]').first()
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/View Rankings/i)
  })

  test("hero h1 has NO auto-running animation (hover-only glitch rule)", async ({ page }) => {
    await page.goto("/tech/rankings")
    const h1 = page.getByRole("heading", { level: 1, name: /^Rankings$/i })
    await expect(h1).toBeVisible()
    const sample1 = await h1.evaluate((el) => getComputedStyle(el).animationName)
    await page.waitForTimeout(500)
    const sample2 = await h1.evaluate((el) => getComputedStyle(el).animationName)
    expect(sample1).toBe(sample2)
    expect(sample1).toBe("none")
  })
})
