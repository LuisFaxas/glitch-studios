import { test, expect } from "@playwright/test"

const DESKTOP_VIEWPORT = { width: 1440, height: 900 }

// Phase 16.1 Plan 03 — Wiring: Blog nav entry, unified socials, benchmarks stub.
// D-09, D-10, D-11, D-12.

test.describe("Phase 16.1: Tech Blog nav entry (D-09)", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 768,
    "sidebar nav tiles only render on desktop",
  )

  test("Tech sidebar renders Blog link pointing at /tech/blog", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT)
    await page.goto("/tech/reviews")
    const blogTile = page
      .locator('nav[aria-label="Main navigation"] a[href="/tech/blog"]')
      .first()
    await expect(blogTile).toBeVisible({ timeout: 15_000 })
  })

  test("Clicking the Blog tile navigates to /tech/blog (200 response)", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT)
    await page.goto("/tech/reviews")
    await page
      .locator('nav[aria-label="Main navigation"] a[href="/tech/blog"]')
      .first()
      .click()
    await expect(page).toHaveURL(/\/tech\/blog$/)
    // Real H1, not a Next.js 404 page
    await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible()
  })
})

test.describe("Phase 16.1: Benchmarks stale copy replaced (D-10)", () => {
  test("Benchmarks page does not contain 'phase 7.6' or 'Phase 07.6'", async ({
    page,
  }) => {
    await page.goto("/tech/benchmarks")
    const body = (await page.content()).toLowerCase()
    expect(body).not.toContain("phase 7.6")
    expect(body).not.toContain("phase 07.6")
    await expect(
      page.getByRole("heading", { level: 1, name: "Benchmarks" }),
    ).toBeVisible()
  })
})

test.describe("Phase 16.1: Unified socials (D-11/D-12)", () => {
  test("Footer renders IG/TikTok/YouTube with glitchtech handles + muted X", async ({
    page,
  }) => {
    await page.goto("/")
    const footer = page.locator("footer")
    await expect(
      footer.locator('a[href="https://instagram.com/glitchtech.io"]').first(),
    ).toBeVisible()
    await expect(
      footer.locator('a[href="https://tiktok.com/@glitchtech.io"]').first(),
    ).toBeVisible()
    await expect(
      footer.locator('a[href="https://youtube.com/@glitchtech_io"]').first(),
    ).toBeVisible()
    // X is a placeholder — rendered as <span>, NOT an anchor.
    await expect(
      footer.locator('a[href*="x.com"], a[href*="twitter.com"]'),
    ).toHaveCount(0)
    await expect(footer.locator('span[aria-label="X — coming soon"]')).toHaveCount(1)
    // No SoundCloud anywhere in the footer.
    await expect(footer.locator('a[href*="soundcloud"]')).toHaveCount(0)
  })

  test("Active social links open in a new tab (D-12)", async ({ page }) => {
    await page.goto("/")
    const footer = page.locator("footer")
    for (const href of [
      "https://instagram.com/glitchtech.io",
      "https://tiktok.com/@glitchtech.io",
      "https://youtube.com/@glitchtech_io",
    ]) {
      const link = footer.locator(`a[href="${href}"]`).first()
      await expect(link).toHaveAttribute("target", "_blank")
      await expect(link).toHaveAttribute("rel", /noopener/)
      await expect(link).toHaveAttribute("rel", /noreferrer/)
    }
  })
})
