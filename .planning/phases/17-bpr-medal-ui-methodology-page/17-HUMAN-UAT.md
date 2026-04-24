---
status: partial
phase: 17-bpr-medal-ui-methodology-page
source: [17-VERIFICATION.md]
started: 2026-04-23T00:00:00Z
updated: 2026-04-23T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Live review detail render with populated BPR score
expected: On a published review whose `bpr_score` column is populated, the scorecard shows BPRMedal (correct tier) on the left, `RUBRIC v1.1` chip on the right, divider, then the four rating bars. Hover on the medal displays the "Based on X of 7 disciplines. See methodology." tooltip and the medal links to `/tech/methodology#bpr`.
result: [pending — no published review with populated bpr_score exists in the DB yet; test becomes executable when Phase 19 flagship ships OR when an admin ingests real JSONL into a draft and publishes]

### 2. MEDAL-02 homepage spotlight coverage decision
expected: Decide whether `TechBenchmarkSpotlight` on the `/tech` landing page needs a BPR medal (per the literal MEDAL-02 wording that lists "tech homepage spotlight" as a medal surface) or whether this is deferred to Phase 18 leaderboard work / a Phase 17.1 gap closure.
result: [pending decision — if "add medal now": gap closure extends BenchmarkSpotlight type + getBenchmarkSpotlight() + TechBenchmarkSpotlight render path; if "defer": mark MEDAL-02 as partial, track as Phase 17.1 or Phase 18 follow-up]

### 3. Compact medal fallback path on review cards (list / carousel / related)
expected: On `/tech/reviews` list, on related-reviews carousels, and on category pages, each review card renders the compact BPRMedal when `bprScore !== null`, else the original star + rating row. Expect no nested-link HTML validation errors.
result: [pending — list currently renders empty because no published reviews exist; test becomes executable once at least one published review ships]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
