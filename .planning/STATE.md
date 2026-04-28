---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Production Launch
status: Ready to execute
stopped_at: Completed 48-01-PLAN.md
last_updated: "2026-04-28T03:10:26.439Z"
last_activity: 2026-04-28
progress:
  total_phases: 8
  completed_phases: 7
  total_plans: 58
  completed_plans: 53
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-24 — v4.0 started)

**Core value:** Clients can discover Glitch Studios' work and book services or buy beats in one seamless experience. Tech readers trust GlitchTech's hardware scorecards.
**Current focus:** Phase 48 — launch-blocker-proof-pass

## Current Position

Phase: 48 (launch-blocker-proof-pass) — EXECUTING
Plan: 2 of 6
Gap closure phases 47-48 were added after `.planning/v4.0-MILESTONE-AUDIT.md` returned `gaps_found`.
Next phase: 48 — Launch Blocker Proof Pass.

Phase 30 is complete and verified. Phase 29.3 Plan 06 passed real macOS Safari + Firefox; Phase 47 promoted missing verification backfills into phase-level close artifacts, repaired the ROADMAP checkbox for Phase 29.3, normalized AUDIT/RANK requirements traceability, and left unresolved launch proof visible for Phase 48.

Phase 48 carry-forward blockers:

- Resend/domain deliverability
- auth/OAuth/admin-invite smoke
- mobile checkout purchase proof
- PERF-03/PERF-04/PERF-06 performance evidence

**Root cause identified 2026-04-27T00:48Z (commit 6af8177):** Native pointer/style feedback loop on synchronous React state updates inside native input event handlers. Codex reproduced locally on headless Chromium with real-mouse input. Fix defers `setFilters` + `setOpen` via `setTimeout(0)` out of the native-event task. User verified the final 29.3-06 preview on real macOS Safari + Firefox; Phase 47-02 now records that evidence in `.planning/phases/29.3-rebuild-filter/29.3-VERIFICATION.md`.

Post-root-cause gating commits: `6af8177` (root cause), `12214c7` (price slider commit-on-release), `ba1e747` (PriceRangeSlider replaces Base UI Slider, defer mobile sheet open), `c9d8c60` (cross-engine timeline test), and the 29.3-06 gating/docs commits recorded in `29.3-06-VERIFICATION.md`.

Active debug session: .planning/debug/filter-chip-crash-mac-browsers.md (Current Focus updated to native-event hypothesis; historical image/drop-shadow/min-width hypotheses retained below as superseded).
Phase 29.2 (Site-Wide Hero Rollout) shipped after the 29.3-06 macOS verification pass.

Progress: Phase 22 audit complete 2026-04-24. 25 phases derived + committed to ROADMAP. 10 production bugs caught (6 auth fixed live during audit; 4 broken admin pages + mobile checkout + mobile nav + /forgot-password routes + /about bundled into Phase 23 debug).

**2026-04-27 audit (.planning/audit-screenshots/2026-04-27/AUDIT-FINDINGS.md):**

- Dev server (`pnpm dev` :3010) renders `/tech/rankings/laptops` clean on desktop + mobile, 4/4 Playwright visual tests pass with zero console/page errors
- Filter UI is **rendering** in working tree (`<LeaderboardFilters>` + `<LeaderboardFilterSheet>` mounted) and passed the 29.3-06 real macOS verification path.
- Phase 29.3 ROADMAP checkbox and phase-level verification were reconciled in Phase 47-02.
- 🚨 Local prod (`pm2 glitch_studios_prod` :3004) has a missing build chunk and is misleading any visual check against it. Fix: `pnpm build && pm2 restart glitch_studios_prod`. Vercel prod unaffected.
- Visual flags for human review: BPR medal `1%` suffix consistency, GlitchMark Acer row outlier (8,400 vs 800–1200 cluster)

## Performance Metrics

**Velocity:**

