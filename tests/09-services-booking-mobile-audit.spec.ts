import { test, type Page, type BrowserContext } from "@playwright/test"
import path from "path"
import fs from "fs"

const screenshotDir = path.resolve(
  __dirname,
  "../.planning/phases/09-services-booking/screenshots/audit"
)

fs.mkdirSync(screenshotDir, { recursive: true })

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

async function mobileContext(browser: any): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    userAgent: MOBILE_UA,
  })
}

async function skipSplash(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("glitch-splash-seen", "true")
  })
}

async function logOverflowAndTapTargets(page: Page, name: string) {
  // OVERFLOW audit
  const widths = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  if (widths.scrollWidth > widths.clientWidth + 1) {
    console.log(
      `[OVERFLOW] ${name}: scrollWidth=${widths.scrollWidth} clientWidth=${widths.clientWidth}`
    )
    // Second screenshot showing overflow at right edge
    await page.evaluate(() =>
      window.scrollTo(document.documentElement.scrollWidth, 0)
    )
    await page.screenshot({
      path: path.join(screenshotDir, `${name}-overflow.png`),
      fullPage: true,
    })
    await page.evaluate(() => window.scrollTo(0, 0))
  }

  // TAP-TARGET audit (buttons + links in viewport) — threshold 48px
  const small = await page.evaluate(() => {
    const results: { tag: string; h: number; w: number; text: string }[] = []
    const els = Array.from(
      document.querySelectorAll("button, a")
    ) as HTMLElement[]
    for (const el of els) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      if (rect.top > window.innerHeight || rect.bottom < 0) continue
      if (rect.height < 48) {
        results.push({
          tag: el.tagName.toLowerCase(),
          h: Math.round(rect.height),
          w: Math.round(rect.width),
          text: (el.innerText || el.getAttribute("aria-label") || "").slice(
            0,
            40
          ),
        })
      }
    }
    return results
  })
  for (const s of small) {
    console.log(
      `[TAP-TARGET] ${name}: <${s.tag}> ${s.w}x${s.h}px "${s.text}"`
    )
  }
}

async function captureRoute(page: Page, url: string, name: string) {
  await page.goto(url, { waitUntil: "networkidle" }).catch(() => {})
  await page.waitForTimeout(500)
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true,
  })
  await logOverflowAndTapTargets(page, name)
}

