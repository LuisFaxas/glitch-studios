---
phase: 14-global-polish
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/footer.tsx
  - src/components/forms/newsletter-form.tsx
autonomous: true
requirements: [POLISH-02]
must_haves:
  truths:
    - "A 'STAY IN THE LOOP' label in font-mono uppercase appears above the newsletter input in the footer — visitors know what they're signing up for"
    - "The newsletter submit button reads 'Subscribe' (not 'Join') on all screen sizes"
    - "On mobile (375px), the newsletter input is full-width and not cramped — the form fills its container instead of competing with a sibling element"
    - "The copyright line is visually separated from the newsletter form — not inline with the button on mobile"
    - "The footer's condensed single-row layout on desktop is preserved — no structural redesign"
    - "pnpm tsc --noEmit passes with no new errors"
  artifacts:
    - path: "src/components/layout/footer.tsx"
      provides: "Footer with 'Stay in the loop' label above newsletter form + copyright moved to its own bottom row"
      contains: "Stay in the loop"
    - path: "src/components/forms/newsletter-form.tsx"
      provides: "NewsletterForm with 'Subscribe' button copy, compact prop support, and className pass-through"
      contains: "Subscribe"
  key_links:
    - from: "src/components/layout/footer.tsx"
      to: "src/components/forms/newsletter-form.tsx"
      via: "Renders <NewsletterForm compact /> inside the right-column div"
      pattern: "NewsletterForm"
---

<objective>
Fix the footer newsletter section: add a "STAY IN THE LOOP" label above the form, rename the button from "Join" to "Subscribe", make the input full-width on mobile, and move the copyright notice to its own bottom row so it's not inline with the button. Keep the footer's condensed single-row layout on desktop intact.

Purpose: POLISH-02 — the footer newsletter signup is currently unlabeled, the button copy is generic, and mobile layout is cramped. These are the specific "buried or undersized" signals described in the ROADMAP success criterion.

Output:
- Updated `src/components/forms/newsletter-form.tsx` — button copy changed to "Subscribe"; accepts `compact` boolean prop that reduces height from `h-10` to `h-8`
- Updated `src/components/layout/footer.tsx` — "Stay in the loop" label above `<NewsletterForm compact />`; copyright moved to its own row at the bottom of the footer
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@src/components/layout/footer.tsx
@src/components/forms/newsletter-form.tsx

<interfaces>
<!-- Key types and contracts the executor needs. -->

Current NewsletterForm interface (from newsletter-form.tsx):
```typescript
interface NewsletterFormProps {
  source?: NewsletterSource
}
export function NewsletterForm({ source }: NewsletterFormProps = {})
```
After this plan, the interface becomes:
```typescript
interface NewsletterFormProps {
  source?: NewsletterSource
  compact?: boolean   // when true: h-8 input + button instead of h-10; used in footer
}
```

Current footer right column (from footer.tsx):
```tsx
{/* Right: Newsletter + copyright */}
<div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4 shrink-0">
  <NewsletterForm />
  <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#333333] whitespace-nowrap">
    &copy; 2026 Glitch Studios
  </p>
</div>
```

Current footer outer structure:
```tsx
<footer className="mt-16 border-t border-[#222222] bg-[#0a0a0a]">
  <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      {/* Left: Logo + tagline + nav + social icons */}
      ...
      {/* Right: Newsletter + copyright */}
      ...
    </div>
  </div>
</footer>
```

