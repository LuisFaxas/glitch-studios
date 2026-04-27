# Benchmark Chart / Leaderboard Audit — 2026-04-27

**Scope:** Quick state audit of the master leaderboard at `/tech/rankings/laptops` after Phase 29.3 Plan 04 completion (comprehensive timeline test commit `c9d8c60`).
**Method:** Playwright visual capture against fresh dev server (`PORT=3010 pnpm dev`) on desktop (1440×900) + mobile (390×844).
**Result:** 4/4 Linux-headless visual tests passed with zero console/page errors. Visual artifacts captured.

> ⚠️ **STATUS UPDATE (after user correction during /gsd:progress review):**
>
> The 03:15Z Safari failure was real, but later commits changed the fact pattern. After Plan 05 failed, Codex reproduced the freeze locally on headless Chromium with real-mouse input and isolated the root cause to a **native pointer/style feedback loop on synchronous React state updates inside native input events** (commit `6af8177`, 2026-04-27 00:48 EDT). Four follow-on commits + three uncommitted gating edits address the full fix family.
>
> Phase 29.3 is now **awaiting macOS retest under Plan 29.3-06**, not blocked on the historical image-decode/drop-shadow/min-width hypotheses. See [`.planning/phases/29.3-rebuild-filter/29.3-06-PLAN.md`](../../phases/29.3-rebuild-filter/29.3-06-PLAN.md) for the gating artifact.
>
> The visual artifacts in this folder remain valid evidence of the *visual* state of the page from Linux-headless dev server. They do not substitute for real macOS browser interaction testing — that's what Plan 29.3-06 deploys + verifies.

## Visual state — what's rendering

### Desktop (`leaderboard-desktop.png`)

- Sidebar nav (REVIEWS / **RANKINGS** active / CATEGORIES / COMPARE / BENCHMARKS / BLOG) intact
- TechHero block: eyebrow "RANKINGS" → h1 "LAPTOPS RANKINGS" → subhead "Compare every laptop we've reviewed — sortable by GlitchMark, BPR, and key benchmarks." → CTA `READ METHODOLOGY`
- **Top filter bar is rendered** (sort headers visible: PRICE / BPR / GLITCHMARK / 3DMARK / LLM / CLR with up/down chevrons)
- Table with 6 product rows, BPR medal pills + GlitchMark column + per-discipline columns + BUY button
- Page footer + MobileTabBar absent (correctly suppressed at desktop viewport)

### Mobile (`leaderboard-mobile.png`)

- Cards view active (toggle to TABLE visible top-right)
- Sticky `FILTERS` sheet trigger visible (per Phase 29.3 deferred-open pattern)
- Per-card: rank → BPR medal → product → GlitchMark headline → discipline rows → year/price → BUY
- Footer + bottom tab bar render correctly
- `MobileContentWrapper` padding behaves with the player bar absent

## Filter UI status

`STATE.md:152` claims: *"filter UI is currently HIDDEN in `leaderboard-table.tsx` so the page is usable."*

**That note is stale.** Uncommitted Phase 29.3 work has re-enabled the filter:

```
src/components/tech/leaderboard-filter-sidebar.tsx |  +26/-9
src/components/tech/leaderboard-table.tsx          | +173/-69
```

In the live render: `<LeaderboardFilters>` mounts at lines 611 + 648 of `leaderboard-table.tsx`; `<LeaderboardFilterSheet>` mounts at lines 625 + 788 (mobile). The crash-repro Playwright test (`tests/29.3-comprehensive-timeline.spec.ts`) confirms filter chip clicks survive on webkit/firefox/chromium per the c9d8c60 commit.

**Conclusion:** Phase 29.3 is *de facto* shipped in working tree but not committed. Either commit + close the phase, or roll the filter back to hidden until you sign off.

## Visual flags worth a human eye

These are not bugs in the test sense — they are "is this what we want?" calls for Trap/Faxas:

1. **BPR medal labels read `SILVER 1%`, `GOLD 1%`, `BRONZE 1%`.** The "1%" suffix appears on every visible card on mobile. Likely percentile-rank intent, but reads ambiguous next to the medal name.
2. **GlitchMark column has mixed scale presentation.** Rows show `8,400` (Acer, with text "partial"), no value (ROG), `1188` (Framework), `1000` (MBP M5), `924` (Dell), `842` (ThinkPad). The 8,400 outlier suggests either pre-recompute placeholder data or a unit mismatch; cluster around 800–1200 looks like the intended ×10 scale per memory `feedback_techhero_standard.md` family of decisions. Worth confirming the Acer row.
3. **GlitchMark "partial"** label on the first row — this is the expected display for incomplete rubric coverage and does not need a fix, but it surfaces here for the record.

