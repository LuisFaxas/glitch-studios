---
quick_id: 260423-rfu
type: execute
autonomous: true

must_haves:
  truths:
    - "16-CONTEXT.md contains a locked decision documenting that JSONL `field` values MUST match the RUBRIC_V1_1 object-key suffix (short form), not the `RubricTestSpec.field` property value"
    - "The decision enumerates at least 3 concrete examples from the deferred-items.md list (e.g. `ripgrep_cargo`, `triad`, `seq_read`) so Mac harness authors have direct copy-reference values"
    - "The decision pins the deadline (2026-04-25) as resolved in-context rather than pending — no code change needed, contract is now documented"
    - "`deferred-items.md` 'RUBRIC_V1_1 object-key / field-property inconsistency' section is marked resolved with a pointer at the new CONTEXT.md decision"
  artifacts:
    - path: ".planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md"
      provides: "Locked D-18 rubric-map key/field contract"
    - path: ".planning/phases/16-jsonl-ingest-pipeline/deferred-items.md"
      provides: "Marked-resolved notice referencing the CONTEXT.md decision"
---

<objective>
Document the RUBRIC_V1_1 key/field short-form contract as a locked decision (D-18) in Phase 16's CONTEXT.md so the Mac harness JSONL producer has an unambiguous rule for what to emit as `field`. Mark the corresponding section in `deferred-items.md` as resolved with a pointer to the new decision. This is Option B from the 2026-04-23 UAT audit — the zero-code-change resolution. Soft deadline: 2026-04-25 (Mac harness first real bench run).
</objective>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Append D-18 to 16-CONTEXT.md</name>
  <files>.planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md</files>
  <read_first>
    - .planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md (locate D-17 end + start of Claude's Discretion block)
    - .planning/phases/16-jsonl-ingest-pipeline/deferred-items.md (copy affected-entries list)
    - src/lib/tech/rubric-map.ts (confirm current key/field shape)
    - src/actions/admin-tech-ingest.ts (confirm lookup construction at line 230)
  </read_first>
  <behavior>
    - New decision D-18 inserted at the end of `<decisions>` section, BEFORE the "### Claude's Discretion" subsection.
    - Decision text cites the rubric-map lookup line number (`admin-tech-ingest.ts:230`) and the full mapping convention.
    - A minimum-3-example table (short form ↔ long-form) lets Mac harness authors copy-paste the rule.
  </behavior>
  <action>
    1. Open `.planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md`.
    2. Locate the end of the "### Test Coverage" block (after D-17, approximately line 128).
    3. Insert a new "### JSONL Field Naming Contract" subsection with D-18 before the "### Claude's Discretion" block.
    4. D-18 body:
       - State the rule: JSONL line `field` values MUST match the suffix of the RUBRIC_V1_1 object key (`${discipline}:${tool}:${field}`), NOT the `RubricTestSpec.field` property value.
       - Cite the lookup site: `src/actions/admin-tech-ingest.ts:230` computes `${line.discipline}:${line.tool}:${line.field}` from JSONL and indexes RUBRIC_V1_1 by that string.
       - Table of short-form ↔ long-form examples (at least 5 rows covering cpu/memory/storage/video).
       - State that Phase 16 fixtures and the Mac harness BOTH emit the short form.
       - Cross-reference `deferred-items.md` for historical context.
    5. Save.
  </action>
  <verify>
    <automated>grep -c 'D-18' .planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q 'D-18' .planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md` returns exit 0.
    - `grep -q 'ripgrep_cargo' .planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md` returns exit 0 (example is present).
    - `grep -q 'admin-tech-ingest.ts:230' .planning/phases/16-jsonl-ingest-pipeline/16-CONTEXT.md` returns exit 0 (lookup site cited).
  </acceptance_criteria>
  <done>D-18 documents the contract with a copy-referenceable example table.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Mark rubric-map deferred section resolved</name>
  <files>.planning/phases/16-jsonl-ingest-pipeline/deferred-items.md</files>
  <read_first>
    - .planning/phases/16-jsonl-ingest-pipeline/deferred-items.md (existing RUBRIC section)
  </read_first>
  <behavior>
    - The existing "## RUBRIC_V1_1 object-key / field-property inconsistency" section gains a "Resolved" status banner at the top pointing at 16-CONTEXT.md D-18.
    - Original content preserved (for historical context) — just annotated with resolution.
  </behavior>
  <action>
    1. Open `.planning/phases/16-jsonl-ingest-pipeline/deferred-items.md`.
    2. Find the heading "## RUBRIC_V1_1 object-key / field-property inconsistency (Plan 04 discovery)".
    3. Insert a "**Status: RESOLVED 2026-04-23** — see `16-CONTEXT.md` D-18 (JSONL Field Naming Contract)." line immediately below the heading.
    4. Leave the rest of the section intact so the historical analysis + option list is preserved.
  </action>
  <verify>
    <automated>grep -c 'Status: RESOLVED' .planning/phases/16-jsonl-ingest-pipeline/deferred-items.md</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q 'Status: RESOLVED' .planning/phases/16-jsonl-ingest-pipeline/deferred-items.md` returns exit 0.
    - `grep -q 'D-18' .planning/phases/16-jsonl-ingest-pipeline/deferred-items.md` returns exit 0.
  </acceptance_criteria>
  <done>deferred-items.md shows the rubric-map item as resolved with a forward pointer to D-18.</done>
</task>

</tasks>

<verification>
- Both acceptance greps pass.
- No source files changed; rubric-map.ts and admin-tech-ingest.ts untouched.
- Running audit-uat after the commit drops the debt counter by the rubric-map item (deadline cleared).
</verification>

<success_criteria>
- [ ] D-18 added to 16-CONTEXT.md with a short-form/long-form example table
- [ ] deferred-items.md rubric-map section marked RESOLVED
- [ ] Changes committed
</success_criteria>

<output>
After completion, create `.planning/quick/260423-rfu-document-rubric-map-key-field-short-form/260423-rfu-SUMMARY.md`
</output>
