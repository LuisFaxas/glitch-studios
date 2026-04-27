import { test, expect } from "@playwright/test"

test.describe("29.2-09 — /tech/benchmarks TechHero", () => {
  test.setTimeout(30_000)

  test("TechHero renders with cyan tone and BENCHMARKS eyebrow", async ({ page }) => {
    await page.goto("/tech/benchmarks")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "cyan")
    await expect(hero).toContainText("BENCHMARKS")
  })

  test("h1 reads 'Benchmarks'", async ({ page }) => {
    await page.goto("/tech/benchmarks")
    await expect(
      page.getByRole("heading", { level: 1, name: /^Benchmarks$/i }),
    ).toBeVisible()
  })

  test("CTA 'Read methodology' links to /tech/about#methodology", async ({ page }) => {
    await page.goto("/tech/benchmarks")
    const hero = page.locator("[data-tech-hero]").first()
    const cta = hero.locator('a[href="/tech/about#methodology"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/Read methodology/i)
  })

  test("Subhead contains 'every benchmark measures and why it matters'", async ({ page }) => {
    await page.goto("/tech/benchmarks")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toContainText("each benchmark measures and why it matters")
  })

  test("Empty-state body text still renders below the hero", async ({ page }) => {
    await page.goto("/tech/benchmarks")
    await expect(page.getByText("No benchmarks published yet")).toBeVisible({ timeout: 5_000 })
  })
})
