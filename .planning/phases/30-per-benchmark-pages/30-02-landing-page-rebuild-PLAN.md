---
phase: 30-per-benchmark-pages
plan: 02
type: execute
wave: 2
depends_on: ["30-01-slug-data-layer"]
files_modified:
  - src/app/(tech)/tech/benchmarks/page.tsx
  - tests/30-02-benchmarks-landing.spec.ts
autonomous: true
requirements:
  - "Phase 30 SC-1 (lists all 43 tests, 13 discipline sections, empty-state stub removed)"
  - "Phase 30 SC-6 (landing is force-static + revalidate=60)"
  - "Phase 30 SC-7 (cross-link contract: tile → detail; methodology link)"
  - "Phase 30 SC-9 (GlitchTech spelling)"
  - "Phase 30 SC-10 (sidebar one-screen)"
must_haves:
  truths:
    - "User visits /tech/benchmarks and sees a hero, methodology blurb, jump-nav with 13 discipline anchors, then 13 discipline sections in sortOrder"
    - "User sees exactly 43 per-test tile cards across all 13 sections"
    - "User can click any tile and arrive at /tech/benchmarks/{slug} (route exists from Plan 30-03; this plan only verifies the link href is correct)"
    - "User in BPR-eligible disciplines (CPU, GPU, LLM, Video, Dev, Python, Games) sees BPR ELIGIBLE badge on the section header AND on each tile in those sections"
    - "User clicks a jump-nav anchor and the matching discipline section scrolls into view"
    - "User on mobile (≤640px) sees one tile per row; on lg sees three tiles per row"
    - "User does not see the old empty-state copy ('No benchmarks published yet')"
    - "Sidebar continues to fit one screen without scroll on desktop viewports"
  artifacts:
    - path: "src/app/(tech)/tech/benchmarks/page.tsx"
      provides: "Replaces empty-state body with discipline-grouped tile sections; keeps TechHero from 29.2-09 unchanged"
      contains: "RUBRIC_V1_1"
    - path: "tests/30-02-benchmarks-landing.spec.ts"
      provides: "Playwright spec asserting 43 tile links + 13 discipline section anchors + 7 BPR ELIGIBLE badges + sidebar no-scroll on desktop"
      contains: "test('lists 43 benchmarks across 13 disciplines'"
  key_links:
    - from: "src/app/(tech)/tech/benchmarks/page.tsx"
      to: "src/lib/tech/rubric-map.ts"
      via: "imports RUBRIC_V1_1 + BPR_ELIGIBLE_DISCIPLINES"
      pattern: "from \"@/lib/tech/rubric-map\""
    - from: "src/app/(tech)/tech/benchmarks/page.tsx"
      to: "src/lib/tech/benchmark-slug.ts"
      via: "imports slugFromRubricKey for tile hrefs"
      pattern: "slugFromRubricKey"
    - from: "src/app/(tech)/tech/benchmarks/page.tsx"
      to: "/tech/benchmarks/[slug]"
      via: "Each tile is a Next Link to /tech/benchmarks/{slug}"
      pattern: "href=.*tech/benchmarks/"
    - from: "src/app/(tech)/tech/benchmarks/page.tsx"
      to: "/tech/about#methodology"
      via: "TechHero CTA + methodology blurb inline link both target #methodology"
      pattern: "/tech/about#methodology"
---

<objective>
Replace the honest-empty-state body on `/tech/benchmarks` with a discipline-grouped tile index of all 43 RUBRIC_V1_1 tests. TechHero stays unchanged (locked by 29.2-09). Each tile links to `/tech/benchmarks/{slug}`. Mirror MethodologyDisciplineCards aesthetic (BPR ELIGIBLE badge, section headers in GlitchHeading, hover-only RGB split, group-hover underline).

Purpose: Ship Success Criterion #1 (lists all 43 tests, grouped by discipline, empty-state stub removed). The detail route doesn't exist yet — Plan 30-03 creates it; tile links will resolve to 404 until then, which is intentional (sequential mandate).

Output: One rewritten page.tsx + one Playwright spec.
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

@src/app/(tech)/tech/benchmarks/page.tsx
@src/components/tech/methodology-discipline-cards.tsx
@src/components/tech/tech-hero.tsx
@src/components/ui/glitch-heading.tsx
@src/lib/tech/rubric-map.ts
@src/lib/tech/benchmark-slug.ts