## Production environment status

🚨 **Local prod server is broken** and will mislead any visual check that targets port 3004.

```
$ pm2 list  → glitch_studios_prod online (pid 1720857, 19h uptime)
$ curl http://localhost:3004/tech/rankings/laptops  → 200 OK (HTML)
$ curl http://localhost:3004/_next/static/css/...   → 404
$ pm2 logs glitch_studios_prod
   ChunkLoadError: Failed to load chunk
   server/chunks/[externals]_next_dist_compiled_@vercel_og_index_node_00__rw~.js
   from /api/auth/[...all]/route.js
   MODULE_NOT_FOUND
```

**Cause:** Stale `.next/` build with a missing/cleaned chunk for the Better Auth route. Page HTML returns but every auth-dependent subresource 500s and CSS 404s.

**Fix when ready (single command, ~2 min, 2GB RAM peak — do not run in parallel with another build per CLAUDE.md):**

```bash
cd ~/workspaces/projects/personal/glitch_studios && pnpm build && pm2 restart glitch_studios_prod
```

Source code itself is healthy — fresh `pnpm dev` on 3010 boots clean and the same Playwright suite passes 4/4 with zero console errors. The audit screenshots in this folder are from the dev server, not the broken prod server.

## Working-tree summary

| Status | Files |
|---|---|
| Modified, uncommitted | 17 files including `leaderboard-table.tsx`, `leaderboard-filter-sidebar.tsx`, `bpr-medal.tsx`, `tile-nav.tsx`, `cart-provider.tsx`, `template.tsx`, `auth-client.ts`, `glitch-heading.tsx`, `bottom-tab-bar.tsx`, `mobile-nav-overlay.tsx`, `logo-tile.tsx`, `logo-tile.module.css`, `.gitignore`, `.mcp.json`, `CLAUDE.md`, `package.json`, `pnpm-lock.yaml` |
| Untracked | `.planning/debug/`, `.praxis/`, `AGENTS.md`, `GLITCH-VIDEO-OPS-HANDOFF.md`, `brand-engine/`, `dev/`, `scripts/crash-repro.mjs`, `src/app/export/`, `tests/forensics-overlay-leak.spec.ts`, `tests/audit-2026-04-27-leaderboard.spec.ts` |

A lot of in-flight work has accumulated. Recommendation: stage + commit the leaderboard filter rebuild (Phase 29.3 closure) as a discrete commit before the working tree drifts further.

## Source-of-truth alignment check

| Doc | Says | Reality |
|---|---|---|
| `STATE.md:27` | "Phase 29.3 — EXECUTING — Plan 4 of 5" | Plan 04 commit `c9d8c60` landed; working tree includes Plan 05 work uncommitted |
| `STATE.md:152` | "filter UI is currently HIDDEN" | Filter is re-enabled in working tree |
| `PROJECT.md:162` | "29.1 polish shipped" | Confirmed |
| Praxis capsule | "Praxis polish complete, restart MCP for run_lint" | Aligned |
| GSD + Praxis | Both treat 29.3 as in-progress | True for committed tree, almost-done in working tree |

## Recommended next moves

1. **Commit Phase 29.3 closure** — `leaderboard-table.tsx` + `leaderboard-filter-sidebar.tsx` + the new audit test, with a `feat(29.3): re-enable filter after rebuild` message. Update STATE.md note about filter being hidden.
2. **Triage the visual flags** above with Trap (BPR `1%` suffix, GlitchMark Acer outlier).
3. **Rebuild the local prod server** when convenient — non-blocking, it's been broken for 19h and has not affected anything user-facing because Vercel handles real prod.
4. **Carry the unrelated working-tree changes** (logo-tile, tile-nav, glitch-heading, etc.) into separate commits or revert — they're unscoped relative to Phase 29.3.

## Files

- `leaderboard-desktop.png` — 1052 KB, 1440×900 viewport, full-page
- `leaderboard-mobile.png` — 759 KB, 390×844 viewport, full-page
- `tests/audit-2026-04-27-leaderboard.spec.ts` — reusable spec, parameterized by `PW_BASE_URL`

— Audit run by Claude on Codebox, 2026-04-27.
