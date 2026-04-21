---
phase: 14-global-polish
plan: 02
status: complete
requirements: [POLISH-02]
---

## Delivered

Footer newsletter labeled, sized, and copyright separated.

## Changes

- **NewsletterForm** — added `compact?: boolean` prop. When true: `h-8` inputs + button, `text-xs` + `text-[10px]` respectively, `px-4`. Default remains `h-10`. Input got `min-w-0` so it shrinks cleanly at 375px instead of overflowing flex.
- **NewsletterForm** — button label "Join" → "Subscribe".
- **Footer** — new right column: `STAY IN THE LOOP` label (tracking-[0.2em]) above `<NewsletterForm compact />` constrained to `md:w-[280px]`.
- **Footer** — copyright moved to its own bottom row with `mt-4 pt-4 border-t border-[#1a1a1a]`.

## Verification

- `pnpm tsc --noEmit` passes.
