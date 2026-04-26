import { test, expect } from "@playwright/test"

test.describe("29.1-02 — About methodology hub + /tech/methodology redirect (D-02/D-03/D-21)", () => {
  test.setTimeout(30_000)

  test("about page renders all methodology anchors", async ({ page }) => {
    await page.goto("/tech/about")
    await expect(
      page.getByRole("heading", { level: 1, name: /^ABOUT$/i }),
    ).toBeVisible({ timeout: 5_000 })
    for (const id of [
      "story",
      "methodology",
      "bpr",
      "glitchmark",
      "disciplines",
      "thresholds",
      "exclusion-policy",
      "rubric-changelog",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1)
    }
  })

  test("glitchmark section explains the ×10 display convention", async ({ page }) => {
    await page.goto("/tech/about#glitchmark")
    await expect(page.locator("#glitchmark")).toBeVisible()
    await expect(page.locator("#glitchmark")).toContainText(
      /multiplied by 10 and rounded to the nearest integer/i,
    )
  })

  test("bare /tech/methodology redirects to /tech/about (no fragment)", async ({ page }) => {
    const response = await page.goto("/tech/methodology", {
      waitUntil: "domcontentloaded",
    })
    expect([200, 301, 308]).toContain(response?.status() ?? 0)
    await expect(page).toHaveURL(/\/tech\/about(?:\?|$)/)
    await expect(page.locator("#story")).toBeVisible()
  })

  test("/tech/methodology#bpr → /tech/about#bpr (fragment preserved)", async ({ page }) => {
    await page.goto("/tech/methodology#bpr", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/tech\/about#bpr$/)
    await expect(page.locator("#bpr")).toBeVisible()
  })

  test("/tech/methodology#disciplines → /tech/about#disciplines (fragment preserved)", async ({ page }) => {
    await page.goto("/tech/methodology#disciplines", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/tech\/about#disciplines$/)
    await expect(page.locator("#disciplines")).toBeVisible()
  })

  test("/tech/methodology#glitchmark → /tech/about#glitchmark (fragment preserved)", async ({ page }) => {
    await page.goto("/tech/methodology#glitchmark", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/tech\/about#glitchmark$/)
    await expect(page.locator("#glitchmark")).toBeVisible()
  })

  test("BPR medal links to /tech/about#bpr (sample assertion)", async ({ page }) => {
    await page.goto("/tech/categories/laptops/rankings")
    const aboutBprLinks = page.locator('a[href="/tech/about#bpr"]')
    await expect(aboutBprLinks.first()).toBeAttached({ timeout: 10_000 })
  })
})
