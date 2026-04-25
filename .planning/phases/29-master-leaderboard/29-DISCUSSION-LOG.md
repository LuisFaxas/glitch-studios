# Phase 29: Master Leaderboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 29-master-leaderboard
**Areas discussed:** Columns & filters, Sub-category handling, Sparse / single-row state + placeholders, Affiliate + compare hooks, Table tech & interaction, Surfacing

---

## Gray-area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Columns & filters | Default columns + ordering, filter sidebar set, per-category column variation | ✓ |
| Sub-category handling | Flatten descendants vs direct-children-only; sub-cat as chip vs column vs hidden | ✓ |
| Sparse / single-row state + placeholders | Real-only vs seeded placeholders vs gated route — page liveness at v4.0 launch | ✓ |
| Affiliate + compare hooks | Reserve affiliate column slot? Add row-pinning checkboxes for compare? | ✓ |

**User's choice:** All four areas selected (multi-select).

---

## Columns

| Option | Description | Selected |
|--------|-------------|----------|
| Identity + scores + key benchmarks | # \| Product (image+name+chips) \| BPR medal \| GlitchMark \| CPU MC \| GPU \| AI \| Year \| Price. Sticky # + Product. ~9 cols | ✓ |
| Scores-first compact | # \| Product \| GlitchMark \| BPR \| Price \| Year \| benchmarks behind expandable. ~7 visible | |
| All-benchmarks-visible wide | ~13-15 cols, always horizontal scroll. UserBenchmark/PassMark style | |
| Per-category column sets | Laptops surface battery+portability; desktops surface thermal+PSU. Driven by category metadata | |

**User's choice:** Identity + scores + key benchmarks (Recommended).
**Notes:** Sticky `#` + `Product` columns on horizontal scroll; identity stays anchored, scores read first.

## Benchmarks (which count as "key" for laptops)

| Option | Description | Selected |
|--------|-------------|----------|
| Geekbench 6 Multi (CPU MC) | Most recognized cross-platform CPU score. Methodology spotlight per Phase 15 D-17 | |
| Cinebench 2024 Multi | Pro-creator audience reference. Apple Silicon comparable | |
| 3DMark Steel Nomad / Wild Life (GPU) | Single GPU number, model picked by laptop class | |
| AI / LLM throughput | Brand-differentiating — GlitchTech identity. Tokens/sec or composite | |

**User's choice:** "Research should determine this." (free text)
**Notes:** Captured as D-02 — researcher reads rubric + reviews leading benchmark-comparison sites and recommends 3-5 columns; planner locks final list.

---

## Filters

| Option | Description | Selected |
|--------|-------------|----------|
| All seven, organized | Price (range), Year, CPU kind, RAM, Storage, Medal tier, Sub-category. Desktop sidebar + mobile Sheet | ✓ |
| Tight 4-filter set | Price, Year, CPU kind, Medal tier only. RAM/storage in row chips | |
| Faceted with counts | Same seven + live counts per option ('Apple Silicon (3)') | |

**User's choice:** All seven, organized (Recommended).
**Notes:** Multi-select chips for everything except price (range slider). Sub-category filter only shown when current category has descendants.

## Filters — zero results behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state + 'Reset filters' | Message + reset button; filter UI stays visible | ✓ |
| Auto-relax least-restrictive filter | Drop most recently changed filter on 0 results | |
| Inline 'no results' on table area only | Quieter, no dedicated reset button | |

**User's choice:** Empty state + Reset filters (Recommended).

---

## Sub-category scope

| Option | Description | Selected |
|--------|-------------|----------|
| All descendants flattened | Every laptop in any descendant ranks side-by-side. Maximizes "one place to compare" | ✓ |
| Direct children only | Only products tagged directly to 'Laptops'. Each sub-cat has its own /rankings | |
| Flattened but grouped by sub-category | Rows visually group under sub-category headers | |

**User's choice:** All descendants flattened (Recommended).

## Sub-category UI on each row

| Option | Description | Selected |
|--------|-------------|----------|
| Small chip under product name | Row shows name on top, sub-category as small mono-font chip with CPU/RAM/storage chips | ✓ |
| Dedicated 'Class' column | Add Class column between Product and BPR medal | |
| Hidden — only via filter | Don't show sub-cat on row at all | |

**User's choice:** Small chip under product name (Recommended).

---

## Sparse / single-row state

| Option | Description | Selected |
|--------|-------------|----------|
| Seed plausible placeholder rows for design | 4-6 plausible laptops with realistic-but-fake benchmark numbers. MBP M5 Max = real | ✓ |
| Real-only with strong empty state | Show only published reviews. Visually dead during design review | |
| Seed placeholders, GATE the route | Seed for design, block /rankings publicly until ≥3 published reviews | |
| Seed placeholders, ship publicly with 'Preview' banner | Yellow banner discloses placeholder rows | |

