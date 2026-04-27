import { test, expect } from "@playwright/test"

test.describe("Phase 30-03: /tech/benchmarks/[slug] detail page", () => {
  test("known slug renders detail page with all 5 regions", async ({ page }) => {
    const response = await page.goto(
      "/tech/benchmarks/cpu-geekbench6-multi",
      { waitUntil: "networkidle" },
    )
    expect(response?.status()).toBe(200)

    await expect(page.getByText("BENCHMARK", { exact: true }).first()).toBeVisible()
    await expect(
      page.getByRole("heading", { level: 1, name: "Geekbench 6 Multi-Core" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "View methodology" }),
    ).toHaveAttribute("href", "/tech/about#methodology")

    await expect(page.getByText(/DISCIPLINE: CPU/)).toBeVisible()
    await expect(page.getByText(/TOOL: geekbench6/)).toBeVisible()
    await expect(page.getByText(/FIELD: multi/)).toBeVisible()
    await expect(page.getByText(/UNIT: score/)).toBeVisible()
    await expect(page.getByText(/HIGHER IS BETTER/)).toBeVisible()
    await expect(page.getByText(/MODE: AC \+ BATTERY/)).toBeVisible()
    await expect(page.getByText("BPR ELIGIBLE", { exact: true }).first()).toBeVisible()

    await expect(
      page.getByRole("heading", { level: 2, name: "What this measures" }),
    ).toBeVisible()
    await expect(
      page.getByText(/Geekbench 6 Multi-Core measures CPU performance via geekbench6/),
    ).toBeVisible()

    await expect(page.getByText("How we test", { exact: true })).toBeVisible()
    await expect(
      page.getByRole("link", { name: /View the GlitchTech methodology/ }),
    ).toBeVisible()

    // intentional: spec asserts the typo is absent
    await expect(page.locator("body")).not.toContainText("GlitchTek")
  })

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/tech/benchmarks/not-a-real-test", {
      waitUntil: "domcontentloaded",
    })
    expect(response?.status()).toBe(404)
  })

  test("battery-only mode test renders Battery column only (no AC, no BPR)", async ({ page }) => {
    const response = await page.goto(
      "/tech/benchmarks/battery-life-video-loop-hours",
      { waitUntil: "networkidle" },
    )
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", { level: 1, name: "Video loop (local 1080p)" }),
    ).toBeVisible()
    await expect(page.getByText(/MODE: BATTERY ONLY/)).toBeVisible()
    const acHeader = page.getByRole("columnheader", { name: /^AC/ })
    const bprHeader = page.getByRole("columnheader", { name: /^BPR/ })
    const battHeader = page.getByRole("columnheader", { name: /^BATTERY/ })
    await expect(acHeader).toHaveCount(0)
    await expect(bprHeader).toHaveCount(0)
    if ((await battHeader.count()) > 0) {
      await expect(battHeader).toBeVisible()
    }
  })

  test("ac-only mode test renders AC column only (no Battery, no BPR)", async ({ page }) => {
    const response = await page.goto("/tech/benchmarks/memory-stream-triad", {
      waitUntil: "networkidle",
    })
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", { level: 1, name: "STREAM Triad" }),
    ).toBeVisible()
    await expect(page.getByText(/MODE: AC ONLY/)).toBeVisible()
    const battHeader = page.getByRole("columnheader", { name: /^BATTERY/ })
    const bprHeader = page.getByRole("columnheader", { name: /^BPR/ })
    await expect(battHeader).toHaveCount(0)
    await expect(bprHeader).toHaveCount(0)
  })

  test("empty-leaderboard rubric renders 200 with either empty panel or rows", async ({ page }) => {
    const response = await page.goto(
      "/tech/benchmarks/cpu-hyperfine-ripgrep-cargo",
      { waitUntil: "networkidle" },
    )
    expect(response?.status()).toBe(200)
    const emptyPanel = page.getByText("No measurements yet", { exact: true })
    const tableRows = page.locator("tbody tr")
    const hasEmpty = (await emptyPanel.count()) > 0
    const hasRows = (await tableRows.count()) > 0
    expect(hasEmpty || hasRows).toBeTruthy()
  })

  test("sort toggle on AC column flips aria-sort", async ({ page }) => {
    await page.goto("/tech/benchmarks/cpu-geekbench6-multi", {
      waitUntil: "networkidle",
    })
    const acHeader = page.getByRole("columnheader", { name: /^AC/ })
    if ((await acHeader.count()) === 0) {
      test.skip(true, "No leaderboard data to test sort interaction")
    }
    await expect(acHeader).toHaveAttribute("aria-sort", "descending")
    await acHeader.getByRole("button").click()
    await expect(acHeader).toHaveAttribute("aria-sort", "ascending")
    await acHeader.getByRole("button").click()
    await expect(acHeader).toHaveAttribute("aria-sort", "descending")
  })

  test("row product link goes to /tech/reviews/[slug]; category link goes to /tech/categories/[slug]", async ({ page }) => {
    await page.goto("/tech/benchmarks/cpu-geekbench6-multi", {
      waitUntil: "networkidle",
    })
    const productLinks = page.locator('tbody a[href^="/tech/reviews/"]')
    const categoryLinks = page.locator('tbody a[href^="/tech/categories/"]')
    const pCount = await productLinks.count()
    if (pCount === 0) {
      test.skip(true, "No leaderboard rows in current seed; cross-link assertion skipped")
    }
    await expect(productLinks.first()).toBeVisible()
    if ((await categoryLinks.count()) > 0) {
      await expect(categoryLinks.first()).toBeVisible()
    }
  })
})

test.describe("Phase 30-03: SSG enumeration", () => {
  test("3 representative slugs (one per mode) return 200", async ({ page }) => {
    const slugs = [
      "cpu-geekbench6-multi",
      "memory-stream-triad",
      "battery-life-video-loop-hours",
    ]
    for (const slug of slugs) {
      const r = await page.goto(`/tech/benchmarks/${slug}`, {
        waitUntil: "domcontentloaded",
      })
      expect(r?.status(), `slug ${slug} should return 200`).toBe(200)
    }
  })
})
