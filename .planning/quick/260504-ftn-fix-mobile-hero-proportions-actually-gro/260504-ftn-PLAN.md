---
phase: 260504-ftn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/home/hero-section.tsx
autonomous: false
requirements:
  - QUICK-260504-ftn
must_haves:
  truths:
    - "Mobile logo container width on a 390x844 viewport is ≥ 290px (was 234px under w-[60vw])"
    - "Logo image element width inside the container is ≥ 290px on mobile"
    - "Center stack absolute wrapper uses top-[38%] (reverted from top-[42%])"
    - "CTA cluster absolute wrapper uses bottom-28 md:bottom-32 (reverted from bottom-20 md:bottom-32)"
    - "STUDIOS wordmark text-[22px] / tracking 0.4em on mobile is unchanged in studios-hero-section.tsx"
    - "Subtitle mb-3 md:mb-8 spacing is preserved"
    - "CTA grid max-w-[260px] md:max-w-none md:w-auto is preserved"
    - "Primary CTA px-4 py-2.5 md:px-10 md:py-3 text-[11px] md:text-sm is preserved"
    - "Secondary CTA defaults px-3 py-2 md:px-6 md:py-3 text-[10px] md:text-sm are preserved"
  artifacts:
    - path: src/components/home/hero-section.tsx
      provides: "Hero with corrected mobile logo width + reverted vertical positioning"
      contains_substrings:
        - "w-[78vw] max-w-[320px]"
        - "top-[38%]"
        - "bottom-28 md:bottom-32"
      forbidden_substrings:
        - "w-[60vw] max-w-[320px]"
        - "top-[42%]"
        - "bottom-20 md:bottom-32"
  key_links:
    - from: "src/components/home/hero-section.tsx"
      to: "[data-testid=\"glitch-logo\"]"
      via: "Tailwind w-[78vw] max-w-[320px] on the logo container div"
      pattern: "w-\\[78vw\\] max-w-\\[320px\\]"
---

<objective>
Actually grow the mobile hero logo by changing the binding constraint (w-[60vw] → w-[78vw]) and revert the two cosmetic down-shifts that the previous plan (260504-eq6) introduced. The previous plan bumped a max-w cap that was a no-op on mobile (the w-[60vw] = 234px sat well below the 280/320px caps), so the logo never grew. It also moved the center stack and CTA cluster downward, producing a "zoomed in / cramped" feel without making anything bigger.

Purpose: Deliver the mobile hero proportions the previous plan was supposed to deliver — a meaningfully larger wordmark and the original (better) vertical layout. Single-file, three-line surgical edit.

Output: Updated `src/components/home/hero-section.tsx` with the corrected mobile width, the reverted center-stack top, the reverted CTA bottom, and an updated D-16 comment block reflecting the new mobile baseline. Visual verification screenshots saved into `.playwright-mcp/` with the `ftn-` prefix.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/components/home/hero-section.tsx

<!-- Read-only references — DO NOT modify these files -->
@src/components/home/studios-hero-section.tsx
@src/components/home/tech-hero-section.tsx

<!-- Previous plan / summary for context only -->
@.planning/quick/260504-eq6-rebalance-home-tech-hero-sections-mobile/260504-eq6-PLAN.md
@.planning/quick/260504-eq6-rebalance-home-tech-hero-sections-mobile/260504-eq6-SUMMARY.md

<interfaces>
<!-- The exact current strings in src/components/home/hero-section.tsx that this plan replaces. -->
<!-- Verified by Read at plan time — no codebase exploration needed during execution. -->

Current line 106 (center stack absolute wrapper, inside clsx):
```
"absolute inset-x-0 top-[42%] -translate-y-1/2 z-10 flex flex-col items-center justify-center pointer-events-none",
```

Current line 129 (logo container className):
```
className="w-[60vw] max-w-[320px] md:w-[70vw] md:max-w-[400px] lg:w-[60vw] lg:max-w-[460px] xl:max-w-[520px] 2xl:max-w-[600px] min-w-0 pointer-events-auto flex justify-center"
```

Current line 145 (CTA cluster absolute wrapper, inside clsx):
```
"absolute z-10 inset-x-0 bottom-20 md:bottom-32 flex flex-col items-center gap-4 px-6 text-center pointer-events-none",
```

