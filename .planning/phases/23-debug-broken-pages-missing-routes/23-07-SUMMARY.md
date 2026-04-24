---
phase: 23-debug-broken-pages-missing-routes
plan: 07
status: complete
completed: 2026-04-24
---

## What was built

Closed Audit §D.1 `/admin/media` upload failure.

### Root cause

R2 bucket `glitch-beats` had an **empty CORS policy**. Browser-originated presigned-URL PUTs from prod origins (glitchstudios.io, glitchtech.io) were blocked by the CORS preflight. `media-upload-zone.tsx` was correct (as RESEARCH.md §Bug 4 predicted).

### Fix

Added CORS policy to `glitch-beats` bucket (Cloudflare dashboard → R2 → Settings → CORS). Allows the five prod/preview origins on GET/PUT/POST/DELETE/HEAD. No code redeploy needed — CORS changes are live immediately. See [23-07-DIAGNOSIS.md](.planning/phases/23-debug-broken-pages-missing-routes/23-07-DIAGNOSIS.md) for the exact JSON applied.

### Code changes (Tasks 1-2 shipped anyway for observability)

**`src/components/admin/media-upload-zone.tsx`**
- Added `data-testid="media-drop-zone"` and `data-dragging={dragOver ? "true" : "false"}` on the drop-zone root (non-behavioral — enables regression testing).
- Added `onDragEnter` handler symmetric to `onDragOver` — both `preventDefault` + `setDragOver(true)`. Fills minor edge case where entering the zone didn't flip visual state before first mouse move.

**`tests/23-07-media-upload.spec.ts`** (new) — 2 passed (desktop):
- ✅ Drop zone testid present + initial `data-dragging=false`
- ✅ Drag state flips true on `dragenter`, back to false on `dragleave`
- ⏭️ File-picker upload fixme'd (requires R2 env locally — prod verification replaces it)

**`tests/fixtures/tiny.png`** — 69-byte 1×1 PNG fixture.

## Diagnosis method

Entire investigation was MCP-driven, no Vercel preview deploy needed:
- `vercel env ls production` — confirmed all 5 R2_* vars present.
- Cloudflare MCP `r2_buckets_list` + `r2_bucket_get` — found the bucket, confirmed location.
- Cloudflare dashboard → CORS panel → user confirmed empty policy.
- Applied CORS fix via dashboard.

Total diagnosis time: ~5 minutes.

## Deviations from plan

Plan Tasks 3-4 assumed a full Vercel-preview + real-device reproduction cycle. The env + CORS inventory via MCP short-circuited that: the missing CORS rule was immediately obvious once inventoried. Real-device test still pending user confirmation at production URL.
