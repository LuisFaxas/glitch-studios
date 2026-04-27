import { test, expect } from "@playwright/test"

test.describe("Phase 30-02: /tech/benchmarks landing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tech/benchmarks", { waitUntil: "networkidle" })
  })

  test("hero is present with locked 29.2-09 copy", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Benchmarks" })).toBeVisible()
    await expect(page.getByText("BENCHMARKS", { exact: true }).first()).toBeVisible()
    await expect(
      page.getByText("Every test we run, explained. See what each benchmark measures and why it matters."),
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Read methodology" })).toHaveAttribute(
      "href",
      "/tech/about#methodology",
    )
  })

  test("methodology blurb mentions 43 benchmarks and 13 disciplines", async ({ page }) => {
    await expect(
      page.getByText(/GlitchTech runs 43 benchmarks across 13 disciplines/),
    ).toBeVisible()
    // intentional: spec asserts the typo is absent (do not "fix" by removing the literal)
    await expect(page.locator("body")).not.toContainText("GlitchTek")
  })

  test("jump-nav lists 13 discipline anchors in sortOrder", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Disciplines" })
    const anchors = nav.locator("a")
    await expect(anchors).toHaveCount(13)
    const expectedOrder = [
      "CPU", "GPU", "MEMORY", "STORAGE", "LLM", "VIDEO",
      "DEV", "PYTHON", "GAMES", "THERMAL", "BATTERY LIFE", "WIRELESS", "DISPLAY",
    ]
    for (let i = 0; i < expectedOrder.length; i++) {
      await expect(anchors.nth(i)).toHaveText(expectedOrder[i])
    }
  })

  test("renders 13 discipline sections with anchor ids", async ({ page }) => {
    const expectedIds = [
      "discipline-cpu", "discipline-gpu", "discipline-memory", "discipline-storage",
      "discipline-llm", "discipline-video", "discipline-dev", "discipline-python",
      "discipline-games", "discipline-thermal", "discipline-battery-life",
      "discipline-wireless", "discipline-display",
    ]
    for (const id of expectedIds) {
      await expect(page.locator(`#${id}`)).toBeVisible()
    }
  })

  test("lists 43 benchmarks across 13 disciplines (one tile per test, all linking to detail route)", async ({ page }) => {
    const tiles = page.locator('a[href^="/tech/benchmarks/"]')
    await expect(tiles).toHaveCount(43)
  })

  test("BPR ELIGIBLE badge appears on 7 BPR-eligible disciplines (sections + tiles)", async ({ page }) => {
    // 7 section badges (CPU, GPU, LLM, Video, Dev, Python, Games)
    // 23 tile badges (5+5+3+3+3+2+2 from RUBRIC_V1_1)
    // Total = 30
    const badges = page.getByText("BPR ELIGIBLE", { exact: true })
    await expect(badges).toHaveCount(30)
  })

  test("known sample tiles link to expected slug routes", async ({ page }) => {
    // MAJOR-2 fix: href-first locator (GlitchHeading mirror layers can break role-based name lookup).
    const cpuTile = page.locator('a[href="/tech/benchmarks/cpu-geekbench6-multi"]')
    await expect(cpuTile).toBeVisible()
    await expect(cpuTile).toContainText(/Geekbench 6 Multi-Core/i)

    const batteryTile = page.locator('a[href="/tech/benchmarks/battery-life-video-loop-hours"]')
    await expect(batteryTile).toBeVisible()
    await expect(batteryTile).toContainText(/Video loop/i)
  })

  test("old empty-state copy is gone", async ({ page }) => {
    await expect(page.locator("body")).not.toContainText("No benchmarks published yet")
  })
})

test.describe("Phase 30-02: sidebar one-screen on desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  test("sidebar fits within viewport without scroll", async ({ page }) => {
    await page.goto("/tech/benchmarks", { waitUntil: "networkidle" })
    const sidebar = page.locator('aside, nav[aria-label*="sidebar" i], [data-sidebar]').first()
    if ((await sidebar.count()) > 0) {
      const box = await sidebar.boundingBox()
      if (box) {
        expect(box.height).toBeLessThanOrEqual(900)
      }
    }
  })
})

test.describe("Phase 30-02: mobile layout", () => {
  test.use({ viewport: { width: 375, height: 812 } })
  test("tile grid is single-column on mobile", async ({ page }) => {
    await page.goto("/tech/benchmarks", { waitUntil: "networkidle" })
    const firstGrid = page.locator("#discipline-cpu ul").first()
    const tiles = firstGrid.locator('li a[href^="/tech/benchmarks/"]')
    const count = await tiles.count()
    expect(count).toBeGreaterThanOrEqual(2)
    const box1 = await tiles.nth(0).boundingBox()
    const box2 = await tiles.nth(1).boundingBox()
    if (box1 && box2) {
      expect(box2.y).toBeGreaterThan(box1.y + 20)
    }
  })
})
