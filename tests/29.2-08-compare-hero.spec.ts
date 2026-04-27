import { test, expect } from "@playwright/test"

test.describe("29.2-08 — /tech/compare TechHero", () => {
  test.setTimeout(30_000)

  test("TechHero renders with cyan tone and COMPARE eyebrow", async ({ page }) => {
    await page.goto("/tech/compare")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "cyan")
    await expect(hero).toContainText("COMPARE")
  })

  test("h1 reads 'Compare Devices'", async ({ page }) => {
    await page.goto("/tech/compare")
    await expect(
      page.getByRole("heading", { level: 1, name: /Compare Devices/i }),
    ).toBeVisible()
  })

  test("CTA 'Pick devices' links to #compare-picker", async ({ page }) => {
    await page.goto("/tech/compare")
    const hero = page.locator("[data-tech-hero]").first()
    const cta = hero.locator('a[href="#compare-picker"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/Pick devices/i)
  })

  test("Subhead contains 'Benchmark for benchmark, score for score'", async ({ page }) => {
    await page.goto("/tech/compare")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toContainText("Benchmark for benchmark, score for score")
  })

  test("ComparePageClient still renders below the hero", async ({ page }) => {
    await page.goto("/tech/compare")
    const innerMain = page.locator("main.min-h-screen.bg-black")
    await expect(innerMain).toBeVisible()
    await expect(page.locator("#compare-picker")).toBeAttached()
  })
})
