---
phase: 30-per-benchmark-pages
plan: 04
type: execute
wave: 4
depends_on: ["30-01-slug-data-layer", "30-02-landing-page-rebuild", "30-03-detail-page-route"]
files_modified:
  - src/components/tech/methodology-discipline-cards.tsx
  - tests/30-04-cross-links.spec.ts
autonomous: true
requirements:
  - "Phase 30 SC-7 (methodology page disciplines link to /tech/benchmarks discipline anchors; row product → /tech/reviews/[slug]; row category → /tech/categories/[slug])"
must_haves:
  truths:
    - "User on /tech/about clicks a discipline name in the disciplines section and navigates to /tech/benchmarks#discipline-{name}"
    - "User on /tech/benchmarks/[slug] clicks a row's product cell and arrives at /tech/reviews/[slug] (already wired in Plan 30-03 — this plan verifies)"
    - "User on /tech/benchmarks/[slug] clicks a row's category cell and arrives at /tech/categories/[slug] (already wired in Plan 30-03 — this plan verifies)"
    - "User on /tech/benchmarks (landing) clicks 'Read methodology' and arrives at /tech/about#methodology (already wired in Plan 30-02 — this plan verifies)"
    - "Existing /tech/about page still renders (regression guard — methodology page hasn't broken)"
  artifacts:
    - path: "src/components/tech/methodology-discipline-cards.tsx"
      provides: "Updated discipline cards link out to /tech/benchmarks#discipline-{slug}"
      contains: "/tech/benchmarks#discipline-"
    - path: "tests/30-04-cross-links.spec.ts"
      provides: "Playwright spec verifying every cross-link in the Phase 30 contract resolves"
      contains: "test('methodology disciplines link to benchmarks landing anchors'"
  key_links:
    - from: "/tech/about#disciplines"
      to: "/tech/benchmarks#discipline-{name}"
      via: "MethodologyDisciplineCards renders an anchor link per discipline tile"
      pattern: "/tech/benchmarks#discipline-"
    - from: "/tech/benchmarks/[slug]"
      to: "/tech/reviews/[slug]"
      via: "BenchmarkLeaderboardTable row product cell (already in Plan 30-03)"
      pattern: "/tech/reviews/"
    - from: "/tech/benchmarks/[slug]"
      to: "/tech/categories/[slug]"
      via: "BenchmarkLeaderboardTable row category cell (already in Plan 30-03)"
      pattern: "/tech/categories/"
---

<objective>
Wire the methodology page's discipline section to link into the new `/tech/benchmarks` landing's discipline anchors. Verify all Phase 30 cross-links resolve via Playwright (some links were wired in Plans 30-02 and 30-03; this plan adds the only remaining wiring change — the methodology → benchmarks discipline anchors — and runs the full cross-link verification).

Per CONTEXT D-07: "Methodology page `/tech/about#disciplines` discipline names link to the corresponding discipline section on `/tech/benchmarks` (anchor link, not a new route)".

Purpose: Close Success Criterion #7 (cross-link contract). Make the editorial path methodology → benchmarks → review → category work end-to-end.

Output: One updated component (MethodologyDisciplineCards) + one Playwright spec.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/30-per-benchmark-pages/30-CONTEXT.md
@.planning/phases/30-per-benchmark-pages/30-UI-SPEC.md
@.planning/phases/30-per-benchmark-pages/30-01-SUMMARY.md
@.planning/phases/30-per-benchmark-pages/30-02-SUMMARY.md
@.planning/phases/30-per-benchmark-pages/30-03-SUMMARY.md

