---
phase: 48-launch-blocker-proof-pass
plan: 05
artifact: perf-baseline
recorded_at: 2026-04-28T03:13:22Z
source_phase: 25-performance-audit-fixes
---

# Performance Baseline

deployed_url: https://glitchstudios.io/ and https://glitchtech.io/

Production brand hosts are the target for the Phase 48 performance run. Phase 48 research names `https://glitchstudios.io/` for the Studios root and `https://glitchtech.io/` for the Tech brand surface; dashboard or Lighthouse evidence still needs explicit observed values before any open PERF row can pass.

| requirement | status | evidence |
| --- | --- | --- |
| PERF-01 | preserved | Phase 25 evidence: admin Studios/Tech context switcher under 500 ms |
| PERF-02 | preserved | Phase 25 evidence: admin edit-page to ingest-wizard navigation under 500 ms |
| PERF-05 | preserved | Phase 25 evidence: image audit found zero native img tags in src |
| PERF-07 | preserved | Phase 25 evidence: database query/index audit completed |
| PERF-03 | open | capture public route cold-nav p95 < 1.5 s TTFB on Vercel |
| PERF-04 | open | capture mobile LCP on / and /tech < 2.5 s |
| PERF-06 | open | capture bundle audit for client-only bundles > 200 KB gzipped |

## Preserved Evidence Sources

| source | preserved requirements | notes |
| --- | --- | --- |
| `.planning/phases/25-performance-audit-fixes/25-01-SUMMARY.md` | PERF-01, PERF-02 | Recorded 258 ms Studios to Tech and 287 ms Tech to Studios in dev, under the perceived-latency target. |
| `.planning/phases/25-performance-audit-fixes/25-02-SUMMARY.md` | PERF-07 | Recorded 20 schema-side indexes and migration coverage for database query/index audit. |
| `.planning/phases/25-performance-audit-fixes/25-03-SUMMARY.md` | PERF-05 | Recorded zero native `<img>` tags remaining in `src/`. |
| `.planning/phases/25-performance-audit-fixes/25-VERIFICATION.md` | PERF-03, PERF-04, PERF-06 | Preserved as gaps_found until Phase 48 captures deployed cold-nav, mobile LCP, and bundle evidence. |
