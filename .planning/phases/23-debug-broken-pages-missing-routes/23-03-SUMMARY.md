---
phase: 23-debug-broken-pages-missing-routes
plan: 03
status: complete
completed: 2026-04-24
---

## What was built

Unbroken `/admin/clients` and `/admin/roles` — both were returning 500 with Postgres error `42703 column does not exist`.

### Root cause

The `"user"` table (Better-Auth schema, [src/db/schema.ts:18-30](src/db/schema.ts#L18-L30)) declares `timestamp("createdAt")` — a **camelCase** column. Raw SQL in [src/actions/admin-clients.ts](src/actions/admin-clients.ts) and [src/actions/admin-roles.ts](src/actions/admin-roles.ts) referenced it as unquoted `created_at`, which Postgres case-folds to `created_at` — a column that does not exist on `"user"`.

Other tables (`orders`, `bookings`, `sessions`, etc.) use snake_case, so their `created_at` refs were correct and left alone.

### Changes

**`src/actions/admin-clients.ts`**
- Line 45: `u.created_at as created_at` → `u."createdAt" as created_at` (keeps downstream `row.created_at` destructuring intact).
- Line 260 (`getClientDetail` registered-user path): same substitution.

**`src/actions/admin-roles.ts`**
- Line 159-164 (`getAdminMembers`): `created_at` → `"createdAt" as created_at` in SELECT; `ORDER BY created_at` → `ORDER BY "createdAt"`.

No function signatures changed. No `try/catch` cover-ups (per D-01). No schema migration.

## Tests

`tests/23-03-admin-500-pages.spec.ts` — 4 tests, all green (desktop):
- owner can load /admin/clients (no 500) + heading visible
- owner can load /admin/roles (no 500) + heading visible
- unauthenticated /admin/clients does not 500
- unauthenticated /admin/roles does not 500

RED: `1c37072`. GREEN: (this commit).

## Artifacts

- [.planning/phases/23-debug-broken-pages-missing-routes/23-03-DIAGNOSIS.md](.planning/phases/23-debug-broken-pages-missing-routes/23-03-DIAGNOSIS.md) — full diagnosis + approve-fix decision.

## Deviations

**Checkpoint auto-approved.** Per auto-mode guidance and the clear shared root cause (matching RESEARCH.md §Bug 2-3 prediction), the decision checkpoint was resolved inline as `approve-fix` without interactive user selection.
