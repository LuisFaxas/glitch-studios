# Domain Pitfalls

**Project:** Glitch Studios — GlitchTek v3.0 Launch
**Researched:** 2026-04-20
**Confidence:** HIGH (schema read directly, rubric pack read directly, session log read directly)

---

## v3.0 GlitchTek Pitfalls

These pitfalls are specific to adding category leaderboards, JSONL benchmark ingest, BPR medal rollup, and methodology locking on top of the existing v2.0 tech review data model. Each is tagged with criticality and the v3.0 phase that must address it.

---

## BLOCKER Pitfalls

These must be resolved before launch. Any of these in the wrong state at launch time permanently corrupts leaderboards or destroys reader trust.

---

### B-1: Duplicate Runs Silently Win the Leaderboard

**What goes wrong:** Reviewer re-runs `cpu.sh` after a thermal event. Both the original and the retry end up in `tech_benchmark_runs`. The query for the leaderboard takes the MAX or latest score per `(productId, testId)`, so the leaderboard shows the retry score. No one notices the run provenance is ambiguous. Readers compare this score to a competitor's single-run result.

**Warning sign:** Multiple rows in `tech_benchmark_runs` with the same `(product_id, test_id)` and `recorded_at` within the same day.

**Prevention:** Add a `run_uuid` column (supplied by the JSONL, generated once per bench session, not per line) and a partial unique index: `UNIQUE (product_id, test_id, run_uuid)`. The ingest pipeline rejects a re-run of the same session unless the admin explicitly marks the previous run as `superseded = true`. The leaderboard query joins only `WHERE superseded IS NOT TRUE`. Never silently use `MAX(score)` — always require provenance.

**Phase:** v3.0 Phase 1 (Methodology lock + schema). Schema change before any ingest runs.

---

### B-2: Partial JSONL Ingest Leaves the DB in a Corrupt Half-State

**What goes wrong:** The JSONL file from the Mac has 100 lines. Line 47 is malformed (missing `discipline` key, Infinity value, etc.). The ingest script has processed lines 1–46 into the DB and then crashes. The leaderboard now has partial data: some tests are populated, others are empty. The BPR rollup runs on whatever is there and produces a nonsense score. If the reviewer doesn't notice, the MBP review goes live with a fabricated BPR tier.

**Warning sign:** `tech_benchmark_runs` has rows for a product but the discipline count is less than expected (e.g., CPU rows exist but GPU rows are absent, and no "skipped" record exists either).

**Prevention:** Wrap the entire ingest operation in a single database transaction. If any line fails validation, rollback all inserts for that session. Never commit a partial session. Before starting: validate all 100 lines against a Zod schema, collect all errors, report them upfront, and only begin the DB transaction if validation passes. This is parse-then-commit, not stream-and-commit.

**Phase:** v3.0 Phase 2 (Ingest pipeline). The transaction wrapper and pre-flight validator are not optional MVP shortcuts.

---

### B-3: Rubric Version Mismatch Makes Old and New Reviews Incomparable on the Leaderboard

**What goes wrong:** Rubric v1.1 uses Geekbench 6 for CPU single/multi scores. A future rubric v1.2 adds Geekbench 6.1 (or a different sub-test). A reviewer runs v1.2 on a new laptop. The leaderboard now has `Geekbench 6 Multi` for the MBP and `Geekbench 6.1 Multi` for the new laptop. The scores are not the same test. The leaderboard places them in the same column with no disclosure. Reader sees wrong comparison.

**Warning sign:** Two products in the same leaderboard column where the underlying `tech_benchmark_tests.name` strings differ (even slightly).

**Prevention:** Add `rubric_version` (e.g., `'1.1'`) to `tech_benchmark_runs` at the row level. The leaderboard page must filter to a single rubric version by default and show a visible "Rubric v1.1 results" badge. When multiple versions exist for a category, show a version selector. Never mix scores from different rubric versions in a single sorted column. Also add `rubric_version` to `tech_reviews` so the review page can show a "Reviewed under Rubric v1.1" badge.

**Phase:** v3.0 Phase 1 (Methodology lock). Schema column added before the first ingest run.

---

### B-4: BPR Rollup Is Gameable by Dropping Weak Disciplines

