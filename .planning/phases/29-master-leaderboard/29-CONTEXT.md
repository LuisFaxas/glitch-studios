# Phase 29: Master Leaderboard - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Build `/tech/categories/[slug]/rankings` — the master leaderboard page where every published review in a category lines up side-by-side with BPR medal, GlitchMark, key benchmarks, year, and price. Sortable on every column with `nuqs` URL state. Filterable via desktop sidebar + mobile Sheet. Mobile card fallback at `<768px`. This is the v3.0-carry-over headline feature that was never shipped (Phase 18 territory) and the strongest product framing on the site per the Phase 22 audit B.6 — "the single place a buyer can compare all laptops across CPU, GPU, and other benchmarks."

**In scope:**
- Server-rendered route at `src/app/(tech)/tech/categories/[slug]/rankings/page.tsx`
- Leaderboard query module: `src/lib/tech/leaderboard.ts` — `getLeaderboardRows(categorySlug)` + `getLeaderboardBenchmarkColumns(categorySlug)` with `unstable_cache`
- Client table component: `src/components/tech/leaderboard-table.tsx` (TanStack Table + nuqs)
- Filter sidebar (desktop) + Sheet (mobile) component
- Mobile card fallback rendering at `<768px`
- Empty state with methodology CTA (RANK-06)
- Column header → methodology anchor in new tab (RANK-07)
- "View Rankings" CTA wired into `/tech/categories/[slug]` editorial page (single surface, not site-wide)
- Placeholder review seed: 4-6 plausible laptop reviews with `status='placeholder'` so the page demonstrates real layout density
- Reserved affiliate column slot rendering a placeholder "Buy" button (Phase 41 swaps the link target)

**Out of scope (other phases):**
- Editorial reframe of `/tech/categories/[slug]` → Phase 31
- Per-benchmark cross-category leaderboard pages → Phase 30
- Affiliate link cloaking + tracking infrastructure → Phase 41 (this phase only reserves the column)
- Compare integration (row-pinning, "Compare selected" button, /tech/compare URL-slug acceptance) → not in v4.0 unless audit B.7 flags otherwise
- Tech homepage leaderboard preview teaser → Phase 38 (GlitchTech polish) or Phase 40
- Cross-links from review detail / methodology / categories index → Phase 38 / Phase 45 (cross-link sweep)
- Replacing placeholder reviews with real ingested reviews → Phase 36 (FLAG) + future review phases
- Schema changes to `tech_reviews` for placeholder support → handled by extending the existing review status enum (no new columns; see D-09)

</domain>

<decisions>
## Implementation Decisions

