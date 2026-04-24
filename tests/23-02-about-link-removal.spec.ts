import { test, expect, devices } from "@playwright/test"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"

test.describe("23-02 About link removal", () => {
  test("No 'About' link exists in GlitchTech nav (desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE_URL}/tech`, { waitUntil: "domcontentloaded" })
    await expect(
      page.getByRole("link", { name: /^about$/i }),
    ).toHaveCount(0)
  })

  test("No 'About' link in mobile tech overlay menu", async ({ browser }) => {
    const ctx = await browser.newContext({
      ...devices["iPhone 13"],
      viewport: { width: 375, height: 812 },
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE_URL}/tech`, { waitUntil: "domcontentloaded" })
    // Try to open mobile menu if present — use a permissive locator that
    // accommodates either a hamburger or overlay trigger.
    const menuBtn = page.getByRole("button", { name: /menu|open/i }).first()
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click()
    }
    await expect(
      page.getByRole("link", { name: /^about$/i }),
    ).toHaveCount(0)
    await ctx.close()
  })

  test("/tech/blog has no /tech/about anchor and links to methodology", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/tech/blog`, { waitUntil: "domcontentloaded" })
    await expect(page.locator('a[href="/tech/about"]')).toHaveCount(0)
    await expect(page.locator('a[href="/tech/methodology"]')).toHaveCount(1)
  })

  test("/tech/benchmarks has no /tech/about anchor and links to methodology", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/tech/benchmarks`, {
      waitUntil: "domcontentloaded",
    })
    await expect(page.locator('a[href="/tech/about"]')).toHaveCount(0)
    await expect(page.locator('a[href="/tech/methodology"]')).toHaveCount(1)
  })

  test("Studios routes have no /about link (guardrail)", async ({ page }) => {
    for (const path of ["/", "/beats", "/services"]) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" })
      await expect(page.locator('a[href="/about"]')).toHaveCount(0)
    }
  })
})