test.describe("Phase 09 mobile audit (375px)", () => {
  test.setTimeout(180_000)

  test("01 services toggle ON (current state)", async ({ browser }) => {
    const ctx = await mobileContext(browser)
    const page = await ctx.newPage()
    await skipSplash(page)
    await captureRoute(page, "/services", "01-services-toggle-on") // fullPage: true
    await ctx.close()
  })

  test("02 services toggle OFF (pre-Wave-2 state)", async ({ browser }) => {
    const ctx = await mobileContext(browser)
    const page = await ctx.newPage()
    await skipSplash(page)
    // Pre-Wave-2: manifesto may not exist yet — capture whatever renders (fullPage: true)
    await captureRoute(page, "/services", "02-services-toggle-off")
    await ctx.close()
  })

  test("03 book toggle OFF (pre-Wave-2 state)", async ({ browser }) => {
    const ctx = await mobileContext(browser)
    const page = await ctx.newPage()
    await skipSplash(page)
    await captureRoute(page, "/book", "03-book-toggle-off") // fullPage: true
    await ctx.close()
  })

  test("04 book step1 service", async ({ browser }) => {
    const ctx = await mobileContext(browser)
    const page = await ctx.newPage()
    await skipSplash(page)
    await captureRoute(page, "/book", "04-book-step1-service") // fullPage: true
    await ctx.close()
  })

  test("05 book step2 date", async ({ browser }) => {
    const ctx = await mobileContext(browser)
    const page = await ctx.newPage()
    await skipSplash(page)
    await page.goto("/book", { waitUntil: "networkidle" }).catch(() => {})
    await page.waitForTimeout(500)

    // Resolve first service slug by reading a service-tile link/button
    const firstSlug = await page
      .evaluate(() => {
        // Look for any element with data-service-slug, or first anchor with /book?service=
        const el = document.querySelector(
          "[data-service-slug]"
        ) as HTMLElement | null
        if (el) return el.getAttribute("data-service-slug")
        const link = Array.from(
          document.querySelectorAll('a[href*="service="]')
        ) as HTMLAnchorElement[]
        if (link.length > 0) {
          const url = new URL(link[0].href, window.location.origin)
          return url.searchParams.get("service")
        }
        return null
      })
      .catch(() => null)

    if (!firstSlug) {
      // Click the first service tile button instead
      const firstTile = page
        .locator('button:has-text("SELECT"), [data-service-tile] button')
        .first()
      const hasTile = await firstTile.isVisible().catch(() => false)
      if (!hasTile) {
        fs.writeFileSync(
          path.join(screenshotDir, "05-skip.md"),
          "No bookable service found at audit time — step 2-5 skipped.\n"
        )
        console.log(
          "[SKIP] 05-book-step2-date: no bookable service found"
        )
        await page.screenshot({
          path: path.join(screenshotDir, "05-book-step2-date.png"),
          fullPage: true,
        })
        await ctx.close()
        return
      }
      await firstTile.click()
      await page.waitForTimeout(600)
    } else {
      await page.goto(`/book?service=${firstSlug}`, {
        waitUntil: "networkidle",
      })
      await page.waitForTimeout(600)
    }

    await page.screenshot({
      path: path.join(screenshotDir, "05-book-step2-date.png"),
      fullPage: true,
    })
    await logOverflowAndTapTargets(page, "05-book-step2-date")
    await ctx.close()
  })

  test("06 book step3 time", async ({ browser }) => {
    const ctx = await mobileContext(browser)
    const page = await ctx.newPage()
    await skipSplash(page)
    await page.goto("/book", { waitUntil: "networkidle" }).catch(() => {})
    await page.waitForTimeout(500)

    // Try deep-link first
    const firstSlug = await page
      .evaluate(() => {
        const link = Array.from(
          document.querySelectorAll('a[href*="service="]')
        ) as HTMLAnchorElement[]
        if (link.length > 0) {
          const url = new URL(link[0].href, window.location.origin)
          return url.searchParams.get("service")
        }
        return null
      })
      .catch(() => null)

    if (firstSlug) {
      await page.goto(`/book?service=${firstSlug}`, {
        waitUntil: "networkidle",
      })
      await page.waitForTimeout(800)
    }

    // Click the first non-disabled calendar day button
    const dayBtn = page
      .getByRole("button", { name: /^\d{1,2}$/ })
      .filter({ hasNot: page.locator("[disabled]") })
      .first()
    const dayVisible = await dayBtn.isVisible().catch(() => false)
    if (dayVisible) {
      await dayBtn.click().catch(() => {})
      await page.waitForTimeout(600)
    } else {
      console.log("[SKIP] 06-book-step3-time: no calendar day found")
    }

    await page.screenshot({
      path: path.join(screenshotDir, "06-book-step3-time.png"),
      fullPage: true,
    })
    await logOverflowAndTapTargets(page, "06-book-step3-time")
    await ctx.close()
  })

  test("07 book step4 details", async ({ browser }) => {
    const ctx = await mobileContext(browser)
    const page = await ctx.newPage()
    await skipSplash(page)
    await page.goto("/book", { waitUntil: "networkidle" }).catch(() => {})
    await page.waitForTimeout(500)

    const firstSlug = await page
      .evaluate(() => {
        const link = Array.from(
          document.querySelectorAll('a[href*="service="]')
        ) as HTMLAnchorElement[]
        if (link.length > 0) {
          const url = new URL(link[0].href, window.location.origin)
          return url.searchParams.get("service")
        }
        return null
      })
      .catch(() => null)

    if (firstSlug) {
      await page.goto(`/book?service=${firstSlug}`, {
        waitUntil: "networkidle",
      })
      await page.waitForTimeout(800)
    }

    // Pick a day
    const dayBtn = page
      .getByRole("button", { name: /^\d{1,2}$/ })
      .filter({ hasNot: page.locator("[disabled]") })
      .first()
    if (await dayBtn.isVisible().catch(() => false)) {
      await dayBtn.click().catch(() => {})
      await page.waitForTimeout(600)
    }

    // Pick first time slot
    const slot = page
      .locator("button")
      .filter({ hasText: /AM|PM|\d{1,2}:\d{2}/ })
      .first()
    if (await slot.isVisible().catch(() => false)) {
      await slot.click().catch(() => {})
      await page.waitForTimeout(500)
    }

    // Click continue
    const cont = page.getByRole("button", { name: /continue/i }).first()
    if (await cont.isVisible().catch(() => false)) {
      await cont.click().catch(() => {})
      await page.waitForTimeout(600)
    }

    await page.screenshot({
      path: path.join(screenshotDir, "07-book-step4-details.png"),
      fullPage: true,
    })
    await logOverflowAndTapTargets(page, "07-book-step4-details")
    await ctx.close()
  })

  test("08 book step5 payment", async ({ browser }) => {
    const ctx = await mobileContext(browser)
    const page = await ctx.newPage()
    await skipSplash(page)
    await page.goto("/book", { waitUntil: "networkidle" }).catch(() => {})
    await page.waitForTimeout(500)

    const firstSlug = await page
      .evaluate(() => {
        const link = Array.from(
          document.querySelectorAll('a[href*="service="]')
        ) as HTMLAnchorElement[]
        if (link.length > 0) {
          const url = new URL(link[0].href, window.location.origin)
          return url.searchParams.get("service")
        }
        return null
      })
      .catch(() => null)

    if (firstSlug) {
      await page.goto(`/book?service=${firstSlug}`, {
        waitUntil: "networkidle",
      })
      await page.waitForTimeout(800)
    }

    const dayBtn = page
      .getByRole("button", { name: /^\d{1,2}$/ })
      .filter({ hasNot: page.locator("[disabled]") })
      .first()
    if (await dayBtn.isVisible().catch(() => false)) {
      await dayBtn.click().catch(() => {})
      await page.waitForTimeout(600)
    }

    const slot = page
      .locator("button")
      .filter({ hasText: /AM|PM|\d{1,2}:\d{2}/ })
      .first()
    if (await slot.isVisible().catch(() => false)) {
      await slot.click().catch(() => {})
      await page.waitForTimeout(500)
    }

    const cont = page.getByRole("button", { name: /continue/i }).first()
    if (await cont.isVisible().catch(() => false)) {
      await cont.click().catch(() => {})
      await page.waitForTimeout(800)
    }

    // Fill form fields
    const nameInput = page
      .locator('input[name="name"], input[placeholder*="name" i]')
      .first()
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Test User").catch(() => {})
    }
    const emailInput = page
      .locator('input[type="email"], input[name="email"]')
      .first()
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("test@example.com").catch(() => {})
    }
    const phoneInput = page
      .locator('input[type="tel"], input[name*="phone" i]')
      .first()
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill("+15555555555").catch(() => {})
    }

    const cont2 = page
      .getByRole("button", { name: /continue|pay|submit/i })
      .first()
    if (await cont2.isVisible().catch(() => false)) {
      await cont2.click().catch(() => {})
    }
    await page.waitForTimeout(3000) // Stripe iframe may or may not render in test env

    await page.screenshot({
      path: path.join(screenshotDir, "08-book-step5-payment.png"),
      fullPage: true,
    })
    await logOverflowAndTapTargets(page, "08-book-step5-payment")
    await ctx.close()
  })
})