Current D-16 comment block lines 113–126 — the relevant line to update is line 120:
```
              mobile: 320px cap
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Apply three surgical edits + update D-16 comment in hero-section.tsx</name>
  <files>src/components/home/hero-section.tsx</files>
  <action>
Make exactly four Edit operations on `src/components/home/hero-section.tsx`. Do NOT touch any other file. Do NOT touch any other line. Use the Edit tool with the exact strings shown.

**Edit 1 — Grow the mobile logo (THE PRIMARY FIX, line 129)**

Replace:
```
className="w-[60vw] max-w-[320px] md:w-[70vw] md:max-w-[400px] lg:w-[60vw] lg:max-w-[460px] xl:max-w-[520px] 2xl:max-w-[600px] min-w-0 pointer-events-auto flex justify-center"
```
With:
```
className="w-[78vw] max-w-[320px] md:w-[70vw] md:max-w-[400px] lg:w-[60vw] lg:max-w-[460px] xl:max-w-[520px] 2xl:max-w-[600px] min-w-0 pointer-events-auto flex justify-center"
```

ONLY the leading `w-[60vw]` changes to `w-[78vw]`. Every other token (max-w-[320px], md:*, lg:*, xl:*, 2xl:*, min-w-0, pointer-events-auto, flex, justify-center) is preserved verbatim.

Math sanity check: 78vw on a 390px viewport = 304.2px (capped by max-w-[320px] only on phones ≥411px wide, e.g. iPhone 14 Pro Max at ~430px → 78vw = 335.4px → clamped to 320px). On a 390px iPhone 14, the natural 304.2px wins. The logo grows from 234px → 304.2px (+30%) on a stock 390px viewport.

**Edit 2 — Update the D-16 comment to reflect the new mobile baseline (line 120)**

Replace:
```
              mobile: 320px cap
```
With:
```
              mobile: 78vw natural, 320px cap (cap activates on phones ≥411px)
```

Keep all other lines of the D-16 comment block (lines 113–126) intact: the explanation about ROG 13 / 13" laptop target, splash 1.5× scale, the md/lg/xl/2xl ladder (400px / 460px / 520px / 600px), the `min-w-0` aspect-ratio note, the `data-testid` regression-anchor note. ONLY line 120 changes.

**Edit 3 — Revert the bad center-stack down-shift (line 106)**

Replace:
```
        "absolute inset-x-0 top-[42%] -translate-y-1/2 z-10 flex flex-col items-center justify-center pointer-events-none",
```
With:
```
        "absolute inset-x-0 top-[38%] -translate-y-1/2 z-10 flex flex-col items-center justify-center pointer-events-none",
```

ONLY `top-[42%]` → `top-[38%]`. Indentation, trailing comma, and every other token preserved. This restores the pre-eq6 baseline so the subtitle+logo stack sits slightly above true center, giving more breathing room above the CTAs.

**Edit 4 — Revert the bad CTA cluster down-shift (line 145)**

Replace:
```
        "absolute z-10 inset-x-0 bottom-20 md:bottom-32 flex flex-col items-center gap-4 px-6 text-center pointer-events-none",
```
With:
```
        "absolute z-10 inset-x-0 bottom-28 md:bottom-32 flex flex-col items-center gap-4 px-6 text-center pointer-events-none",
