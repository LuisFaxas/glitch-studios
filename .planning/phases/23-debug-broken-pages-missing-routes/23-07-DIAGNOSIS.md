# Phase 23-07 Diagnosis — Admin Media Upload

## Status: Code hooks shipped — prod diagnosis BLOCKED on user action

Per RESEARCH.md §Bug 4, `media-upload-zone.tsx` is textbook correct (preventDefault on dragover + drop, sane MIME/size validation, standard presigned-URL → XHR-PUT flow). The prod failure is almost certainly config-level (R2 CORS or missing env vars). This requires Vercel preview deploy + Cloudflare R2 dashboard inspection, neither of which the agent can drive.

## What's been done (Task 1-2 — agent-autonomous)

### `src/components/admin/media-upload-zone.tsx`
- Added `data-testid="media-drop-zone"` and `data-dragging={dragOver ? "true" : "false"}` to the drop-zone root — non-behavioral, enables regression testing.
- Added `onDragEnter` handler symmetric to existing `onDragOver` (both set `setDragOver(true)` + `preventDefault`). Fills a gap where entering the zone didn't always flip visual state before first move.

### Tests
`tests/23-07-media-upload.spec.ts` — 2/3 passed (desktop):
- ✅ Drop zone visible with testid + initial `data-dragging=false`
- ✅ Drag state flips `true` on `dragenter` and back to `false` on `dragleave`
- ⏭️ File-picker happy path — `test.fixme` because local R2 PUT fails without CORS + env; unblocks when prod/preview config is verified

`tests/fixtures/tiny.png` committed (69-byte 1x1 PNG for upload fixture).

## What's blocked (Tasks 3-4 — user action required)

1. **Deploy to Vercel preview.**
2. **On preview URL, visit `/admin/media`:**
   - Attempt file-picker upload (record outcome + browser console XHR response).
   - Attempt drag-drop upload (record outcome + XHR response).
   - Compare — do both fail the same way?
3. **Vercel dashboard → Logs** filter by `/admin/media` + Server Actions. Look for errors from `getMediaUploadUrl` or `confirmMediaUpload`. Paste most recent entry below.
4. **Vercel dashboard → Env Variables (Production):**
   - `R2_ACCESS_KEY_ID`: present?
   - `R2_SECRET_ACCESS_KEY`: present?
   - `R2_BUCKET`: present? value?
   - `R2_ENDPOINT`: present? value?
   (Check `src/actions/admin-media.ts` for the exact env-var names if different.)
5. **Cloudflare dashboard → R2 → bucket → Settings → CORS:**
   - Allowed origins list (look for prod + preview hostnames)
   - Allowed methods (must include `PUT`)
   - Allowed headers (must include `Content-Type` or `*`)

### Checkpoint — awaiting user

Please fill in this section:

```markdown
## Reproduction
- Preview URL:
- File-picker outcome:
- Drag-drop outcome:
- Both fail the same way? YES/NO

## Vercel log (most recent error)
```
{paste log line}
```

## Env inventory (Production)
- R2_ACCESS_KEY_ID: {present?}
- R2_SECRET_ACCESS_KEY: {present?}
- R2_BUCKET: {present? value?}
- R2_ENDPOINT: {present? value?}

## R2 CORS rules
- Allowed origins:
- Allowed methods:
- Missing origin(s)?

## Root cause:
{one sentence}

## Fix plan:
{one sentence — CORS update / env var set / code change}

## Fix applied:
{what changed, when}
```

Once filled in, Task 4 (apply the targeted fix and re-verify) can proceed.
