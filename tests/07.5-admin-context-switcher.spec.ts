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

test.describe("07.5 Admin context switcher", () => {
  test("renders both pills and Studios is active on /admin", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded" })

    const studiosPill = page.getByRole("tab", { name: /^Studios$/i })
    const techPill = page.getByRole("tab", { name: /^Tech$/i })
    await expect(studiosPill).toBeVisible()
    await expect(techPill).toBeVisible()
    await expect(studiosPill).toHaveAttribute("aria-selected", "true")
    await expect(techPill).toHaveAttribute("aria-selected", "false")
  })

  test("clicking Tech pill navigates to /admin/tech and flips active state", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded" })

    await page.getByRole("tab", { name: /^Tech$/i }).click()
    await page.waitForURL(`${BASE_URL}/admin/tech`)

    const studiosPill = page.getByRole("tab", { name: /^Studios$/i })
    const techPill = page.getByRole("tab", { name: /^Tech$/i })
    await expect(techPill).toHaveAttribute("aria-selected", "true")
    await expect(studiosPill).toHaveAttribute("aria-selected", "false")

    await expect(page.getByRole("heading", { name: /Tech Dashboard/i })).toBeVisible()
  })

  test("Tech-mode sidebar shows Products / Reviews / Categories / Benchmarks", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech`, { waitUntil: "domcontentloaded" })

    for (const label of ["Products", "Reviews", "Categories", "Benchmarks"]) {
      await expect(page.locator("aside").getByRole("link", { name: new RegExp(label, "i") }).first()).toBeVisible()
    }
  })

  test("Shared items visible in BOTH modes", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")

    for (const pathname of ["/admin", "/admin/tech"]) {
      await page.goto(`${BASE_URL}${pathname}`, { waitUntil: "domcontentloaded" })
      for (const label of ["Media Library", "Site Settings"]) {
        await expect(
          page.locator("aside").getByRole("link", { name: new RegExp(label, "i") }).first(),
        ).toBeVisible()
      }
    }
  })
})
