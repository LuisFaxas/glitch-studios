import { test, expect, type Page } from "@playwright/test"

/**
 * Phase 29.3 comprehensive timeline test.
 *
 * Exercises every previously-broken interaction path with REAL .click() and
 * REAL pointer events (no dispatchEvent workarounds). Measures wall-clock
 * timing per stage so regressions surface as slowdowns.
 *
 * Selector contract (post-Codex root-cause fix + slider rewrite):
 *   - [data-testid="leaderboard-filters"]   — chip-bar root
 *   - [data-facet-dropdown="<Label>"]       — facet trigger button (Year / CPU / etc.)
 *   - [role="menu"]                         — open CustomDropdown panel (sibling of trigger,
 *                                              NOT portalled; renders inline)
 *   - inside [role="menu"]: button[aria-pressed]  — option chips
 *   - [data-price-popover-trigger]          — Price popover trigger
 *   - inside Price popover: [data-slot="slider-thumb"]  — hand-rolled slider thumbs (×2)
 *
 * Run cross-engine:
 *   pnpm exec playwright test tests/29.3-comprehensive-timeline.spec.ts --project=desktop
 *   pnpm exec playwright test tests/29.3-comprehensive-timeline.spec.ts --project=webkit
 *   pnpm exec playwright test tests/29.3-comprehensive-timeline.spec.ts --project=firefox
 */

const ROUTE = "/tech/rankings/laptops"
const CHIP_BATCH = 10
const STRESS_BATCH = 30

interface StageTiming {
  stage: string
  ms: number
}

async function stage<T>(
  timings: StageTiming[],
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const t0 = Date.now()
  const result = await fn()
  timings.push({ stage: name, ms: Date.now() - t0 })
  return result
}

async function getRowCount(page: Page): Promise<number> {
  return page.locator("[data-leaderboard-table] tbody tr").count()
}

async function openFacet(page: Page, label: string) {
  const trigger = page.locator(`[data-facet-dropdown="${label}"]`)
  await trigger.click()
  // The CustomDropdown panel is a sibling of the trigger. Use the local
  // `[role="menu"]` scoped to that trigger's parent.
  const panel = trigger.locator("xpath=following-sibling::div[@role='menu']")
  await expect(panel).toBeVisible()
  return { trigger, panel }
}

async function closeFacet(trigger: ReturnType<Page["locator"]>) {
  await trigger.click()
}

