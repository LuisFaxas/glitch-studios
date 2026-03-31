---
phase: 7
reviewers: [codex]
reviewed_at: "2026-03-30T01:30:00.000Z"
plans_reviewed: [07-01-PLAN.md, 07-02-PLAN.md, 07-03-PLAN.md]
---

# Cross-AI Plan Review — Phase 7

## Codex Review (GPT-5.4)

Review grounded in the current implementation in beat-catalog.tsx, beat-row.tsx, beat-detail-panel.tsx, beat-search.tsx, beat-filters.tsx, middleware.ts, admin-beats.ts, and playwright.config.ts. The overall sequencing is sensible, but the plans get weaker as they move from UI construction into integration and test setup.

### Plan 07-01

**Summary**
This is a solid decomposition wave. It maps well to the phase goals and keeps the new UI isolated before integration, but it under-specs a few implementation details that matter in this codebase: mobile filter density, `view` state behavior, and beat edge cases from the existing `BeatSummary` shape.

**Strengths**
- Breaks the redesign into reusable components instead of entangling everything inside the catalog.
- Directly addresses BEATS-01 through BEATS-03 with visible card density, grouped filters, and constrained mood tags.
- Reuses existing patterns cleanly: `LicenseModal`, `useAudioPlayer`, and nuqs-backed query state.
- Keeps scope mostly UI-only, which matches the research note that no new packages are needed.

**Concerns**
- `[MEDIUM]` The filter bar is likely too dense for 375px as written: search, 3 selects, BPM slider, clear, count, and view toggle in two wrapped rows is still a lot of controls for one mobile band.
- `[MEDIUM]` The plan does not define how `view` query state should behave. If it is implemented like current search/filter state with server-invalidating navigation, toggling views may trigger unnecessary refetch and animation churn.
- `[MEDIUM]` Beat card edge cases are missing: no cover art, no preview audio, multiple producers, `moods: null`, and sold-exclusive beats.
- `[LOW]` Tooltips on the view toggle add implementation overhead with limited value on touch devices.
- `[LOW]` A fixed `3/2/1` grid may be slightly under-dense on large desktop if the content area allows 4 cards across.

**Suggestions**
- Define `BeatCard` behavior for missing media, co-producer formatting, and a `+N` mood overflow treatment up front.
- Treat `view` as client-only UI state and avoid server refetch on toggle.
- Make the mobile version a single cohesive container, but allow the controls to stack intentionally instead of forcing a crowded "two-row bar."
- Consider skipping tooltips and relying on icon buttons plus labels or `aria-label`s.
- Validate whether an `xl:grid-cols-4` breakpoint is needed to hit the "industry leader" density target.

**Risk Assessment:** MEDIUM

---

### Plan 07-02

**Summary**
This is the critical wave, and it is directionally correct: it integrates the new filter bar, adds card/list switching, and upgrades list density. The main issue is that it does not fully reconcile the existing expandable row architecture in beat-row.tsx and beat-detail-panel.tsx with the proposed new waveform/list-row behavior.

**Strengths**
- Correctly replaces the scattered search/filter UI with one cohesive bar.
- Persists the card/list decision from D-02 instead of leaving it as an implicit local-only toggle.
- Adds a stronger list row structure with producer info and headers, which should improve scannability.
- Includes an empty state, which is necessary because the current catalog already handles no-results/no-content branches.

**Concerns**
- `[HIGH]` The plan does not decide whether list rows still use the existing expandable detail panel. Adding a waveform strip inside rows while keeping the current detail panel risks duplicated audio UI, redundant motion, and confusing interaction states.
- `[HIGH]` The `?view` nuqs integration is a real implementation risk if it uses the wrong parser/options. A server-invalidating view toggle would feel broken and could undermine the `AnimatePresence` crossfade.
- `[MEDIUM]` Mobile behavior for list headers, waveform strip, badges, and metadata is not specified. This is the wave most likely to fail success criterion 4 if not made explicit.
- `[MEDIUM]` Existing behaviors are not called out for preservation: keyboard expand/collapse, `stopPropagation` on play, disabled play without preview audio, and sold-exclusive signaling.
- `[MEDIUM]` `tsc --noEmit` alone is too weak here. The highest-risk failure modes in this wave are visual/runtime, not type-level.
- `[LOW]` The plan lists page.tsx but does not specify the new props/data contract needed for count, view default, or filter-bar inputs.

