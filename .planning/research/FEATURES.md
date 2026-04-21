# Feature Landscape: GlitchTek v3.0 Leaderboards + Methodology

**Domain:** Hardware review site — category leaderboards, methodology exposition, JSONL evidence, BPR rollup
**Researched:** 2026-04-20
**Scope:** v3.0 new features only. Assumes v2.0 review detail, reviews list, 2-way compare, categories, Tiptap editor are already shipped.

---

## Reference Sites Studied

| Site | Defining Format | What to Extract |
|------|----------------|-----------------|
| PassMark CPU Charts | 3-column ranked table (CPU / Score / Price), "NA" for missing prices, pagination across 4+ pages, search box, category pills | Column economy, NA handling, pill filters |
| PassMark Mega Page | 12-column table with toggleable columns, range sliders per column, category dropdown, compare URL encoding (`/compare/6304vs5157/`) | Filter depth, column visibility, URL-encoded compare state |
| Tom's Hardware CPU Hierarchy | Article-embedded tables; 7 columns default; % relative to top chip (fastest = 100%); methodology inline on same page; "Out of Stock" for missing prices | Relative % scoring, inline methodology, no separate page needed |
| NotebookCheck Ranking | Weighted Sum Model; category-dependent weights (a 2kg ultrabook vs 2kg gaming laptop score differently for weight); sortable by any column; reviewer impression adjustment (`+/- X%`) | Sub-score weighting, category-dependent scoring, editorial adjustment |
| RTings | "Performance Usages" score boxes; per-score "how we test" inline links; versioned test benches with changelogs; raw data spreadsheet public; category-weighted overall scores | Inline methodology links, versioning, evidence transparency, paywall backlash |
| Geekbench Browser | Permalink per result (`/v6/cpu/17731392`); compare URL (`/compare/[id]?baseline=[id]`); URL-encoded search/sort (`?q=&sort=score&dir=desc`); workload breakdown PDFs | Evidence permalinks, URL state for sort/filter, multi-result comparison pattern |
| GamersNexus Living Doc | Centralized methodology doc; per-platform test bench specs listed with purchase links; "Reason" column per benchmark tool; "Last Updated: 2025-01-17" timestamp | Living doc structure, per-benchmark rationale column |
| Digital Foundry | Video-first with frametime overlay graphs; frame-by-frame analysis from uncompressed capture; side-by-side comparison clips | Evidence density; their format doesn't map directly to leaderboards |
| Laptop Mag | 1–5 star editorial synthesis (not formula); 12 sub-categories; Editor's Choice at ≥ 4 stars; dedicated "how we review" page | Verdict box simplicity; downside of opaque editorial scoring |

---

## Table Stakes

Every competing site has these. Missing any of them makes the leaderboard feel unfinished or untrustworthy.

