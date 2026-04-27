# brand-engine

Render any animated component on the website to a transparent `.mov` for video editing. The website is the source of truth; this engine is the compositor.

## Usage

```bash
# List the 4 registered assets
pnpm brand:list

# Render hero-tech with default params (matches the live /tech homepage)
pnpm brand:render --asset hero-tech

# Render a parameterized BPR medal callout
pnpm brand:render --asset bpr-medal --tier platinum --score 87

# Render a rating-bar with custom label + value
pnpm brand:render --asset rating-bar --label "BATTERY" --value 7

# Render every registered asset at its default params
pnpm brand:all

# Override defaults
pnpm brand:render --asset hero-tech --output-fps 30 --url http://localhost:3010
```

Output lands in `exports/<asset-id>/<param-hash>/`:

```
exports/bpr-medal/platinum-87-7d/
├── bpr-medal.mov         ← THE deliverable. PNG-in-MOV, bit-perfect RGBA.
├── bpr-medal.webm        ← VP9 alpha for browser preview.
├── frames/               ← Raw captured PNGs at variable timing (debug only).
└── concat.txt            ← ffmpeg concat manifest (debug only).
```

The script verifies every encoded frame is byte-identical to one of the raw captures and exits non-zero if any frame diverges.

## Importing into DaVinci Resolve

The .mov file is bit-perfect RGBA, but DaVinci needs two clip-attribute tweaks once for the file:

1. Drop the `.mov` on the timeline.
2. **Right-click clip → Clip Attributes → Alpha Mode = Straight** (NOT Premultiplied).
3. **Right-click clip → Retime Process = Frame Repeat** (NOT Optical Flow). Optical Flow's motion-compensated interpolation can't track soft alpha edges and visibly smears the pulse-line glow into a "fat bulge."
4. Set the timeline frame rate to **60fps** to match the clip — otherwise DaVinci resamples and may re-introduce soft-edge artifacts.

These settings can be saved as DaVinci defaults so future imports inherit them automatically.

## The methodology (the 7 commandments)

The engine encodes a hard-won formula. Subtract from it at your peril.