**Suggestions**
- Add one explicit decision before implementation: either keep expandable detail rows and make the row waveform decorative/minimal, or replace the detail-panel interaction entirely. Do not leave both models half-alive.
- Keep WaveSurfer limited to the currently playing/expanded beat, as the research note already suggests.
- Define a mobile list behavior explicitly: hide headers, collapse waveform, and stack metadata to avoid overflow.
- Add a lightweight browser verification step after this wave, even if full screenshot approval stays in Wave 3.
- Specify the exact `view` param strategy and prop contract for `FilterBar` and `BeatCatalog`.

**Risk Assessment:** MEDIUM-HIGH

---

### Plan 07-03

**Summary**
The checkpoint idea is good, and the six screenshot scenarios are well aligned to the success criteria. The problem is operational: this plan is not truly autonomous in the current repo because admin upload requires authentication, the upload path writes to R2, and there is no defined test bootstrap for admin session, isolated data, or cleanup. The media files do exist locally, so file availability is not the blocker.

**Strengths**
- Uses explicit desktop and mobile viewport targets that match D-10.
- Covers both view modes plus filtered and empty states, which is the right verification surface.
- Ends with a human approval checkpoint, which is appropriate for a visual overhaul.
- Fits the existing Playwright setup in playwright.config.ts.

**Concerns**
- `[HIGH]` Uploading via `/admin` is blocked by auth in middleware.ts, and the relevant actions in admin-beats.ts require admin. The plan does not define how Playwright gets an admin session.
- `[HIGH]` UI-driven upload to R2 through upload-zone.tsx is brittle and can pollute shared storage. That is both a reliability risk and a security/data-hygiene risk.
- `[HIGH]` Screenshot existence is not enough to verify "no horizontal overflow." That criterion needs direct assertions.
- `[MEDIUM]` Creating a real beat during the test can make runs non-idempotent unless the plan includes cleanup or deterministic fixture replacement.
- `[MEDIUM]` The new UI does not currently expose stable selectors, so the spec may become fragile if it relies on incidental text/layout.
- `[MEDIUM]` Motion and audio-driven visuals can make screenshots flaky unless animations are stabilized for test runs.

**Suggestions**
- Split this wave into two parts: deterministic fixture setup, then Playwright visual verification.
- Prefer seeding or a setup action for the test beat over uploading through the admin UI in the same spec.
- If admin upload must be tested, add explicit auth bootstrap, isolated test bucket/database assumptions, and cleanup.
- Add assertions for no horizontal overflow and visible/cohesive filter controls before taking screenshots.
- Add stable locators in Wave 1 or 2 so Wave 3 is not forced to guess at selectors.

**Risk Assessment:** HIGH

---

## Consensus Summary

Only one reviewer (Codex/GPT-5.4) was available. Gemini CLI is not installed, and Claude CLI was skipped (current runtime).

### Top Concerns (by severity)

1. **Plan 07-02 detail panel ambiguity [HIGH]** — The plan does not reconcile the existing expandable detail panel (WaveSurfer + MIDI + license CTA) with the new inline waveform strip. Both coexisting risks duplicated audio UI and confusing interaction states.

2. **Plan 07-02 view toggle server invalidation [HIGH]** — If `?view` param uses `shallow: false`, toggling views triggers a server refetch. Must use `shallow: true` for the view param specifically.

3. **Plan 07-03 admin auth for Playwright [HIGH]** — No test bootstrap defined for admin session. Upload via admin UI is blocked by auth middleware.

4. **Plan 07-03 R2 upload pollution [HIGH]** — UI-driven R2 upload during tests is brittle and pollutes shared storage. Prefer seed/server action.

5. **Plan 07-01 mobile filter density [MEDIUM]** — Filter bar may be too dense at 375px even with 2-row layout.

6. **Plan 07-01 beat card edge cases [MEDIUM]** — Missing specs for: no cover art, no preview audio, multiple producers, null moods, sold-exclusive status.

### Divergent Views

N/A — single reviewer.