- Total plans completed: 109 (v1.0 + v2.0)
- Average duration: ~4 min (v1.0 baseline)

**v1.0 Reference (36 plans):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 6 | 76min | 12.7min |
| 01.1 | 2 | 4min | 2min |
| 01.2 | 3 | 12min | 4min |
| 01.4 | 3 | 7min | 2.3min |
| 02 | 8 | 27min | 3.4min |
| 03 | 6 | 26min | 4.3min |
| 04 | 8 | 32min | 4min |
| 04.1 | 2 | 6min | 3min |
| Phase 05 P01 | 2min | 2 tasks | 6 files |
| Phase 06 P01 | 2min | 2 tasks | 3 files |
| Phase 06.1 P01 | 2min | 2 tasks | 7 files |
| Phase 07 P01 | 3min | 2 tasks | 4 files |
| Phase 07 P02 | 2min | 2 tasks | 4 files |
| Phase 07.1 P01 | 5min | 2 tasks | 10 files |
| Phase 07.1 P03 | 1min | 1 tasks | 1 files |
| Phase 07.1 P02 | 2min | 2 tasks | 3 files |
| Phase 07.2 P02 | 2min | 2 tasks | 5 files |
| Phase 07.2 P01 | 2min | 1 tasks | 40 files |
| Phase 07.2 P03 | 2min | 2 tasks | 2 files |
| Phase 07.3 P01 | 8min | 2 tasks | 2 files |
| Phase 07.6 P01 | 18min | 8 tasks | 8 files |
| Phase 07.6 P02 | 3min | 2 tasks | 1 files |
| Phase 07.6 P03 | 9min | 13 tasks | 14 files |
| Phase 07.6 P04 | 6min | 6 tasks | 5 files |
| Phase 07.6 P05 | 5min | 6 tasks | 4 files |
| Phase 07.6 P06 | 8min | 10 tasks | 7 files |
| Phase 07.6 P07 | 5min | 7 tasks | 5 files |
| Phase 08 P01 | 2min | 2 tasks | 2 files |
| Phase 08 P02 | 4min | 2 tasks | 2 files |
| Phase 08 P03 | 4min | 1 tasks | 1 files |
| Phase 15 P01 | 15min | 2 tasks | 4 files |
| Phase 15 P02 | 7min | 2 tasks | 2 files |
| Phase 15 P03 | 6 | 2 tasks | 2 files |
| Phase 16 P01 | 10min | 1 tasks | 4 files |
| Phase 16 P02 | 4 | 2 tasks | 2 files |
| Phase 16 P03 | 14 | 1 tasks | 2 files |
| Phase 16 P04 | 19 | 2 tasks | 6 files |
| Phase 29.3 P01 | 7 | 5 tasks | 4 files |
| Phase 29.3 P03 | 5min | 1 tasks | 2 files |
| Phase 29.3 P04 | 45min | 1 tasks | 2 files |
| Phase 47 P01 | 5min | 2 tasks | 4 files |
| Phase 47 P02 | 4min | 2 tasks | 3 files |
| Phase 47-verification-backfill-planning-state-repair P03 | 4min | 3 tasks | 4 files |
| Phase 48-launch-blocker-proof-pass P01 | 5min | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0 Roadmap]: Sequential page-by-page overhaul, one page per phase
- [v2.0 Roadmap]: Playwright screenshots during development for visual verification
- [v2.0 Roadmap]: Admin dashboard first (needed to verify all other pages)
- [v2.0 Roadmap]: Mobile-first verification on every phase
- [Phase 05]: Merged sidebar from 7 to 5 sections (Clients into Commerce, Media into Content)
- [Phase 05]: Three-tier visual hierarchy via border weight and background shade
- [Phase 06.1]: Custom Framer Motion splash over ReactBits -- tighter integration with existing glitch CSS
- [Phase 06.1]: ScrollSection variant prop pattern for diverse section entrance animations
- [Phase 07]: Base UI Select for filter dropdowns replacing chip filters; view toggle prop-driven for shallow:true separation
- [Phase 07]: View toggle uses nuqs shallow:true; decorative CSS waveform bars instead of WaveSurfer in rows
- [Phase 07.1]: audio-decode v3.5 default import API; inline synthetic peaks in seed to avoid server-only conflict; canvas bars bottom-aligned with devicePixelRatio
- [Phase 07.1]: Keep WaveSurfer.js for desktop, canvas Waveform for mobile -- different rendering per viewport
- [Phase 07.1]: Beat card waveform auto-starts playback on seek; list row visual-only per D-08; widget uses !p-0 for edge-to-edge waveform
- [Phase 07.2]: Flat sequential tab bar render replacing split-array; MobileContentWrapper client boundary for dynamic padding
- [Phase 07.2]: Mobile audit uses browser.newContext() with isMobile/hasTouch for true mobile emulation instead of Playwright project config
- [Phase 07.2]: Container-relative positioning (top-1/2, bottom-16) replaces viewport-relative (50vh, 12vh) for correct centering within variable-height hero
- [Phase 07.3]: Removed CompactNowPlaying from menu overlay (D-10) -- redundant with persistent player bar
- [Phase 07.3]: Menu shows only 3 nav items not in tab bar (Book Session, Artists, Contact) per iOS More tab pattern (D-01)
- [v3.0 Roadmap]: Phase 15 is load-bearing — all METH-* schema work must complete before Phase 16 ingest code is written (PITFALLS B-1 to B-5)
- [v3.0 Roadmap]: Phase 17 (BPR Medal + Methodology) can run in parallel with Phase 16 after Phase 15 ships
- [v3.0 Roadmap]: Phase 20 (GlitchTek Blog) can run in parallel after Phase 15 ships — only needs blog brand column
- [v3.0 Roadmap]: BPR medal uses monochrome intensity variants per flat palette (not colors) — requires Josh color approval before Phase 17 ships
- [v3.0 Roadmap]: Methodology content is DB-driven via Tiptap (not MDX) so Josh can update without a redeploy
- [v3.0 Roadmap]: Leaderboard client-sort in memory (corpus <20); flip to server-sort if category exceeds ~500 rows
- [v3.0 Roadmap]: JSONL ingest is parse-then-commit (validate all lines before opening DB transaction) — no partial writes
- [Phase 15]: Migration 0003 applied via direct postgres-js script (not drizzle-kit migrate) — drizzle-kit hits interactive prompt on column conflicts; same pattern as 0002
- [Phase 15]: tech_review_discipline_exclusions table name (D-20/METH-02) — not tech_benchmark_exclusions from ROADMAP wording; CONTEXT is authoritative
- [Phase 15]: discipline column kept nullable on tech_benchmark_tests — rubric seed guarantees non-null on new rows; safer than NOT NULL race during migration
- [Phase 15]: 43 entries in RUBRIC_V1_1 (not 39 as plan must_haves stated) — research matrix and action section both enumerate 43 rows; trusted source of truth over plan typo
- [Phase 15]: Rubric v1.1 seed is self-contained — auto-creates Laptops category if absent so it runs on a fresh DB without prerequisite seeds
- [Phase 15]: Seed env loading: require('dotenv') pattern with config({ path: '.env.local' }) — dotenv is transitive dep; import form causes TS2307 without explicit devDependency
- [Phase 15]: D-16 3-column DISTINCT ON (productId, testId, mode) in getBenchmarkRunsForProducts — no mode='ac' WHERE filter; callers filter downstream
- [Phase 15]: getBenchmarkSpotlight resolves Geekbench 6 Multi via RUBRIC_V1_1 id lookup, not ilike name match (D-17) — rename-safe
- [Phase 15]: Phase 15 assertion scripts use standalone postgres.js (not @/lib/db) to avoid server-only guard in queries.ts
- [Phase 16]: Phase 16 Plan 01: bpr.ts single-module design — pure math + async DB code colocated; vitest uses server-only stub via alias so unit tests run in Node context
- [Phase 16]: Phase 16 Plan 01: vitest adopted as project unit-test runner (previously Playwright-only); config stubs server-only + maps @/ alias
- [Phase 16]: Phase 16 Plan 02: Zod v4 .issues (not .errors) — installed zod@4.3.6; plan snippet used legacy API
- [Phase 16]: Phase 16 Plan 02: commit transaction passes tx to computeBprScore so BPR recompute sees uncommitted just-inserted rows on the same connection (Postgres READ COMMITTED)
- [Phase 16]: Phase 16 Plan 02: ingest split into src/actions/admin-tech-ingest.ts (not appended to admin-tech-benchmarks.ts) — keeps ingest logic isolated, file remains ~520 lines vs 84-line benchmarks file
- [Phase 16]: Phase 16 Plan 03: @base-ui accordion uses multiple boolean (not type='multiple'); Button has no asChild — use Link/anchor + buttonVariants() for styled links
- [Phase 16]: Phase 16 Plan 04: JSONL fixture 'field' values must match RUBRIC_V1_1 object-key suffix (short form), not the longer RubricTestSpec.field property — pre-existing rubric inconsistency logged to deferred-items.md for rubric v1.2 remediation
- [Phase 16]: Phase 16 Plan 04: Playwright E2E tests skip gracefully when ADMIN_EMAIL/ADMIN_PASSWORD/TEST_REVIEW_ID env are unset — mirrors tests/07.5-*.spec.ts convention; tests commit-safe even without CI envs
- [Phase 29.3]: Phase 29.3 Plan 01: Footer marked 'use client' (NewsletterForm child already client) — chosen over <FooterLogo> island for smaller blast radius
- [Phase 29.3]: Phase 29.3 Plan 01: Table min-width 1280px (laptop standard) chosen over 100% — Codebox VM cannot validate column legibility on real macOS browsers; Plan 29.3-02 will A/B if needed
- [Phase 29.3]: Phase 29.3 Plan 01: Columns useMemo eslint-disable retained — SortHeader receives currentSort/currentDir as JSX props but ignores them at destructure; ESLint can't see the dead-prop pattern
- [Phase 29.3]: Phase 29.3 Plan 03: Discarded an in-progress unstaged CustomDropdown rewrite of leaderboard-filter-sidebar.tsx — abandoned earlier rebuild attempt that violates phase boundary (CONTEXT explicitly defers chip-bar rewrite). Reset file to HEAD before applying single data-testid edit.
- [Phase 29.3]: Phase 29.3 Plan 03: Did NOT touch the SortHeader atomic-fix at leaderboard-table.tsx:146 — sort onClick re-enable is sibling work to filter remount, but out-of-scope this plan. Revisit after Plan 05 verifies chip-click safety on macOS.
- [Phase 29.3]: Phase 29.3 Plan 04: Spec uses dispatchEvent('click') for ALL clicks (5 trigger + 21 chip clicks) — Playwright natural .click() and keyboard.press hang for 30s on Chromium / throw 'Page closed' on Webkit when fired during/after the chip-bar's setFilters re-render schedule
- [Phase 29.3]: Phase 29.3 Plan 04: DOM leak guard scoped to [data-base-ui-portal] subtree (~10 nodes, ±2 tolerance), NOT body subtree (337-node delta on chromium = false positive from table reflow when filter narrows row count)
- [Phase 29.3]: Phase 29.3 Plan 04: playwright.config.ts baseURL honors PLAYWRIGHT_BASE_URL env override — needed because the Codebox prod server (port 3004) runs a stale build predating Plan 03's data-testid; user's separate dev server on port 3010 has current source
- [Phase 47]: Phase 22 verification is passed for AUDIT-01 through AUDIT-04; the missing artifact was the only audit gap for that group.
- [Phase 47]: Phases 23, 24, and 25 remain gaps_found to preserve mobile checkout, email deliverability, and PERF proof carry-forwards for Phase 48.
- [Phase 47]: Phase 29 remains the formal RANK-01 through RANK-07 implementation evidence; Phase 29.1 contributes polish evidence only.
- [Phase 47]: Phase 29.3 is phase-level passed from 29.3-06 real macOS Safari and Firefox verification, while 29.3-05 remains failed_superseded for timeline truth.
- [Phase 47]: AUDIT-01 through AUDIT-04 and RANK-01 through RANK-07 are complete only as Phase 47 evidence normalization, not as new launch proof.
- [Phase 47]: Phase 48 remains the owner for Resend/domain deliverability, auth/OAuth/admin-invite smoke, mobile checkout purchase proof, and PERF-03/PERF-04/PERF-06 performance evidence.
- [Phase 48-launch-blocker-proof-pass]: 48-01 records baseline evidence only; EMAIL, PERF, and AUTH requirements remain open until dashboard, inbox, deployed URL, or real-device proof exists.
- [Phase 48-launch-blocker-proof-pass]: 48-01 Vercel env inventory records encrypted variable presence only and intentionally excludes secret values.

