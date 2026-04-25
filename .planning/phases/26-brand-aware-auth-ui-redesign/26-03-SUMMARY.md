---
phase: 26-brand-aware-auth-ui-redesign
plan: 03
status: complete
requirements: [AUTH-12, AUTH-28]
completed: 2026-04-24
---

## What Was Built

Data foundation for Phase 26: artist applications schema + grandfather migration so existing users aren't locked out by the upcoming email-verification soft gate.

## Tasks

1. Added Drizzle declarations to `src/db/schema.ts`: `artistApplicationStatusEnum`, `artistApplicationBrandEnum`, `artistApplications` table (12 columns + 3 indices), `artistApplicationsRelations`, and additive `user.newsletterOptIn` boolean column.
2. Wrote `src/db/migrations/0006_phase26_auth.sql` — idempotent SQL that creates the enums, table, indices, adds the user column, and runs a guarded grandfather UPDATE flipping `emailVerified=true` for pre-existing users (re-runs are no-ops via `phase26_migration_meta`).
3. Wrote `scripts/run-phase26-migration.ts` (postgres-js standalone runner, matches Phase 15 pattern) and added `db:migrate:phase26` to package.json scripts.

## Key Files

### Created
- `src/db/migrations/0006_phase26_auth.sql`
- `scripts/run-phase26-migration.ts`

### Modified
- `src/db/schema.ts`
- `package.json`

## Verification

- `pnpm tsc --noEmit` exits 0.
- Schema exports `artistApplications`, `artistApplicationStatusEnum`, `artistApplicationBrandEnum`, `artistApplicationsRelations`.
- Migration uses `DO $$ EXCEPTION WHEN duplicate_object` for enums, `IF NOT EXISTS` for table/index/column, and `phase26_migration_meta` row guard for the grandfather UPDATE.
- User must run `pnpm db:migrate:phase26` once before deploy (DB write — not auto-run).

## Notes / Deviations

- Followed plan verbatim except the runner script: used `tsx --env-file=.env.local` matching the existing `db:seed-users` script convention rather than dotenv import (cleaner with the rest of the project).
- Added `ssl: "require"` to the postgres client to match `apply-phase25-migration.mjs`.