<interfaces>
<!-- Use these directly. -->

From src/components/tech/tech-hero.tsx:
```typescript
export interface TechHeroProps {
  eyebrow?: string
  title: string
  subhead: string
  ctaLabel: string
  ctaHref: string
  ctaOpensInNewTab?: boolean
  tone?: "cyan" | "amber"      // default "cyan"
  size?: "compact" | "default" | "tall"   // default "default" = h-[280px]
}
export function TechHero(props: TechHeroProps): JSX.Element
```

From src/components/ui/glitch-heading.tsx (used pattern, exact API to be confirmed by reading the file):
```typescript
// Wraps children in a hover-only RGB-split component. Used as <GlitchHeading>{text}</GlitchHeading>.
// Site-wide rule (memory: feedback_glitch_headers.md): every header uses this; no auto-running animations.
```

From src/lib/tech/rubric-map.ts:
```typescript
export const RUBRIC_V1_1: Record<string, RubricTestSpec>   // 43 entries
export const BPR_ELIGIBLE_DISCIPLINES: ReadonlyArray<BenchmarkDiscipline> = ["cpu","gpu","llm","video","dev","python","games"]
// RubricTestSpec has: discipline, tool, field, name, unit, direction, mode, bprEligible, sortOrder
```

From src/lib/tech/benchmark-slug.ts (Plan 30-01):
```typescript
export function slugFromRubricKey(key: string): string
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Rebuild /tech/benchmarks landing page with 13 discipline sections + 43 tiles</name>
  <files>src/app/(tech)/tech/benchmarks/page.tsx</files>
  <read_first>
    - src/app/(tech)/tech/benchmarks/page.tsx (current file — full content; you replace the body but KEEP the TechHero with its 29.2-09 props verbatim)
    - src/components/tech/methodology-discipline-cards.tsx (full file — visual template; mirror its tile + section + badge aesthetic)
    - src/components/tech/tech-hero.tsx (lines 1-60 — confirm props names; the existing call uses eyebrow="BENCHMARKS" title="Benchmarks" tone="cyan")
    - src/components/ui/glitch-heading.tsx (full file — confirm component shape and hover-only behavior)
    - src/lib/tech/rubric-map.ts (full file — RUBRIC_V1_1 keys; sortOrder values)
    - src/lib/tech/benchmark-slug.ts (Plan 30-01 — slugFromRubricKey)
    - .planning/phases/30-per-benchmark-pages/30-UI-SPEC.md sections "Landing page — `/tech/benchmarks`", "Methodology blurb panel", "Jump-nav anchor strip", "Discipline section (× 13)", "Per-test tile (linked to detail page)"
  </read_first>
  <action>
    Implement the locked UI-SPEC for `/tech/benchmarks`. ALL copy strings are quoted from UI-SPEC verbatim — do NOT paraphrase. Server component (no "use client"), force-static + revalidate=60.

    Top-level page structure (per UI-SPEC):
    ```
    [TechHero — UNCHANGED, locked from 29.2-09]
    [Methodology blurb panel]
    [Jump-nav anchor strip — 13 discipline links]
    [Discipline section × 13, each with sub-grid of tiles]
    ```

    Detailed implementation:

    ```tsx
    import type { Metadata } from "next"
    import Link from "next/link"
    import { TechHero } from "@/components/tech/tech-hero"
    import { GlitchHeading } from "@/components/ui/glitch-heading"
    import {
      RUBRIC_V1_1,
      BPR_ELIGIBLE_DISCIPLINES,
      type BenchmarkDiscipline,
      type RubricTestSpec,
    } from "@/lib/tech/rubric-map"
    import { slugFromRubricKey } from "@/lib/tech/benchmark-slug"

    export const dynamic = "force-static"
    export const revalidate = 60

    export const metadata: Metadata = {
      title: "Benchmarks",
      description:
        "Every test we run, explained. See what each benchmark measures and why it matters.",
    }

    // Display order locked to RUBRIC sortOrder ascending — CPU, GPU, Memory, Storage, LLM, Video, Dev, Python, Games, Thermal, Battery Life, Wireless, Display.
    const DISCIPLINE_ORDER: BenchmarkDiscipline[] = [
      "cpu", "gpu", "memory", "storage", "llm", "video",
      "dev", "python", "games", "thermal", "battery_life", "wireless", "display",
    ]

    // UI-SPEC "Jump-nav anchor strip": uppercase labels, "BATTERY LIFE" not "BATTERY_LIFE".
    const DISCIPLINE_LABEL: Record<BenchmarkDiscipline, string> = {
      cpu: "CPU",
      gpu: "GPU",
      memory: "MEMORY",
      storage: "STORAGE",
      llm: "LLM",
      video: "VIDEO",
      dev: "DEV",
      python: "PYTHON",
      games: "GAMES",
      thermal: "THERMAL",
      battery_life: "BATTERY LIFE",
      wireless: "WIRELESS",
      display: "DISPLAY",
    }

    function disciplineAnchorId(d: BenchmarkDiscipline): string {
      // UI-SPEC "anchor href: #discipline-{discipline-key}" — keep underscore in battery_life replaced with hyphen
      // for URL-fragment hygiene (matches the convention of disciplines section ids elsewhere).
      return `discipline-${d.replace(/_/g, "-")}`
    }

    function isBprEligibleDiscipline(d: BenchmarkDiscipline): boolean {
      return BPR_ELIGIBLE_DISCIPLINES.includes(d)
    }

    // Group RUBRIC_V1_1 by discipline, sorted by sortOrder within each group.
    function groupByDiscipline(): Record<BenchmarkDiscipline, Array<{ key: string; spec: RubricTestSpec }>> {
      const out = {} as Record<BenchmarkDiscipline, Array<{ key: string; spec: RubricTestSpec }>>
      for (const d of DISCIPLINE_ORDER) out[d] = []
      for (const [key, spec] of Object.entries(RUBRIC_V1_1)) {
        out[spec.discipline].push({ key, spec })
      }
      for (const d of DISCIPLINE_ORDER) {
        out[d].sort((a, b) => a.spec.sortOrder - b.spec.sortOrder)
      }
      return out
    }

    function modesSummary(tests: Array<{ spec: RubricTestSpec }>): string {
      // UI-SPEC: "AC + Battery" if any test in section is mode='both', else "AC only" or "Battery only".
      const hasBoth = tests.some((t) => t.spec.mode === "both")
      if (hasBoth) return "AC + Battery"
      const allAc = tests.every((t) => t.spec.mode === "ac")
      if (allAc) return "AC only"
      const allBattery = tests.every((t) => t.spec.mode === "battery")
      if (allBattery) return "Battery only"
      // Mixed (shouldn't happen in v1.1 but be safe)
      return "Mixed"
    }

    function directionPhrase(direction: "higher_is_better" | "lower_is_better"): string {
      return direction === "higher_is_better" ? "higher is better" : "lower is better"
    }

    export default function TechBenchmarksPage() {
      const grouped = groupByDiscipline()

      return (
        <main className="min-h-screen bg-black">
          {/* TechHero — LOCKED from 29.2-09, do not modify */}
          <TechHero
            eyebrow="BENCHMARKS"
            title="Benchmarks"
            subhead="Every test we run, explained. See what each benchmark measures and why it matters."
            ctaLabel="Read methodology"
            ctaHref="/tech/about#methodology"
            tone="cyan"
            size="default"
          />

          {/* Methodology blurb panel — UI-SPEC copy locked */}
          <section className="mx-auto max-w-5xl px-6 pt-12">
            <p className="font-sans text-[15px] leading-relaxed text-[#888]">
              GlitchTech runs 43 benchmarks across 13 disciplines on every laptop we review. Seven disciplines feed BPR (battery vs AC). Every test is reproducible — same hardware, same OS build, same numbers. Read the{" "}
              <Link
                href="/tech/about#methodology"
                className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
              >
                full methodology
              </Link>{" "}
              for tool versions, run order, and exclusion rules.
            </p>
          </section>

          {/* Jump-nav anchor strip — 13 discipline links */}
          <nav
            aria-label="Disciplines"
            className="mx-auto max-w-5xl px-6 pt-8 pb-4 border-b border-[#222]"
          >
            <ul className="flex flex-wrap gap-2">
              {DISCIPLINE_ORDER.map((d) => (
                <li key={d}>
                  <a
                    href={`#${disciplineAnchorId(d)}`}
                    className="inline-flex min-h-[44px] items-center px-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888] border border-[#222] hover:text-[#f5f5f0] hover:border-[#444] transition-colors"
                  >
                    {DISCIPLINE_LABEL[d]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* 13 discipline sections */}
          {DISCIPLINE_ORDER.map((d) => {
            const tests = grouped[d]
            const eligible = isBprEligibleDiscipline(d)
            const modes = modesSummary(tests)
            return (
              <section
                key={d}
                id={disciplineAnchorId(d)}
                className="mx-auto max-w-5xl px-6 py-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-mono text-[20px] md:text-[28px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                    <GlitchHeading>{DISCIPLINE_LABEL[d]}</GlitchHeading>
                  </h2>
                  {eligible && (
                    <span className="bg-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#000]">
                      BPR ELIGIBLE
                    </span>
                  )}
                </div>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
                  {tests.length} tests · {modes}
                </p>

                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tests.map(({ key, spec }) => {
                    const slug = slugFromRubricKey(key)
                    const tileBpr = eligible // every tile in a BPR-eligible section is BPR-contributing per UI-SPEC
                    return (
                      <li key={key}>
                        <Link
                          href={`/tech/benchmarks/${slug}`}
                          className="group relative block min-h-[96px] border border-[#222] bg-[#111] p-4 transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
                        >
                          {tileBpr && (
                            <span className="absolute right-3 top-3 bg-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#000]">
                              BPR ELIGIBLE
                            </span>
                          )}
                          <span className="block font-mono text-[13px] md:text-[15px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] after:block after:h-px after:origin-left after:scale-x-0 after:bg-[#f5f5f0] after:transition-transform after:duration-200 group-hover:after:scale-x-100">
                            <GlitchHeading>{spec.name}</GlitchHeading>
                          </span>
                          <span className="mt-1 block font-sans text-[13px] leading-relaxed text-[#888]">
                            {spec.tool} · {spec.unit} · {directionPhrase(spec.direction)}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </main>
      )
    }
    ```

    Notes for the executor:
    - Brand spelling is `GlitchTech` (verify after writing — search file for `GlitchTek`, must be zero).
    - Do NOT add `"use client"` — this is a server component, fully static.
    - Do NOT add framer-motion or any auto-running animation — UI-SPEC bans them and 29.3 baseline lessons forbid persistent layered surfaces.
    - The `DISCIPLINE_ORDER` array drives both jump-nav and section render order; do not derive it from RUBRIC_V1_1 enumeration order (that depends on object insertion which is fragile).
    - Every h2 wraps inside `<GlitchHeading>` per memory `feedback_glitch_headers.md`.
    - Tile inner element wraps test name in `<GlitchHeading>` for hover-only RGB split via group-hover.
    - The `<a>` inside the jump-nav `<li>` is a plain anchor (#fragment), not a Next Link — this is correct; same-page anchor scroll uses native browser behavior, not router navigation.
    - Sidebar one-screen rule: this page only renders in main content region; no new sidebar widgets; sidebar fits as before.
  </action>
  <verify>
    <automated>pnpm tsc --noEmit && pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - File `src/app/(tech)/tech/benchmarks/page.tsx` exists.
    - `grep -q "RUBRIC_V1_1" src/app/(tech)/tech/benchmarks/page.tsx` succeeds.
    - `grep -q "BPR_ELIGIBLE_DISCIPLINES" src/app/(tech)/tech/benchmarks/page.tsx` succeeds.
    - `grep -q "slugFromRubricKey" src/app/(tech)/tech/benchmarks/page.tsx` succeeds.
    - `grep -q 'export const dynamic = "force-static"' src/app/(tech)/tech/benchmarks/page.tsx` succeeds.
    - `grep -q "export const revalidate = 60" src/app/(tech)/tech/benchmarks/page.tsx` succeeds.
    - `grep -q "BPR ELIGIBLE" src/app/(tech)/tech/benchmarks/page.tsx` succeeds.
    - `grep -q "GlitchHeading" src/app/(tech)/tech/benchmarks/page.tsx` succeeds.
    - `grep -q "/tech/about#methodology" src/app/(tech)/tech/benchmarks/page.tsx` succeeds.
    - `grep -c "GlitchTek" src/app/(tech)/tech/benchmarks/page.tsx` returns `0`.
    - `grep -q "No benchmarks published yet" src/app/(tech)/tech/benchmarks/page.tsx` returns NOTHING (old empty-state copy must be gone).
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
  </acceptance_criteria>
  <done>
    Landing page renders 13 discipline sections, 43 total tiles, BPR badges on 7 BPR-eligible sections + their tiles, methodology blurb + jump-nav present, no client component, force-static + revalidate=60 enforced, no GlitchTek typos.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Playwright spec for landing page structure</name>
  <files>tests/30-02-benchmarks-landing.spec.ts</files>
  <read_first>
    - tests/29.2-09-benchmarks-hero.spec.ts (existing /tech/benchmarks Playwright spec — same baseURL, same hero assertions to extend; keep existing assertions if any are reused)
    - tests/29.2-03-discipline-cards.spec.ts (existing pattern for asserting discipline grids — use same locator strategies)
    - playwright.config.ts (baseURL = http://localhost:3004 unless PLAYWRIGHT_BASE_URL set; projects = desktop/mobile/webkit/firefox)
    - src/app/(tech)/tech/benchmarks/page.tsx (just rewritten — assertions verify what was built)
    - .planning/phases/30-per-benchmark-pages/30-UI-SPEC.md sections "Landing page" + "Discipline section" + "Per-test tile"
  </read_first>
  <action>
    Create `tests/30-02-benchmarks-landing.spec.ts` asserting the structural contract from UI-SPEC. Test runs at desktop AND mobile viewports.

    ```typescript
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
        // Brand spelling enforcement: never GlitchTek
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
        // 43 test tiles + the hero CTA points to /tech/about#methodology (NOT counted; different prefix).
        // The methodology blurb inline link points to /tech/about#methodology too.
        // The footer (if any) shouldn't link to /tech/benchmarks/<slug> on this page.
        await expect(tiles).toHaveCount(43)
      })

      test("BPR ELIGIBLE badge appears on 7 BPR-eligible disciplines (sections + tiles)", async ({ page }) => {
        // Section badges: 7 (CPU, GPU, LLM, Video, Dev, Python, Games)
        // Tile badges: count = number of tests in those 7 disciplines.
        // From RUBRIC_V1_1: cpu=5, gpu=5, llm=3, video=3, dev=3, python=2, games=2 → 23 tile badges
        // Total BPR ELIGIBLE text occurrences = 7 (section) + 23 (tile) = 30
        const badges = page.getByText("BPR ELIGIBLE", { exact: true })
        await expect(badges).toHaveCount(30)
      })

      test("known sample tiles link to expected slug routes", async ({ page }) => {
        await expect(page.getByRole("link", { name: /Geekbench 6 Multi-Core/ })).toHaveAttribute(
          "href",
          "/tech/benchmarks/cpu-geekbench6-multi",
        )
        await expect(page.getByRole("link", { name: /Video loop/ })).toHaveAttribute(
          "href",
          "/tech/benchmarks/battery-life-video-loop-hours",
        )
      })

      test("old empty-state copy is gone", async ({ page }) => {
        await expect(page.locator("body")).not.toContainText("No benchmarks published yet")
      })
    })

    test.describe("Phase 30-02: sidebar one-screen on desktop", () => {
      test.use({ viewport: { width: 1440, height: 900 } })
      test("sidebar fits within viewport without scroll", async ({ page }) => {
        await page.goto("/tech/benchmarks", { waitUntil: "networkidle" })
        // Match locator used by 29.x sidebar specs — confirm by reading existing sidebar spec.
        // Generic fallback: assert there's no element with overflow that exceeds viewport in the aside region.
        const sidebar = page.locator('aside, nav[aria-label*="sidebar" i], [data-sidebar]').first()
        if (await sidebar.count() > 0) {
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
        // Pick the first discipline section's <ul> and check that adjacent tiles don't share a row.
        const firstGrid = page.locator("#discipline-cpu ul").first()
        const tiles = firstGrid.locator('li a[href^="/tech/benchmarks/"]')
        const count = await tiles.count()
        expect(count).toBeGreaterThanOrEqual(2)
        const box1 = await tiles.nth(0).boundingBox()
        const box2 = await tiles.nth(1).boundingBox()
        if (box1 && box2) {
          // On mobile, second tile must be below first (y delta significant)
          expect(box2.y).toBeGreaterThan(box1.y + 20)
        }
      })
    })
    ```

    Notes for executor:
    - The exact sidebar locator may differ — read one of the 29.x sidebar specs (e.g. `tests/sidebar-collapse.spec.ts` if it exists, or `29.1-*` specs) to confirm the right locator and replace the generic fallback if a project pattern exists.
    - `toHaveCount(30)` for badges is computed from the rubric: CPU 5 + GPU 5 + LLM 3 + Video 3 + Dev 3 + Python 2 + Games 2 = 23 tile badges; plus 7 section-header badges = 30 total. Verify this count against the actual rubric-map.ts before locking the assertion.
  </action>
  <verify>
    <automated>pnpm exec playwright test tests/30-02-benchmarks-landing.spec.ts --project=desktop</automated>
  </verify>
  <acceptance_criteria>
    - File `tests/30-02-benchmarks-landing.spec.ts` exists.
    - `grep -q "test('lists 43 benchmarks across 13 disciplines" tests/30-02-benchmarks-landing.spec.ts || grep -q 'test\\("lists 43 benchmarks across 13 disciplines' tests/30-02-benchmarks-landing.spec.ts` succeeds.
    - `grep -q "discipline-cpu" tests/30-02-benchmarks-landing.spec.ts && grep -q "discipline-battery-life" tests/30-02-benchmarks-landing.spec.ts` succeeds.
    - `grep -q "GlitchTek" tests/30-02-benchmarks-landing.spec.ts` succeeds (the spec ASSERTS no GlitchTek, so the literal string appears in a `not.toContainText` assertion).
    - `pnpm exec playwright test tests/30-02-benchmarks-landing.spec.ts --project=desktop` exits 0.
    - `pnpm exec playwright test tests/30-02-benchmarks-landing.spec.ts --project=mobile` exits 0.
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
  </acceptance_criteria>
  <done>
    Playwright spec asserts hero copy, methodology blurb, 13 jump-nav anchors in correct order, 13 section ids, 43 tile links, 30 BPR ELIGIBLE badge occurrences, two known-slug tile hrefs, absence of old empty-state copy, single-column mobile grid, sidebar fits one screen on desktop. All passes on desktop + mobile projects.
  </done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- `pnpm exec playwright test tests/30-02-benchmarks-landing.spec.ts --project=desktop` passes
- `pnpm exec playwright test tests/30-02-benchmarks-landing.spec.ts --project=mobile` passes
- `grep -c "GlitchTek" src/app/\(tech\)/tech/benchmarks/page.tsx` returns 0
- Manual smoke: `pnpm dev` then visit http://localhost:3010/tech/benchmarks — verify visually that 13 sections render with hero + jump-nav + tile grid
</verification>

<success_criteria>
- /tech/benchmarks lists all 43 RUBRIC_V1_1 tests (Phase 30 SC-1)
- 13 discipline sections in sortOrder (CPU first, Display last)
- Jump-nav has 13 uppercase discipline anchors that scroll to matching #discipline-* ids
- Each tile links to /tech/benchmarks/{slug} where slug = slugFromRubricKey(key)
- BPR ELIGIBLE badge appears on 7 BPR-eligible discipline sections + every tile in those sections
- Old empty-state stub is removed
- TechHero copy unchanged from 29.2-09 (Phase 30 SC-7 cross-link contract preserved)
- Page is server-rendered, force-static, revalidate=60 (Phase 30 SC-6)
- No GlitchTek typos (Phase 30 SC-9)
- Sidebar one-screen rule preserved (Phase 30 SC-10)
</success_criteria>

<output>
After completion, create `.planning/phases/30-per-benchmark-pages/30-02-SUMMARY.md` documenting:
- Files created/modified
- Whether tsc/lint/playwright (desktop + mobile) all passed first try
- Any deviations (e.g., GlitchHeading API differed; sidebar locator changed)
- Visual smoke verification result (screenshot path or "verified at /tech/benchmarks")
</output>