### Roadmap Evolution

- Phase 06.1 inserted after Phase 6: Homepage Flair (INSERTED) — Splash logo animation, scroll-driven effects, animated scroll indicator, Glitch logo in hero, beat card spacing. From user review during Phase 6 checkpoint.
- Phase 07.1 inserted after Phase 7: Listening Experience & Waveform Overhaul (INSERTED) — Real waveform generation, WaveSurfer.js, interactive player bar, sidebar widget improvements
- Phase 07.2 inserted after Phase 7.1: Mobile Experience Overhaul (URGENT) — Bottom nav broken, no hamburger menu, no sign-in, hero breaks on mobile, entire mobile UX needs overhaul. From Phase 07 UAT.
- Phase 07.4 inserted after Phase 7: Brand architecture & Glitch Tech sub-brand foundation (INSERTED) — Pivot to add tech reviews vertical. Pick brand model (sections vs subdomains), build Glitch Tech shell, nav, landing page.
- Phase 07.5 inserted after Phase 7: Product reviews data model & admin input (INSERTED) — Drizzle schema for products/categories/benchmarks, admin CRUD for computer reviews rubric (Geekbench, 3DMark, storage, AI).
- Phase 07.6 inserted after Phase 7: Reviews display & comparison tables (INSERTED) — Public review page template with YouTube embed, comparison tables with Recharts.
- v3.0 Milestone started: Phases 15-21 added (2026-04-20) — GlitchTek Launch: methodology lock, JSONL ingest, BPR medal, category leaderboard, flagship review, tech blog, deploy hardening.
- Phase 29.1 inserted after Phase 29 (2026-04-26): Master Leaderboard Polish (INSERTED) — top-level /tech/rankings route + sidebar nav button next to Blog, hero sections on rankings + category pages, horizontal-scroll fix, filter UI rework, mobile view toggle, GlitchMark scale display revisit. Sequential execution with Playwright verification per task. From user UAT immediately after Phase 29 ship.
- Phase 29.3 inserted after Phase 29.2 (2026-04-26): Reduce Filter-Path GPU Baseline + Re-Enable Filter (URGENT). Filter chip clicks on `/tech/rankings/laptops` crashed macOS Safari + Firefox tabs across 15+ deploy attempts. Final 29.3-06 verification passed on real macOS Safari + Firefox; investigation artifact: `.planning/debug/filter-chip-crash-mac-browsers.md`. Phase 47-02 reconciled the stale roadmap/state artifacts and wrote phase-level verification.

