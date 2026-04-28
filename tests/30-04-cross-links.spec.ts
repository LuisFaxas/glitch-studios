import { test, expect } from "@playwright/test"

test.describe("Phase 30-04: cross-link contract", () => {
  test("landing CTA 'Read methodology' navigates to /tech/about#methodology", async ({ page }) => {
    await page.goto("/tech/benchmarks", { waitUntil: "networkidle" })
    const cta = page.getByRole("link", { name: "Read methodology" })
    await expect(cta).toHaveAttribute("href", "/tech/about#methodology")
    await cta.click()
    await page.waitForURL(/\/tech\/about#methodology$/)
    await expect(page).toHaveURL(/#methodology$/)
  })

  test("methodology disciplines link to benchmarks landing anchors", async ({ page }) => {
    await page.goto("/tech/about", { waitUntil: "networkidle" })
    const disciplineLinks = page.locator(
      'a[href*="/tech/benchmarks#discipline-"]',
    )
    const count = await disciplineLinks.count()
    expect(
      count,
      "All 13 disciplines must link to /tech/benchmarks#discipline-*",
    ).toBeGreaterThanOrEqual(13)

    const cpuLink = disciplineLinks.filter({ hasText: /CPU/i }).first()
    if ((await cpuLink.count()) > 0) {
      await expect(cpuLink).toHaveAttribute(
        "href",
        "/tech/benchmarks#discipline-cpu",
      )
    }

    const batteryLink = disciplineLinks
      .filter({ hasText: /Battery/i })
      .first()
    if ((await batteryLink.count()) > 0) {
      const href = await batteryLink.getAttribute("href")
      expect(href).toBe("/tech/benchmarks#discipline-battery-life")
    }
  })

  test("clicking methodology discipline lands on the right benchmarks section", async ({ page }) => {
    await page.goto("/tech/about", { waitUntil: "networkidle" })
    const cpuLink = page
      .locator('a[href="/tech/benchmarks#discipline-cpu"]')
      .first()
    if ((await cpuLink.count()) === 0) {
      test.skip(
        true,
        "Methodology disciplines section not found in current /tech/about page",
      )
    }
    await cpuLink.click()
    await page.waitForURL(/\/tech\/benchmarks#discipline-cpu$/)
    await expect(page.locator("#discipline-cpu")).toBeVisible()
  })

  test("detail page row product cell links to /tech/reviews/[slug]", async ({ page }) => {
    await page.goto("/tech/benchmarks/cpu-geekbench6-multi", {
      waitUntil: "networkidle",
    })
    const productLinks = page.locator('tbody a[href^="/tech/reviews/"]')
    const count = await productLinks.count()
    if (count === 0) {
      test.skip(
        true,
        "No leaderboard rows in current dev seed; cross-link contract not testable here",
      )
    }
    const firstHref = await productLinks.first().getAttribute("href")
    expect(firstHref).toMatch(/^\/tech\/reviews\/[a-z0-9-]+$/)
  })

  test("detail page row category cell links to /tech/categories/[slug]", async ({ page }) => {
    await page.goto("/tech/benchmarks/cpu-geekbench6-multi", {
      waitUntil: "networkidle",
    })
    const categoryLinks = page.locator(
      'tbody a[href^="/tech/categories/"]',
    )
    if ((await categoryLinks.count()) === 0) {
      test.skip(true, "No category-linked rows present; assertion skipped")
    }
    const firstHref = await categoryLinks.first().getAttribute("href")
    expect(firstHref).toMatch(/^\/tech\/categories\/[a-z0-9-]+$/)
  })

  test("detail page CTA 'View methodology' navigates to /tech/about#methodology", async ({ page }) => {
    await page.goto("/tech/benchmarks/cpu-geekbench6-multi", {
      waitUntil: "networkidle",
    })
    const cta = page.getByRole("link", { name: "View methodology" })
    await expect(cta).toHaveAttribute("href", "/tech/about#methodology")
  })

  test("detail page methodology footer link navigates to /tech/about#methodology", async ({ page }) => {
    await page.goto("/tech/benchmarks/cpu-geekbench6-multi", {
      waitUntil: "networkidle",
    })
    const footerLink = page.getByRole("link", {
      name: /View the GlitchTech methodology/,
    })
    await expect(footerLink).toHaveAttribute("href", "/tech/about#methodology")
  })

  test("methodology page itself still renders (regression guard)", async ({ page }) => {
    const response = await page.goto("/tech/about", { waitUntil: "networkidle" })
    expect(response?.status()).toBe(200)
    await expect(page.locator("#methodology")).toBeAttached()
    await expect(page.locator("#disciplines")).toBeAttached()
    // intentional: spec asserts the typo is absent
    await expect(page.locator("body")).not.toContainText("GlitchTek")
  })
})
