---
phase: 48-launch-blocker-proof-pass
plan: 05
subsystem: performance
tags: [vercel, web-vitals, lcp, bundle-size, launch-proof]

requires:
  - phase: 25-performance-audit-fixes
    provides: "Preserved PERF-01, PERF-02, PERF-05, and PERF-07 evidence plus PERF-03/PERF-04/PERF-06 carry-forward gaps"
  - phase: 48-launch-blocker-proof-pass
    provides: "Production deployment target and Phase 48 artifact structure"
provides:
  - "Deployed cold-nav p95 timing proof for `/` and `/tech`"
  - "Mobile LCP p75 proof for `/` and `/tech`"
  - "Bundle gzip-size audit proving no scanned static chunk exceeds 200 KB gzipped"
affects: [48-06, PERF-03, PERF-04, PERF-06, launch-proof]

tech-stack:
  added: []
  patterns:
    - "Use deployed timing artifacts when dashboard exports are unavailable but live production proof is required"
    - "Keep raw timing, Web Vitals, and bundle-size artifacts beside summary matrices"

key-files:
  created:
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/perf/deployed-timing-raw.txt
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/perf/mobile-lcp-raw.json
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/perf/perf-evidence-matrix.md
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/perf/bundle-size-raw.txt
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/perf/bundle-audit.md
  modified: []

key-decisions:
  - "Used deployed timing artifacts instead of Vercel Speed Insights screenshots because the plan explicitly allows equivalent deployed timing proof."
  - "Used Web Vitals p75 for LCP because Core Web Vitals evaluates page experience at the 75th percentile; raw max values remain visible in the evidence."

patterns-established:
  - "Performance proof rows must include observed numeric values and raw evidence filenames, not only dashboard claims."
  - "Bundle audit records raw gzip sizes and the over-threshold count even when no fix is needed."

requirements-completed: [PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07]

duration: 15min
completed: 2026-04-28
---

# Phase 48 Plan 05: Performance Proof Summary

**Production timing, mobile Web Vitals, and bundle gzip-size artifacts close the PERF-03/PERF-04/PERF-06 launch-proof gaps while preserving prior Phase 25 evidence.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-28T05:15:36Z
- **Completed:** 2026-04-28T05:20:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Captured 20 live deployed TTFB samples each for `https://glitchstudios.io/` and `https://glitchtech.io/`.
- Captured mobile LCP samples using Playwright Chromium mobile emulation and `PerformanceObserver` Web Vitals entries.
- Audited `.next/static/chunks` gzip sizes after `pnpm build`; no scanned JS/CSS chunk exceeded the 200 KB gzipped threshold.
- Preserved PERF-01, PERF-02, PERF-05, and PERF-07 Phase 25 evidence while closing the missing deployed PERF proof rows.

## Task Commits

1. **Task 1: Preserve passed performance evidence and prepare deployed URL** - `cce575c` (docs)
2. **Task 2: Capture Vercel cold-nav and mobile LCP evidence** - `e557503` (docs)
3. **Task 3: Bundle audit and small threshold fixes** - `e1a4272` (docs)

## Files Created/Modified

- `.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/perf-baseline.md` - Preserved Phase 25 performance evidence and named production target URLs.
- `.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/deployed-timing-raw.txt` - Raw `curl` timing samples for `/` and `/tech`.
- `.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/mobile-lcp-raw.json` - Raw mobile LCP samples from Playwright/Web Vitals.
- `.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/perf-evidence-matrix.md` - PERF-03 and PERF-04 pass matrix with observed values and evidence filenames.
- `.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/bundle-size-raw.txt` - Raw gzip-size scan of `.next/static/chunks`.
- `.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/bundle-audit.md` - PERF-06 bundle audit summary.

## Observed Values

| Requirement | Route | Observed | Status |
| --- | --- | --- | --- |
| PERF-03 | `/` | p95 TTFB 1.348 s | passed |
| PERF-03 | `/tech` | p95 TTFB 0.197 s | passed |
| PERF-04 | `/` | mobile LCP p75 2.436 s | passed |
| PERF-04 | `/tech` | mobile LCP p75 0.496 s | passed |
| PERF-06 | scanned static chunks | max gzip 168113 bytes; 0 chunks over 200 KB | passed |

## Decisions Made

- Dashboard screenshots were not required for PERF-03 because the plan permits an equivalent deployed timing artifact; raw `curl` timing samples provide auditable production evidence.
- The `/` LCP raw max sample was 2652 ms, but the Web Vitals p75 value was 2436 ms and therefore under the 2.5 s threshold.
- No bundle fix was applied because no scanned static JS/CSS chunk exceeded 200 KB gzipped.

## Deviations from Plan

None - plan executed within the allowed proof paths. The only substitution was using the plan-approved deployed timing artifact instead of a Vercel Speed Insights dashboard export.

## Issues Encountered

- Vercel Speed Insights dashboard export was not used; production timing proof was generated directly from live aliases.
- One `/` LCP sample exceeded 2.5 s, but the p75 Web Vitals value passed. The outlier remains visible in `mobile-lcp-raw.json`.

## User Setup Required

None for performance proof. Remaining Phase 48 blockers still require Resend/Cloudflare dashboard proof and real iOS Safari checkout proof.

## Next Phase Readiness

Plan 48-06 can now treat PERF-03, PERF-04, and PERF-06 as evidence-backed. Wave 2 remains blocked on `48-02` email/domain proof and `48-04` real-device checkout proof.

## Self-Check: PASSED

- `perf-evidence-matrix.md` contains all required PERF-03 and PERF-04 rows with observed values and evidence filenames.
- `bundle-audit.md` contains the required command, exit status, threshold, table header, PERF-06 status, and raw evidence pointer.
- Task commits exist in git history: `cce575c`, `e557503`, and `e1a4272`.

---
*Phase: 48-launch-blocker-proof-pass*
*Completed: 2026-04-28*
