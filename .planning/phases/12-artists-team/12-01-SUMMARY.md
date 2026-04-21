---
phase: 12-artists-team
plan: 01
status: complete
requirements: [TEAM-01, TEAM-02]
---

## Delivered

Schema migration adding `kind`, `specialties`, `isFeatured` to `team_members`, plus admin server actions accepting the new fields.

## Schema Changes

```ts
export const artistKindEnum = pgEnum("artist_kind", ["internal", "collaborator"])

// teamMembers additions:
kind: artistKindEnum("kind").default("internal").notNull(),
specialties: text("specialties").array().default([]).notNull(),
isFeatured: boolean("is_featured").default(false).notNull(),
```

## Migration Path

`pnpm drizzle-kit push` failed due to a drizzle-kit 0.31.10 bug parsing a preexisting CHECK constraint (`TypeError: Cannot read properties of undefined (reading 'replace')`). Worked around by applying the DDL directly via a one-off script using the project's `postgres` driver:

1. `CREATE TYPE artist_kind AS ENUM ('internal', 'collaborator')`
2. `ALTER TABLE team_members ADD COLUMN kind artist_kind NOT NULL DEFAULT 'internal'`
3. `ALTER TABLE team_members ADD COLUMN specialties text[] NOT NULL DEFAULT '{}'`
4. `ALTER TABLE team_members ADD COLUMN is_featured boolean NOT NULL DEFAULT false`

All three columns verified on Neon via `information_schema.columns` readback. Existing rows backfilled automatically via column DEFAULT.

## Admin Actions

- `TeamMemberFormData` interface extended with optional `kind`, `specialties`, `isFeatured`.
- `createTeamMember` passes defaults (`internal`, `[]`, `false`) when fields omitted.
- `updateTeamMember` enforces single-featured invariant: when `isFeatured=true`, first clears `isFeatured=false` on all other `kind='internal'` members.
- Both actions now `revalidatePath("/artists")` in addition to `/admin/team`.

## Verification

- `pnpm tsc --noEmit` passes.
- Schema readback confirms all 3 columns present with correct defaults.
