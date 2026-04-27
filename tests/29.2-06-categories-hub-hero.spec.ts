import { test, expect } from "@playwright/test"

test.describe("29.2-06 — /tech/categories hub TechHero", () => {
  test.setTimeout(30_000)

  test("TechHero renders with amber tone and CATEGORIES eyebrow", async ({ page }) => {
    await page.goto("/tech/categories")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "amber")
    await expect(hero).toContainText("CATEGORIES")
  })

  test("h1 reads 'Categories'", async ({ page }) => {
    await page.goto("/tech/categories")
    await expect(
      page.getByRole("heading", { level: 1, name: /^Categories$/i }),
    ).toBeVisible()
  })

  test("CTA 'View rankings' links to /tech/rankings", async ({ page }) => {
    await page.goto("/tech/categories")
    const hero = page.locator("[data-tech-hero]").first()
    const cta = hero.locator('a[href="/tech/rankings"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/View rankings/i)
  })

  test("Subhead contains 'Drill in to see rankings, specs, and scores'", async ({ page }) => {
    await page.goto("/tech/categories")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toContainText("Drill in to see rankings, specs, and scores")
  })

  test("CategoryTile grid still renders below the hero", async ({ page }) => {
    await page.goto("/tech/categories")
    const innerMain = page.locator("main.min-h-screen.bg-black")
    await expect(innerMain).toBeVisible()
    await expect(innerMain.locator("section").last()).toBeVisible({ timeout: 5_000 })
  })
})
