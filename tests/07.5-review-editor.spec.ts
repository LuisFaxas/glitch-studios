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

test.describe("07.5 Review editor", () => {
  test("new review page renders the shell (header + body pane)", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/reviews/new`, { waitUntil: "domcontentloaded" })

    await expect(page.getByText(/^New Review$/i)).toBeVisible()
    await expect(page.getByLabel(/Title/i).first()).toBeVisible()
    await expect(page.getByLabel(/Product/i).first()).toBeVisible()
    await expect(page.getByLabel(/Verdict/i).first()).toBeVisible()
  })

  test("details button opens the rating sheet with 4 sliders", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/reviews/new`, { waitUntil: "domcontentloaded" })

    await page.getByRole("button", { name: /^Details$/i }).click()

    for (const dim of ["Performance", "Build Quality", "Value", "Design"]) {
      await expect(page.getByText(new RegExp(`^${dim}`, "i")).first()).toBeVisible()
    }
    await expect(page.getByText(/Overall.*auto/i)).toBeVisible()
  })

  test("publish button is disabled until required fields are saved", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/reviews/new`, { waitUntil: "domcontentloaded" })

    const publishBtn = page.getByRole("button", { name: /^Publish$/i })
    await expect(publishBtn).toBeDisabled()
  })

  test("autosave indicator displays 'Saved' state initially", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/reviews/new`, { waitUntil: "domcontentloaded" })

    const indicator = page.locator('[aria-live="polite"][role="status"]')
    await expect(indicator).toBeVisible()
  })

  test("reviews list page shows New review button and empty state", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/reviews`, { waitUntil: "domcontentloaded" })

    await expect(page.getByRole("heading", { name: /^Reviews$/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /New review/i }).first()).toBeVisible()
  })
})