**What goes wrong:** A product has a poor battery score. The reviewer marks Battery as "not applicable" (maybe the Mac Mini doesn't have a battery). That's legitimate. But then a reviewer for a MacBook marks Battery as "not applicable" just because the result is bad. BPR improves artificially. The medal tier is wrong. Trust is destroyed if anyone audits it.

**Warning sign:** A product flagged as `discipline_excluded` for Battery that is a portable device. Or BPR tier changes when the same product's excluded discipline list changes without a hardware rationale.

**Prevention:** The `discipline_excluded` field must require an `exclusion_reason` from a controlled enum (`no_hardware`, `requires_license`, `device_class_exempt`) — not a free-text field. The BPR rollup formula only accepts `device_class_exempt` (e.g., Mac Mini has no battery) as a valid exclusion. `requires_license` (no 3DMark Mac license) is valid but must be surfaced as "GPU score estimated" on the review. Free-text exclusions are rejected by the ingest validator. Show excluded disciplines on the BPR badge with a tooltip: "BPR excludes: Battery (desktop device)".

**Phase:** v3.0 Phase 1 (Methodology lock) for enum definition; v3.0 Phase 3 (BPR rollup) for badge UI.

---

### B-5: Source Attribution Loss — Can't Trace a Score Back to Its Context

**What goes wrong:** Six months after publishing, a reader claims the Geekbench score is wrong. You cannot tell: which macOS build was the Mac on, what was the ambient temperature, was it AC or battery mode, was Low Power Mode on? Without this provenance, you cannot defend the score or invalidate it. This is a credibility-destroying situation for a review site.

**Warning sign:** `tech_benchmark_runs.notes` is NULL for all rows, or notes are inconsistent free-text ("ran fine", "re-test").

**Prevention:** The JSONL logging library (`_lib/logging.sh`) already wraps each tool invocation with hostname, macOS build, and timestamp. Add `ambient_temp_c`, `power_mode` (`ac`|`battery`), `lpm_enabled` (bool), and `macos_build` (e.g., `25D2128`) as required fields in the JSONL schema. The ingest validator must reject any line missing these fields — they are not nullable. Store them as `jsonb` metadata on `tech_benchmark_runs`. The review page and admin detail view must show this provenance. If ambient temp > 26°C, the ingest validator must set `run_flagged = true` and block automatic leaderboard inclusion until an admin clears the flag.

**Phase:** v3.0 Phase 1 (Methodology lock — JSONL schema spec); v3.0 Phase 2 (Ingest — validator enforcement).

---

## HIGH Severity Pitfalls

---

### H-1: Missing Discipline Cells Displayed as Zero, Not N/A

**What goes wrong:** A Mac Mini is reviewed. It has no battery. The leaderboard has a "Battery Life (hours)" column. The Mac Mini has no row in `tech_benchmark_runs` for that test. The leaderboard renders `0` or an empty cell, which a reader interprets as "zero hours" or "not tested yet." The Mac Mini ranks last in battery life. This is misleading.

**Warning sign:** Leaderboard cells rendering `0`, blank, or a dash for disciplines with no data, with no explanation.

**Prevention:** Distinguish three states explicitly: (1) `score exists` — render value; (2) `explicitly excluded` — render "N/A" with tooltip showing reason; (3) `not yet tested` — render "—" (em dash) with tooltip "Pending". The DB needs a `tech_benchmark_exclusions` table: `(product_id, test_id, reason_enum, notes)`. The leaderboard query left-joins exclusions and uses CASE to render the correct state. Null-sorting rule: excluded/pending cells always sort to the bottom regardless of sort direction. Never allow nulls to sort above real scores.

**Phase:** v3.0 Phase 1 (schema) + Phase 4 (Leaderboard UI).

---

### H-2: Leaderboard Sort Resets on Filter Change

**What goes wrong:** Reader sorts leaderboard by "CPU Multi Score" descending to find the fastest Mac. Then applies a "Laptops only" filter. Sort resets to default (alphabetical or by BPR). The reader has to re-apply their sort. This is a frequent UX complaint in filterable tables.

**Warning sign:** Sort state managed in component state (`useState`) rather than URL query params.

**Prevention:** All leaderboard state — sort column, sort direction, active filters, category selection — must live in URL query params via `nuqs` (already in the stack). This also makes leaderboards bookmarkable and shareable. Sort direction must persist through filter changes. The only exception: if the current sort column becomes invisible due to a filter (e.g., sorted by "Battery" but Battery column was just hidden), fallback to BPR descending with a toast: "Sort reset: Battery column hidden."

**Phase:** v3.0 Phase 4 (Leaderboard UX). Non-negotiable for a table labeled "leaderboard."

---

### H-3: Null Scores in the Sort Column Break Expected Sort Order

**What goes wrong:** Reader sorts by "GPU: 3DMark Steel Nomad." Some products (Mac Mini desktop) legitimately have no GPU score. With standard `ORDER BY score DESC NULLS LAST`, the Mac Mini appears at the bottom. But if the reader sorts ascending (to find the worst), the Mac Mini appears at the top — above machines that were actually tested. Reader thinks Mac Mini scored zero.

**Warning sign:** `NULLS FIRST` / `NULLS LAST` not explicitly set on sort queries. Null rows appearing in unexpected positions.

**Prevention:** Always use explicit `NULLS LAST` for descending sorts and `NULLS LAST` for ascending sorts. Null (N/A) rows must always appear below measured scores regardless of direction. In the UI, show a horizontal divider between measured rows and N/A rows with a label: "Products without this benchmark (3)." Drizzle supports `sql`column desc nulls last`` via raw SQL; use it explicitly in the leaderboard query.

**Phase:** v3.0 Phase 4 (Leaderboard query layer).

---

### H-4: Cross-Config Comparisons Without Disclosure (64GB vs 16GB, M5 Max vs M4 Pro)

**What goes wrong:** The leaderboard shows MBP 16" M5 Max 64GB and MBP 14" M4 Pro 18GB in the same "MacBooks" category. The M5 Max wins every memory-bandwidth benchmark partly because it has 4x the RAM. A reader buys the M5 Max thinking it's faster "per dollar" without realizing the M4 Pro 18GB was never allowed to run the 70B LLM test — it would have OOM'd. The leaderboard shows "N/A" but the column header says "Llama 70B tg128" without a note that only 64GB+ units can run this test.

**Warning sign:** LLM 70B test columns showing N/A for sub-64GB products with no explanation. Memory bandwidth compared across configs with different unified memory sizes.

**Prevention:** Add `config_tag` to `tech_products` (e.g., `"M5 Max / 64GB / 2TB"`). The leaderboard shows the config tag in the product name column, not just the model name. For tests with hardware prerequisites (e.g., "Requires ≥64GB RAM"), add a `min_ram_gb` field to `tech_benchmark_tests`. The UI renders a footnote: "† Requires ≥64GB RAM — only applicable to qualifying configs." The `/tech/methodology` page must explain which discipline variants are config-gated. This is not optional — it is the difference between a credible benchmark site and a misleading one.

**Phase:** v3.0 Phase 1 (methodology + schema) for `config_tag` and `min_ram_gb`; Phase 4 (Leaderboard UI) for display.

---

### H-5: Geomean vs Arithmetic Mean Not Justified, BPR Easily Misread

**What goes wrong:** The BPR is a geometric mean of `(battery_score / ac_score)` retention ratios across disciplines. An arithmetic mean would let a single outlier discipline dominate. For example: if battery mode crushes CPU by 90% but battery life itself is fine, arithmetic mean makes the BPR look better than it is. Geomean gives equal multiplicative weight to each discipline — a 50% drop in one discipline cannot be fully offset by a 150% score in another.

However: if the methodology page never explains this, a reader sees a BPR of 0.82 (Gold) and does not know whether that number is defensible or fabricated. This is also an SEO/credibility risk — a competitor could write "GlitchTek BPR is unexplained" and it would be accurate.

**Warning sign:** `/tech/methodology` does not include the BPR formula, the rationale for geomean, and at least one worked example.

**Prevention:** The methodology page must include: (1) the exact formula (`BPR = (∏ (battery_i / ac_i))^(1/n)` for n included disciplines), (2) why geomean (dominant-factor protection), (3) what counts as an "included discipline" for BPR (all AC/battery pairs — CPU, GPU, LLM, Video, Dev, Python, Games — thermal and storage are AC-only and excluded from BPR), (4) a worked example using the MBP M5 Max data. The rubric v1.1 schema must define this unambiguously so a future reviewer cannot redefine BPR per-review.

**Phase:** v3.0 Phase 1 (Methodology lock). The formula must be locked before the first BPR score is published.

---

### H-6: BPR Medal Badge Shown Without Discipline Disclosure

**What goes wrong:** A review card shows "BPR: Gold 🥇" with no tooltip or link. A reader sees Gold and assumes the product retained ≥80% performance on battery across all disciplines. In reality, two disciplines were excluded (GPU: no license, Games: N/A for this device class). Gold was achieved on 5 of 7 disciplines. This is misleading by omission.

**Warning sign:** BPR badge rendered without a link to the methodology page or an expandable "which disciplines" tooltip.

**Prevention:** The BPR badge must link to the methodology anchor (`/tech/methodology#bpr`) and show on hover/tap: "Based on X of Y disciplines. See methodology." The admin ingest preview must show the BPR breakdown before publishing. If more than 2 disciplines are excluded from BPR, a warning flag is shown: "Limited BPR: only 3 disciplines included — treat with caution."

**Phase:** v3.0 Phase 3 (BPR rollup + medal UI).

---

### H-7: `tech_benchmark_runs` Has No Unique Constraint — Compare Tool Will Break After Ingest

**What goes wrong:** The current schema has no unique constraint on `(product_id, test_id)` in `tech_benchmark_runs`. After the first ingest, multiple rows can exist for the same product+test (duplicate runs, re-tests). `getBenchmarkRunsForProducts()` in `src/lib/tech/queries.ts` returns all rows and groups them by `(productId, testId)` at the call site. If there are two rows for the same test, the compare tool renders both — or takes the last one in sort order (which is `recordedAt` then `name`, not deterministic for same-day runs). The compare tool at `/tech/compare` uses this query directly. After ingest it will break silently.

**Warning sign:** `getBenchmarkRunsForProducts` returning duplicate `(productId, testId)` pairs in its result array.

**Prevention:** The leaderboard query layer must NOT reuse `getBenchmarkRunsForProducts` without modification. Instead, add a `getCanonicalBenchmarkRuns` query that uses `DISTINCT ON (product_id, test_id) ORDER BY product_id, test_id, recorded_at DESC` (Postgres) to return the canonical (most recent, non-superseded) run per test. The compare tool should be migrated to this canonical query as part of Phase 2 ingest work. Add a DB constraint: `UNIQUE (product_id, test_id, run_uuid)` to prevent silent duplicates.

**Phase:** v3.0 Phase 2 (Ingest pipeline). Must be resolved before first ingest. This is a breaking change to the compare tool if not addressed.

---

### H-8: Rubric Version Bump Silently Breaks the Flagship MBP Review

**What goes wrong:** The MBP 16" M5 Max is reviewed under rubric v1.1. Later, rubric v1.2 changes the Geekbench test from GB6 to GB6.1 or adds a new sub-test. A future reviewer imports v1.2 scores for a new laptop. The leaderboard now compares GB6 (MBP) vs GB6.1 (new laptop) in the same column, silently. The MBP review page does not show "Reviewed under v1.1" anywhere.

**Warning sign:** Leaderboard query that joins `tech_benchmark_tests` by name string rather than checking `rubric_version` on the run.

**Prevention:** When rubric v1.2 ships: (1) bump `pack/CLAUDE.md` pack version to 1.2; (2) add v1.2 tests as new `tech_benchmark_tests` rows — do not modify existing v1.1 test rows; (3) the leaderboard defaults to the latest rubric version and shows a "Rubric v1.1 archive" toggle to see older reviews; (4) the MBP review remains under v1.1 and is not retroactively re-run unless explicitly re-reviewed. The process: never edit existing `tech_benchmark_tests` rows after data exists — only add new ones and version them. This is append-only test management.

**Phase:** v3.0 Phase 1 (Methodology lock — define the versioning policy). The policy must be written and committed before any v1.2 planning begins.

---

## MEDIUM Severity Pitfalls

---

### M-1: Leaderboard Filter State URL Explosion

**What goes wrong:** Leaderboard has: category filter, rubric version, sort column, sort direction, config filter (RAM size), manufacturer filter. Each is a URL param. The resulting URL becomes `?cat=laptops&rubric=1.1&sort=cpu_multi&dir=desc&ram=64&mfr=apple` — 78 characters. That's fine. But if the filter count grows to 8-10 params (which it will as new disciplines are added), bookmark sharing degrades and the URL appears broken to non-technical readers.

**Prevention:** Use `nuqs` (already in stack) with `shallow: true` for transient state. Group related filters: `config=64gb-m5max` instead of `ram=64&chip=m5max`. Cap the leaderboard at 6 filter dimensions for v3.0. Do not add "show/hide columns" as a URL-persisted filter — that belongs in `localStorage` only.

**Phase:** v3.0 Phase 4 (Leaderboard UX). Design the filter schema before building the UI.

---

### M-2: Pagination on Leaderboard Defeats the Purpose

**What goes wrong:** Leaderboard of 12 MacBooks with pagination showing 5 per page. Reader cannot compare rank 1 vs rank 8 side by side. Leaderboard + pagination is a UX antipattern — the whole value is seeing everything ranked at once.

**Prevention:** Leaderboards must render all products in a single scroll. For v3.0, the "Laptops" category will have at most ~20 products. No pagination. Do not apply the cursor pagination from `listPublishedReviews` to the leaderboard. Use `getLeaderboardRows` as a separate query (full fetch, no cursor). If the category grows to >50 products in a future milestone, revisit with virtual scrolling — but for v3.0, render everything.

**Phase:** v3.0 Phase 4 (Leaderboard). Do not reuse the cursor pagination pattern from `listPublishedReviews`.

---

### M-3: Mobile Horizontal Scroll Without a Signal That More Columns Exist

**What goes wrong:** The leaderboard has 8 score columns. On mobile, the table is horizontally scrollable. The user doesn't know that. They see 3 columns and think that's all there is. The "CPU Multi" column (the most important one) is off-screen to the right.

**Prevention:** Freeze the first two columns (rank + product name) with `position: sticky left: 0`. Show a faint right-edge shadow/gradient as a scroll affordance. On initial load, auto-scroll 1 column to the right and back (a "peek" animation, <300ms) so the user discovers horizontal scrolling. Default column order: BPR first, then the most commonly searched discipline (CPU Multi), then others. On mobile, show a "Swipe for more →" label that disappears after first interaction (persisted in `localStorage`).

**Phase:** v3.0 Phase 4 (Leaderboard UX).

---

### M-4: Tie-Breaking When BPR Scores Are Identical

**What goes wrong:** Two products both score Gold (e.g., BPR = 0.83). The leaderboard renders them in an unstable order that changes between page loads depending on DB row insertion order or Postgres query plan. Reader sees different orderings on different visits and suspects manipulation.

**Prevention:** BPR is computed to 4 decimal places. True ties are extremely rare. The tiebreaker order must be explicit and documented: (1) BPR desc; (2) overall review rating desc (from `tech_reviews`); (3) product name asc (alphabetical). This order must be hardcoded in the `getLeaderboardRows` query's `ORDER BY` clause — never rely on implicit sort stability. Document the tiebreaker on the methodology page.

**Phase:** v3.0 Phase 3 (BPR rollup) + Phase 4 (Leaderboard query).

---

### M-5: Template Fidelity Drift Between Reviewers

**What goes wrong:** Reviewer #1 (the flagship MBP review) writes a 4-paragraph verdict, fills all gallery slots, includes all 13 discipline sub-sections in `body_html` with screenshots. Reviewer #2 later writes a 1-sentence verdict, skips the LLM section in body, provides no gallery images. The review detail page renders inconsistently. The leaderboard shows a "Published" badge for both. Reader trust erodes.

**Warning sign:** `verdict` column under 100 characters. `body_html` missing discipline section headers (detectable by checking for `<h3>` count). `techReviewGallery` having 0 rows for a published review.

**Prevention:** Add a `template_completeness_score` computed in the admin review editor (client-side) that checks: (1) verdict length ≥ 150 chars, (2) body HTML contains all 13 discipline section IDs, (3) gallery has ≥ 3 images, (4) all required benchmark tests have data or an explicit exclusion. The editor shows a checklist sidebar: "3 of 5 quality checks passed." Publishing must be blocked (or require an admin override with a reason) if score < 4/5. This is enforced in the admin UI, not the DB — the DB accepts anything, the editor gates the publisher.

**Phase:** v3.0 Phase 5 (Flagship review) — the checklist must exist before the flagship review is published.

---

### M-6: Draft Reviews Appearing in Leaderboard

**What goes wrong:** The ingest pipeline writes benchmark runs to `tech_benchmark_runs` for a product. The review for that product is still in `status = 'draft'`. The leaderboard query joins products to benchmark runs (not to reviews), so the product appears on the leaderboard with scores but no linked review. Reader clicks the product — there's no published review. This is confusing and looks broken.

**Warning sign:** Leaderboard showing products with no linked published review.

**Prevention:** The leaderboard query must require `EXISTS (SELECT 1 FROM tech_reviews WHERE product_id = p.id AND status = 'published')`. Products with benchmark data but no published review must not appear on the public leaderboard. They can appear in an admin "Preview leaderboard" mode. The ingest pipeline does not gate on review status — it always writes runs — but the leaderboard display layer enforces the published-review requirement.

**Phase:** v3.0 Phase 4 (Leaderboard query). The WHERE clause is non-negotiable.

---

### M-7: Legal Risk — "Fastest Laptop" Claims Without Caveats

**What goes wrong:** A headline like "The Fastest Mac Ever Reviewed" appears on the MBP review page or leaderboard title. This is legally and editorially risky: "ever reviewed" is only among the few products reviewed on GlitchTek; "fastest" depends on the workload. Without scope caveats, this exposes the brand to FTC "clear and conspicuous disclosure" requirements for comparative claims and could result in complaints from manufacturers.

**Prevention:** All comparative superlatives must include scope qualifiers: "Fastest Mac in GlitchTek's 2026 benchmark suite" or "Highest CPU score among reviewed MacBooks." The methodology page must state: "GlitchTek scores reflect tested products only. We make no claims about untested products." Add a standard disclaimer to all leaderboard pages. Avoid the word "best" without qualification in page titles, OG titles, or H1s.

**Phase:** v3.0 Phase 1 (Methodology page) for the disclaimer; copywriting review during Phase 5 (flagship review).

---

### M-8: SEO Keyword Stuffing Dilutes Credibility

**What goes wrong:** Review body HTML is stuffed with phrases like "best MacBook Pro M5 Max review 2026" in headings and prose. Tech-savvy readers (the target audience) immediately recognize keyword stuffing and dismiss the review as SEO content rather than a genuine benchmark. This is exactly the credibility trap that GlitchTek is trying to avoid.

**Prevention:** No review title, H1, H2, or verdict text should be written with keyword density in mind. Write for a reader who already knows what they are looking for. SEO meta tags (`<title>`, OG tags) can include the product model name and year as structural metadata — that is appropriate. Body copy should not repeat the product name more than 2-3 times per section. The template spec (Phase 1) must include an editorial style guide with this rule.

**Phase:** v3.0 Phase 1 (Template spec) and Phase 5 (Flagship review editorial review).

---

## LOW Severity Pitfalls

---

### L-1: Gallery Images at Different Aspect Ratios Break Review Layout

**What goes wrong:** Reviewer captures Geekbench screenshot at 16:9 (1920×1080) and a coconutBattery screenshot at 4:3 (1400×1050). The gallery carousel renders them with fixed height, causing the 4:3 image to appear either cropped or with black bars, while 16:9 fills naturally. The review page looks unpolished.

**Prevention:** Gallery images must be normalized to a standard crop: 16:9 for all benchmark screenshots, center-crop applied by the admin upload tool. The review template spec must state: "all benchmark screenshots must be captured at 1920×1080, full-screen result window." The gallery component uses `aspect-ratio: 16/9` CSS and `object-fit: cover` — consistent regardless of input.

**Phase:** v3.0 Phase 5 (Flagship review — establish the screenshot capture standard before the first gallery is published).

---

### L-2: `publishedAt` Not Set on Tech Reviews, Leaderboard Sort Is Wrong

**What goes wrong:** `tech_reviews.published_at` is set by the admin when flipping status to "published," but the current schema has no DB trigger and no application-layer enforcement. If the admin forgets to set it, `published_at` is NULL. The review still appears (the query filters on `status = 'published'` not on `published_at`). The leaderboard sorts by `published_at` and NULL reviews float to unexpected positions.

**Warning sign:** `tech_reviews` rows with `status = 'published'` and `published_at IS NULL`.

**Prevention:** Add a Drizzle migration that adds a DB-level trigger (or application-level enforcement in the admin mutation): when `status` changes to `'published'`, set `published_at = NOW()` if it is NULL. Add a CHECK constraint: `CHECK (status != 'published' OR published_at IS NOT NULL)`. The leaderboard should not sort by `published_at` in its primary ordering (sort by BPR, not recency) but the review list page relies on it.

**Phase:** v3.0 Phase 1 or Phase 2 migration.

---

### L-3: Wireless and Display Disciplines Are AC-Only — BPR Denominator Is Silent About This

**What goes wrong:** The BPR README states it is "the geometric mean of all (battery_score / ac_score) ratios." But Wireless (§3.11) and Display (§3.12) have no battery mode. They are AC-only. Thermal (§3.9) is also AC-only. If the BPR formula naively includes all 13 disciplines, it will divide by zero (no battery score exists for those 3 disciplines). If it silently skips them, the denominator n varies between products, which distorts cross-product comparisons.

**Prevention:** The rubric v1.1 lock must explicitly define: "BPR denominator = {CPU, GPU, LLM, Video, Dev, Python, Games} — 7 disciplines. Memory, Storage, Thermal, Wireless, Display, and BPR are excluded from BPR because they have no battery mode or are computed." n is fixed at 7 for all products (or the number of those 7 that are not device-class excluded). This prevents the denominator from varying and makes cross-product BPR comparable.

**Phase:** v3.0 Phase 1 (Methodology lock). The 7-discipline list must be enumerated in the schema as a constant or in a `bpr_eligible` boolean on `tech_benchmark_tests`.

---

## Integration Pitfalls with Existing v2.0 Code

---

### I-1: `getBenchmarkRunsForProducts` Is Used by the Compare Tool — Ingest Must Not Break It

**Specific context:** `/tech/compare` calls `getBenchmarkRunsForProducts(productIds)` which fetches all rows from `tech_benchmark_runs` joined to `tech_benchmark_tests`. After ingest, if a product has multiple runs per test (superseded runs, AC + battery mode variants), this query returns duplicate `(productId, testId)` pairs. The compare tool's chart rendering groups by testId and will display multiple bars or take an arbitrary row.

**Prevention:** Before the ingest pipeline is built, refactor `getBenchmarkRunsForProducts` to use `DISTINCT ON (product_id, test_id)` with canonical ordering. The leaderboard will use a separate `getLeaderboardBenchmarkRows` query. Do not share the same query between the compare tool and the leaderboard — they have different data shape requirements. Add a regression test (or at minimum a Playwright check on `/tech/compare`) that verifies the compare tool still renders correctly after the first ingest run.

**Phase:** v3.0 Phase 2 (Ingest). Refactor `getBenchmarkRunsForProducts` as step 0 before any ingest code is written.

---

### I-2: `tech_reviews.status = 'published'` Check Is Missing from the Benchmark Spotlight Query

**Specific context:** `getBenchmarkSpotlight()` in `queries.ts` (line 728) joins `tech_benchmark_runs` to `tech_reviews` to ensure only products with published reviews show in the spotlight. It uses `ilike(techBenchmarkTests.name, "%Geekbench 6 Multi%")` to find the top benchmark. After ingest, if the test name changes (Geekbench 6 Multi-Core vs. Geekbench 6 Multi) the query returns null and the spotlight disappears silently. Also, the `ilike` approach is fragile — it will break if the test is renamed in the `tech_benchmark_tests` table.

**Prevention:** Replace the `ilike` name match with a direct join via `tech_benchmark_tests.id` using a well-known UUID seeded in the migration (a "sentinel" row for the canonical Geekbench 6 Multi test). Or: add a `is_spotlight_candidate` boolean to `tech_benchmark_tests` that the ingest sets to true for recognized flagship tests. The leaderboard phase should also audit `getBenchmarkSpotlight` and ensure it handles the case of multiple products with published reviews.

**Phase:** v3.0 Phase 2 (Ingest) — the ingest migration is the natural time to fix the spotlight query.

---

### I-3: Category Descendant Query Is Re-Fetching the Full Category Tree on Every Request

**Specific context:** `getCategoryDescendantIds` and `listTopLevelCategoriesWithCounts` both fetch the entire `tech_categories` table on every call. With 3 categories this is negligible. As GlitchTek adds more categories (Windows laptops, iPads, monitors), this becomes a full table scan on every leaderboard page load.

**Prevention:** Cache the category tree at build time (Next.js `cache()` or `unstable_cache`) or at request time with a 60-second revalidation. The category tree changes only when an admin modifies categories — not on every benchmark ingest. Use `next/cache` `revalidateTag('tech-categories')` on admin mutations. This is not a v3.0 blocker (3 categories) but implement the cache wrapper now so the pattern is established.

**Phase:** v3.0 Phase 4 (Leaderboard query layer).

---

## Phase-to-Pitfall Matrix

| Pitfall | ID | Criticality | v3.0 Phase |
|---|---|---|---|
| Duplicate runs corrupt leaderboard | B-1 | BLOCKER | Phase 1 (schema) |
| Partial JSONL ingest leaves corrupt half-state | B-2 | BLOCKER | Phase 2 (ingest) |
| Rubric version mismatch on leaderboard | B-3 | BLOCKER | Phase 1 (schema) |
| BPR gameable by dropping disciplines | B-4 | BLOCKER | Phase 1 + Phase 3 |
| Source attribution loss (provenance) | B-5 | BLOCKER | Phase 1 (JSONL spec) + Phase 2 |
| Missing discipline cells show as zero | H-1 | HIGH | Phase 1 (schema) + Phase 4 |
| Sort resets on filter change | H-2 | HIGH | Phase 4 (UX) |
| Null scores sort incorrectly | H-3 | HIGH | Phase 4 (query) |
| Cross-config comparisons without disclosure | H-4 | HIGH | Phase 1 + Phase 4 |
| BPR geomean not justified/documented | H-5 | HIGH | Phase 1 (methodology) |
| BPR badge shown without discipline breakdown | H-6 | HIGH | Phase 3 (badge UI) |
| No unique constraint, compare tool breaks | H-7 | HIGH | Phase 2 (ingest) |
| Rubric bump breaks flagship review | H-8 | HIGH | Phase 1 (policy) |
| Filter URL explosion | M-1 | MEDIUM | Phase 4 |
| Pagination on leaderboard | M-2 | MEDIUM | Phase 4 |
| Mobile scroll without affordance | M-3 | MEDIUM | Phase 4 |
| Tie-breaking instability | M-4 | MEDIUM | Phase 3 + Phase 4 |
| Template fidelity drift | M-5 | MEDIUM | Phase 5 (flagship) |
| Draft reviews appearing on leaderboard | M-6 | MEDIUM | Phase 4 |
| "Fastest laptop" legal risk | M-7 | MEDIUM | Phase 1 + Phase 5 |
| SEO keyword stuffing | M-8 | MEDIUM | Phase 1 (style guide) |
| Gallery aspect ratio inconsistency | L-1 | LOW | Phase 5 |
| publishedAt NULL on published reviews | L-2 | LOW | Phase 1/2 migration |
| AC-only disciplines in BPR denominator | L-3 | LOW | Phase 1 |
| getBenchmarkRunsForProducts breaks compare | I-1 | HIGH | Phase 2 (pre-ingest) |
| getBenchmarkSpotlight fragile ilike match | I-2 | MEDIUM | Phase 2 |
| Category tree fetched on every request | I-3 | LOW | Phase 4 |

---

## Pre-Launch Checklist (v3.0 Specific)

- [ ] `tech_benchmark_runs` has `run_uuid` column and `UNIQUE(product_id, test_id, run_uuid)` constraint
- [ ] `tech_benchmark_runs` has `rubric_version`, `ambient_temp_c`, `power_mode`, `macos_build`, `run_flagged` columns
- [ ] `tech_benchmark_tests` has `bpr_eligible` boolean, `min_ram_gb` nullable field
- [ ] `tech_benchmark_exclusions` table exists: `(product_id, test_id, reason_enum, notes)`
- [ ] JSONL ingest is transactional: validates all lines before committing any
- [ ] Ingest rejects ambient_temp > 26°C without admin override
- [ ] `getBenchmarkRunsForProducts` refactored to return canonical run per (product, test)
- [ ] Leaderboard query requires published review to exist before showing product
- [ ] Leaderboard sort column, direction, and filters all persist in URL via nuqs
- [ ] Null scores always sorted to bottom regardless of sort direction
- [ ] BPR badge links to methodology and shows discipline count on hover
- [ ] `/tech/methodology` includes BPR formula, geomean rationale, and worked example
- [ ] Leaderboard shows rubric version badge; does not mix v1.1 and v1.2 scores in same column
- [ ] Flagship MBP review passes 5/5 template completeness checks before publish
- [ ] No review title or H1 contains a superlative without a scope qualifier

---

## Sources

- `src/db/schema.ts` — tech_* tables, current benchmark_runs shape (no unique constraint on product_id+test_id)
- `src/lib/tech/queries.ts` — getBenchmarkRunsForProducts, getBenchmarkSpotlight (ilike pattern), listPublishedReviews (cursor pagination)
- `.planning/PROJECT.md` — v3.0 feature scope, rubric v1.1 status
- `~/workspaces/_scratch/glitchtech-bench-mac/00_README.md` — 13 disciplines, AC-only disciplines (Memory, Storage, Thermal, Wireless, Display), BPR definition (§3.13)
- `~/workspaces/_scratch/glitchtech-bench-mac/03_session-log.md` — real data shape (CPU §3.1 complete, remaining 12 disciplines pending), session provenance fields (ambient temp, macOS build, battery health)
- `~/workspaces/_scratch/glitchtech-bench-mac/CLAUDE.md` — JSONL logging architecture, pack v1.1 = rubric v1.1 versioning policy, preflight gate

---

## v1.0/v2.0 Pitfalls (Original — Still Applicable)

> The following pitfalls were researched during v1.0/v2.0 planning (2026-03-25) and remain valid for the studios side of the platform.

### Critical: Serving Audio Files Through Vercel Serverless Functions
Beat files must not be served through API routes. Use external object storage with pre-signed URLs. See original entry above for full detail. **Phase:** v1.0 Phase 1 (Validated — already shipped correctly).

### Critical: No Audio Watermarking on Beat Previews
Untagged previews are free to steal. Pre-generate tagged variants at upload time. **Phase:** v1.0 Phase 1 (Validated).

### Critical: Beat Licensing Model Not Enforced in Code
License types are first-class DB entities, not text strings. Exclusive purchase must change beat status. **Phase:** v1.0 Phase 2 (Validated).

### Critical: iOS Safari Audio Playback
Requires direct user gesture. Test on real device. **Phase:** v1.0 Phase 2 (Validated).

### Dual Payment Reconciliation
Use Stripe as orchestrator with PayPal as a Stripe payment method. **Phase:** v1.0 Phase 2 (Validated).

### Calendar Booking Timezone + Double-Booking
UTC storage, DB unique constraint, DST handling. **Phase:** v1.0 Phase 3 (Validated).

### Admin Dashboard Usability
Task-oriented design for non-technical owner. **Phase:** v1.0 Phase 4 (Validated).

---
*Updated 2026-04-20 — v3.0 GlitchTek Launch pitfall set added. Original v1.0/v2.0 pitfalls retained as validated reference.*