Target palette (locked): `#000000 #0a0a0a #111111 #222222 #f5f5f0 #888888 #555555 #444444 #333333`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add compact prop + rename button in NewsletterForm</name>
  <files>src/components/forms/newsletter-form.tsx</files>
  <read_first>
    - src/components/forms/newsletter-form.tsx (read full current file before editing)
  </read_first>
  <action>
    Make the following changes to `src/components/forms/newsletter-form.tsx`:

    1. **Add `compact` to the props interface**:
    ```typescript
    interface NewsletterFormProps {
      source?: NewsletterSource
      compact?: boolean
    }
    ```

    2. **Destructure `compact` from props**:
    ```typescript
    export function NewsletterForm({ source, compact }: NewsletterFormProps = {}) {
    ```

    3. **Change the input height**: Use `compact` to toggle between `h-8` (footer use) and `h-10` (default). Replace the static `h-10` on the input with:
    ```tsx
    className={`flex-1 ${compact ? "h-8" : "h-10"} bg-[#111111] border border-[#333333] rounded-none px-3 ${compact ? "text-xs" : "text-sm"} text-[#f5f5f0] font-sans placeholder:text-[#555555] focus:border-[#f5f5f0] focus:outline-none transition-colors disabled:opacity-50`}
    ```

    4. **Change the button height** in the same way: replace the static `h-10` on the button with `${compact ? "h-8" : "h-10"}`. Also update the button text sizes: `${compact ? "text-[10px]" : "text-xs md:text-sm"}`. Keep `px-4 md:px-6` but make it `px-4` flat when compact (no md variant needed since footer is always compact).
    Full button className when compact:
    ```
    shrink-0 bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] rounded-none px-4 h-8 font-mono font-bold text-[10px] uppercase tracking-[0.05em] hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors disabled:opacity-50 whitespace-nowrap
    ```
    Full button className when NOT compact (default):
    ```
    shrink-0 bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] rounded-none px-4 md:px-6 h-10 font-mono font-bold text-xs md:text-sm uppercase tracking-[0.05em] hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors disabled:opacity-50 whitespace-nowrap
    ```

    5. **Change the button label** from `"Join"` to `"Subscribe"` in both the loading state and default state:
    ```tsx
    {isLoading ? "..." : "Subscribe"}
    ```

    6. **Add `min-w-0` to the input** to prevent flex overflow on mobile when parent is narrow. Add `min-w-0` to the existing input className.

    Do NOT change the form `onSubmit` logic, schema validation, toast calls, or server action wiring. Only the visual layer changes.
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && grep -q 'Subscribe' src/components/forms/newsletter-form.tsx && grep -q 'compact' src/components/forms/newsletter-form.tsx && ! grep -q '"Join"' src/components/forms/newsletter-form.tsx && grep -q 'min-w-0' src/components/forms/newsletter-form.tsx && pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - Button text is `"Subscribe"` in both loading (`"..."`) and idle state — `"Join"` must not appear anywhere in the file (grep must find zero matches for the string `"Join"`)
    - `compact` prop is declared in the interface as `compact?: boolean`
    - Input uses conditional height (`h-8` when compact, `h-10` when not)
    - Button uses conditional height (`h-8` when compact, `h-10` when not)
    - Input has `min-w-0` class (prevents flex shrink issues on mobile)
    - `subscribeNewsletter` server action call is unchanged (no logic changes)
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>NewsletterForm renders "Subscribe" button, accepts compact prop for footer sizing, and has min-w-0 on the input to prevent mobile overflow.</done>
</task>

<task type="auto">
  <name>Task 2: Add label + separate copyright in footer</name>
  <files>src/components/layout/footer.tsx</files>
  <read_first>
    - src/components/layout/footer.tsx (read full current file before editing)
    - src/components/forms/newsletter-form.tsx (verify compact prop now exists — Task 1 output)
  </read_first>
  <action>
    Make the following changes to `src/components/layout/footer.tsx`:

    **Change 1: Replace the right column** (`{/* Right: Newsletter + copyright */}` block).

    Current:
    ```tsx
    {/* Right: Newsletter + copyright */}
    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4 shrink-0">
      <NewsletterForm />
      <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#333333] whitespace-nowrap">
        &copy; 2026 Glitch Studios
      </p>
    </div>
    ```

    Replace with:
    ```tsx
    {/* Right: Newsletter */}
    <div className="flex flex-col gap-1 shrink-0 w-full md:w-auto">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#555555]">
        Stay in the loop
      </p>
      <div className="w-full md:w-[280px]">
        <NewsletterForm compact />
      </div>
    </div>
    ```

    **Change 2: Add a copyright bottom row** below the existing `flex` row, but still inside the `max-w-7xl` container. After the closing `</div>` of the `flex flex-col gap-4 md:flex-row ...` wrapper, add:
    ```tsx
    {/* Copyright — own row below the main footer content */}
    <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
      <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#333333]">
        &copy; 2026 Glitch Studios
      </p>
    </div>
    ```

    The resulting footer structure should be:
    ```tsx
    <footer className="mt-16 border-t border-[#222222] bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
        {/* Main row: left (logo+nav+social) + right (newsletter) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          {/* Left — UNCHANGED */}
          ...
          {/* Right: newsletter label + form */}
          <div className="flex flex-col gap-1 shrink-0 w-full md:w-auto">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#555555]">
              Stay in the loop
            </p>
            <div className="w-full md:w-[280px]">
              <NewsletterForm compact />
            </div>
          </div>
        </div>
        {/* Copyright row */}
        <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
          <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#333333]">
            &copy; 2026 Glitch Studios
          </p>
        </div>
      </div>
    </footer>
    ```

    Do NOT change the left column (logo, tagline, nav links, social icons). Do NOT change any import at the top of the file. Do NOT redesign the footer — the cyberpunk minimal condensed aesthetic must be preserved.

    The "Stay in the loop" label uses `text-[#555555]` (slightly brighter than `#333333` copyright) and `tracking-[0.2em]` (wider letter-spacing for the label vs the copyright's `tracking-[0.05em]`). This creates visual hierarchy: label as guidance, copyright as fine print.
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && grep -q 'Stay in the loop' src/components/layout/footer.tsx && grep -q 'compact' src/components/layout/footer.tsx && grep -q 'border-t border-\[#1a1a1a\]' src/components/layout/footer.tsx && grep -q '2026 Glitch Studios' src/components/layout/footer.tsx && grep -q 'md:w-\[280px\]' src/components/layout/footer.tsx && pnpm tsc --noEmit && pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - `footer.tsx` contains the literal string `"Stay in the loop"` as a `<p>` element (grep confirms)
    - `footer.tsx` passes `compact` prop to `<NewsletterForm compact />` (grep: `NewsletterForm compact`)
    - `footer.tsx` contains `md:w-[280px]` wrapper for the newsletter form (constrains width on desktop)
    - `footer.tsx` contains copyright in its own row below the main footer row, separated by `border-t border-[#1a1a1a]`
    - The left column (logo, nav links, social icons) is unchanged — grep still finds `InstagramIcon`, `navLinks`, and `styles.glitchWrapper` in the file
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0 (or warnings-only)
  </acceptance_criteria>
  <done>Footer has a "STAY IN THE LOOP" label above the compact newsletter form, form is constrained to 280px on desktop and full-width on mobile, and the copyright is in its own bottom row separated from the newsletter.</done>
</task>

</tasks>

<verification>
Run phase-wide checks after both tasks complete:
```
cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit && pnpm lint
```
Spot-check the newsletter button copy:
```
grep -n "Join\|Subscribe" src/components/forms/newsletter-form.tsx
```
Must show only "Subscribe" — no "Join" match.

Spot-check footer structure:
```
grep -n "Stay in the loop\|compact\|Copyright\|Glitch Studios" src/components/layout/footer.tsx
```
Must show the label, compact prop usage, and copyright in its own section.
</verification>

<success_criteria>
- POLISH-02 delivered: footer newsletter is labeled, properly sized, and copyright is visually separated
- "STAY IN THE LOOP" label is visible above the input on all screen sizes
- Input + button render at `h-8` in the footer (compact) vs `h-10` in other contexts (default)
- Button reads "Subscribe" site-wide
- Footer layout on desktop unchanged — still a condensed single row
- Mobile 375px: newsletter form is full-width with no cramping
- `pnpm tsc --noEmit` + `pnpm lint` exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/14-global-polish/14-02-SUMMARY.md` documenting:
- Confirmation that compact prop was added to NewsletterForm and used in footer
- The exact label text used ("Stay in the loop" vs other copy)
- Whether copyright was moved to its own row as planned or a different arrangement was used
- Any mobile layout issues discovered during implementation
- TypeScript errors encountered (if any) and resolution
</output>
