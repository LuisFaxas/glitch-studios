# Phase 30: Per-Benchmark Pages - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Surface every benchmark in `RUBRIC_V1_1` (43 tests) as its own browsable page. Two routes:

- `/tech/benchmarks` — landing index, all 43 tests grouped by discipline
- `/tech/benchmarks/[slug]` — per-benchmark detail page with cross-category leaderboard

Replaces the current honest-empty-state stub on `/tech/benchmarks`. Read-only on the data layer (no schema changes, no rubric mutations).

</domain>

<decisions>
## Implementation Decisions

### URL Strategy
- **D-01:** Slug = full rubric key kebab-cased. `cpu:geekbench6:multi` → `/tech/benchmarks/cpu-geekbench6-multi`. 1:1 reversible mapping with `RUBRIC_V1_1`. No schema column needed; both directions derive in code.
- **D-06 (downstream guidance):** `generateStaticParams` enumerates `Object.keys(RUBRIC_V1_1)` mapped through the same kebab transform. 43 known slugs prerender at build. Adding a 14th discipline / new test → next build picks it up.

### Landing Page Layout
- **D-02:** Discipline-grouped tile sections (13 sections, mirrors methodology page structure). Each section has a tile sub-grid of its tests; jump-nav across the top for the 13 disciplines. BPR-eligible badge on the 7 BPR-eligible tests' tiles (reuses the badge pattern from `MethodologyDisciplineCards` shipped in 29.2-03).
- No filter chips, no nuqs URL state, no JS interactivity beyond anchor scrolling. Static-friendly, low-baseline (the 29.3 GPU baseline lessons apply: keep persistent shell light).

### Detail Page — AC + Battery Presentation
- **D-03:** When a benchmark has `mode: "both"`, render side-by-side columns in a single ranking: `Rank | Product | Category | AC Score | Battery Score | BPR ratio`. One sort order at a time, toggleable. Reader sees plugged-vs-unplugged on every row.
- **D-04:** Default sort = AC score (toggleable to Battery, BPR ratio). For `mode: "ac"` benchmarks, only the AC column renders. For `mode: "battery"`, only Battery. The `direction` field (`higher_is_better` / `lower_is_better`) determines descending vs ascending.

### Editorial Content
- **D-05:** "What this measures" + "why it matters" blurbs are generated from rubric metadata for this phase (terse, formulaic, ships now without content authoring). Per-test editorial copy is **deferred** to a future content phase. Each detail page links out to `/tech/about#methodology` for the full methodology context.

### Cross-Linking (carried forward from Phase 22 audit B.9, no re-discussion needed)
- Leaderboard row product names → product review page `/tech/reviews/[slug]`
- Detail page CTA → `/tech/about#methodology` (same target as `/tech/benchmarks` landing CTA established in 29.2-09)
- Methodology page `/tech/about#disciplines` discipline names link to the corresponding discipline section on `/tech/benchmarks` (anchor link, not a new route)
- Affiliate links per row: **out of scope this phase** (Phase 41 territory)

### Claude's Discretion
- TechHero copy on landing + detail pages (eyebrow / title / subhead / CTA wording — follow 29.2 cadence; recommended `BENCHMARKS` / `Benchmarks` cyan default for landing; `BENCHMARK` / `<test name>` cyan for detail with CTA "View methodology" → `/tech/about#methodology`)
- Empty-state styling when a benchmark has 0 measurements (use the same monochrome empty-state pattern as `/tech/blog` and `/tech/benchmarks` body in 29.2-09/10)
- Tile visual styling on the landing (border + bg + hover; reuse `MethodologyDisciplineCards` aesthetic for consistency)
- "Not measured" row vs omit-row policy when a product is missing a test (recommend: omit; honest leaderboard contains only products with the measurement)
- Baseline relative score rendering (`+47% vs baseline` pill or column) — recommend ship as a column in the leaderboard row using `tech_benchmark_tests.reference_score`; if `reference_score` is null for a test, omit the column without breaking the row
- Pagination: not needed at current data volume; if leaderboard exceeds ~50 rows in the future, defer pagination to a polish phase
- 404 handling for unknown slugs (use Next.js `notFound()` from the route handler)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Rubric / Data Layer (read-only in this phase)
- `src/lib/tech/rubric-map.ts` — `RUBRIC_V1_1` (43 RubricTestSpec entries keyed `<discipline>:<tool>:<field>`); types `BenchmarkDiscipline`, `BenchmarkMode`, `BenchmarkDirection`, `RubricTestSpec`. Authoritative source for slug enumeration and metadata.
- `src/lib/tech/leaderboard.ts` — query patterns, direction handling, sort helpers reusable for cross-category leaderboards.
- `src/lib/tech/queries.ts` — `getBenchmarkRunsForProducts` and similar (Phase 27/28 cross-product fetch patterns).

### Component / Pattern Reuse
- `src/components/tech/tech-hero.tsx` — TechHero with size variants (Phase 29.2-01); use `default` size for both landing and detail.
- `src/components/tech/methodology-discipline-cards.tsx` — discipline-grouped tile pattern with BPR ELIGIBLE badge; mirror this aesthetic on the landing page.
- `src/components/ui/glitch-heading.tsx` — wrap every h1 (TechHero handles this internally) and section h2s on this phase's pages.
- `src/components/tech/category-tile.tsx` — Direction B tile pattern (80px icon + caption + group hover). Useful reference for the landing tiles, though benchmark tiles use text-led (test name + tool / discipline) rather than icon-led.

