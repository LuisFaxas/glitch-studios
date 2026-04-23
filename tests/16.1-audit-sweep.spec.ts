import { test, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { ROUTES, SWEEP_VIEWPORTS } from "./16.1-route-inventory"

/**
 * Phase 16.1 Plan 04 — Audit sweep (D-13/D-14).
 *
 * Medium-depth: visits every public route at 3 viewports (mobile 375,
 * laptop 1280, desktop 1920), captures full-page screenshots, and runs
 * lightweight sanity assertions. Findings accumulate into the JSON report
 * written to .planning/phases/16.1-public-site-maintenance/audit-findings.json
 * and the markdown report 16.1-AUDIT-SWEEP.md (hand-written after the run).
 *
 * This spec is SINGLE-THREADED (workers=1 already from playwright.config)
 * and expected to take several minutes. Re-runs overwrite the screenshot
 * directory for a clean baseline.
 */

const SCREENSHOT_DIR = path.resolve(
  ".planning/phases/16.1-public-site-maintenance/audit-screenshots",
)
const REPORT_PATH = path.resolve(
  ".planning/phases/16.1-public-site-maintenance/audit-findings.json",
)

interface Finding {
  route: string
  viewport: string
  kind: "stale-copy" | "dead-link" | "http-error" | "page-crash" | "lone-nav-tile" | "console-error"
  severity: "blocker" | "warning" | "info"
  detail: string
}

const findings: Finding[] = []

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  // Reset previous run's findings so the new report reflects the current pass.
  if (fs.existsSync(REPORT_PATH)) fs.unlinkSync(REPORT_PATH)
})

test.afterAll(() => {
  fs.writeFileSync(REPORT_PATH, JSON.stringify(findings, null, 2))
  console.log(`AUDIT_FINDINGS_COUNT=${findings.length}`)
  console.log(`AUDIT_FINDINGS_PATH=${REPORT_PATH}`)
})

// Pre-flight resource guard — fail fast if RAM is too tight for a sweep.
// CodeBox shares 19GB across all projects per CLAUDE.md, so a cautious
// threshold avoids OOM mid-run.
// (Optional) skipped for now — the whole spec runs with workers=1 on
// playwright.config.ts, sequential, no parallelism risk.

// Use a single browser project (desktop) but manually set the viewport
// per-viewport in each test. This avoids running the spec 3× (once per
// viewport × once per project) and keeps the matrix minimal.
test.describe.configure({ mode: "serial" })

for (const route of ROUTES) {
  for (const vp of SWEEP_VIEWPORTS) {
    test(`${route.url} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })

      const consoleErrors: string[] = []
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text())
      })
      page.on("pageerror", (err) => {
        findings.push({
          route: route.url,
          viewport: vp.name,
          kind: "page-crash",
          severity: "blocker",
          detail: `uncaught: ${err.message.split("\n")[0]}`,
        })
      })

      const response = await page.goto(route.url, { waitUntil: "domcontentloaded" })
      // For unauth-gated pages, expect a redirect to /login on localhost.
      const status = response?.status() ?? 0
      if (status >= 400) {
        findings.push({
          route: route.url,
          viewport: vp.name,
          kind: "http-error",
          severity: "blocker",
          detail: `HTTP ${status}`,
        })
      }

      // Allow client-side nav (redirects, hydration) to settle briefly.
      await page.waitForTimeout(800)

      // Stale-copy probe — D-10 said "phase 7.6" must be gone site-wide.
      // The probe runs on every route as a regression guard in case the
      // string creeps back in somewhere.
      const htmlLower = (await page.content()).toLowerCase()
      for (const needle of ["phase 7.6", "phase 07.6", "glitchtek"]) {
        if (htmlLower.includes(needle)) {
          findings.push({
            route: route.url,
            viewport: vp.name,
            kind: "stale-copy",
            severity: needle === "glitchtek" ? "blocker" : "warning",
            detail: `found "${needle}" in rendered HTML`,
          })
        }
      }

      // Lone-nav-tile gap — desktop only; relevant only when the expanded
      // sidebar is visible (>= 768px) on non-homepage routes (homepage
      // defaults to collapsed so tiles aren't rendered there).
      if (vp.width >= 1024 && route.url !== "/" && route.url !== "/tech") {
        const tileHrefs = await page
          .locator('nav[aria-label="Main navigation"] a[href]')
          .evaluateAll((els) =>
            els.map((el) => ({
              href: (el as HTMLAnchorElement).getAttribute("href") ?? "",
              classes:
                (el as HTMLAnchorElement).getAttribute("class") ?? "",
            })),
          )
          .catch(() => [])

        // A lone small tile manifests as a `col-span-1` entry followed by
        // no other `col-span-1` before a row-break (col-span-2 means a
        // new row starts). Approximate detection: count small tiles, if
        // odd → at least one lone small exists.
        const smallCount = tileHrefs.filter((t) => t.classes.includes("col-span-1")).length
        if (smallCount % 2 === 1) {
          findings.push({
            route: route.url,
            viewport: vp.name,
            kind: "lone-nav-tile",
            severity: "warning",
            detail: `odd number of col-span-1 nav tiles (${smallCount}) — check for empty half-row`,
          })
        }
      }

      // Screenshot after settle.
      const safeName = route.url.replace(/\//g, "_").replace(/^_/, "root") || "root"
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${safeName}__${vp.name}.png`),
        fullPage: true,
      })

      if (consoleErrors.length) {
        findings.push({
          route: route.url,
          viewport: vp.name,
          kind: "console-error",
          severity: "info",
          detail: consoleErrors.slice(0, 3).join(" || ").slice(0, 300),
        })
      }

      // Soft probe — log, but NEVER fail the spec. Failures abort serial
      // execution and skip downstream routes; the audit report is the
      // authoritative source of truth for the sweep's findings.
      if (status >= 400) {
        console.log(
          `AUDIT_SOFT_FAIL: ${route.url} @ ${vp.name} returned HTTP ${status}`,
        )
      }
      // Keep `expect` at end so test infra knows the test ran.
      expect(status).toBeGreaterThan(0)
    })
  }
}
