---
phase: 10-blog
plan: 07
status: complete
---

# Plan 10-07 Summary — Post detail reading time

## What shipped

- `estimateReadTime` helper deleted from `src/components/blog/post-content.tsx`.
- Reading time now derives from `readingTimeCached` (shared with index + hero).
- `ReadingTimeBadge` replaces `<span>{readTime} min read</span>`.
- Date format upgraded to UI-SPEC short-form (`APR 20 2026`).
- Metadata row unified: `{N} MIN READ · APR 20 2026 · {CATEGORY}` with gap-2 spacing and muted middle-dot separators.
- Category badge rewritten to match the hero/card style (mono 11px bold uppercase tracking-wide in `#222222/#888888`).

## Scope boundary held

- Prose block (`dangerouslySetInnerHTML` with prose classes) untouched.
- Back-to-Blog link untouched.
- Cover image block untouched.
- `<h1>` typography untouched.

## Key files

modified:
  - src/components/blog/post-content.tsx

## Verification

- `pnpm tsc --noEmit` exits 0.
