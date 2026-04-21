---
phase: 10-blog
plan: 02
status: complete
---

# Plan 10-02 Summary — Reading time helper + badge

## What shipped

- `src/lib/reading-time.ts` exports `readingTime(content)` (pure, 225 wpm, Math.ceil, floor 1) and `readingTimeCached` (react.cache wrapper mirroring portfolio-for-service.ts).
- `src/components/blog/reading-time-badge.tsx` exports `ReadingTimeBadge({ minutes, className? })` — server-safe, no `"use client"`, renders `"{N} MIN READ"` in `font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]`.

## Algorithm

1. Strip HTML tags, markdown punctuation (`# * _ \` ~ > [ ] ( ) !`), collapse whitespace.
2. Split on spaces, filter falsy, count tokens.
3. `Math.ceil(tokens / 225)`, clamped to minimum 1 (empty content also → 1).

## Key files

created:
  - src/lib/reading-time.ts
  - src/components/blog/reading-time-badge.tsx

## Verification

- `pnpm tsc --noEmit` exits 0.
- No vitest configured — helper will be validated through downstream consumers (Plan 03 PostCard, Plan 05 Hero, Plan 07 post detail).