### Columns & layout
- **D-01:** Default column set + order (left → right): `# | Product (image + name + sub-category chip + CPU/RAM/storage chips) | BPR medal | BPR score | GlitchMark | <key benchmarks> | Year | Price | Buy`. Sticky `#` + `Product` columns on horizontal scroll on desktop. Identity stays anchored, scores read first, benchmarks expand horizontally.
- **D-02:** "Key benchmarks" column set is **researcher-determined**. Phase 29 researcher reads the rubric (`src/lib/tech/rubric-map.ts` + `RUBRIC_V1_1`), reviews leading benchmark-comparison sites (Tom's Hardware Bench, AnandTech Bench, Notebookcheck, PassMark, PCMark) and recommends 3-5 columns that strike the balance between brand identity (AI/LLM reflects GlitchTech voice) and reader recognition (Geekbench multi is universally legible). Planner locks the final list before implementation.
- **D-03:** Sub-category chip rendered under product name (small mono-font, alongside CPU/RAM/storage chips) when descendants are flattened — keeps rows scannable without a dedicated "Class" column.
- **D-04:** Default sort = **GlitchMark descending** (REQUIREMENTS.md RANK-01 — locked, NOT BPR descending). NULLS LAST always — products without GlitchMark sort to bottom regardless of direction.

### Filters
- **D-05:** Filter set (all seven, organized in sidebar / Sheet, in this order):
  1. Price — range slider with min/max bounds derived from current category corpus
  2. Year — multi-select chips (year values from current category corpus)
  3. CPU kind — multi-select chips: Apple Silicon / Intel / AMD / Snapdragon (derive from product spec; expand list if more vendors appear)
  4. RAM — multi-select chips: 8 / 16 / 32 / 64+ GB (bucketed)
  5. Storage — multi-select chips: 512 GB / 1 TB / 2 TB+ (bucketed). **AMENDED 2026-04-25 during plan-check:** dropped the `<512 GB` bucket per RESEARCH §Open Questions Q1 — no modern reviewable laptop ships below 512 GB; keeps the filter set tight without sacrificing coverage. If a budget product enters the catalog later, restore the bucket.
  6. Medal tier — multi-select chips: Platinum / Gold / Silver / Bronze (BPR tiers)
  7. Sub-category — multi-select chips (only when current category has descendants; otherwise hidden)
- **D-06:** Zero-results behavior: dedicated empty state above (or replacing) the table area with copy "No reviews match these filters" + a "Reset filters" button that clears all `nuqs` params. Filter sidebar stays visible/accessible.

### Sub-category scope
- **D-07:** `/tech/categories/[slug]/rankings` shows **all descendants flattened** — every laptop in any descendant (gaming, ultrabook, workstation, budget, etc.) ranks side-by-side in one list. Maximizes the "one place to compare" product framing from audit B.6. Sub-category becomes a filter chip the user can narrow with.
- **D-08:** Reuse `getCategoryDescendantIds(slug)` from `src/lib/tech/queries.ts` — pattern already established in the existing `/tech/categories/[slug]` route.

### Sparse-data + placeholder reviews
- **D-09:** Seed **4-6 plausible placeholder laptop reviews** so the leaderboard renders with realistic density at v4.0 launch. Mark them via the existing `status` column on `tech_reviews` — extend the enum (or use `'placeholder'` if already supported, otherwise add via migration in this phase) so `status='placeholder'` rows appear on the leaderboard but are excluded from `/tech/reviews` list, homepage carousels, and any "published" surface.
- **D-10:** Real flagship review (MBP 16 M5 Max from Phase 36) and the reference baseline (MBP 14 M3 base) co-exist on the leaderboard alongside placeholders. When real reviews replace a placeholder slot, operator flips status to `draft` (hidden) or deletes the placeholder row.
- **D-11:** Placeholder set should plausibly span the filter axes (price, year, CPU kind, RAM, storage, sub-category, medal tier) so each filter has at least 2 working values at launch. Researcher picks specific products; planner finalizes during seed task. Avoid trademarked benchmark scores — use plausible-but-fake numbers in the same range as published references.
- **D-12:** No "Preview" banner / no public route gate — placeholders ship live without disclosure, per the placeholder-first build memory. (Reconsider only if a placeholder generates user confusion in feedback.)

### Affiliate column reservation
- **D-13:** Last column = "Buy". Renders a styled placeholder button per row with tooltip "Affiliate links coming soon" — disabled or passive (not a real link) until Phase 41 wires `/go/[…]` cloaking and per-product affiliate URLs. Reserves layout commitment now to avoid a second table reflow when Phase 41 ships.
- **D-14:** Component contract: the Buy button accepts a `productId` prop and renders from a `<BuyButton>` component (or inline) that Phase 41 can swap to a real `<AffiliateLink>` without touching the leaderboard table layout.

### Compare integration
- **D-15:** **No row-pinning, no checkboxes, no "Compare selected" button** in Phase 29. Leaderboard is view-only; users navigate to `/tech/compare` separately if they want side-by-side. Compare redesign (audit B.7) is its own future phase.

### Table technology + interaction
- **D-16:** Library = **`@tanstack/react-table` v8.x** (already hinted in v3.0 Phase 18 plans, industry-standard for sortable headless tables, plays cleanly with `nuqs`). Install via `pnpm add @tanstack/react-table`. Table is a client component (`'use client'`) consuming server-fetched rows.
- **D-17:** Sticky behavior: header sticky on vertical scroll; `#` + `Product` columns sticky on horizontal scroll on desktop only. Mobile uses card fallback (no horizontal scroll).
- **D-18:** Row click target = **entire row** (cursor-pointer). Anywhere on the row navigates to the review detail page. Hover treatment matches site cyberpunk aesthetic — subtle row tint + crisp left-edge accent (planner finalizes via UI-SPEC).
- **D-19:** "Buy" button click is event-stopped so it does not trigger the row navigation (prevents accidental review-page redirect when user is going for the affiliate link, even if the link is a placeholder today).

### Mobile card fallback
- **D-20:** At `<768px` viewport, the leaderboard switches from a table to per-product cards. Each card shows: rank #, BPR medal, product name + sub-category chip, GlitchMark score (large), 3 most-relevant benchmark rows (researcher-determined per D-02), price, year, and the placeholder Buy button. Filters move to a Sheet triggered by a sticky filter button. No horizontal scroll on mobile — all data is vertical.

### Surfacing
- **D-21:** Phase 29 ships **one surface link**: a prominent "View Rankings" CTA on `/tech/categories/[slug]`. Phase 31 (category editorial reframe) will re-style the link in its hero/editorial layout — Phase 29 just adds a clear, working link button so the route is reachable.
- **D-22:** Categories index tile link, tech-homepage leaderboard preview, review-detail/methodology cross-links are all **deferred** (see Deferred Ideas). Phase 38 (GlitchTech polish) and Phase 45 (SEO + cross-link sweep) are the natural homes.

### Methodology link behavior
- **D-23:** Each column header (BPR, GlitchMark, every benchmark column) has a small "?" / link affordance that opens `/tech/methodology#<anchor>` in a new tab (RANK-07). Anchors: `#bpr`, `#glitchmark`, and per-benchmark anchors that the methodology page exposes (researcher confirms which anchors exist; planner adds any missing anchors as part of the methodology page touch-ups in this phase).

### Out-of-scope confirmations (do NOT plan these)
- Compare integration (any UI hook from leaderboard → compare)
- Affiliate link cloaking, /go/ routes, or any tracking — Phase 41 only
- Editorial restyle of `/tech/categories/[slug]` (only the CTA addition belongs here)
- Per-benchmark cross-category pages (Phase 30)
- Tech homepage leaderboard teaser (Phase 38 / Phase 40)
- Replacing placeholders with real reviews (Phase 36 + later review phases)

### Claude's Discretion
- Exact mobile card visual layout (information hierarchy within the card) — UI-SPEC step or planner discretion.
- Exact desktop hover/focus row treatment — UI-SPEC step (subtle tint vs glitch-line vs left-edge accent).
- Filter sidebar collapsed-by-default vs expanded-by-default behavior on desktop.
- Whether "Reset filters" appears in both the empty state AND inside the filter sidebar header (or just the empty state).
- TanStack Table v8 ColumnDef shape — researcher/planner picks; aim for typed columns and reusable cell renderers.
- Whether the placeholder Buy button is a `<button disabled>` styled like a primary CTA, or a passive `<span>` with hover tooltip — visual decision; behavior identical (no action).

### Folded Todos
None — no pending todos matched this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope + decisions
- `.planning/REQUIREMENTS.md` "RANK-01..07" section — acceptance criteria for the master leaderboard
- `.planning/ROADMAP.md` "Phase 29: Master Leaderboard" entry — high-level success criteria
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §B.6 "Category rankings (master leaderboard)" — vision, product framing, deferred items
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §"Section I" — GlitchMark/BPR coexistence on leaderboard (re-affirmed)
- `.planning/phases/28-glitchmark-system/28-CONTEXT.md` D-16 — GlitchMark and BPR coexist forever; both surface on leaderboard

### Existing query layer (pattern to extend)
- `src/lib/tech/queries.ts` — `getCategoryBySlug`, `getCategoryDescendantIds`, `listProductsForCategory`, `getCategoryBreadcrumb`, `listChildCategories` (read these to understand DISTINCT ON canonical-run patterns and category tree traversal)
- `src/lib/tech/bpr.ts` — pure-function module; pattern to mirror for any leaderboard math helpers
- `src/lib/tech/glitchmark.ts` (NEW from Phase 28) — recompute on ingest; the leaderboard reads `tech_reviews.glitchmark_score` directly, no recompute here

### Schema (read before writing migrations or queries)
- `src/db/schema.ts` lines 821-874 — `tech_reviews` table including `bpr_score`, `bpr_tier`, `glitchmark_score`, `glitchmark_is_partial`, `glitchmark_test_count`, `glitchmark_version`, `status`
- `src/db/schema.ts` lines 875-932 — `tech_benchmark_templates`, `tech_benchmark_tests`, `tech_benchmark_runs`, indices
- `src/db/schema.ts` `tech_review_discipline_exclusions` — for "Not tested" tooltip data (RANK-04)
- `src/db/schema.ts` `tech_products` — manufacturer, spec sheet, hero image fields

### Existing components (reuse, don't reimplement)
- `src/components/tech/bpr-medal.tsx` — `<BprMedal>` component, used per row
- `src/components/tech/category-product-tile.tsx` — existing card-style tile (mobile card fallback may extend or pattern-match)
- `src/components/ui/sheet.tsx` — shadcn Sheet for mobile filter overlay
- `src/components/ui/glitch-heading.tsx` — already used on `/tech/categories/[slug]`; reuse for leaderboard h1 (per memory `feedback_glitch_headers.md` — hover-only RGB-split glitch)

### Existing route (where the link goes)
- `src/app/(tech)/tech/categories/[slug]/page.tsx` — gets the "View Rankings" CTA in this phase (D-21)
- `src/app/(tech)/tech/methodology/page.tsx` — column-header methodology links target this page with anchors (D-23)

### Migration pattern (only if status enum needs migration)
- `src/db/migrations/0007_phase27_media.sql` and `0008_phase28_glitchmark.sql` — DO $$ EXCEPTION enum guard, IF NOT EXISTS, idempotent runner pattern. Clone for `0009_phase29_*.sql` if the `status` enum needs `'placeholder'` added.
- `scripts/run-phase28-migration.ts` — standalone postgres-js runner; clone for Phase 29 if a migration is needed.

### Project memory (read at agent startup)
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/project_glitchmark.md` — origin concept; BPR vs GlitchMark comparison (informs leaderboard column purpose)
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/project_placeholder_first_build.md` — placeholder-first build philosophy (justifies D-09..D-12)
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/project_brand_name.md` — brand is GlitchTech (not GlitchTek); fix copy as touched
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/feedback_no_executors.md` — no gsd-executor subagents; work inline, verify with Playwright
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/feedback_glitch_headers.md` — site-wide rule: hover-only RGB-split glitch on every header; no auto-running animations
- `~/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/feedback_playwright_verification.md` — Playwright during dev for visual verification

### CodeBox constraints (read by planner before sizing tasks)
- `~/CLAUDE.md` + `~/workspaces/CLAUDE.md` — pnpm only, never run `next build` in parallel agents, prefer `pnpm tsc --noEmit` for verification

### External research targets (researcher should look at these)
- Tom's Hardware CPU / GPU benchmark hierarchy charts — column choice + sort UX
- AnandTech Bench (now archived but pattern is canonical) — comparison table column hierarchy
- Notebookcheck laptop database — sub-category filter UX, large-corpus filtering
- UserBenchmark, PassMark, PCMark — column-density extremes (what NOT to do beyond a point)
- TanStack Table v8 docs (https://tanstack.com/table/v8) — ColumnDef API + nuqs integration patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/tech/queries.ts` — already exports category-tree helpers (`getCategoryDescendantIds`, `listProductsForCategory`); leaderboard query module extends the pattern with a JOIN on `tech_reviews` + benchmark runs
- `src/components/tech/bpr-medal.tsx` `<BprMedal>` — drop-in cell renderer for medal column
- `src/components/ui/sheet.tsx` — shadcn Sheet for mobile filters; already used elsewhere (consistent UX)
- `src/components/ui/glitch-heading.tsx` — h1 styling consistent with rest of /tech surfaces
- `src/components/tech/category-product-tile.tsx` — pattern reference for mobile card fallback
- `tech_reviews.glitchmark_*` columns + `bpr_*` columns (from Phase 28 + earlier) — leaderboard reads directly, no recompute in this phase

### Established Patterns
- **DISTINCT ON canonical runs:** Phase 15 query patterns (D-16 / `getBenchmarkRunsForProducts`) — apply same shape when fetching one canonical (mode='ac') run per (productId, testId) for benchmark columns
- **`unstable_cache` wrapper:** Phase 18 plan hint — wrap leaderboard fetch with `unstable_cache` keyed by category slug; revalidate on review publish
- **Numeric persistence + display:** GlitchMark = `numeric(7,2)` shown as `165.32`; BPR = `numeric(5,4)` shown as tier; price = pre-formatted string from `tech_products`
- **NULLS LAST sort:** explicit `ORDER BY ... NULLS LAST` in Drizzle queries — applies to GlitchMark (D-04) and any benchmark column where some products lack a run
- **`nuqs` URL state:** site-wide convention for sortable + filterable views (used on /tech/reviews, /beats); leaderboard follows the same pattern
- **No gsd-executor subagents** (memory: `feedback_no_executors.md`); work inline with Playwright verification
- **Hover-only glitch headers** (memory: `feedback_glitch_headers.md`); reuse `<GlitchHeading>` for h1
- **Migration runner pattern:** `pnpm db:migrate:phase{N}` script + standalone postgres-js runner (Phase 27/28 freshest examples) — only needed if `status` enum gets `'placeholder'` added

### Integration Points
- **Route:** new file `src/app/(tech)/tech/categories/[slug]/rankings/page.tsx` (server component) — fetches via `getLeaderboardRows` and `getLeaderboardBenchmarkColumns`, passes to `<LeaderboardTable>` client component, wraps with filter sidebar
- **Query module:** new file `src/lib/tech/leaderboard.ts` — exports `getLeaderboardRows(categorySlug)` and `getLeaderboardBenchmarkColumns(categorySlug)`; cached via `unstable_cache`
- **Table component:** new file `src/components/tech/leaderboard-table.tsx` — TanStack Table + nuqs sort + filter state
- **Filter components:** new files `src/components/tech/leaderboard-filter-sidebar.tsx` (desktop) + `src/components/tech/leaderboard-filter-sheet.tsx` (mobile) OR a single component that re-skins; planner decides
- **Mobile card fallback:** new file `src/components/tech/leaderboard-card.tsx` (rendered when viewport `<768px`)
- **Buy button placeholder:** new file `src/components/tech/buy-button.tsx` (or inline in table); contract designed for Phase 41 swap
- **Placeholder seed:** new file `src/db/seeds/placeholder-laptops.ts` (or extend existing seed) — inserts 4-6 `tech_products` + `tech_reviews` rows with `status='placeholder'` and matching `tech_benchmark_runs` for plausible filter coverage
- **Status enum extension (if needed):** `src/db/migrations/0009_phase29_placeholder_status.sql` + `scripts/run-phase29-migration.ts` + `pnpm db:migrate:phase29` — only if existing `tech_reviews.status` enum doesn't already include `'placeholder'` (researcher confirms current enum values during research phase)
- **CTA wiring:** `src/app/(tech)/tech/categories/[slug]/page.tsx` gets a "View Rankings" CTA button linking to `/tech/categories/[slug]/rankings`

</code_context>

<specifics>
## Specific Ideas

- **Reference device anchor:** MBP 14 M3 base = the GlitchMark 100 baseline (per Phase 28 D-05). It must be a row on the leaderboard — placeholder set should include it. Methodology link from the GlitchMark column header points to the baseline section showing this anchor.
- **Real flagship row:** MBP 16 M5 Max (Phase 36) is the one real published review at v4.0 launch. It must surface clearly — likely top of GlitchMark sort once Phase 36 ships.
- **Placeholder set spec (suggested, planner finalizes):** ~6 rows spanning sub-categories (gaming / ultrabook / workstation / budget), CPU kinds (Apple Silicon / Intel / AMD), price tiers, year range. E.g.: MBP 14 M3 base (Apple/ultrabook/reference), ROG Strix G16 (Intel+Nvidia/gaming), ThinkPad X1 Carbon (Intel/ultrabook/business), Razer Blade 16 (Intel+Nvidia/gaming/premium), Dell XPS 14 (Intel/ultrabook/mainstream), Framework 16 (AMD/workstation/enthusiast). Researcher picks final set; ensure no trademarked actual benchmark numbers are reused — use plausible-but-fake numbers.
- **Methodology page tone consistency:** column-header anchors should land on the existing methodology section voice (first-person plural, plain English, no hedging — same as BPR + GlitchMark sections).
- **TanStack Table version:** v8.x is current stable; install fresh per CodeBox `pnpm add @tanstack/react-table` (don't pin to v7).
- **Cyberpunk aesthetic discipline:** hover treatments on rows must match site visual language (subtle, NOT auto-running). Per memory `feedback_glitch_headers.md`, animations are hover-only.

</specifics>

<deferred>
## Deferred Ideas

- **Tech-homepage leaderboard preview teaser** ("Top 5 laptops by GlitchMark") — audit explicitly noted this; deferred to Phase 38 (GlitchTech polish) or Phase 40 (public per-page polish)
- **Categories index tile cross-link** to /rankings — Phase 31 (category editorial reframe) or Phase 38
- **Review-detail "See in rankings" cross-link** — Phase 38 / Phase 45 cross-link sweep
- **Methodology-page "See current rankings" cross-link** — Phase 38 / Phase 45 cross-link sweep
- **Compare integration: row-pinning + "Compare selected" button** — its own future phase, paired with `/tech/compare` URL-slug acceptance redesign (audit B.7 deferred work)
- **Real affiliate links + /go/ cloaking + tracking** — Phase 41 (Affiliate Marketing Infrastructure)
- **Per-benchmark cross-category leaderboard pages** — Phase 30
- **Editorial reframe of /tech/categories/[slug] hub** — Phase 31
- **Mobile-device categories beyond laptops** — implicit-future when more categories ship reviews; placeholder seed in this phase is laptops-only
- **Replace placeholder reviews with real ingested reviews** — Phase 36 (FLAG) brings the first real one; subsequent review phases displace the placeholders one-by-one
- **Faceted filter counts** ("Apple Silicon (3)") — opted for plain multi-select chips in v4.0; revisit if filter discoverability becomes a UAT issue
- **Leaderboard server-side sort** (when corpus exceeds ~500 rows per category) — currently client-sort in memory per v3.0 roadmap decision; flip later if needed
- **Auto-relax filter on zero results** — chose explicit "Reset filters" empty state instead; revisit if user feedback says explicit feels heavy
- **"Preview" banner / public route gate for placeholder rows** — chose to ship live without disclosure per placeholder-first build memory; revisit only if user confusion shows up

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 29-master-leaderboard*
*Context gathered: 2026-04-25*
