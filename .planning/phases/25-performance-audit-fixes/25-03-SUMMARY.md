---
phase: 25-performance-audit-fixes
plan: 03
status: complete
completed: 2026-04-24
---

## What was built

Closed PERF-05 image pipeline audit: zero native `<img>` tags remain in `src/`.

### Changes

**`src/components/admin/tech/review-editor.tsx`**
- Added `import Image from "next/image"`.
- Line 375: hero preview `<img>` → `<Image width={400} height={96} sizes="400px" unoptimized>`.
- Line 411: gallery thumb `<img>` → `<Image width={64} height={64} sizes="64px" unoptimized>`.
- Removed the `eslint-disable` comments that suppressed the `<img>` lint warning.

**`src/components/admin/tech/product-form.tsx`**
- Added `import Image from "next/image"`.
- Line 235: hero preview `<img>` → `<Image width={800} height={160} sizes="800px" unoptimized>`.
- Removed suppression comment.

### Why `unoptimized`

All 3 replacements render user-uploaded URLs (R2-backed media). Next Image's optimizer refuses unknown domains unless they're in `next.config.ts` `images.remotePatterns`. Using `unoptimized` keeps the Next Image component structure (progressive enhancement if we whitelist the R2 CDN later) while not breaking admin previews today.

### Tests

`tests/25-03-image-pipeline.spec.ts` — 1/1 passed:
- `grep -rn --include="*.tsx" -E "<img[ >]" src/` returns zero matches. Future regressions caught automatically.

### Deviations

None. Plan executed verbatim.