### Surfaces Touched
- `src/app/(tech)/tech/benchmarks/page.tsx` — current landing (TechHero + empty-state). Replace the empty-state body with the discipline-grouped tile sections.
- `src/app/(tech)/tech/benchmarks/[slug]/page.tsx` — **NEW route** to be created by this phase.

### Methodology / Editorial Anchors
- `/tech/about#methodology` — landing CTA + detail CTA target (precedent: 29.2-09 benchmarks hero already points here).
- `/tech/about#disciplines` — discipline-name reverse links from disciplines listed on per-benchmark surface.

### Brand / Quality Standards
- `references/ui-brand.md` — hover-only RGB-split, GlitchTech spelling, sidebar-no-scroll, no auto animations on h1.
- `.planning/phases/29.2-site-wide-hero-rollout/29.2-CONTEXT.md` — TechHero usage cadence and copywriting conventions.
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §B.9 — locked architectural decisions for `/tech/benchmarks` (tile + blurb format, AC+Battery framing, editorial methodology blurb at top, cross-link contract, affiliate-natural-here-for-Phase-41).

### Memory / Constraints
- Sequential execution per plan; Playwright spec per plan; `pnpm tsc --noEmit` and `pnpm lint` clean after each plan.
- CodeBox build constraint (CLAUDE.md): never run concurrent `pnpm build`; one build at a time.
- 29.3 GPU baseline lessons: keep persistent shell light; no always-mounted glitch layers; memoize provider context values; conditional render heavy elements.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`RUBRIC_V1_1` constant**: drives both landing enumeration and `generateStaticParams`. No DB query needed for the landing page if the only data shown is rubric metadata + per-test counts.
- **`tech_benchmark_runs` + `tech_benchmark_tests` schema**: per-test scores live here, joined to `tech_reviews` (and `tech_products`). Phase 28's GlitchMark ingest path populates these atomically.
- **`<TechHero>`**: ready to mount on both landing and detail; size + tone choices in Claude's discretion above.
- **`<MethodologyDisciplineCards>` (29.2-03)**: discipline section + tile + BPR ELIGIBLE badge pattern is the visual template for the landing page sections.

### Established Patterns
- **Static-first**: `/tech/about`, `/tech/categories` use `force-static` + `revalidate = 60`. Mirror this for both new surfaces.
- **TanStack Table for leaderboards**: detail page leaderboard reuses the leaderboard.ts query patterns; if a table abstraction exists in `<LeaderboardTable>`, evaluate whether it generalizes to per-benchmark leaderboards or needs a leaner per-benchmark variant (the 29.3 baseline lessons argue for leaner — no sticky cells, no 1600px min-width, no canvas widgets).
- **Honest empty-states**: when a benchmark has 0 measurements, render a "No measurements yet" panel (29.2-10 blog precedent), never fake rows.

### Integration Points
- **Sidebar nav**: Benchmarks link already exists (active in 29.x); no nav changes needed.
- **`/tech/benchmarks` route**: page.tsx is being rewritten in this phase (replaces empty-state body); TechHero stays.
- **`/tech/benchmarks/[slug]` route**: brand-new file. Use the existing `(tech)` layout group's shell.

</code_context>

<specifics>
## Specific Ideas

- AC + Battery side-by-side renders the BPR ratio per row using the same calculation already in `bpr.ts` (geometric-mean inputs); this phase only displays the per-test ratio (battery/ac), not a recomputation.
- Landing page tiles can show per-test "{N} measurements" using a count query against `tech_benchmark_runs` — useful but verify the query cost against the 29.3 baseline lessons. If it forces a per-tile DB hit, batch into one aggregate query at the page level.
- The detail page's editorial blurb takes the form: "{Test name} measures {discipline} via {tool}. Higher scores indicate better {direction}. We run this on {mode}." All template variables come from the rubric — no editorial input needed for the v1 ship.

</specifics>

<deferred>
## Deferred Ideas

- **Per-test editorial copywriting** ("what this measures" / "why it matters" handcrafted prose) — belongs in a content phase after this presentation phase ships.
- **Affiliate links on leaderboard rows** — Phase 41 (Affiliate Marketing Infrastructure).
- **Search / filter on landing page** beyond discipline grouping — defer to a later polish phase if the data volume justifies it.
- **Pagination on detail leaderboards** — not needed until a single benchmark routinely exceeds ~50 measured products.
- **Per-test admin authoring UI** — out of scope; rubric is append-only via code (D-14 from Phase 17).
- **Cross-benchmark normalization or aggregate scoring** beyond BPR/GlitchMark — separate research phase if pursued.
- **Editorial slug overrides** (`/tech/benchmarks/cinebench` instead of `cinebench2024-multi`) — would require a slug column + collision policing; not justified for v1.

</deferred>

---

*Phase: 30-per-benchmark-pages*
*Context gathered: 2026-04-27*
