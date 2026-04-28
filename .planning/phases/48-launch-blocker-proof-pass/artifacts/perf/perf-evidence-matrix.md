# Performance Evidence Matrix

Captured: 2026-04-28T05:15:36Z through 2026-04-28T05:17:20Z
Deployment: production aliases `https://glitchstudios.io/` and `https://glitchtech.io/`

| requirement | route | source | metric | threshold | observed | evidence | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PERF-03 | / | Deployed timing artifact, 20 cache-busted GET samples with `curl -w time_starttransfer` | p95 TTFB/cold-nav | < 1.5 s | 1.348 s | deployed-timing-raw.txt | passed |
| PERF-03 | /tech | Deployed timing artifact, 20 cache-busted GET samples with `curl -w time_starttransfer` | p95 TTFB/cold-nav | < 1.5 s | 0.197 s | deployed-timing-raw.txt | passed |
| PERF-04 | / | Web Vitals artifact from Playwright Chromium mobile emulation using `PerformanceObserver` LCP entries | LCP p75 | < 2.5 s | 2.436 s | mobile-lcp-raw.json | passed |
| PERF-04 | /tech | Web Vitals artifact from Playwright Chromium mobile emulation using `PerformanceObserver` LCP entries | LCP p75 | < 2.5 s | 0.496 s | mobile-lcp-raw.json | passed |

## Notes

- Vercel Speed Insights dashboard export was not required because the plan allows an equivalent deployed timing artifact.
- `/` LCP samples were `1064,1160,2328,2436,2652` ms. The p75 Web Vitals value is under threshold; one max sample exceeded 2.5 s and remains visible in `mobile-lcp-raw.json`.
- `/tech` LCP samples were `440,456,468,496,1792` ms.
- Raw timing and browser artifacts are intentionally kept next to this matrix for auditability.