### Pending Todos

- Phase 15 plan-phase needed before any v3.0 code is written
- Medal color approval from Josh required before Phase 17 ships (current proposal: monochrome intensity — Platinum white/black, Gold #888/black, Silver outlined, Bronze dashed)
- Rubric map completeness: CPU discipline confirmed from §3.1; extend rubric-map.ts as remaining 12 disciplines are benchmarked when Mac returns 2026-04-25
- **Clean up UAT owner account** `uat-admin@glitchstudios.local` (id `4SiXiidcECIpu7XgJ9JjBLyimUVQvrzj`, role=owner, password `UatAdmin!2026`) — created 2026-04-22 during Phase 16 UAT because the real admin password was unknown. Delete this account before prod deploy OR rotate password + audit it as a real owner. Tracked because it bypasses the normal provisioning path.
- **Wire up Resend + transactional email** — Resend SDK is not integrated. Currently broken: password reset / forgot-password flow, booking confirmation emails, contact form notifications, newsletter broadcasts, any Better Auth email verification. This affected Phase 16 UAT: the only path to recover `admin@glitchstudios.com` was a manual DB account creation because the forgot-password email would not send. Needs its own phase before launch.

### Blockers/Concerns

- Review Mac (MBP 16" M5 Max 64GB) returns 2026-04-25 — only CPU §3.1 benchmarks captured; 12 disciplines remaining. Ingest wizard must be ready by then.
- `blog_categories` UNIQUE(slug) constraint — check schema.ts before writing Phase 15 migration to confirm whether to change to UNIQUE(slug, brand)
- Phase 4.1 Plan 03 (smoke test) still marked incomplete from v1 -- site may have untested routes
- Resend / email delivery is not functional anywhere in the app — any feature that relies on email (auth recovery, booking confirmations, contact replies) will silently fail until the integration phase runs.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260331-2ug | Waveform polish pass — full-bleed sidebar widget, player bar gradient fix, list row interactivity + duration | 2026-03-31 | 285e935 | [260331-2ug-waveform-polish-pass](./quick/260331-2ug-waveform-polish-pass/) |
| 260331-3xw | Player bar restore button + auth button under cart | 2026-03-31 | cdcb6d6 | [260331-3xw-player-bar-restore-auth-relocation](./quick/260331-3xw-player-bar-restore-auth-relocation/) |
| 260331-5ob | Beats hero carousel — 3-slide Embla autoplay replacing BundleSection | 2026-03-31 | 5ea27bd | [260331-5ob-beats-hero-carousel](./quick/260331-5ob-beats-hero-carousel/) |
| 260401-lbs | Compact cards view + localStorage persistence — 3-mode toggle (compact/large/list) | 2026-04-01 | 3d9fc76 | [260401-lbs-compact-cards-view-persistence](./quick/260401-lbs-compact-cards-view-persistence/) |
| 260401-m19 | ElasticSlider volume control + BPM range slider jumpiness fix | 2026-04-01 | 708e323 | [260401-m19-elastic-slider-integration](./quick/260401-m19-elastic-slider-integration/) |
| 260416-wav | Research animation libraries for React/Next.js ECG heartbeat pulse and cyberpunk motion effects | 2026-04-17 | — | [260416-wav-research-animation-libraries-for-react-n](./quick/260416-wav-research-animation-libraries-for-react-n/) |
| 260423-rfu | Document rubric-map key/field short-form contract before 2026-04-25 Mac harness use | 2026-04-23 | 275fce0 | [260423-rfu-document-rubric-map-key-field-short-form](./quick/260423-rfu-document-rubric-map-key-field-short-form/) |

## Session Continuity

Last session: 2026-04-28T03:10:26.432Z
Stopped at: Completed 48-01-PLAN.md
Resume file: None
Next session entry point: Plan Phase 48 to prove Resend/domain deliverability, auth/OAuth/admin-invite smoke, mobile checkout purchase proof, and PERF-03/PERF-04/PERF-06 performance evidence.

Last activity: 2026-04-28
