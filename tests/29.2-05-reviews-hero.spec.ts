import { test, expect } from "@playwright/test"

test.describe("29.2-05 — /tech/reviews TechHero", () => {
  test.setTimeout(30_000)

  test("TechHero renders with cyan tone and ALL REVIEWS eyebrow", async ({ page }) => {
    await page.goto("/tech/reviews")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "cyan")
    await expect(hero).toContainText("ALL REVIEWS")
  })

  test("h1 reads 'Reviews'", async ({ page }) => {
    await page.goto("/tech/reviews")
    await expect(
      page.getByRole("heading", { level: 1, name: /^Reviews$/i }),
    ).toBeVisible()
  })

  test("CTA 'Browse latest' links to #latest", async ({ page }) => {
    await page.goto("/tech/reviews")
    const hero = page.locator("[data-tech-hero]").first()
    const cta = hero.locator('a[href="#latest"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/Browse latest/i)
  })

  test("Subhead contains 'honest, data-driven, no sponsored rankings'", async ({ page }) => {
    await page.goto("/tech/reviews")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toContainText("honest, data-driven, no sponsored rankings")
  })

  test("#latest anchor is attached and content below the hero is present", async ({ page }) => {
    await page.goto("/tech/reviews")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })

    const latestAnchor = page.locator("#latest")
    await expect(latestAnchor).toBeAttached()

    // ReviewsFilterBar section is right below the hero
    const filterSection = page.locator('main > section').first()
    await expect(filterSection).toBeVisible({ timeout: 5_000 })
  })
})
