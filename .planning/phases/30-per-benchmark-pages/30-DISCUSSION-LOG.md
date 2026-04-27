# Phase 30: Per-Benchmark Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 30-per-benchmark-pages
**Areas discussed:** Slug strategy, Landing page layout, AC + Battery presentation, 'What this measures' content source

---

## Slug Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Full key (kebab) | `cpu:geekbench6:multi` → `/tech/benchmarks/cpu-geekbench6-multi`. 1:1 mapping with RUBRIC_V1_1, never collides, makes discipline obvious in URL, trivial reversible derivation. | ✓ |
| Drop discipline prefix | `/tech/benchmarks/geekbench6-multi`. Shorter, more shareable, but cross-discipline collisions possible; needs a uniqueness check that doesn't currently exist. | |
| Short editorial slug | `/tech/benchmarks/geekbench-6-multi` (hand-curated). Most readable but adds slug column + content authoring + collision policing. | |

**User's choice:** Full key (kebab)
**Notes:** Locked as D-01. Slug enumeration drives `generateStaticParams` directly from `Object.keys(RUBRIC_V1_1)`.

---

## Landing Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Discipline-grouped tile sections | 13 sections, each with a tile sub-grid; mirrors methodology page; jump-nav per discipline; BPR-eligible badge on 7 tiles. | ✓ |
| Flat searchable list with chip filters | Single tile grid + filter chips at top; nuqs URL state. More interactive but adds filter-row pattern (29.3 crash precedent argues caution). | |
| Sortable table view | TanStack table; dense reference-doc feel. Less editorial; tiles warmer; overkill for 43 rows of static metadata. | |

**User's choice:** Discipline-grouped tile sections
**Notes:** Locked as D-02. Reuses `MethodologyDisciplineCards` aesthetic for consistency. No nuqs / no JS state.

---

## AC + Battery Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Side-by-side columns (single ranking) | Columns: Rank \| Product \| Category \| AC \| Battery \| BPR ratio. Single sort, toggleable. Plugged-vs-unplugged story per row. | ✓ |
| Tabs that swap the table | AC tab + Battery tab; rank changes per tab. Loses at-a-glance comparison. | |
| Two stacked tables | AC ranking on top, Battery below. Vertical scroll, no head-to-head comparison. | |

**User's choice:** Side-by-side columns
**Notes:** Locked as D-03.

### Sort Default Follow-Up

| Option | Description | Selected |
|--------|-------------|----------|
| By AC score | Peak performance first; matches 'AC = ceiling' framing. | ✓ |
| By Battery score | Battery-life narrative first; inverts conventional 'fastest first' expectation. | |
| By BPR ratio | Centers the unplugged-penalty editorial frame; unconventional default. | |

**User's choice:** By AC score
**Notes:** Locked as D-04. Sort toggleable to Battery and BPR ratio. `direction` field decides asc/desc per test.

---

## 'What This Measures' Content Source

| Option | Description | Selected |
|--------|-------------|----------|
| Generated from rubric metadata only | Terse 1-2 sentence auto-blurb from discipline + tool + field + unit + direction. Ships now with no content authoring. | ✓ |
| Editorial content layer (DB column) | Add `measure_blurb` + `matters_blurb` columns to `tech_benchmark_tests`; 43 tests × 2 paragraphs each. Schema + content work blocks the phase on copywriting. | |
| MDX file per benchmark | Co-locate per-test MDX in `src/content/benchmarks/[slug].mdx`. Same content burden, no schema change. | |

**User's choice:** Generated from rubric metadata only
**Notes:** Locked as D-05. Per-test editorial copy is deferred to a future content phase.

---

## Claude's Discretion

Areas left to Claude during planning/execution:
- TechHero eyebrow / title / subhead / CTA copy on landing + detail pages (follow 29.2 cadence)
- Empty-state styling when a benchmark has 0 measurements
- Landing tile visual styling (border / bg / hover) — reuse `MethodologyDisciplineCards` look
- "Not measured" row vs omit-row policy (recommend omit)
- Baseline relative score column rendering using `reference_score` (omit gracefully if null)
- 404 handling for unknown slugs (Next.js `notFound()`)

## Deferred Ideas

- Per-test editorial copywriting → future content phase
- Affiliate links on rows → Phase 41
- Landing search/filter beyond discipline grouping → later polish phase
- Detail leaderboard pagination → not needed until ~50+ rows per benchmark
- Per-test admin authoring UI → out of scope (rubric is code-managed, append-only)
- Editorial slug overrides → not justified for v1