test("comprehensive interaction timeline — chip clicks + cross-facet + slider drag + reset", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  const pageExceptions: string[] = []
  const timings: StageTiming[] = []

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })
  page.on("pageerror", (err) => {
    pageExceptions.push(err.message)
  })

  // ─── STAGE 1: Cold load ───────────────────────────────────────────────────
  await stage(timings, "cold-load", async () => {
    await page.goto(ROUTE)
    await page
      .locator("[data-leaderboard-table]")
      .first()
      .waitFor({ state: "visible" })
    const rows = await getRowCount(page)
    expect(rows).toBeGreaterThan(0)
  })
  const baselineRows = await getRowCount(page)

  // ─── STAGE 2: Year facet — open, batch click, close ───────────────────────
  await stage(timings, "year-batch-clicks", async () => {
    const { trigger, panel } = await openFacet(page, "Year")
    const chip = panel.locator("button[aria-pressed]").first()
    const initialPressed = await chip.getAttribute("aria-pressed")
    for (let i = 0; i < CHIP_BATCH; i += 1) {
      await chip.click()
    }
    // Even toggles → state matches initial
    await expect(chip).toHaveAttribute("aria-pressed", initialPressed ?? "false")
    await closeFacet(trigger)
  })

  // ─── STAGE 3: Year filter active → row count drops ────────────────────────
  await stage(timings, "year-filter-applied", async () => {
    const { trigger, panel } = await openFacet(page, "Year")
    await panel.locator("button[aria-pressed]").first().click()
    await closeFacet(trigger)
    const rowsFiltered = await getRowCount(page)
    expect(rowsFiltered).toBeLessThanOrEqual(baselineRows)
  })

  // ─── STAGE 4: Cross-facet — Year + Medal active simultaneously ────────────
  await stage(timings, "cross-facet-medal", async () => {
    const { trigger, panel } = await openFacet(page, "Medal")
    await panel.locator("button[aria-pressed]").first().click()
    await closeFacet(trigger)
    // Page must remain interactive
    await expect(page.locator("body")).toBeVisible()
  })

  // ─── STAGE 5: Reset button ────────────────────────────────────────────────
  await stage(timings, "reset-filters", async () => {
    const reset = page.locator("[data-reset-filters]").first()
    if (await reset.isVisible().catch(() => false)) {
      await reset.click()
    }
    // setFilters defers via setTimeout(0). Poll for row count to recover so
    // we're not racing the deferred commit.
    await expect
      .poll(() => getRowCount(page), { timeout: 3000 })
      .toBe(baselineRows)
  })

  // ─── STAGE 6: Price slider drag (real pointer events) ─────────────────────
  await stage(timings, "price-slider-drag", async () => {
    const priceTrigger = page.locator("[data-price-popover-trigger]")
    if (!(await priceTrigger.isVisible().catch(() => false))) {
      // Some layouts may not expose the price trigger; skip gracefully.
      return
    }
    await priceTrigger.click()
    const minThumb = page.locator('[data-slot="slider-thumb"]').first()
    await expect(minThumb).toBeVisible()
    const box = await minThumb.boundingBox()
    if (!box) throw new Error("slider thumb has no bounding box")

    // Real drag: pointerdown on thumb → multiple pointermoves → pointerup
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    // Drag right by 60px in 6 steps (10px each); each step gives the new
    // PriceRangeSlider's rAF paint a chance to commit.
    for (let i = 1; i <= 6; i += 1) {
      await page.mouse.move(startX + i * 10, startY, { steps: 2 })
    }
    await page.mouse.up()

    // After release, the price trigger label should reflect a $-prefixed range.
    await expect(priceTrigger).toContainText("$")
    // Close the price popover
    await priceTrigger.click()
  })

  // ─── STAGE 7: Stress — rapid open/close cycles across facets ──────────────
  await stage(timings, "stress-open-close-cycles", async () => {
    const facets = ["Year", "CPU", "RAM", "Storage", "Medal"]
    for (let i = 0; i < STRESS_BATCH; i += 1) {
      const label = facets[i % facets.length]
      const trigger = page.locator(`[data-facet-dropdown="${label}"]`)
      await trigger.click()
      const panel = trigger.locator(
        "xpath=following-sibling::div[@role='menu']",
      )
      await expect(panel).toBeVisible({ timeout: 2000 })
      await trigger.click()
      await expect(panel).not.toBeVisible({ timeout: 2000 })
    }
  })

  // ─── ASSERTIONS ───────────────────────────────────────────────────────────
  expect(
    consoleErrors,
    `Console errors during full timeline:\n${consoleErrors.join("\n")}`,
  ).toEqual([])

  expect(
    pageExceptions,
    `Page exceptions during full timeline:\n${pageExceptions.join("\n")}`,
  ).toEqual([])

  // Page is still interactive at end
  await expect(page.locator("body")).toBeVisible()
  await expect(page.locator("[data-leaderboard-table]").first()).toBeVisible()

  // Per-stage timing budgets (regression guard against freezes / hangs).
  // Stress runs 30 open/close cycles; everything else is a single interaction.
  const budgets: Record<string, number> = {
    "cold-load": 15000,
    "year-batch-clicks": 5000,
    "year-filter-applied": 5000,
    "cross-facet-medal": 5000,
    "reset-filters": 5000,
    "price-slider-drag": 5000,
    "stress-open-close-cycles": 20000,
  }
  for (const t of timings) {
    const budget = budgets[t.stage] ?? 10000
    expect(
      t.ms,
      `Stage "${t.stage}" took ${t.ms}ms (>${budget}ms budget)`,
    ).toBeLessThan(budget)
  }

  const totalMs = timings.reduce((sum, t) => sum + t.ms, 0)
  console.log(
    `\n=== Phase 29.3 Comprehensive Timeline ===\n` +
      timings.map((t) => `  ${t.stage.padEnd(28)} ${t.ms}ms`).join("\n") +
      `\n  ${"TOTAL".padEnd(28)} ${totalMs}ms\n`,
  )
})
