# Bundle Audit

Captured: 2026-04-28T05:17:40Z

command: pnpm build
exit status: 0
bundle_source: `.next/static/chunks` gzip-size scan after local production build; raw evidence in `bundle-size-raw.txt`
threshold: no non-route-critical client-only bundle > 200 KB gzipped
PERF-06: passed

| bundle_or_route | gzipped_size | route_critical | action | status |
| --- | --- | --- | --- | --- |
| largest static chunk: `.next/static/chunks/0w.ita5~ipt8~.js` | 168113 bytes (164.2 KB) | shared client/runtime chunk | No action; under 200 KB gzipped threshold | passed |
| second largest static chunk: `.next/static/chunks/0-iwmbe30d~sy.js` | 155020 bytes (151.4 KB) | shared client/runtime chunk | No action; under 200 KB gzipped threshold | passed |
| third largest static chunk: `.next/static/chunks/0-ztltz8e71h_.js` | 140051 bytes (136.8 KB) | shared client/runtime chunk | No action; under 200 KB gzipped threshold | passed |
| all scanned `.next/static/chunks` JS/CSS files | max 168113 bytes gzipped across 122 files | mixed | No non-route-critical client-only bundle exceeded 200 KB gzipped | passed |

## Raw Evidence

- `bundle-size-raw.txt` contains `bytes_gzip bytes_raw path` for all scanned chunk files.
- Over-threshold count: `0`.
