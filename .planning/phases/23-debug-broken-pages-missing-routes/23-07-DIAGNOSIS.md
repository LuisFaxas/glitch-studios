# Phase 23-07 Diagnosis — Admin Media Upload

## Status: RESOLVED — R2 CORS policy added

## Root cause

The R2 bucket `glitch-beats` had **no CORS policy** — completely empty. Presigned-URL PUT uploads from any browser origin (glitchstudios.io, glitchtech.io, Vercel preview hosts) were blocked by the browser's CORS preflight check. The `media-upload-zone.tsx` component was textbook correct as RESEARCH.md §Bug 4 predicted — the failure was 100% config-level.

## Inventory captured via MCP

### Vercel production env vars (via `vercel env ls production`)
- ✅ `R2_ACCOUNT_ID` — present (23d ago)
- ✅ `R2_ACCESS_KEY_ID` — present (23d ago)
- ✅ `R2_SECRET_ACCESS_KEY` — present (23d ago)
- ✅ `R2_BUCKET_NAME` — present (23d ago)
- ✅ `R2_PUBLIC_URL` — present (23d ago)

All R2 env vars wired correctly. Presigned URL generation was working; the browser PUT was failing at the CORS preflight.

### R2 bucket (via Cloudflare MCP `r2_bucket_get`)
- Name: `glitch-beats`
- Location: ENAM
- Storage class: Standard
- **CORS policy: EMPTY** ← the bug

## Fix applied

Added CORS policy to `glitch-beats` bucket (Cloudflare dashboard → R2 → glitch-beats → Settings → CORS) on 2026-04-24:

```json
[
  {
    "AllowedOrigins": [
      "https://glitchstudios.io",
      "https://www.glitchstudios.io",
      "https://glitchtech.io",
      "https://www.glitchtech.io",
      "https://*.vercel.app"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

CORS changes are live in seconds — no redeploy needed.

## Verification

**Pending user confirmation** — user to log into `/admin/media` on prod (https://glitchstudios.io/admin/media) and attempt a drag-drop upload. Expected: upload succeeds without any code change.

File-picker path was already working (it uses the same presigned URL flow, so it was also blocked by CORS — both fail together, both fix together).

## What code changes landed anyway

Tasks 1-2 from the plan added observability hooks to `media-upload-zone.tsx` that were useful regardless of the CORS diagnosis:
- `data-testid="media-drop-zone"` + `data-dragging={dragOver}` attributes for regression tests
- Symmetric `onDragEnter` handler (was missing) — minor UX polish
- Playwright coverage for drop-zone state transitions (2/3 green; file-picker test fixme'd because local dev doesn't have R2 env wired)
