---
quick_id: 260423-rfu
date: 2026-04-23
status: complete
---

## Quick 260423-rfu — Rubric-map field-naming contract doc

### What shipped
- `.planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md`: new **D-18 (JSONL Field Naming Contract)** inserted at the end of `<decisions>` block. Locks "JSONL `field` must match RUBRIC_V1_1 object-key suffix (short form), not `RubricTestSpec.field`." Includes a 7-row copy-reference table (cpu/memory/storage/video) and cites the lookup site (`admin-tech-ingest.ts:230`).
- `.planning/phases/16-jsonl-ingest-pipeline/deferred-items.md`: RUBRIC section annotated `Status: RESOLVED 2026-04-23` with forward pointer to D-18. Historical analysis preserved.

### Why Option B (doc) over Option A (code)
Rubric v1.2 canonicalization (rewrite object keys so key-suffix == `field` property) would be more structurally correct but breaks any external harness already emitting the short form. Phase 16 fixtures ALREADY use the short form, so Option A would require a v1.2 bump + fixture rewrites + seed update. Option B locks the de-facto contract with zero code change and zero downstream break. Revisit as a real rubric v1.2 if a future breaking change is needed anyway.

### Verification
- `grep -c 'D-18' 16-CONTEXT.md` → 1 ✓
- `grep -c 'ripgrep_cargo' 16-CONTEXT.md` → 2 ✓ (short + long form in the table)
- `grep -c 'admin-tech-ingest.ts:230' 16-CONTEXT.md` → 1 ✓ (lookup site cited)
- `grep -c 'Status: RESOLVED' deferred-items.md` → 1 ✓
- `grep -c 'D-18' deferred-items.md` → 1 ✓ (forward pointer present)
- Source files untouched — no behavior change, no risk to existing Phase 16 tests.

### Effect on UAT debt
Closes the 1 time-bound actionable item flagged in the 2026-04-23 `/gsd:audit-uat` run. Remaining 6 items in the debt counter are all stale (covered by 16-UAT.md); a separate `/gsd:verify-work 16` can flip 16-VERIFICATION.md frontmatter from `human_needed` → `complete` to zero out the counter.

### Next
- Mac harness team unblocked for 2026-04-25 first real bench run.
- If rubric v1.2 ever needs to ship for other reasons, the historical analysis in `deferred-items.md` is preserved for reuse.
