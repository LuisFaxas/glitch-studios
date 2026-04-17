import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3004"

test.describe("Phase 07.4 Wave 1 — Primitive refactor smoke", () => {
  test("desktop / renders without error", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(String(err)))
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(BASE, { waitUntil: "domcontentloaded" })

    // Desktop sidebar (TileNav) nav items
    const sidebar = page.locator("aside").first()
    await expect(sidebar).toBeVisible({ timeout: 10000 })
    await expect(sidebar.getByText("Beats", { exact: true })).toBeVisible()
    await expect(sidebar.getByText("Services", { exact: true })).toBeVisible()

    expect(errors.filter((e) => !e.includes("favicon") && !e.includes("404")), `errors: ${errors.join(" | ")}`).toHaveLength(0)
  })

  test("mobile / renders bottom tab bar + FloatingCartButton at root", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE, { waitUntil: "domcontentloaded" })

    const tabBar = page.locator("nav[aria-label='Mobile navigation']")
    await expect(tabBar).toBeVisible({ timeout: 10000 })
    await expect(tabBar.getByText("Menu", { exact: true })).toBeVisible()

    // FloatingCartButton (now at root layout, md:hidden so visible on mobile)
    const cartBtn = page.locator('button[aria-label*="Shopping cart"]').last()
    await expect(cartBtn).toBeVisible()
  })

  test("mobile FloatingCartButton persists on /beats (cross-route)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE}/beats`, { waitUntil: "domcontentloaded" })

    const cartBtn = page.locator('button[aria-label*="Shopping cart"]').last()
    await expect(cartBtn).toBeVisible({ timeout: 10000 })
  })

  test("mobile menu overlay opens + contains overlay social links", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE, { waitUntil: "domcontentloaded" })

    await page.locator("button[aria-label='Open navigation menu']").click()

    const dialog = page.locator("[role='dialog'][aria-label='Navigation menu']")
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Dialog contains its own social links block (4 items)
    const dialogSocials = dialog.locator("a[aria-label='Instagram'], a[aria-label='YouTube'], a[aria-label='SoundCloud'], a[aria-label='X']")
    await expect(dialogSocials).toHaveCount(4)
  })
})