@src/components/tech/methodology-discipline-cards.tsx
@src/app/(tech)/tech/about/page.tsx
@src/app/(tech)/tech/benchmarks/page.tsx
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add discipline → /tech/benchmarks#discipline-* anchor links in MethodologyDisciplineCards</name>
  <files>src/components/tech/methodology-discipline-cards.tsx</files>
  <read_first>
    - src/components/tech/methodology-discipline-cards.tsx (full file — current shape; how disciplines are rendered today, what props the consumer passes)
    - src/app/(tech)/tech/about/page.tsx (full file — how MethodologyDisciplineCards is invoked; what gets passed in `disciplines` prop)
    - src/app/(tech)/tech/benchmarks/page.tsx (Plan 30-02 — confirm anchor id format `discipline-{slug}` where slug uses hyphens — e.g. `discipline-cpu`, `discipline-battery-life`)
    - .planning/phases/30-per-benchmark-pages/30-CONTEXT.md (D-07 cross-link contract: "discipline names link to the corresponding discipline section on `/tech/benchmarks` (anchor link, not a new route)")
    - **Precheck (REQUIRED before editing component):** count current discipline tiles vs. all 13 disciplines in RUBRIC_V1_1.
        - Run: `grep -c "slug:" src/app/\(tech\)/tech/about/page.tsx` (or whichever file constructs the `disciplines` array passed to MethodologyDisciplineCards) — count entries.
        - Cross-reference against the 13 disciplines in `BenchmarkDiscipline` type in `src/lib/tech/rubric-map.ts`: cpu, gpu, memory, storage, llm, video, dev, python, games, thermal, battery_life, wireless, display.
        - If current count < 13: the parent page is rendering only a subset (likely the 7 BPR-eligible ones). In that case, ALSO update the parent to pass all 13 disciplines (with appropriate `bprEligible` flags) before wiring the cross-links. This is the correct interpretation of ROADMAP SC-7.
        - If current count == 13: only wire the cross-links; no scope expansion needed.
  </read_first>
  <action>
    Update MethodologyDisciplineCards so each discipline tile is wrapped in (or links to) `/tech/benchmarks#discipline-{slug}` where slug = discipline name with underscores → hyphens.

    **Scope handling (MAJOR-3):** Based on the precheck count, this task may need to update TWO files:
    1. `src/components/tech/methodology-discipline-cards.tsx` — wrap tiles in Link (always required).
    2. `src/app/(tech)/tech/about/page.tsx` (or wherever the `disciplines` prop is constructed) — IF current count < 13, expand to pass all 13 disciplines with discipline-name + bprEligible flag matching the rubric. Use BPR_ELIGIBLE_DISCIPLINES from rubric-map.ts as the source of truth for the bprEligible flag per tile.

    The cross-link wiring itself is the same regardless of count:

    The implementation pattern depends on what the current component looks like. Most likely:

    **Step A — Read the current file** to understand:
    1. Whether discipline tiles are already `<Link>` elements or static divs
    2. What prop is passed to identify each discipline (likely `slug`, `key`, or `discipline`)
    3. Whether a `BenchmarkDiscipline` enum value is in scope or just a string

    **Step B — Identify the discipline → slug mapping** that matches Plan 30-02's anchor id format:
    - `cpu` → `discipline-cpu`
    - `gpu` → `discipline-gpu`
    - `memory` → `discipline-memory`
    - `storage` → `discipline-storage`
    - `llm` → `discipline-llm`
    - `video` → `discipline-video`
    - `dev` → `discipline-dev`
    - `python` → `discipline-python`
    - `games` → `discipline-games`
    - `thermal` → `discipline-thermal`
    - `battery_life` → `discipline-battery-life` (underscore → hyphen)
    - `wireless` → `discipline-wireless`
    - `display` → `discipline-display`

    **Step C — Add the link.** If the component currently renders a static element per discipline, wrap the entire tile (or the discipline name h3) in a `<Link>` to `/tech/benchmarks#discipline-{slug-with-hyphens}`:

    ```tsx
    import Link from "next/link"
    // ...
    // Inside the disciplines.map((d) => (...)) block, wrap the tile:
    <Link
      href={`/tech/benchmarks#discipline-${d.discipline.replace(/_/g, "-")}`}
      className="group block ..."   // preserve existing tile styling
    >
      {/* existing tile contents */}
    </Link>
    ```

    Where `d.discipline` is the BenchmarkDiscipline value passed by the consumer in `/tech/about/page.tsx`. If the prop name is different (e.g., `d.slug` or `d.key`), use that instead.

    **Constraints:**
    - Preserve all existing visual styling (border, hover, BPR ELIGIBLE badge, discipline name typography, body copy). Only add the wrapping anchor + cursor-pointer hint via group-hover.
    - The link href is plain anchor (`#fragment`) on a different route — Next Link handles cross-route navigation with hash automatically. Do NOT use a plain `<a>` with `target=_blank`; this is in-app navigation.
    - Sidebar one-screen rule: this is the same page that already exists; no new fixed-height widgets added.
    - Brand spelling: leave existing copy untouched; do not introduce GlitchTek typos.

    **Edge case — if the component is already linking somewhere:** If MethodologyDisciplineCards already wraps the tile in a link (e.g., to `/tech/about#discipline-{slug}` self-anchor or some other target), CHANGE the href to `/tech/benchmarks#discipline-...`. The Phase 30 cross-link contract supersedes any prior in-page anchor.

    **If the discipline prop doesn't carry the BenchmarkDiscipline string** (e.g., it's a free-form `name` string like "Battery Life"), introduce a small mapping inline:

    ```tsx
    const DISCIPLINE_SLUG: Record<string, string> = {
      "CPU": "cpu",
      "GPU": "gpu",
      "Memory": "memory",
      "Storage": "storage",
      "LLM": "llm",
      "Video": "video",
      "Dev": "dev",
      "Python": "python",
      "Games": "games",
      "Thermal": "thermal",
      "Battery Life": "battery-life",
      "Wireless": "wireless",
      "Display": "display",
    }
    ```

    The cleaner refactor is to update `disciplines: DisciplineCardProps[]` to require a `discipline: BenchmarkDiscipline` field, then the parent (/tech/about/page.tsx) passes the BenchmarkDiscipline enum value. Decide based on what the file currently looks like — pick the lowest-blast-radius change.
  </action>
  <verify>
    <automated>pnpm tsc --noEmit && pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q "/tech/benchmarks#discipline-" src/components/tech/methodology-discipline-cards.tsx` succeeds (at least one occurrence — template literal).
    - `grep -q "import Link" src/components/tech/methodology-discipline-cards.tsx` succeeds (Link is now imported).
    - **MAJOR-3 coverage:** the rendered methodology page must yield ≥13 `/tech/benchmarks#discipline-` hrefs. Verify via either:
        - (a) Static count in source: rendered output of MethodologyDisciplineCards must produce ≥13 anchor hrefs at runtime. If component is a `disciplines.map`, the parent must pass at least 13 entries — confirm by grepping the parent file:
          `grep -c "slug:" src/app/\(tech\)/tech/about/page.tsx` returns ≥ 13 (one entry per discipline).
        - (b) Runtime count via Playwright (covered in Task 2): `page.locator('a[href*="/tech/benchmarks#discipline-"]').count()` returns ≥ 13.
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
    - The methodology page `/tech/about` still server-renders without 500 (confirmed indirectly via `pnpm tsc` and via Playwright spec in Task 2).
    - `grep -c "GlitchTek" src/components/tech/methodology-discipline-cards.tsx` returns 0.
  </acceptance_criteria>
  <done>
    Every discipline tile on the methodology page links to /tech/benchmarks#discipline-{slug-with-hyphens}; existing visual treatment preserved; tsc + lint clean.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Playwright spec for full Phase 30 cross-link path</name>
  <files>tests/30-04-cross-links.spec.ts</files>
  <read_first>
    - tests/30-02-benchmarks-landing.spec.ts (Plan 30-02 — locator conventions)
    - tests/30-03-benchmark-detail.spec.ts (Plan 30-03 — locator conventions for detail page tables)
    - tests/29.1-02-about-methodology-anchors.spec.ts (existing methodology-anchors spec — pattern for about-page link assertions)
    - playwright.config.ts (baseURL handling)
    - src/components/tech/methodology-discipline-cards.tsx (just updated — confirm anchor href format)
    - src/app/(tech)/tech/benchmarks/page.tsx (Plan 30-02 — confirm anchor ids match)
    - src/app/(tech)/tech/benchmarks/[slug]/page.tsx (Plan 30-03 — confirm CTA href is /tech/about#methodology)
  </read_first>
  <action>
    Spec runs end-to-end through every cross-link declared in the Phase 30 contract.

    File: `tests/30-04-cross-links.spec.ts`

    ```typescript
    import { test, expect } from "@playwright/test"

    test.describe("Phase 30-04: cross-link contract", () => {
      test("landing CTA 'Read methodology' navigates to /tech/about#methodology", async ({ page }) => {
        await page.goto("/tech/benchmarks", { waitUntil: "networkidle" })
        const cta = page.getByRole("link", { name: "Read methodology" })
        await expect(cta).toHaveAttribute("href", "/tech/about#methodology")
        await cta.click()
        await page.waitForURL(/\/tech\/about#methodology$/)
        await expect(page).toHaveURL(/#methodology$/)
      })

      test("methodology disciplines link to benchmarks landing anchors", async ({ page }) => {
        await page.goto("/tech/about", { waitUntil: "networkidle" })
        // MAJOR-3 fix: enforce coverage of all 13 disciplines.
        // Locate any link from methodology disciplines section that targets /tech/benchmarks#discipline-*
        const disciplineLinks = page.locator('a[href*="/tech/benchmarks#discipline-"]')
        // Must be at least 13 — one per discipline (cpu, gpu, memory, storage, llm, video, dev, python,
        // games, thermal, battery_life, wireless, display). May be more if section header also links.
        const count = await disciplineLinks.count()
        expect(count, "All 13 disciplines must link to /tech/benchmarks#discipline-*").toBeGreaterThanOrEqual(13)

        // Verify the CPU-discipline link specifically resolves to the right anchor target on the landing page.
        const cpuLink = disciplineLinks.filter({ hasText: /CPU/i }).first()
        if (await cpuLink.count() > 0) {
          await expect(cpuLink).toHaveAttribute("href", "/tech/benchmarks#discipline-cpu")
        }

        // Verify battery-life uses the hyphenated slug, not underscore.
        const batteryLink = disciplineLinks.filter({ hasText: /Battery/i }).first()
        if (await batteryLink.count() > 0) {
          const href = await batteryLink.getAttribute("href")
          expect(href).toBe("/tech/benchmarks#discipline-battery-life")
        }
      })

      test("clicking methodology discipline lands on the right benchmarks section", async ({ page }) => {
        await page.goto("/tech/about", { waitUntil: "networkidle" })
        const cpuLink = page.locator('a[href="/tech/benchmarks#discipline-cpu"]').first()
        if (await cpuLink.count() === 0) {
          test.skip(true, "Methodology disciplines section not found in current /tech/about page")
        }
        await cpuLink.click()
        await page.waitForURL(/\/tech\/benchmarks#discipline-cpu$/)
        // The discipline-cpu section heading should be visible after navigation.
        await expect(page.locator("#discipline-cpu")).toBeVisible()
      })

      test("detail page row product cell links to /tech/reviews/[slug]", async ({ page }) => {
        await page.goto("/tech/benchmarks/cpu-geekbench6-multi", { waitUntil: "networkidle" })
        const productLinks = page.locator('tbody a[href^="/tech/reviews/"]')
        const count = await productLinks.count()
        if (count === 0) {
          test.skip(true, "No leaderboard rows in current dev seed; cross-link contract not testable here")
        }
        const firstHref = await productLinks.first().getAttribute("href")
        expect(firstHref).toMatch(/^\/tech\/reviews\/[a-z0-9-]+$/)
      })

      test("detail page row category cell links to /tech/categories/[slug]", async ({ page }) => {
        await page.goto("/tech/benchmarks/cpu-geekbench6-multi", { waitUntil: "networkidle" })
        const categoryLinks = page.locator('tbody a[href^="/tech/categories/"]')
        if (await categoryLinks.count() === 0) {
          test.skip(true, "No category-linked rows present; assertion skipped")
        }
        const firstHref = await categoryLinks.first().getAttribute("href")
        expect(firstHref).toMatch(/^\/tech\/categories\/[a-z0-9-]+$/)
      })

      test("detail page CTA 'View methodology' navigates to /tech/about#methodology", async ({ page }) => {
        await page.goto("/tech/benchmarks/cpu-geekbench6-multi", { waitUntil: "networkidle" })
        const cta = page.getByRole("link", { name: "View methodology" })
        await expect(cta).toHaveAttribute("href", "/tech/about#methodology")
      })

      test("detail page methodology footer link navigates to /tech/about#methodology", async ({ page }) => {
        await page.goto("/tech/benchmarks/cpu-geekbench6-multi", { waitUntil: "networkidle" })
        const footerLink = page.getByRole("link", { name: /View the GlitchTech methodology/ })
        await expect(footerLink).toHaveAttribute("href", "/tech/about#methodology")
      })

      test("methodology page itself still renders (regression guard)", async ({ page }) => {
        const response = await page.goto("/tech/about", { waitUntil: "networkidle" })
        expect(response?.status()).toBe(200)
        await expect(page.locator("#methodology")).toBeAttached()
        await expect(page.locator("#disciplines")).toBeAttached()
        await expect(page.locator("body")).not.toContainText("GlitchTek")
      })
    })
    ```

    Notes for executor:
    - The discipline-link count assertion is `>=13` (not `===13`) to be tolerant if the methodology card also adds a section-header anchor or icon link. Adjust to exact count if the implementation in Task 1 produces exactly one link per discipline.
    - Skipping cleanly when seed data is sparse keeps the test resilient — Phase 30 CI should not fail because the dev DB doesn't have a Geekbench6:multi run for any product.
    - The "click discipline → land on benchmarks anchor" test verifies the navigation actually works in-app, not just that the href attribute is right.
  </action>
  <verify>
    <automated>pnpm exec playwright test tests/30-04-cross-links.spec.ts --project=desktop</automated>
  </verify>
  <acceptance_criteria>
    - File `tests/30-04-cross-links.spec.ts` exists.
    - `grep -q "methodology disciplines link to benchmarks landing anchors" tests/30-04-cross-links.spec.ts` succeeds.
    - `grep -q "/tech/reviews/" tests/30-04-cross-links.spec.ts && grep -q "/tech/categories/" tests/30-04-cross-links.spec.ts` succeeds.
    - `grep -q "/tech/about#methodology" tests/30-04-cross-links.spec.ts` succeeds.
    - `grep -q "discipline-battery-life" tests/30-04-cross-links.spec.ts` succeeds (hyphen-form anchor verification).
    - `grep -q "regression guard" tests/30-04-cross-links.spec.ts` succeeds (methodology page health check present).
    - `pnpm exec playwright test tests/30-04-cross-links.spec.ts --project=desktop` exits 0.
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
  </acceptance_criteria>
  <done>
    Spec verifies all Phase 30 cross-links resolve correctly: landing CTA → methodology, methodology disciplines → benchmarks landing anchors (with hyphen-correct slugs for battery_life), detail row product → /tech/reviews/[slug], detail row category → /tech/categories/[slug], detail CTA + footer → methodology. Methodology page itself remains 200 and contains both #methodology and #disciplines anchors. No GlitchTek typos.
  </done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- `pnpm exec playwright test tests/30-04-cross-links.spec.ts --project=desktop` passes
- `grep -c "GlitchTek" src/components/tech/methodology-discipline-cards.tsx tests/30-04-cross-links.spec.ts` returns 0 (sum)
- Manual smoke: navigate /tech/about → click any discipline tile → land on /tech/benchmarks#discipline-{name} with that section in viewport
</verification>

<success_criteria>
- Methodology page disciplines link to corresponding /tech/benchmarks discipline anchors (Phase 30 SC-7)
- Detail page row product cells link to /tech/reviews/[slug] (Phase 30 SC-7 — verified, originally wired in 30-03)
- Detail page row category cells link to /tech/categories/[slug] (Phase 30 SC-7 — verified, originally wired in 30-03)
- Methodology page does not regress (200, has both anchors)
- All verification commands exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/30-per-benchmark-pages/30-04-SUMMARY.md` documenting:
- Files modified
- Whether tsc/lint/playwright passed first try
- Any deviations (e.g., MethodologyDisciplineCards had a different prop shape than expected; introduced inline DISCIPLINE_SLUG mapping)
- Whether the disciplines section in /tech/about already had links that needed updating vs. added fresh
</output>
