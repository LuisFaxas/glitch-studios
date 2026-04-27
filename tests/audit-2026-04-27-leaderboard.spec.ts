import { test, expect } from "@playwright/test"
const out = ".planning/audit-screenshots/2026-04-27"
test.describe.configure({ mode: "serial" })
const URL_BASE = process.env.PW_BASE_URL || "http://localhost:3004"
for (const [name, w, h] of [["desktop", 1440, 900], ["mobile", 390, 844]] as const) {
  test(`leaderboard ${name}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    const page = await ctx.newPage()
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
    page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`) })
    const res = await page.goto(`${URL_BASE}/tech/rankings/laptops`, { waitUntil: "networkidle", timeout: 30_000 })
    expect(res?.status()).toBe(200)
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${out}/leaderboard-${name}.png`, fullPage: true })
    expect.soft(errors, `console/page errors on ${name}`).toEqual([])
    await ctx.close()
  })
}
