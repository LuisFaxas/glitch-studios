import { test, expect } from "@playwright/test"

const DESKTOP_VIEWPORT = { width: 1440, height: 900 }

// Phase 16.1 Plan 01 — Sub-brand cross-link tiles navigate in the SAME TAB.
// D-01/D-02: target="_blank" removed from tech-cross-link-tile.tsx and
// studios-cross-link-tile.tsx so SPA continuity is preserved on click.

test.describe("Phase 16.1: Cross-link tiles stay in same tab (D-01/D-02)", () => {
  // Cross-link tiles live in the desktop sidebar (`hidden md:flex`). Mobile
  // uses a different nav surface (bottom tab bar + overlay menu) where these
  // tiles are not rendered — this spec targets desktop-only behavior.
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 768,
    "cross-link tiles only render on desktop viewport (>= md breakpoint)"
  )

  test("Studios → Tech cross-link click does not open a new tab", async ({
    page,
    context,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT)
    // /beats keeps the sidebar expanded (the homepage "/" defaults to collapsed
    // and the collapsed sidebar does NOT render the cross-link tile).
    await page.goto("/beats")

    const tile = page.locator('[data-testid="tech-cross-link-tile"]').first()
    await expect(tile).toBeVisible({ timeout: 15_000 })

    // On localhost the middleware host-based rewrite does NOT fire, so the
    // href resolves to "/tech" (relative). On production hosts (glitchstudios.io)
    // the component sets an absolute "https://glitchtech.io/" href, but the
    // same-tab behavior is the invariant we're asserting.
    await expect(tile).not.toHaveAttribute("target", "_blank")

    const initialPageCount = context.pages().length
    await tile.click()
    await page.waitForLoadState("domcontentloaded")

    expect(context.pages().length).toBe(initialPageCount)
    await expect(page).toHaveURL(/\/tech/)
  })

  test("Tech → Studios cross-link click does not open a new tab", async ({
    page,
    context,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT)
    // /tech/reviews keeps the sidebar expanded (/tech is the tech homepage
    // which defaults to collapsed).
    await page.goto("/tech/reviews")

    const tile = page
      .locator('[data-testid="studios-cross-link-tile"]')
      .first()
    await expect(tile).toBeVisible({ timeout: 15_000 })
    await expect(tile).not.toHaveAttribute("target", "_blank")

    const initialPageCount = context.pages().length
    await tile.click()
    await page.waitForLoadState("domcontentloaded")

    expect(context.pages().length).toBe(initialPageCount)
    // Back on the Studios surface — on localhost the StudiosCrossLinkTile
    // href resolves to "/" (studios root).
    await expect(page).toHaveURL(/localhost:3004\/(?:$|\?)/)
  })

  // Documented-as-test: audio persistence across origins is a KNOWN limitation.
  // Browsers cannot persist <audio> elements across origin boundaries, so a
  // cross-origin navigation (production glitchstudios.io → glitchtech.io) will
  // stop any playing beat mid-song. This is an accepted trade-off per D-01/D-02
  // in .planning/phases/16.1-public-site-maintenance/16.1-CONTEXT.md. The
  // "audio continuity across brands" work is deferred to a future unified-origin
  // phase. See ROADMAP §16.1 deferred ideas.
  test.skip("Audio persistence across origin: DEFERRED per D-01/D-02 CONTEXT.md", async () => {
    // intentionally empty
  })
})