| Feature | Why Expected | Complexity | v2.0 Dependency | Concrete Copy |
|---------|--------------|------------|-----------------|---------------|
| **Rank column** | First column on every leaderboard. PassMark, NotebookCheck, Tom's Hardware all lead with it | Easy | None | Column header: `#` |
| **Product name column linking to review** | Universal. Name is always a hyperlink to the full review | Easy | Existing review detail pages at `/tech/reviews/[slug]` | Column header: `Device` |
| **Overall score column** | Every site leads with the composite or primary score | Easy | Needs aggregate score field in `tech_products` or `tech_reviews` | Column header: `GlitchTek Score` (0–100) |
| **Primary benchmark score column** | PassMark leads with CPU Mark; Tom's Hardware with 1080p gaming %. GlitchTek equivalent: Geekbench 6 Multi-Core for Laptop/CPU category | Easy | `tech_benchmark_results` table exists | Column header: `Geekbench 6 MC` |
| **Price column with explicit N/A for unknown** | PassMark uses `NA` — not blank. Tom's Hardware uses `Out of Stock`. Blank cells look like bugs | Easy | `tech_products.price_usd` field exists | Display: `—` or `N/A` in muted text |
| **Year column** | NotebookCheck includes release year. Critical for filtering old vs new hardware | Easy | `tech_products` has release date field | Column header: `Year` |
| **Sort on any column by clicking header** | NotebookCheck, PassMark Mega Page, RTings table all sort on column header click with ↑/↓ indicator | Medium | `@tanstack/react-table` already in stack | Visual: `↑` or `↓` on active sort column |
| **Default sort: score descending** | Every leaderboard opens ranked best→worst. Users expect the #1 product at top | Easy | Table `initialState` | No UI needed — just the default |
| **Category filter** | PassMark category pills: Desktop / Laptop / Server / Mobile. Same concept here | Easy | `tech_categories` table and slug pattern exist from v2.0 | Filter label: `Category` pills — Laptop / Desktop / Mobile / Audio |
| **"Not tested" cell handling** | PassMark uses `NA`; RTings leaves cells blank (confusing). Must be explicit and consistent | Easy | Null check in display layer | `—` (em dash) in grey/muted text; hover tooltip: "Not yet tested" |
| **Pagination** | PassMark paginates across 4+ pages. At v3.0 launch corpus is <20 — no pagination needed yet, but architecture must support it | Easy | TanStack table pagination pattern | Default page size: 25. Add when corpus > 25 |
| **Methodology page** | Every credible site has one. RTings: `/research`. GamersNexus: living doc. Tom's Hardware: inline same page. Laptop Mag: `/articles/how-we-review` | Medium | Nothing yet — new route | URL: `/tech/methodology` (already in v3.0 spec) |
| **"How we test X" link per score section** | RTings links from each score card to the specific test methodology page. Makes individual scores verifiable | Easy | Methodology page must exist first | Inline text: "How we test battery life →" linking to `/tech/methodology#battery` |

---

## Differentiators

Features only 1–2 sites have that meaningfully elevate credibility. Worth shipping.

| Feature | Who Has It | Value Proposition | Complexity | v2.0 Dependency | Concrete Copy |
|---------|-----------|-------------------|------------|-----------------|---------------|
| **Geekbench permalink inline** | Nobody does this in review articles consistently. Geekbench Browser assigns `/v6/cpu/[id]` to every run automatically | Proof the score is real. Readers click the link and see the result on Primate Labs' servers — independently hosted, uneditable | Easy | `tech_benchmark_results` needs a `permalink_url` column | Link text: "Geekbench 6 result →" |
| **Raw log / screenshot attachment per benchmark** | GamersNexus posts terminal screenshots inline. RTings publishes raw data spreadsheets. No one links actual `.txt` log files | Maximal evidence: reader downloads the terminal output from the bench session and verifies the number themselves | Medium | New `tech_benchmark_evidence` table; Uploadthing already in stack | UI: paperclip icon → "Download raw log (cpu-ac.txt, 3.2 KB)" |
| **URL-encoded filter + sort state** | Geekbench Browser (`?sort=score&dir=desc`). PassMark compare (`/compare/6304vs5157/`). Almost no editorial review sites do this for leaderboard pages | Shareable filtered views. Example: "M-series Macs under $2,000 sorted by battery life" | Easy | `nuqs` already in stack; this is exactly how the v2.0 reviews list works | URL: `/tech/leaderboards/laptops?arch=apple-silicon&maxPrice=2000&sort=battery&dir=desc` |
| **Versioned methodology** | RTings introduced versioned test benches in 2019 with changelogs. GamersNexus labels living doc by year. Most editorial sites don't version at all | When rubric changes, old scores stay labeled with the version that produced them. Eliminates "why did the score change?" confusion | Medium | Schema needs `rubric_version` field on `tech_benchmark_results` | Badge on score: "Rubric v1.1". Methodology page shows changelog: v1.1 (2026-04-20) — initial |
| **BPR rollup medal** | Nobody does this | Only GlitchTek tells you how much performance you lose when you unplug. Battery *life* (hours) != battery *performance retention* (% of plugged-in speed). The M5 Max may run 18 hours AND retain 97% performance — Platinum. A Snapdragon laptop may run 22 hours but throttle to 60% — Bronze | Hard | Requires AC and battery `mode` flag on `tech_benchmark_results`; geometric mean computation query | Medal tiers — Platinum: ≥90% "Full performance untethered" / Gold: ≥80% "Minimal unplugged penalty" / Silver: ≥70% "Noticeable throttle, usable" / Bronze: <70% "Significant performance drop on battery" |
| **Inline score contribution breakdown** | RTings shows how each sub-score feeds into overall with weighting displayed in a "box score" | Readers understand *why* a laptop ranks where it ranks. Makes the score auditable | Medium | Review detail page exists; needs new score breakdown component | Collapsible section: "How this score is calculated" with per-discipline bar chart showing contribution |
| **AC vs Battery split columns (optional)** | No review site surfaces this as toggleable leaderboard columns | GlitchTek's unique data asset: we have both AC and battery benchmark runs for every discipline | Medium | Benchmark rows need `mode: 'ac' | 'battery'` flag + BPR computation query | Optional columns (off by default, toggled via column visibility): `Plugged Score` / `Battery Score` / `BPR %` |

