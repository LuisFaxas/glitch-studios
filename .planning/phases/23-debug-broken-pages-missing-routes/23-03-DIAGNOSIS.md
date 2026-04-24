# Phase 23-03 Diagnosis

Captured against local dev server (port 3004) with a real owner session — reproduces identically to the prod symptom ("page couldn't load"). No Vercel logs needed.

## /admin/clients

- **Stack trace (top frame):** `src/actions/admin-clients.ts:39` in `getClients` → `AdminClientsPage` at `src/app/admin/clients/page.tsx:7`.
- **Postgres error:** `42703` — `column u.created_at does not exist` (hint: `Perhaps you meant to reference the column "u.createdAt"`).
- **Offending query (line 39-59):** Raw SQL selects `u.created_at` from the `"user"` table, but the `user` table's timestamp column is declared in Drizzle as `timestamp("createdAt")` (camelCase). Postgres case-folds unquoted identifiers, so unquoted `created_at` never matches the actual `createdAt` column.
- **Root cause:** Column naming drift. The `"user"` table (Better Auth schema) uses camelCase columns (`createdAt`, `emailVerified`, etc.) because Better Auth migrations created it with quoted identifiers. All other app tables (`orders`, `bookings`, etc.) use snake_case. The raw-SQL query in `admin-clients.ts` assumes snake_case for the `user` table and breaks.
- **Fix strategy:** In `src/actions/admin-clients.ts:45` replace `u.created_at as created_at` with `u."createdAt" as created_at`. References to `created_at` on `orders` / `bookings` are correct (those tables genuinely use snake_case) — leave them alone. Line 260 (`getClientDetail`) has the same issue for registered-user lookup; fix at the same time.

## /admin/roles

- **Stack trace (top frame):** `src/actions/admin-roles.ts:159` in `getAdminMembers` → `AdminRolesPage` at `src/app/admin/roles/page.tsx:7`.
- **Postgres error:** `42703` — `column "created_at" does not exist` (hint: `Perhaps you meant to reference the column "user.createdAt"`).
- **Offending query (line 159-164):** `SELECT id, name, email, role, created_at FROM "user" WHERE role != 'user' ORDER BY created_at ASC`. Same camelCase-vs-snake_case mismatch.
- **Root cause:** Same as `/admin/clients` — `user.createdAt` camelCase column referenced as unquoted `created_at`.
- **Fix strategy:** In `src/actions/admin-roles.ts:159-164` replace `created_at` with `"createdAt" as created_at` in SELECT, and `created_at` → `"createdAt"` in ORDER BY. Same alias trick keeps downstream `r.created_at` map logic intact.

## Shared root cause

**YES.** Single failure mode, unified explanation: raw SQL against the Better-Auth `"user"` table assumed snake_case, but that table's columns are camelCase. Fix pattern is identical — quote the column name to preserve case, alias back to snake_case for the existing TS destructuring.

## Env notes

- **Local matches prod?** YES — local reproduction against the same Neon Postgres instance (no prod-specific config needed). The bug ships in the query string itself; it would fire anywhere.
- **Auth cascade (§C.4) relevance:** NO — `requirePermission` succeeded (session is valid, `view_clients` / `manage_roles` both granted to owner). The 500 comes from the DB query, not auth.
- **Why this hasn't been caught before:** Both pages ship without data-dependent tests. The bug is "page loads at all" — trivially caught by a smoke test.
- **Other raw-SQL call-sites on `user` referencing created_at?** Only `getClientDetail` at line 260 (`admin-clients.ts`) selects `created_at` from `"user"`. Same fix applies there for completeness.

## Checkpoint decision

Auto-approved **approve-fix**: root cause is narrow (two-file quote-fix), matches one of the failure modes RESEARCH.md §Bug 2-3 predicted, and does NOT require a migration, schema change, or permission reseed. Proceeding to RED-then-GREEN.