1. **Bare `/export/<asset>` route per asset.** Server component with `noindex` metadata, parsed `searchParams`, delegates to a `"use client"` component. The route renders only the animated component on a transparent body — no layout chrome, no nav, no footer.
2. **Phase-0 arming gate.** The animated subtree only mounts after the capture script calls `window.__armCapture()`. Capture frame 0 lands within ~16ms of animation phase 0 — the loop always starts at the natural beginning of the animation.
3. **Inline transparent body override.** Shared `EXPORT_SHELL_CSS` from `src/app/export/_export-shell.ts` zeroes `html, body { background: transparent }`, hides the layout chrome (FloatingCartButton, Next.js dev indicator, route announcer), and pins `#export-root` to a fixed full-viewport box at `z-index: 9999`. CDP's `Emulation.setDefaultBackgroundColorOverride { a: 0 }` makes the screenshot canvas itself alpha-zero so the body's original color never bleeds through.
4. **Real-time CDP screenshot loop.** No clock mocking, no `minterpolate`, no multi-cycle fold. We just `Page.captureScreenshot` as fast as the headless renderer will let us. Captures are at variable wall-clock intervals; ffmpeg's `concat` demuxer + per-frame `duration` lines lock playback speed to live.
5. **Native viewport. No upscaling.** Lanczos-style upscaling rings around bright bolts on transparent backgrounds (sharp positive-on-zero contrast triggers the resampler's overshoot/undershoot). Each asset's registry entry declares the exact viewport it captures at, and that's also the output resolution.
6. **PNG-in-MOV is the canonical format.** `-c:v png -pix_fmt rgba` round-trips the captured PNGs bit-perfectly. ProRes 4444 was tried and discarded: its mandatory RGB→YUV conversion drifts the green channel at sub-opaque alpha edges, which DaVinci then renders as a wider apparent halo (the "fat bulge" pathology). VP9 alpha .webm is also produced, as a secondary preview output for browsers and DaVinci 18.5+.
7. **Capture buffer + bit-perfect verification.** We capture 60ms past the loop duration so the final output frame at `t = loopMs - 1/fps` always has well-defined source data. Every render verifies that all encoded frames byte-match one of the raw captured PNGs (SHA-256 of the RGBA pixel buffers). Any divergence → exit code 2.

## Adding a new asset

1. Create `brand-engine/assets/<id>.mjs` exporting `{ id, route, description, viewport, loopMs, defaultParams, buildQuery, paramHash, validateParams? }`.
2. Register it in `brand-engine/registry.mjs`.
3. Create `src/app/export/<id>/page.tsx` (server component) + `client.tsx` (client component with `__armCapture()` arming gate). Copy the pattern from any existing asset.
4. Run `pnpm brand:list` to confirm the asset appears.
5. Run `pnpm brand:render --asset <id>` and confirm `verification: N/N frames byte-match raw captures ✓`.

The bit-perfect verification step is the safety net — if your encoder is silently shifting pixels (as ProRes 4444 does), the render will fail loudly before you ever load it in DaVinci.

## Folder structure

```
brand-engine/
├── README.md                  ← this file
├── render.mjs                 ← CLI entry: --asset, --list, --all, --output-fps, --url, --out
├── registry.mjs               ← imports + exports the asset list
├── lib/
│   ├── args.mjs               ← parseArgs, num, bool helpers
│   ├── capture.mjs            ← Playwright + CDP screenshot loop, concat-manifest writer
│   ├── encode.mjs             ← ffmpeg PNG-in-MOV + VP9 webm
│   └── verify.mjs             ← bit-perfect SHA-256 sweep
└── assets/
    ├── hero-tech.mjs
    ├── glitch-burst.mjs
    ├── bpr-medal.mjs
    └── rating-bar.mjs

src/app/export/
├── _export-shell.ts           ← shared EXPORT_SHELL_CSS used by every export client
├── hero-tech/{page.tsx,client.tsx}
├── glitch-burst/{page.tsx,client.tsx}
├── bpr-medal/{page.tsx,client.tsx}
└── rating-bar/{page.tsx,client.tsx}

exports/                       ← gitignored; output landing pad
└── <asset-id>/<param-hash>/{*.mov, *.webm, frames/, concat.txt}
```

## v1 asset library

| Asset | Viewport | Loop | Params | Use case |
|---|---|---|---|---|
| `hero-tech` | 1920×1080 | 2000ms | size, bg | Episode title, lower-third background |
| `glitch-burst` | 1920×1080 | 500ms | size | Jump-cut transition stinger |
| `bpr-medal` | 480×120 | 1000ms | tier, score, disciplineCount | Score reveal callout (e.g., "PLATINUM 87%") |
| `rating-bar` | 480×80 | 2000ms | label, value | Benchmark bar fill insert |

## Off-limits source files

The engine deliberately never modifies these — they are the brand:

- `src/components/home/tech-pulse-line.tsx`
- `src/components/home/tech-hero-section.tsx`
- `src/components/home/hero-section.tsx`
- `src/components/tiles/logo-tile.module.css`
- `src/components/tech/bpr-medal.tsx`
- `src/components/tech/review-rating-bar.tsx`

Export-route-specific visual tweaks happen via inline CSS overrides scoped to `#export-root`. The original components stay pristine and the live website is unaffected.

## What this engine deliberately does NOT do

- **No virtual-time injection / `HeadlessExperimental.beginFrame`.** The real-time CDP loop produces bit-perfect output already; layering deterministic-clock injection adds complexity without measurable benefit at our 0.5–3s asset cycles.
- **No auto-cycle-detection.** Each asset declares its `loopMs` in its registry entry. Hand-set, deterministic.
- **No /brand-engine UI dashboard.** CLI-first. A dashboard might happen if the asset library passes ~10 entries.
- **No ProRes 4444 fallback.** The YUV color drift at alpha edges is the exact pathology this engine was built to defeat. If you need ProRes for a specific NLE, add a flag to `lib/encode.mjs` — but expect to lose the bit-perfect guarantee for that output.
- **No multi-format spam.** PNG sequence stays in `frames/` as a debug artifact. Only `.mov` and `.webm` are first-class outputs.

## Prereqs

- Dev server running: `PORT=3010 pnpm dev` (or pass `--url <other>` to the render command)
- ffmpeg on `$PATH`
- Node 24 (uses ES modules, no build step)
- Playwright (already in devDeps, with bundled Chromium)
