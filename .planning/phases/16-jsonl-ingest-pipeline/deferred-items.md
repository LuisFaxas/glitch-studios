# Phase 16 Deferred Items

## Pre-existing lint errors (out of scope for Phase 16)

Discovered while running `pnpm lint` during Plan 02 Task 2 verification.
These are **not** caused by Phase 16 changes — they pre-date this phase.

- `src/components/tiles/tech-cross-link-tile.tsx:23` — `react-hooks/set-state-in-effect` (2 occurrences, set-state inside useEffect)
- `src/components/ui/dither.jsx:251` — `react-hooks/refs` (ref accessed during render in waveUniformsRef.current)
- `src/lib/permissions.ts:6` — `@typescript-eslint/no-unused-vars` warning for `adminRolePermissions`
- `tests/09-services-booking-mobile-audit.spec.ts:15` — `@typescript-eslint/no-explicit-any`
- `tests/mobile-audit.spec.ts:34` — `@typescript-eslint/no-explicit-any`
- `tests/sidebar-collapse.spec.ts:1` — unused `expect` import
- Plus ~54 additional warnings/errors spread across other pre-existing files

**Total from `pnpm lint`:** 125 problems (60 errors, 65 warnings).

**Scope check:** `pnpm exec eslint src/actions/admin-tech-ingest.ts` returns clean — the file created in Plan 02 introduces zero lint problems.

Recommendation: triage these in a dedicated quick-fix pass (e.g. `/gsd:quick`), not inside Phase 16.

## RUBRIC_V1_1 object-key / field-property inconsistency (Plan 04 discovery)

**Status: RESOLVED 2026-04-23** — see `16-CONTEXT.md` D-18 (JSONL Field Naming Contract). Resolution path was documentation-only (Option B): the short-form contract was locked in 16-CONTEXT.md with a copy-referenceable example table, no rubric v1.2 bump was needed. Quick task: `260423-rfu`. Historical analysis below retained for posterity.

Discovered while authoring JSONL fixtures (Plan 04 Task 1). `src/lib/tech/rubric-map.ts`
has several entries where the object key and the `RubricTestSpec.field` property
diverge, violating the implicit contract that the key is `${discipline}:${tool}:${field}`.

Affected entries:

- `"cpu:hyperfine:ripgrep_cargo"` → `field: "ripgrep_cargo_mean_s"`
- `"memory:stream:triad"` → `field: "triad_gb_s"`
- `"memory:stream:copy"` → `field: "copy_gb_s"`
- `"storage:amorphous:seq_read"` → `field: "seq_read_mb_s"`
- `"storage:amorphous:seq_write"` → `field: "seq_write_mb_s"`
- `"storage:amorphous:rnd4k_read"` → `field: "rnd4k_read_mb_s"`
- `"storage:amorphous:rnd4k_write"` → `field: "rnd4k_write_mb_s"`
- `"video:handbrake:h264_1080p"` → `field: "h264_1080p_fps"`
- `"video:handbrake:hevc_4k"` → `field: "hevc_4k_fps"`
- (and other similar -fps / -mb_s / -s suffixes)

The ingest lookup at `src/actions/admin-tech-ingest.ts:230` computes
`${line.discipline}:${line.tool}:${line.field}` from JSONL and indexes RUBRIC_V1_1
by that string. So the Mac harness must emit JSONL `field` values matching the
object-key suffix (short form, e.g. `ripgrep_cargo`), not the longer
`RubricTestSpec.field` value (e.g. `ripgrep_cargo_mean_s`). This contract is
**not documented** anywhere.

Plan 04 fixtures use the short form to produce matched rows. Real Mac harness
output must follow the same convention.

Options to remediate (pick before 2026-04-25):

1. **Rubric v1.2** — rewrite object keys to match the `field` property exactly
   (breaking change for any external JSONL already using the short form).
2. **Canonicalize** — rewrite RUBRIC_V1_1 so object key == `${discipline}:${tool}:${field}`
   and the `field` property is the short form (most correct; document the contract).
3. **Document the contract** — amend D-15 / CONTEXT.md to state that JSONL `field`
   must match the object-key suffix, leaving the rubric data unchanged.

Recommended: option 2 via a rubric v1.2 bump, with the seed script updating
`tech_benchmark_tests.name` as needed (names are not user-facing keys).

