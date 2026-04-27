import { test, expect } from "@playwright/test"

/**
 * 29.2-01 — TechHero size variants
 * Asserts that the default size renders at the correct pixel height on the
 * existing /tech/rankings + /tech/rankings/laptops surfaces (regression check
 * after adding the size prop). Compact (200px) is verified by code-presence +
 * TypeScript narrowing only — no live page uses it yet. Tall (400px) gets its
 * rendered assertion in 29.2-02's spec when /tech/about mounts a tall hero.
 */
test.describe("29.2-01 — TechHero size variants (no-regression + attribute check)", () => {
  test.setTimeout(30_000)

  test("default size: /tech/rankings hero renders at 280px", async ({ page }) => {
    await page.goto("/tech/rankings")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })

    const innerDiv = hero.locator("div").first()
    const height = await innerDiv.evaluate((el) => (el as HTMLElement).offsetHeight)
    expect(height).toBeGreaterThanOrEqual(280)
    expect(height).toBeLessThan(300)
  })

  test("default size: /tech/rankings/laptops hero renders at 280px", async ({ page }) => {
    await page.goto("/tech/rankings/laptops")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    const innerDiv = hero.locator("div").first()
    const height = await innerDiv.evaluate((el) => (el as HTMLElement).offsetHeight)
    expect(height).toBeGreaterThanOrEqual(280)
    expect(height).toBeLessThan(300)
  })

  test("data-tech-hero and data-tone attributes still present after size prop addition", async ({ page }) => {
    await page.goto("/tech/rankings")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "cyan")
  })

  test("no auto-running animation on hero h1 (regression check)", async ({ page }) => {
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
