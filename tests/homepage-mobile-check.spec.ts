import { test } from "@playwright/test"
import path from "path"

const screenshotDir = path.resolve(__dirname, "../.planning/phases/07.2-mobile-experience-overhaul/screenshots")

test("homepage mobile 375", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.addInitScript(() => { sessionStorage.setItem("glitch-splash-seen", "true") })
  await page.goto("http://localhost:3004", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(screenshotDir, "home-375-current-full.png"), fullPage: true })
  await page.screenshot({ path: path.join(screenshotDir, "home-375-current-viewport.png") })
  await ctx.close()
})