**User's choice:** Seed plausible placeholder rows for design (Recommended).
**Notes:** Captured as D-09..D-12. Ship live without disclosure per placeholder-first build memory.

## Placeholder marking mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Seeded as real reviews, flagged via existing 'status' | status='placeholder' (extend enum if needed); leaderboard reads placeholder rows; other surfaces exclude | ✓ |
| New 'is_placeholder' boolean column on tech_reviews | Explicit flag + global env var toggle. New schema migration | |
| Seed file only, never in prod DB | Dev seed only. Prod design review shows empty state | |

**User's choice:** Seeded as real reviews, flagged via existing 'status' (Recommended).
**Notes:** Researcher confirms whether `tech_reviews.status` enum already includes `'placeholder'`; if not, this phase adds it via migration `0009_phase29_*.sql`.

---

## Affiliate column

| Option | Description | Selected |
|--------|-------------|----------|
| Reserve column slot, render placeholder 'Buy' button | Last column = 'Buy'. Disabled/passive until Phase 41. No relayout later | ✓ |
| Render 'View on Amazon/etc.' placeholder per manufacturer | Plain non-tracking external links. Phase 41 swaps for cloaked /go/ URLs | |
| Fully omit — add column in Phase 41 | No affiliate concept now. Phase 41 reflows table | |

**User's choice:** Reserve column slot, render placeholder 'Buy' button (Recommended).
**Notes:** Phase 41 swaps the link target without touching the leaderboard table layout. Component contract = `<BuyButton productId={...}>`.

## Compare integration

| Option | Description | Selected |
|--------|-------------|----------|
| Out of scope — view-only leaderboard | Users navigate to /tech/compare separately | ✓ |
| Add row checkbox + 'Compare selected (N)' button | Sticky button sends slugs to /tech/compare. Requires compare-side URL acceptance | |
| Reserve checkbox column, no behavior yet | Disabled checkboxes with tooltip | |

**User's choice:** Out of scope — view-only leaderboard (Recommended).

---

## Table technology + interaction

| Option | Description | Selected |
|--------|-------------|----------|
| @tanstack/react-table + sticky cols | TanStack v8. Sticky header + sticky #/Product on horizontal scroll. Whole-row click. Cyberpunk hover | ✓ |
| Hand-rolled with native CSS sticky | Plain table + position:sticky. Smaller bundle, more code | |
| TanStack Table with looser interaction | Same library, only Product name clickable | |

**User's choice:** @tanstack/react-table + sticky cols (Recommended).

## Surfacing — where else does the leaderboard appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Prominent 'View Rankings' CTA on /tech/categories/[slug] | Phase 31 restyles in editorial layout; Phase 29 adds working link | ✓ |
| Tile on /tech/categories index | Add 'View Rankings →' link inside or beneath each tile | |
| Preview teaser on tech homepage | Audit said: tech home should preview the master chart | |
| Cross-link from review detail + methodology | Tighten cross-link mesh from audit pivot #15 | |

**User's choice:** Only the /tech/categories/[slug] CTA. Other surfaces deferred to Phase 31/38/45.

---

## Done check

| Option | Description | Selected |
|--------|-------------|----------|
| Create context | Generate 29-CONTEXT.md and continue to plan-phase | ✓ |
| One more area | Specify additional decision before context is written | |

**User's choice:** Create context.

---

## Claude's Discretion

- Mobile card visual layout (information hierarchy within the card) — UI-SPEC step or planner discretion.
- Desktop hover/focus row treatment (subtle tint vs glitch-line vs left-edge accent) — UI-SPEC step.
- Filter sidebar collapsed-by-default vs expanded-by-default behavior on desktop.
- Whether "Reset filters" appears in both the empty state AND inside the filter sidebar header (or just the empty state).
- TanStack Table v8 ColumnDef shape — researcher/planner picks; aim for typed columns and reusable cell renderers.
- Whether the placeholder Buy button is `<button disabled>` styled as primary CTA, or passive `<span>` with hover tooltip.

## Deferred Ideas

- Tech-homepage leaderboard preview teaser → Phase 38 / Phase 40
- Categories index tile cross-link → Phase 31 / Phase 38
- Review-detail "See in rankings" cross-link → Phase 38 / Phase 45
- Methodology-page "See current rankings" cross-link → Phase 38 / Phase 45
- Compare integration (row-pinning + "Compare selected") → future phase paired with /tech/compare redesign
- Real affiliate links + /go/ cloaking → Phase 41
- Per-benchmark cross-category leaderboard pages → Phase 30
- Editorial reframe of /tech/categories/[slug] → Phase 31
- Faceted filter counts ("Apple Silicon (3)") → revisit if discoverability becomes a UAT issue
- Server-side sort when corpus > 500 rows → flip later if needed
- "Preview" banner / public route gate for placeholders → revisit only if user confusion surfaces
