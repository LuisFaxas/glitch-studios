# Phase 28: GlitchMark System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 28-glitchmark-system
**Areas discussed:** Formula + normalization, Output range + scale, Missing-benchmark handling, Schema shape + versioning, Reference baseline source, Min-N floor, Surface, Versioning identifier

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Formula + normalization | Geometric vs arithmetic mean; range-scale vs z-score normalization | ✓ |
| Output range + scale | 0-100, 0-1000, unbounded ratio | ✓ |
| Missing-benchmark handling | Compute partial vs strict vs penalty | ✓ |
| Schema shape + versioning | Single column vs columns + history table | ✓ |

**User's choice:** All four.

---

## Normalize

| Option | Description | Selected |
|--------|-------------|----------|
| Per-test reference baseline ratio (Recommended) | Admin-set per-test reference; raw / reference. Stable. Mirrors bpr.ts. | ✓ |
| Z-score across all recorded runs | (raw - μ)/σ. Recomputes everyone on every ingest. | |
| Range-scale (min-max) across all runs | (raw - min)/(max - min). Recomputes everyone on every ingest. | |
| Per-test percentile rank | Coarse with few data points. | |

**User's choice:** Per-test reference baseline ratio.
**Notes:** Picked the recommended option. Stability + mirrors bpr.ts ratio approach was the deciding factor.

---

## Combine

| Option | Description | Selected |
|--------|-------------|----------|
| Geometric mean (Recommended) | (s1·s2·...·sn)^(1/n). Penalizes weak categories. PassMark/SPEC standard. | ✓ |
| Arithmetic mean | Plain average. One outlier dominates. | |
| Weighted geometric mean by discipline | Editorial weights; v2 territory. BPR already encodes this. | |

**User's choice:** Geometric mean.
**Notes:** Picked recommended. Locks symmetry with bpr.ts.

---

## Reference

| Option | Description | Selected |
|--------|-------------|----------|
| Admin-set per test, locked at v1 (Recommended) | New `reference_score` column on tech_benchmark_tests. | ✓ |
| First-recorded device defines baseline | Order-dependent and arbitrary. | |
| Computed median of a curated reference set | More admin overhead. | |

**User's choice:** Admin-set per test, locked at v1.
**Notes:** Stability + transparency on methodology page.

---

## Output

| Option | Description | Selected |
|--------|-------------|----------|
| Scaled to 100 = baseline (ratio × 100) (Recommended) | Reference device = 100. Unbounded above. Reads naturally. | ✓ |
| 0-100 normalized (current top device = 100) | Unstable; reshuffles on every new flagship. | |
| PassMark-style 0-1000+ | Industry feel, bigger numbers. | |
| Raw geometric mean (unitless ratio) | Cleanest math, weakest UX. | |

**User's choice:** Scaled to 100 = baseline.
**Notes:** "GlitchMark 165" reads naturally; unbounded above means a future M-series can score 200 without breaking the scale.

---

## Missing

| Option | Description | Selected |
|--------|-------------|----------|
| Compute on whatever exists; min-N floor + partial flag (Recommended) | Min 8 tests; partial flag if < 12. Mirrors BPR's 5-of-7. | ✓ |
| Strict — require ALL tests, else NULL | Most devices won't have a GlitchMark for weeks. | |
| Penalize missing as 0 | Zeros out geometric mean. Misleading. | |
| Penalize missing as discipline-median | Invents data. Hard to explain. | |

**User's choice:** Compute on whatever exists; min-N floor + partial flag.

---

## Schema

| Option | Description | Selected |
|--------|-------------|----------|
| Two columns on tech_reviews + history table (Recommended) | Live score columns + append-only history for v1/v2 preservation. | ✓ |
| Dedicated tech_glitchmark_scores table only | Every read needs a join. | |
| Single column on tech_reviews, no history | Loses GLITCHMARK-07 history requirement. | |

**User's choice:** Two columns on tech_reviews + history table.
**Notes:** Read-path simplicity wins; history table keeps versioning auditable.

---

## Floor

| Option | Description | Selected |
|--------|-------------|----------|
| 8 of recorded tests (Recommended) | Below 8 = NULL; 8-11 = partial; 12+ = full. | ✓ |
| 5 of recorded tests | Lower bar, less comparable scores. | |
| 12 of recorded tests (no partial flag at all) | Strict cutoff. | |

**User's choice:** 8 of recorded tests with partial flag at <12.

---

## Surface

| Option | Description | Selected |
|--------|-------------|----------|
| Section inside /tech/methodology (Recommended) | One trust-layer page; matches BPR section adjacency. | ✓ |
| Dedicated /tech/glitchmark page | More room but splits trust narrative. | |
| Both — short summary + dedicated deep dive | Most complete; more surface area to maintain. | |

**User's choice:** Section inside /tech/methodology.

---

## Version

| Option | Description | Selected |
|--------|-------------|----------|
| 'v1' string, bumped on formula change (Recommended) | Mirrors `rubric_version` ('1.1') pattern already in tech_reviews. | ✓ |
| Semantic 'v1.0.0' | More precision; cognitive overhead. | |
| Date-stamped 'v2026-04' | Self-explanatory but reads odd in UI. | |

**User's choice:** 'v1' string, bumped on formula change.

---

## Claude's Discretion

- Migration file name (0008_phase28_glitchmark.sql) — Phase 26/27 convention
- Column ordering inside `tech_reviews` (group GlitchMark cols after BPR cols)
- Index strategy on `tech_glitchmark_history`
- Worked-example test choice on methodology page (Cinebench R23 Multi suggested)

## Deferred Ideas

- Standalone `/tech/glitchmark` route (methodology section is enough for v1)
- Recompute-all on baseline edit (v2 problem)
- Per-discipline weights (BPR already encodes editorial weighting)
- Cross-category GlitchMark
- "GlitchMark Hall of Fame" surface
