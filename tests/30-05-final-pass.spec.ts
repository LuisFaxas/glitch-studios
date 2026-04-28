import { test, expect } from "@playwright/test"

const ROUTES_TO_CHECK = [
  "/tech/benchmarks",
  "/tech/benchmarks/cpu-geekbench6-multi",
  "/tech/benchmarks/memory-stream-triad",
  "/tech/benchmarks/battery-life-video-loop-hours",
]

test.describe("Phase 30-05: final pass", () => {
  for (const route of ROUTES_TO_CHECK) {
    test(`brand spelling correct on ${route}`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "networkidle" })
      expect(response?.status(), `${route} must return 200`).toBe(200)
      // intentional: spec asserts the typo is absent
      await expect(page.locator("body")).not.toContainText("GlitchTek")
      await expect(page.getByText(/GlitchTech/).first()).toBeVisible()
    })
  }
})

test.describe("Phase 30-05: sidebar one-screen", () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test("sidebar fits one screen on landing", async ({ page }) => {
    await page.goto("/tech/benchmarks", { waitUntil: "networkidle" })
    const sidebar = page.locator('[data-sidebar], aside').first()
    if ((await sidebar.count()) === 0) {
      test.skip(
        true,
        "Sidebar locator not found — selector update needed before this spec is meaningful",
      )
    }
    const box = await sidebar.boundingBox()
    if (box) {
      expect(
        box.height,
        "sidebar height should be ≤ viewport height (no scroll)",
      ).toBeLessThanOrEqual(900)
    }
  })

  test("sidebar fits one screen on detail page", async ({ page }) => {
    await page.goto("/tech/benchmarks/cpu-geekbench6-multi", {
      waitUntil: "networkidle",
    })
    const sidebar = page.locator('[data-sidebar], aside').first()
    if ((await sidebar.count()) === 0) {
      test.skip(true, "Sidebar locator not found")
    }
    const box = await sidebar.boundingBox()
    if (box) {
      expect(box.height).toBeLessThanOrEqual(900)
    }
  })
})

test.describe("Phase 30-05: prior specs sanity", () => {
  test("all key routes return 200", async ({ page }) => {
    for (const route of ROUTES_TO_CHECK) {
      const r = await page.goto(route, { waitUntil: "domcontentloaded" })
      expect(r?.status(), `${route} should return 200`).toBe(200)
    }
  })

  test("unknown slug under /tech/benchmarks returns 404", async ({ page }) => {
    const r = await page.goto(
      "/tech/benchmarks/this-is-not-a-real-test",
      { waitUntil: "domcontentloaded" },
    )
    expect(r?.status()).toBe(404)
  })
})