---

## Anti-Features

Things competing sites do that we should explicitly NOT copy.

| Anti-Feature | Who Does It | Why Avoid | What to Do Instead |
|--------------|------------|-----------|-------------------|
| **Affiliate link injection in table cells** | PassMark (Amazon/Newegg inline in price cells), Tom's Hardware (Amazon affiliate on every link) | Undermines credibility. Readers know the site profits from showing certain products. Skews trust | Show price plainly. Single "Check price" link that opens a neutral search. Explicit disclaimer: "We earn no affiliate fees" |
| **Thousands of rows with no virtualization** | PassMark CPU Mega Page (1M+ entries, one page, filter-heavy) | DOM performance disaster on mobile. Page becomes unusable below 1,000 rows without virtualization | Cap display at 100 visible rows. Paginate at 25/page. Only add `@tanstack/react-virtual` if corpus exceeds 200 rows. At v3.0 launch, corpus is <20 — just render all |
| **Letter-tier gamer ranking theater (S/A/B/C/D)** | Various gaming hardware sites (implied by community requests on Tom's Hardware forums) | Arbitrary cutoffs invite endless argument. Tiers obscure the actual numeric distance between products | Numeric scores + BPR medals (cutoffs are formula-defined and published). No letter tiers |
| **Paywalling score details** | RTings (moved full test results behind subscription in 2025) | Generated 200+ negative replies on ResetEra within days. Community stopped linking RTings. Destroyed trust built over years | All scores free. GlitchTek has no advertising model to protect. Full transparency IS the brand |
| **Un-versioned methodology** | Most editorial sites (The Verge, Engadget, Laptop Mag) — they say "we test performance" without versioning or dating the methodology | When methodology changes silently, old scores become meaningless. "Why did score change?" has no answer | Version every rubric revision explicitly. Every benchmark result carries `rubric_version`. Methodology page shows changelog |
| **Opaque editorial score** | Laptop Mag (1–5 star synthesis with no formula disclosure, purely reviewer judgment) | Readers can't verify or predict the score. Trust depends entirely on brand reputation | GlitchTek scores are formula-derived. Publish the formula on `/tech/methodology`. Show it inline on review detail via the score breakdown component |
| **Gradient/flame cell highlights** | GPU review sites (red→green gradient fills, flame icons for top scores) | Clashes with GlitchTek's flat monochrome brand. Adds noise without information. Feels like gamer-bait | Subtle cell shading: top quartile gets slightly lighter background (`#222` vs `#111`). Brand color accent only for rank `#1` |
| **Static non-shareable tables** | Tom's Hardware CPU Hierarchy (no URL filter state; article-embedded static HTML table) | Can't share a filtered view. Forces every user to re-apply their own filters. Leaderboards derive much of their value from being shareable | All filter and sort state in URL via nuqs |

---

## Novel for GlitchTek (No Competitor Has These)

### BPR (Battery Performance Ratio) Rollup Medal

**Definition:** Geometric mean of `(battery_score / ac_score)` across all disciplines where both modes were tested. Expressed as a percentage. Mapped to 4 medal tiers.

**Formula (to publish on methodology page):**
```
BPR = geometric_mean(battery_score_d / ac_score_d) for each discipline d
    = exp(mean(ln(battery_score_d / ac_score_d)))
```

**Why nobody else has it:** Competitors report battery *life* (hours until empty). We report battery *performance retention* (how fast it runs while on battery). These answer completely different questions. An M5 Max MacBook might run 18 hours AND retain 97% of plugged-in performance — that's Platinum. A Snapdragon laptop might run 22 hours but throttle to 60% performance when unplugged — that's Bronze.

**Medal tiers (copy-ready):**
- `PLATINUM` — BPR ≥ 90% — "Full performance untethered"
- `GOLD` — BPR ≥ 80% — "Minimal unplugged penalty"
- `SILVER` — BPR ≥ 70% — "Noticeable throttle, usable"
- `BRONZE` — BPR < 70% — "Significant performance drop on battery"

**Framing to avoid feeling arbitrary:** Publish the formula on `/tech/methodology`. Reference Apple Silicon as the empirical anchor (known ~95%+ performance retention on battery) — that's what defines Platinum. The thresholds are grounded in real hardware behavior, not marketing copy.

**Schema:** `tech_benchmark_results` needs `mode: 'ac' | 'battery'`. BPR is computed at query time (Drizzle view or derived query), not stored — no migration needed for the medal itself, only the `mode` column addition.

### Rubric v1.1 Evidence Transparency

**What it is:** Each benchmark result in a review article links to three independent evidence sources:
1. Geekbench permalink (auto-uploaded by the app after run: `browser.geekbench.com/v6/cpu/[id]`)
2. Screenshot from the session (`screenshots/cpu-geekbench-ac.png`, stored in Uploadthing)
3. Raw log file (`logs/cpu-ac.txt`, terminal output from `bash pack/disciplines/cpu.sh ac`)

**Schema:** New table `tech_benchmark_evidence`: `(benchmark_result_id, evidence_type: 'geekbench_permalink' | 'screenshot' | 'raw_log', url, captured_at)`

**Why it matters:** The Geekbench permalink is hosted by Primate Labs — a third party with no relationship to GlitchTek. Readers can verify the score independently. This is the hardware review equivalent of showing your work.

---

## Filter UX for Leaderboards

Research sources: PassMark Mega Page (range sliders, category pills), RTings table (above-table controls), v2.0 reviews list (nuqs pattern).

### Recommended Filter Controls

| Filter | UI Control | Values | Source |
|--------|-----------|--------|--------|
| Category | Pill group | Laptop / Desktop / Mobile / Audio | PassMark category pills pattern |
| Year | Select or dual range | 2022–2026, "Any" default | NotebookCheck seasonal roundup pattern |
| Max Price | Range slider | $0–$5,000, "Any" default | PassMark Mega Page range slider pattern |
| CPU Architecture | Checkbox group | Apple Silicon / Intel / AMD / Qualcomm | NotebookCheck filter sidebar |
| Sort | Dropdown | GlitchTek Score / BPR Medal / Battery Life / Geekbench MC / Price / Year | Tom's Hardware sort pattern |
| BPR Medal | Pill group | Platinum / Gold / Silver / Bronze | GlitchTek-specific |

### Filter UX Rules

1. **Filters above the table, not in a sidebar.** Sidebar hides filters on mobile. Above-table pill/chip pattern is what PassMark, RTings, and the v2.0 reviews list all use.
2. **Active filters as dismissible chips.** Show `Apple Silicon ×` chips below the filter controls so users see what's active without scrolling back up.
3. **All filter + sort state in URL via nuqs.** The v2.0 reviews list already does this — reuse the same `useQueryStates` hook pattern.
4. **"Reset filters" link** always visible when any filter is active.
5. **Filter count badge on mobile.** When collapsed to mobile: "Filters (3)" button so users know filters are applied.

### Mobile Leaderboard Layout

PassMark and NotebookCheck are desktop-first horizontal scroll tables — unusable on mobile. Tom's Hardware hierarchy degrades to an article with unresponsive embedded tables.

**GlitchTek approach (switch to cards on mobile):**
- Desktop (≥768px): Full multi-column table
- Mobile (<768px): Card list — one card per product with rank number (`#1`), product name, GlitchTek score badge, BPR medal pill, battery hours, price. Tap card → review detail.
- Single "Sort by" dropdown floats above the card list on mobile.

This matches the mobile UX research recommendation: "Show only the fields that help a person decide, then reveal the rest on tap."

---

## Default Column Set for GlitchTek Leaderboard

Desktop first load (8 columns):

| Order | Column Header | Width | Default Sort | Notes |
|-------|--------------|-------|-------------|-------|
| 1 | `#` | 40px | — | Rank based on current sort |
| 2 | `Device` | 220px | — | Product name + chip model subtitle. Links to review. |
| 3 | `GlitchTek Score` | 100px | **DESC (default)** | Overall aggregate score 0–100 |
| 4 | `BPR` | 80px | — | Medal pill: Platinum / Gold / Silver / Bronze |
| 5 | `Battery` | 90px | — | Best battery life result (hours) |
| 6 | `Geekbench MC` | 100px | — | Multi-core. For GPU category: 3DMark score |
| 7 | `Price` | 80px | — | USD. `N/A` if unknown |
| 8 | `Year` | 60px | — | Release year |

Optional / off by default (column visibility toggle — defer to post-v3.0):
- `Geekbench SC` (single-core)
- `Plugged Score` (AC benchmark)
- `Battery Score` (battery benchmark)
- `BPR %` (raw percentage behind medal)
- `Cinebench R24 MC`
- `LLM tps` (tokens/sec from llama-bench)

---

## Feature→Complexity Matrix

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Leaderboard table (basic, no virtualization) | Easy | TanStack table already in stack; filter pattern mirrors v2.0 reviews list |
| URL-encoded filter + sort state | Easy | nuqs already in stack; same pattern as reviews list |
| Mobile card layout | Easy | Conditional render on viewport width; no new deps |
| `N/A` / `—` cell handling | Easy | Null check in render + Tailwind muted text |
| BPR medal display component | Easy | 4 variants, pill shape, color per tier |
| Geekbench permalink field | Easy | Schema migration: add `permalink_url` to `tech_benchmark_results` |
| BPR rollup computation | Medium | Requires both AC and battery rows for same discipline; geometric mean with Drizzle `sql` template; requires `mode` column migration |
| Evidence attachment table + upload | Medium | New `tech_benchmark_evidence` table; Uploadthing for file storage; admin CRUD extension |
| Versioned methodology tracking | Medium | `rubric_version` field on `tech_benchmark_results`; methodology changelog on `/tech/methodology` |
| Inline score contribution breakdown | Medium-Hard | Requires discipline weights config; per-discipline score fetching; bar chart component |
| Category-dependent score weights | Hard | Per-category weight config in DB; aggregate score changes by category. Defer until multiple products per category |
| JSONL ingest pipeline | Hard | File format parsing; field-to-schema mapping; idempotent re-run handling |
| Virtualized table | Hard (but not needed) | Add `@tanstack/react-virtual` only when corpus > 200. Not needed at v3.0 launch |

---

## v3.0 MVP Scope

**Ship in v3.0:**
1. Leaderboard table at `/tech/leaderboards/[category]` with the 8 default columns above
2. Category pills + sort dropdown + year/price filters, all in URL via nuqs
3. Mobile card layout fallback
4. `—` for untested cells with hover tooltip
5. BPR medal display (4 tiers, formula-defined)
6. BPR computation query (AC vs battery pairs, geometric mean)
7. `mode: 'ac' | 'battery'` field on `tech_benchmark_results` + `rubric_version` field
8. `permalink_url` field on benchmark results; inline "Geekbench 6 result →" link in review detail
9. `/tech/methodology` page: rubric v1.1 disciplines, BPR formula, medal tier cutoffs, test bench specs, changelog

**Defer from v3.0:**
- Category-dependent score weights (meaningless until multiple products per category)
- Column visibility toggle (corpus is <20 at launch — all columns are always relevant)
- JSONL raw log viewer (Geekbench permalink + screenshot is sufficient for launch credibility)
- Virtualization (corpus is <20 at launch)
- `tech_benchmark_evidence` table (defer to v3.1; screenshot uploads can be inline on review via Uploadthing in the interim)

---

## Dependencies on v2.0 Capabilities

| v3.0 Feature | v2.0 Foundation | Gap |
|--------------|----------------|-----|
| Leaderboard table | `tech_products`, `tech_categories`, `tech_reviews`, `tech_benchmark_results` tables | Add `mode`, `rubric_version`, `permalink_url` fields |
| Filter URL state | nuqs installed; reviews list uses same pattern | Define `useLeaderboardParams()` hook |
| Category pills | v2.0 categories browse reuses same pill component | Direct reuse |
| Sort via TanStack Table | `@tanstack/react-table` in stack | Wire initial sort state |
| BPR medals | Nothing | New computation query + medal component |
| Methodology page | Nothing | New route `/tech/methodology` |
| Evidence links | Nothing | `permalink_url` field + inline link in review detail |

---

## Sources

- PassMark CPU Charts — cpubenchmark.net (3-column default, `NA` for missing price, pagination)
- PassMark Mega Page — cpubenchmark.net/CPU_mega_page.html (12 columns, range sliders, category pills, compare URL `/compare/6304vs5157/`)
- Tom's Hardware CPU Hierarchy — tomshardware.com/reviews/cpu-hierarchy (% relative scoring, 7 default columns, inline methodology, `Out of Stock`)
- NotebookCheck Rating Criteria — notebookcheck.net/Our-Rating-Criteria.16002.0.html (Weighted Sum Model, category-dependent weights, reviewer impression `+/- X%`)
- RTings methodology + AVS Forum community — rtings.com/research + AVS Forum thread (versioned test benches 2019, performance usages, inline methodology links, paywall backlash 2025)
- Geekbench Browser — browser.geekbench.com + support.primatelabs.com/kb (permalink `/v6/cpu/[id]`, compare `?baseline=[id]`, search params `?sort=score&dir=desc`)
- GamersNexus Living Doc — gamersnexus.net/features/living-doc (test bench tables, "Reason" column per benchmark tool, last updated Jan 2025)
- Laptop Mag methodology — laptopmag.com/articles/how-we-review (1–5 star synthesis, 12 sub-categories, Editor's Choice ≥4)
- TanStack Table virtualization docs — tanstack.com/table/latest (threshold: virtualization necessary when >50 rows without pagination)
- nuqs React Advanced 2025 — infoq.com/news/2025/12/nuqs-react-advanced (URL state "teleportation" pattern, used by Vercel/Supabase/Clerk)
- UXmatters / WebOsmotic mobile tables — (card fallback pattern, above-table filter controls, dismissible active-filter chips)
- GlitchTech-Bench README v1.1 — ~/workspaces/_scratch/glitchtech-bench-mac/00_README.md (13-discipline rubric, BPR = geometric mean of battery/AC ratios, medal tier thresholds: 90/80/70)

---

## Prior Research (v1.0 Studios)

The v1.0 features research for the Glitch Studios music/video production side (beat store, booking, portfolio) is preserved in git history. This file was overwritten at v3.0 research time because the GlitchTek leaderboard research is the active scope. The v1.0 features are all shipped and validated — see `.planning/milestones/v2.0-REQUIREMENTS.md` for the full list with phase traceability.
