---
phase: 10-blog
plan: 04
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/blog/category-filter.tsx
autonomous: true
requirements: [BLOG-02]
must_haves:
  truths:
    - "Category chips render in a horizontal row below the BLOG h1"
    - "The first chip is labelled 'ALL' (uppercase) and clears the category filter"
    - "The active chip uses inverse styling: bg-[#f5f5f0] text-[#000000]"
    - "On mobile the chip row scrolls horizontally (overflow-x-auto) with no wrap"
    - "Chip labels are mono uppercase per UI-SPEC Typography table"
    - "Tapping any chip resets the offset to 0 (so category changes don't carry over Load More state)"
  artifacts:
    - path: "src/components/blog/category-filter.tsx"
      provides: "Polished client component — inverse-active chip, mono uppercase labels, mobile horizontal scroll, resets offset"
      contains: "ALL"
  key_links:
    - from: "src/components/blog/category-filter.tsx"
      to: "URL query state (category param + offset reset)"
      via: "router.push with category + no offset"
      pattern: "params.delete\\(\"offset\"\\)|params.delete\\(\"page\"\\)"
---

<objective>
Polish the existing CategoryFilter client component per D-07 so it's visually inline with the rest of the blog index and resets pagination state when the filter changes. This is a narrow surgical update — rename labels to uppercase, swap the "All" text to "ALL", ensure inverse-active styling matches the UI-SPEC accent rules, guarantee horizontal scroll on mobile, and delete both `page` AND `offset` URL params on click (so category changes play nicely with the Plan 06 Load More implementation).

Purpose: Completes the category-nav portion of BLOG-02 and makes the component cooperate with the new offset-based pagination shipped in Plan 06.

Output: Updated CategoryFilter with uppercase labels, inverse-active styling, mobile horizontal scroll, and offset reset.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/10-blog/10-CONTEXT.md
@.planning/phases/10-blog/10-UI-SPEC.md

@src/components/blog/category-filter.tsx
@src/app/(public)/blog/page.tsx

<interfaces>
From src/components/blog/category-filter.tsx (current shape):

    interface CategoryFilterProps {
      categories: BlogCategory[]
      activeCategory: string | null
    }
    export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps)

This prop signature is consumed by src/app/(public)/blog/page.tsx line 82:

    <CategoryFilter categories={categories} activeCategory={categorySlug} />

DO NOT change the prop signature — Plan 06 continues to pass the same two props.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Polish CategoryFilter — ALL label, inverse-active state, mobile scroll, offset reset</name>
  <files>src/components/blog/category-filter.tsx</files>
  <read_first>
    - src/components/blog/category-filter.tsx (full file — you are editing in place, preserving prop signature)
    - src/app/(public)/blog/page.tsx (to confirm how the component is consumed — its props do not change)
    - .planning/phases/10-blog/10-UI-SPEC.md Copywriting Contract + Interaction Contract sections (exact chip copy + mobile scroll behavior)
  </read_first>
  <action>
    Edit src/components/blog/category-filter.tsx. Preserve the "use client" directive, imports, and CategoryFilterProps interface. Make these specific changes:

    1. In `handleCategoryClick`, after setting / deleting the `category` param, delete BOTH the legacy `page` param AND the new `offset` param so any Load More progress is reset. Replace the existing `params.delete("page")` line with:
       ```ts
       params.delete("page")
       params.delete("offset")
       ```

    2. The "All" button:
       - Change the visible label text from `All` to `ALL` (uppercase)
       - Keep the click handler `() => handleCategoryClick(null)`

    3. Update button className for BOTH the All button AND each mapped category button (they share the same className string — currently identical). Replace the className expression with:
       ```tsx
       clsx(
         "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200",
         isActive
           ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
           : "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]",
       )
       ```
       where `isActive` is `!activeCategory` for the ALL button and `activeCategory === category.slug` for each category button. Keep the existing ternary structure — just change the typography classes to match UI-SPEC Label/Metadata: `text-[11px] font-bold uppercase tracking-wide` (current code uses `text-sm`, which is too large).

    4. Category name rendering: wrap category.name in `{category.name.toUpperCase()}` so user-entered casing (e.g., "News & Updates") displays as `NEWS & UPDATES` per the UI-SPEC mono-uppercase rule.

    5. Update the container `<div>` className. Current: `"flex gap-1 overflow-x-auto pb-2"`. Replace with:
       ```
       flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
       ```
       The scrollbar-hiding classes match the UI-SPEC mobile interaction spec ("no scrollbar visible"). Keep `whitespace-nowrap` on each button (already present) so long category names don't wrap.

    FINAL file should still be a "use client" component with the same default export (named `CategoryFilter`) and the same two props (`categories`, `activeCategory`).
  </action>
  <verify>
    <automated>grep -q "\"use client\"" src/components/blog/category-filter.tsx &amp;&amp; grep -q "ALL" src/components/blog/category-filter.tsx &amp;&amp; grep -q "params.delete(\"offset\")" src/components/blog/category-filter.tsx &amp;&amp; grep -q "bg-\[#f5f5f0\] text-\[#000000\]" src/components/blog/category-filter.tsx &amp;&amp; grep -q "text-\[11px\]" src/components/blog/category-filter.tsx &amp;&amp; grep -q "overflow-x-auto" src/components/blog/category-filter.tsx &amp;&amp; grep -q "toUpperCase" src/components/blog/category-filter.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File keeps `"use client"` directive
    - Contains the literal `ALL` (the button label)
    - Contains `params.delete("offset")` in the handleCategoryClick body
    - Contains `params.delete("page")` in the handleCategoryClick body (preserves compat during migration)
    - Active chip classes include `bg-[#f5f5f0] text-[#000000]` (inverse)
    - Idle chip classes include `bg-[#111111] text-[#888888]` + `border-[#222222]`
    - Button className includes `text-[11px]` `font-bold` `uppercase` `tracking-wide`
    - Container div className includes `overflow-x-auto` + a scrollbar-hiding mechanism (`[scrollbar-width:none]` or `[&::-webkit-scrollbar]:hidden`)
    - Category name rendered with `.toUpperCase()`
    - Prop interface unchanged (`{ categories, activeCategory }`)
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>CategoryFilter shows ALL-first uppercase chips in the inverse-active style, resets offset on click, and scrolls horizontally on mobile without a visible scrollbar.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- Visit /blog?category=news — active chip shows inverse fill; clicking ALL clears filter and removes category param from URL
</verification>

<success_criteria>
- First chip label is `ALL` in uppercase mono
- Active chip uses `#f5f5f0` background + `#000000` text (inverse)
- Mobile: chip row scrolls horizontally, no visible scrollbar
- Tapping any chip resets both `page` and `offset` URL params to 0
- Typography matches UI-SPEC Label/Metadata: mono 11px bold uppercase
</success_criteria>

<output>
After completion, create `.planning/phases/10-blog/10-04-SUMMARY.md` documenting: the exact className sets used (so Plan 06 can match the hero's category badge styling if it wants to), the URL-param cleanup behavior, and confirmation that the component still renders under the same prop signature.
</output>
