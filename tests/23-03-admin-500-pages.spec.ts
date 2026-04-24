import { test, expect, type Page } from "@playwright/test"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"

async function loginAsAdmin(page: Page): Promise<boolean> {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return false
  try {
    const res = await page.request.post(`${BASE_URL}/api/auth/sign-in/email`, {
      data: { email, password },
    })
    return res.ok()
  } catch {
    return false
  }
}

test.describe("23-03 Admin 500-page regressions", () => {
  test("owner can load /admin/clients (no 500)", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    const res = await page.goto(`${BASE_URL}/admin/clients`, {
      waitUntil: "domcontentloaded",
    })
    expect(res?.status()).toBeLessThan(400)
    await expect(
      page.getByRole("heading", { name: /clients/i }).first(),
    ).toBeVisible()
    await expect(
      page.getByText(/application error|page could.?n.?t load/i),
    ).toHaveCount(0)
  })

  test("owner can load /admin/roles (no 500)", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    const res = await page.goto(`${BASE_URL}/admin/roles`, {
      waitUntil: "domcontentloaded",
    })
    expect(res?.status()).toBeLessThan(400)
    await expect(
      page.getByRole("heading", { name: /roles/i }).first(),
    ).toBeVisible()
  })

  test("unauthenticated /admin/clients does NOT 500", async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const res = await page.goto(`${BASE_URL}/admin/clients`, {
      waitUntil: "domcontentloaded",
    })
    expect(res?.status()).toBeLessThan(500)
    await ctx.close()
  })

  test("unauthenticated /admin/roles does NOT 500", async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const res = await page.goto(`${BASE_URL}/admin/roles`, {
      waitUntil: "domcontentloaded",
    })
    expect(res?.status()).toBeLessThan(500)
    await ctx.close()
  })
})