```

ONLY `bottom-20` → `bottom-28`. `md:bottom-32` is preserved. Indentation and trailing comma preserved.

**MUST NOT TOUCH** (drift watch — re-confirm none of these change):
- Line 110 subtitle paragraph: `mb-3 md:mb-8` stays
- Line 149 CTA grid: `max-w-[260px] md:max-w-none md:w-auto` stays
- Line 153 primary CTA: `px-4 py-2.5 md:px-10 md:py-3 ... text-[11px] md:text-sm` stays
- Lines 162, 169 secondary CTA defaults: `px-3 py-2 md:px-6 md:py-3 ... text-[10px] md:text-sm` stay
- ScrollArrow (line 186) stays untouched — it is already a button
- Dither shader, splash overlay, sidebar collapse logic, scrim, bottom lip gradient — all out of scope
- `src/components/home/studios-hero-section.tsx` — read-only, do not modify
- `src/components/home/tech-hero-section.tsx` — read-only, do not modify
- D-16 ladder for md/lg/xl/2xl breakpoints (400/460/520/600 caps, 70vw/60vw widths) — preserved exactly
  </action>
  <verify>
    <automated>cd /Users/faxas/FAXAS_HQ/Projects/Coding_Projects/PERSONAL/glitch_studios && \
echo "=== REQUIRED substrings (must all return 1) ===" && \
grep -c 'w-\[78vw\] max-w-\[320px\]' src/components/home/hero-section.tsx && \
grep -c 'top-\[38%\]' src/components/home/hero-section.tsx && \
grep -c 'bottom-28 md:bottom-32' src/components/home/hero-section.tsx && \
grep -c 'mobile: 78vw natural, 320px cap (cap activates on phones ≥411px)' src/components/home/hero-section.tsx && \
echo "=== FORBIDDEN substrings (must all return 0) ===" && \
( grep -c 'w-\[60vw\] max-w-\[320px\]' src/components/home/hero-section.tsx || true ) && \
( grep -c 'top-\[42%\]' src/components/home/hero-section.tsx || true ) && \
( grep -c 'bottom-20 md:bottom-32' src/components/home/hero-section.tsx || true ) && \
echo "=== Drift guards (preservation checks — each must return ≥1) ===" && \
grep -c 'mb-3 md:mb-8' src/components/home/hero-section.tsx && \
grep -c 'max-w-\[260px\] md:max-w-none md:w-auto' src/components/home/hero-section.tsx && \
grep -c 'px-4 py-2.5 md:px-10 md:py-3' src/components/home/hero-section.tsx && \
grep -c 'text-\[11px\] md:text-sm' src/components/home/hero-section.tsx && \
grep -c 'px-3 py-2 md:px-6 md:py-3' src/components/home/hero-section.tsx && \
grep -c 'md:w-\[70vw\] md:max-w-\[400px\]' src/components/home/hero-section.tsx && \
grep -c 'lg:w-\[60vw\] lg:max-w-\[460px\]' src/components/home/hero-section.tsx && \
grep -c 'xl:max-w-\[520px\] 2xl:max-w-\[600px\]' src/components/home/hero-section.tsx && \
echo "=== TypeScript sanity ===" && \
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E '(hero-section\.tsx|error TS)' | head -20 || echo "no tsc errors mentioning hero-section.tsx"</automated>
  </verify>
  <done>
- All four required substrings present (each grep returns ≥1)
- All three forbidden substrings absent (each grep returns 0)
- All eight drift-guard substrings still present (each returns ≥1)
- `tsc --noEmit` produces no errors mentioning `hero-section.tsx`
- No other file in the repo was modified by this task (verifiable via `git status`)
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Visual verification — Playwright measurements + human eyes</name>
  <what-built>
Edit 1 grew the mobile logo by switching the binding constraint from `w-[60vw]` (234px on a 390px viewport — the entire reason the previous fix was a no-op) to `w-[78vw]` (304.2px natural, 320px capped). Edits 3 and 4 reverted the eq6 down-shifts so the center stack sits at `top-[38%]` and the CTA cluster sits at `bottom-28 md:bottom-32` again, restoring the pre-eq6 vertical proportions. Edit 2 updated the D-16 comment block so future readers understand the new mobile baseline.
  </what-built>
  <how-to-verify>
Run the dev server and use Playwright MCP to take measurements at iPhone 14 viewport. Save all artifacts into `.playwright-mcp/` (NEVER repo root) with filename prefix `ftn-`.

**Step 1 — Start dev server (skip if already running):**
```
npm run dev
```
Wait for "Ready" output. Note the URL (typically https://glitch.localhost or http://localhost:3000).

**Step 2 — Mobile measurements via Playwright MCP at 390x844:**

Use Playwright MCP to:
1. Set viewport to 390x844 (iPhone 14)
2. Navigate to `/` (the home hero, which uses the shared HeroSection without a custom wordmark)
3. Wait for the WebGL dither to render (canvasReady transition completes ~500ms after first paint)
4. Measure `[data-testid="glitch-logo"].getBoundingClientRect()` — record `width` and the bounding rect's `top`/`bottom`
5. Measure the inner image element width (the first `<div>` inside `[data-testid="glitch-logo"]`)
6. Measure the primary CTA (`a[href="/services"]` matching the Book a Session link) bounding rect — record `top` (distance from viewport top)
7. Take a full-page screenshot saved as `.playwright-mcp/ftn-home-hero-mobile-390x844.png`

**Pass thresholds (HARD — if any fails, the fix did not land):**
- Logo container width ≥ 290px (was 234px)
- Inner logo image width ≥ 290px
- Logo container width ≤ 320px (capped by max-w-[320px], proves the cap is now active or near-active on this viewport)
- Primary CTA top is ≥ 690px from viewport top (with `bottom-28` = 112px from section bottom on an 844px section, the CTA cluster top should be roughly viewport_height − 112px − cluster_height; the cluster is ~150px tall, so CTA-cluster top ≈ 580px and primary CTA itself ≈ 580–620px range — anything ≥ 690px would mean the revert didn't apply, anything ≤ 540px would mean a regression)

**Step 3 — Studios hero drift check (read-only confirmation):**

Navigate to `/studios`. Confirm the STUDIOS wordmark still uses `text-[22px]` / `tracking-[0.4em]` styling (or whatever the current studios-hero-section.tsx defines). Take screenshot `.playwright-mcp/ftn-studios-hero-mobile-390x844.png`.

**Step 4 — Tech hero drift check:**

Navigate to `/tech`. Confirm tech wordmark and inline CTAs are unchanged. Take screenshot `.playwright-mcp/ftn-tech-hero-mobile-390x844.png`.

**Step 5 — Desktop sanity (md+ unchanged):**

Set viewport to 1440x900. Navigate to `/`. Confirm logo still renders within md/lg/xl ladder caps (visually unchanged from before). Take screenshot `.playwright-mcp/ftn-home-hero-desktop-1440x900.png`.

**Step 6 — Human visual check:**

Open the four screenshots and confirm:
- Mobile home hero: logo is meaningfully larger than before (~30%+ visually), CTA cluster sits comfortably above the bottom dock (not jammed against it), subtitle has breathing room above the logo
- Studios mobile: STUDIOS wordmark unchanged
- Tech mobile: tech hero unchanged
- Desktop home: no visible change (md+ ladder unchanged)

**Numerical evidence to report back:**
- Logo container width (px) — must be ≥ 290
- Logo image width (px) — must be ≥ 290
- Primary CTA top (px) — should be in the ~580–660 range on 844px viewport
- Confirmation that no horizontal overflow / scrollbar appears at 390px width
  </how-to-verify>
  <resume-signal>Type "approved" once measurements pass and screenshots look correct. If logo width < 290px or any forbidden-substring grep returned ≥1, type "fix" and describe the issue.</resume-signal>
</task>

</tasks>

<verification>
**Substring contract on `src/components/home/hero-section.tsx` (post-fix):**

Required (each `grep -c` ≥ 1):
- `w-[78vw] max-w-[320px]`
- `top-[38%]`
- `bottom-28 md:bottom-32`
- `mobile: 78vw natural, 320px cap (cap activates on phones ≥411px)`

Forbidden (each `grep -c` = 0):
- `w-[60vw] max-w-[320px]`
- `top-[42%]`
- `bottom-20 md:bottom-32`

Preserved (drift guards, each `grep -c` ≥ 1):
- `mb-3 md:mb-8`
- `max-w-[260px] md:max-w-none md:w-auto`
- `px-4 py-2.5 md:px-10 md:py-3`
- `text-[11px] md:text-sm`
- `px-3 py-2 md:px-6 md:py-3`
- `md:w-[70vw] md:max-w-[400px]`
- `lg:w-[60vw] lg:max-w-[460px]`
- `xl:max-w-[520px] 2xl:max-w-[600px]`

**Untouched files (verify via `git status`):**
- `src/components/home/studios-hero-section.tsx`
- `src/components/home/tech-hero-section.tsx`
- `src/components/home/scroll-arrow.tsx`
- Every file outside `src/components/home/hero-section.tsx`

**Runtime checks:**
- Logo container width ≥ 290px at 390x844 viewport
- Inner logo image width ≥ 290px at 390x844 viewport
- Logo container width ≤ 320px at 390x844 viewport (cap respected)
- Primary CTA top in the ~580–660px range at 390x844 viewport (confirms `bottom-28` revert)
- STUDIOS wordmark unchanged on `/studios`
- Tech hero unchanged on `/tech`
- Desktop hero unchanged at 1440x900
- No horizontal scroll at 390px width
</verification>

<success_criteria>
- `src/components/home/hero-section.tsx` contains exactly the four edits described, no more, no less
- All required substrings present, all forbidden substrings absent, all drift-guard substrings preserved
- TypeScript compile produces no errors mentioning `hero-section.tsx`
- Playwright measurement at 390x844: logo container width ≥ 290px AND ≤ 320px
- Playwright measurement at 390x844: inner logo image width ≥ 290px
- Playwright measurement at 390x844: primary CTA top is ≥ 580px and ≤ 660px (confirms `bottom-28` revert worked, not a regression)
- Visual confirmation: logo is visibly ~30% larger on mobile vs pre-fix, CTA cluster has breathing room above the bottom dock, subtitle has breathing room above the logo
- Studios + Tech heroes visually unchanged (drift guard)
- Desktop hero visually unchanged at 1440x900 (drift guard)
- All Playwright artifacts saved into `.playwright-mcp/` with `ftn-` prefix
- No file other than `src/components/home/hero-section.tsx` modified by this plan
</success_criteria>

<output>
After completion, create `.planning/quick/260504-ftn-fix-mobile-hero-proportions-actually-gro/260504-ftn-SUMMARY.md` capturing:
- The exact diff applied (4 edits)
- Measured logo container width pre-fix (234px) vs post-fix (record actual measurement)
- Measured CTA top position post-fix
- Paths to the four `.playwright-mcp/ftn-*.png` screenshots
- Confirmation that studios + tech heroes are unchanged
- Any drift discovered during verification (should be none)
</output>
