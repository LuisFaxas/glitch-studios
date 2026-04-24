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

test.describe("23-01 Admin homepage editor reachability", () => {
  test("Sidebar 'Homepage' link targets /admin/settings/homepage and navigates without 404", async ({
    page,
  }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded" })

    const link = page
      .locator("aside")
      .getByRole("link", { name: /^Homepage$/i })
      .first()
    await expect(link).toHaveAttribute("href", "/admin/settings/homepage")

    await link.click()
    await expect(page).toHaveURL(/\/admin\/settings\/homepage$/)
    await expect(
      page.getByRole("heading", { name: /homepage/i }).first(),
    ).toBeVisible()
  })

  test("Quick Action 'Homepage' tile exists on /admin and links to editor", async ({
    page,
  }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded" })

    const tile = page.getByTestId("quick-action-homepage")
    await expect(tile).toBeVisible()
    await expect(tile).toHaveAttribute("href", "/admin/settings/homepage")
  })

  test("On /admin/settings/homepage, only Homepage sidebar row is active (not Site Settings)", async ({
    page,
  }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/settings/homepage`, {
      waitUntil: "domcontentloaded",
    })

    const aside = page.locator("aside").last()
    const homepageRow = aside
      .getByRole("link", { name: /^Homepage$/i })
      .first()
    const settingsRow = aside
      .getByRole("link", { name: /^Site Settings$/i })
      .first()

    // Active state is indicated via the bg-[#f5f5f0] + text-[#000000] classes in admin-sidebar.tsx.
    // Assert background color is the active cream rather than the inactive near-black.
    await expect(homepageRow).toHaveClass(/bg-\[#f5f5f0\]/)
    await expect(settingsRow).not.toHaveClass(/bg-\[#f5f5f0\]/)
  })
})
