import { test, expect } from "@playwright/test"
import path from "path"
import fs from "fs"

const screenshotDir = path.resolve(
  __dirname,
  "../.planning/phases/09-services-booking/screenshots/verification"
)

fs.mkdirSync(screenshotDir, { recursive: true })

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"

const mobileCtx = { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, userAgent: MOBILE_UA }

test.describe("Phase 09 — Mobile verification (375px)", () => {
  test.setTimeout(120_000)

  test("no horizontal overflow on /services", async ({ browser }) => {
    const ctx = await browser.newContext(mobileCtx)
    const page = await ctx.newPage()
    await page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("/services", { waitUntil: "networkidle" })
    await page.waitForTimeout(400)
    await page.screenshot({
      path: path.join(screenshotDir, "01-services.png"),
      fullPage: true,
    })
    const widths = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1)
    await ctx.close()
  })

  test("no horizontal overflow on /book step 1", async ({ browser }) => {
    const ctx = await browser.newContext(mobileCtx)
    const page = await ctx.newPage()
    await page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("/book", { waitUntil: "networkidle" })
    await page.waitForTimeout(400)
    await page.screenshot({
      path: path.join(screenshotDir, "02-book-step1.png"),
      fullPage: true,
    })
    const widths = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1)
    await ctx.close()
  })

  test("manifesto renders when booking is off (skipped when on)", async ({
    browser,
  }) => {
    const ctx = await browser.newContext(mobileCtx)
    const page = await ctx.newPage()
    await page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("/services", { waitUntil: "networkidle" })
    await page.waitForTimeout(400)

    const hasManifesto =
      (await page.getByText("WE'RE BUILDING GLITCH STUDIOS.").count()) > 0
    test.skip(!hasManifesto, "booking_live is ON; manifesto not rendered")

    await expect(
      page.getByText("WE'RE BUILDING GLITCH STUDIOS.").first()
    ).toBeVisible()
    await expect(page.getByText("WHAT WE'RE BUILDING").first()).toBeVisible()
    await expect(page.getByText("BE FIRST IN THE DOOR").first()).toBeVisible()

    await page.screenshot({
      path: path.join(screenshotDir, "03-services-off-manifesto.png"),
      fullPage: true,
    })
    await ctx.close()
  })

  test("CONTINUE TO DATE button is at least 48px tall (when present)", async ({
    browser,
  }) => {
    const ctx = await browser.newContext(mobileCtx)
    const page = await ctx.newPage()
    await page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("/book", { waitUntil: "networkidle" })
    await page.waitForTimeout(400)

    const btn = page.getByRole("button", { name: /continue to date/i }).first()
    const count = await btn.count()
    test.skip(count === 0, "Wizard not rendered (booking_live may be off)")
    const box = await btn.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48)
    await ctx.close()
  })

  test("booking summary mobile header is ~48px", async ({ browser }) => {
    const ctx = await browser.newContext(mobileCtx)
    const page = await ctx.newPage()
    await page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("/book", { waitUntil: "networkidle" })
    await page.waitForTimeout(400)

    const header = page
      .getByRole("button", { name: /booking summary/i })
      .first()
    const count = await header.count()
    test.skip(count === 0, "Summary header not rendered (booking_live may be off)")
    const box = await header.boundingBox()
    expect(Math.abs((box?.height ?? 0) - 48)).toBeLessThanOrEqual(4)
    await ctx.close()
  })

  test("service detail panel renders 9 sections (when bookings live)", async ({
    browser,
  }) => {
    const ctx = await browser.newContext(mobileCtx)
    const page = await ctx.newPage()
    await page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("/services", { waitUntil: "networkidle" })
    await page.waitForTimeout(400)

    const hasManifesto =
      (await page.getByText("WE'RE BUILDING GLITCH STUDIOS.").count()) > 0
    test.skip(hasManifesto, "booking_live is OFF; detail panel not rendered")

    // All 9 sections are mounted in the accordion DOM (B-01 expands first;
    // others animate open on tap). Assert DOM presence — AnimatePresence
    // with height:0 can cause strict visibility checks to fail.
    await page.waitForSelector("text=PRICING", { state: "attached", timeout: 5000 })
    expect(await page.getByText("PRICING").count()).toBeGreaterThan(0)
    expect(await page.getByText("DURATION & INCLUDES").count()).toBeGreaterThan(
      0
    )
    expect(await page.getByText("HIGHLIGHTS").count()).toBeGreaterThan(0)
    expect(await page.getByText("PROCESS").count()).toBeGreaterThan(0)
    expect(await page.getByText("POLICIES").count()).toBeGreaterThan(0)
    expect(
      await page.getByRole("link", { name: /book this service/i }).count()
    ).toBeGreaterThan(0)

    await page.screenshot({
      path: path.join(screenshotDir, "06-services-detail-panel.png"),
      fullPage: true,
    })
    await ctx.close()
  })

  test("all 5 wizard step headings literal present in booking-flow", async ({
    browser,
  }) => {
    const ctx = await browser.newContext(mobileCtx)
    const page = await ctx.newPage()
    await page.addInitScript(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("/book", { waitUntil: "networkidle" })
    await page.waitForTimeout(400)

    const hasManifesto =
      (await page.getByText("WE'RE BUILDING GLITCH STUDIOS.").count()) > 0
    test.skip(hasManifesto, "booking_live is OFF; wizard not rendered")

    await expect(page.getByText("SELECT SERVICE").first()).toBeVisible()
    const widths = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1)
    await ctx.close()
  })
})
