import { test, expect } from "@playwright/test"

test.describe("29.2-10 — /tech/blog TechHero + empty-state", () => {
  test.setTimeout(30_000)

  test("TechHero renders with amber tone and GLITCHTECH BLOG eyebrow", async ({ page }) => {
    await page.goto("/tech/blog")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "amber")
    await expect(hero).toContainText("GLITCHTECH BLOG")
  })

  test("h1 reads 'Blog'", async ({ page }) => {
    await page.goto("/tech/blog")
    await expect(
      page.getByRole("heading", { level: 1, name: /^Blog$/i }),
    ).toBeVisible()
  })

  test("CTA 'Read latest' links to #latest", async ({ page }) => {
    await page.goto("/tech/blog")
    const hero = page.locator("[data-tech-hero]").first()
    const cta = hero.locator('a[href="#latest"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/Read latest/i)
  })

  test("Subhead contains 'Hardware deep-dives, benchmark breakdowns'", async ({ page }) => {
    await page.goto("/tech/blog")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toContainText("Hardware deep-dives, benchmark breakdowns")
  })

  test("Empty-state section renders: 'No posts yet' heading", async ({ page }) => {
    await page.goto("/tech/blog")
    await expect(page.getByText("No posts yet")).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("GlitchTech posts are in draft")).toBeVisible()
  })
})

// Phase 29.2 smoke test — all 6 tech surfaces now have TechHero
test.describe("29.2 phase smoke — all /tech/* surfaces have TechHero", () => {
  test.setTimeout(60_000)

  const surfaces: Array<{ path: string; tone: string; eyebrow: string }> = [
    { path: "/tech/about",      tone: "amber", eyebrow: "METHODOLOGY HUB" },
    { path: "/tech/reviews",    tone: "cyan",  eyebrow: "ALL REVIEWS" },
    { path: "/tech/categories", tone: "amber", eyebrow: "CATEGORIES" },
    { path: "/tech/compare",    tone: "cyan",  eyebrow: "COMPARE" },
    { path: "/tech/benchmarks", tone: "cyan",  eyebrow: "BENCHMARKS" },
    { path: "/tech/blog",       tone: "amber", eyebrow: "GLITCHTECH BLOG" },
  ]

  for (const { path, tone, eyebrow } of surfaces) {
    test(`${path} renders TechHero with tone=${tone}`, async ({ page }) => {
      await page.goto(path)
      const hero = page.locator("[data-tech-hero]").first()
      await expect(hero).toBeVisible({ timeout: 8_000 })
      await expect(hero).toHaveAttribute("data-tone", tone)
      await expect(hero).toContainText(eyebrow)
      const h1Count = await page.getByRole("heading", { level: 1 }).count()
      expect(h1Count).toBe(1)
    })
  }
})
