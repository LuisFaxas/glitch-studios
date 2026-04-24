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

test.describe("25-01 Admin context switcher perf", () => {
  test("Studios -> Tech switch completes under 1500ms (dev)", async ({
    page,
  }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" })

    const start = Date.now()
    await page
      .getByRole("tab", { name: /^Tech$/i })
      .click()
    await page.waitForURL(new RegExp(`${BASE_URL}/admin/tech$`), {
      timeout: 5_000,
    })
    await page.waitForLoadState("domcontentloaded")
    const elapsed = Date.now() - start

    console.log(`[25-01] Studios -> Tech elapsed: ${elapsed}ms`)
    expect(elapsed).toBeLessThan(1500)
  })

  test("Tech -> Studios switch completes under 1500ms (dev)", async ({
    page,
  }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech`, { waitUntil: "networkidle" })

    const start = Date.now()
    await page
      .getByRole("tab", { name: /^Studios$/i })
      .click()
    await page.waitForURL(`${BASE_URL}/admin`, { timeout: 5_000 })
    await page.waitForLoadState("domcontentloaded")
    const elapsed = Date.now() - start

    console.log(`[25-01] Tech -> Studios elapsed: ${elapsed}ms`)
    expect(elapsed).toBeLessThan(1500)
  })
})
