---
phase: 10-blog
plan: 04
status: complete
---

# Plan 10-04 Summary — Category filter polish

## What shipped

- `CategoryFilter` now renders `ALL` (uppercase) as the first chip and maps each category name via `.toUpperCase()`.
- Typography updated to UI-SPEC Label/Metadata: `font-mono text-[11px] font-bold uppercase tracking-wide`.
- Active chip styling preserved (`bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]`), idle: `bg-[#111111] text-[#888888] border-[#222222]`.
- `handleCategoryClick` now deletes both `page` and `offset` URL params so the category change resets Plan 06's Load More state.
- Container scroll container hides scrollbars cross-browser via `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`.

## ClassName sets (for Plan 06 reuse)

- Chip base: `px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200`
- Active chip: `bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]`
- Idle chip: `bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]`
- Row: `flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`

## Key files

modified:
  - src/components/blog/category-filter.tsx

## Verification

- `pnpm tsc --noEmit` exits 0.
- Prop signature (`{ categories, activeCategory }`) unchanged — callers (including `/blog/page.tsx`) need no updates.
