# Phase 15: Methodology Lock + Schema - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 15-methodology-lock-schema
**Areas discussed:** UNIQUE constraint shape, discipline + mode column typing, Existing data backfill, Rubric v1.1 seed scope + idempotency

---

## UNIQUE Constraint Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Partial unique on `(product_id, test_id, mode, run_uuid) WHERE superseded=false` | Matches REQUIREMENTS.md + pitfall B-1. Allows superseded rows to coexist. Requires Drizzle `sql\`...\`` expression. | ✓ |
| Simple unique on `(product_id, test_id, run_uuid)` | Matches ROADMAP success criterion 5 wording. Prevents dual-mode (AC+Battery) coexistence for one run_uuid. | |
| Simple unique on `(product_id, test_id, mode, run_uuid)` | Compromise: catches AC+Battery, blocks full duplicate. No superseded awareness. | |

**User's choice:** Partial unique on `(product_id, test_id, mode, run_uuid) WHERE superseded=false` (recommended).
**Notes:** Dual-mode (ac + battery) coexistence is required by the rubric workflow; superseded history must remain queryable.

---

## discipline + mode Column Typing

| Option | Description | Selected |
|--------|-------------|----------|
| discipline: pgEnum, mode: pgEnum | DB-level safety. 13 disciplines locked; adding one = new rubric version. Strong Drizzle types. | ✓ |
| discipline: text, mode: pgEnum | Discipline flexible, mode strict. Research SUMMARY leaned this way. | |
| discipline: text, mode: text | All flexibility; no DB guard rails. | |

**User's choice:** Both enums (recommended).
**Notes:** Append-only rubric policy means changing the discipline set = version bump + new migration anyway, so enum cost is negligible; type safety payoff is high.

---

## Existing Data Backfill

| Option | Description | Selected |
|--------|-------------|----------|
| Add NOT NULL with DB defaults, no backfill | No production rows exist (Mac returns 2026-04-25). Safe single-transaction migration. | ✓ |
| Nullable first, backfill, then enforce NOT NULL | Two-step safety if dev DB has demo rows. | |
| TRUNCATE `tech_benchmark_runs`, then NOT NULL | Nuke-and-pave; destructive. | |

**User's choice:** NOT NULL with DB defaults (recommended).
**Notes:** Confirmed no production rows by schema inspection (no seed file populates `tech_benchmark_runs`). `mode` and `run_uuid` have no DB default — required from ingest; safe because no existing rows to backfill.

---

## Rubric v1.1 Seed Scope + Idempotency

| Option | Description | Selected |
|--------|-------------|----------|
| Seed all 13 disciplines, ON CONFLICT DO NOTHING on `(template_id, discipline, mode, name)` | Unblocks Phase 16+17 parallel work. Append-only. Idempotent. | ✓ |
| CPU-only now, extend as benchmarked (ROADMAP plan-02 wording) | Minimal seed; blocks Phase 16 dry-run for non-CPU. | |
| Seed all 13 with ON CONFLICT DO UPDATE | Editable on re-run. Contradicts append-only rubric policy. | |

**User's choice:** All 13 with ON CONFLICT DO NOTHING (recommended).
**Notes:** Test rows (name, unit, direction, discipline, mode) are metadata, not scores. Seeding them upfront creates the lookup targets Phase 16's rubric-map needs. Actual benchmark numbers still arrive per-discipline as the Mac produces them.

---

## Claude's Discretion

- Migration file organization (single vs split) — planner decides based on Drizzle-kit output.
- Internal helper-type naming — planner follows existing camelCase conventions in `src/db/schema.ts`.
- App-layer vs trigger for `published_at = NOW()` auto-fill — app-layer via existing admin mutation (CHECK constraint is the DB-level guard).
- Exact rubric-map key format — `<discipline>:<tool>:<field>` colon-separated flat keys chosen as a specific idea; planner can refine.

## Deferred Ideas

- BPR computation (`src/lib/tech/bpr.ts`) — Phase 16.
- `/tech/methodology` page content — Phase 17.
- `brand` column on blog tables — Phase 20 (not Phase 15 despite roadmap wording).
- Rubric v1.2 migration tooling — when actually needed.
