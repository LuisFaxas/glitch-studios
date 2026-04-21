---
phase: 12-artists-team
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/db/schema.ts
  - src/actions/admin-content.ts
autonomous: true
requirements: [TEAM-01, TEAM-02]
must_haves:
  truths:
    - "teamMembers table has artist_kind enum with values 'internal' and 'collaborator'"
    - "teamMembers table has specialties text[] column defaulting to empty array"
    - "teamMembers table has is_featured boolean column defaulting to false"
    - "All existing rows in the DB are backfilled as kind='internal' via column DEFAULT"
    - "TeamMember TypeScript type automatically reflects the three new columns via InferSelectModel"
    - "createTeamMember and updateTeamMember server actions accept kind, specialties, isFeatured"
    - "updateTeamMember clears isFeatured=true on all other internal members when setting isFeatured=true"
  artifacts:
    - path: "src/db/schema.ts"
      provides: "artistKindEnum definition + kind/specialties/isFeatured columns on teamMembers"
      contains: "artistKindEnum"
    - path: "src/actions/admin-content.ts"
      provides: "Updated TeamMemberFormData interface + create/update actions with new fields"
      contains: "kind"
  key_links:
    - from: "src/db/schema.ts"
      to: "Neon DB"
      via: "drizzle-kit push applies the migration"
      pattern: "artistKindEnum"
    - from: "src/actions/admin-content.ts"
      to: "src/db/schema.ts teamMembers"
      via: "Drizzle insert/update .set({ kind, specialties, isFeatured })"
      pattern: "isFeatured"
---

<objective>
Add three columns to the teamMembers Drizzle table — `kind` (pgEnum: internal/collaborator), `specialties` (text[]), `isFeatured` (boolean) — and push the migration to Neon. Update the admin server actions to accept the new fields. This is the data-layer prerequisite for every other Phase 12 plan.

Purpose: Without `kind`, the page cannot split into TEAM and COLLABORATORS sections (TEAM-01). Without `specialties`, the chip filter on ArtistsSection has no data to filter on (TEAM-02/03). Without `isFeatured`, ArtistHeroBanner cannot identify which member to feature.

Output:
1. `src/db/schema.ts` — artistKindEnum + 3 new columns on teamMembers
2. `src/actions/admin-content.ts` — TeamMemberFormData updated, create/update actions pass new fields, isFeatured invariant enforced
3. Migration pushed to Neon (`drizzle-kit push`)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/12-artists-team/12-RESEARCH.md
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add artist_kind enum + 3 columns to schema.ts and push migration</name>
  <files>src/db/schema.ts</files>
  <read_first>
    - src/db/schema.ts (full file — confirm existing teamMembers definition at lines 104-119, existing pgEnum imports, confirm no artistKindEnum already exists)
    - src/types/index.ts (confirm TeamMember = InferSelectModel<typeof teamMembers> — new columns flow through automatically)
  </read_first>
  <action>
    STEP 1 — In `src/db/schema.ts`, add `artistKindEnum` immediately after the existing `postStatusEnum` definition (around line 85), BEFORE the teamMembers table definition:

    ```typescript
    export const artistKindEnum = pgEnum("artist_kind", ["internal", "collaborator"])
    ```

    Confirm `pgEnum` is already imported from `"drizzle-orm/pg-core"` (it is — line 9). No new import needed.

    STEP 2 — Inside the `teamMembers` pgTable definition, add the three new columns AFTER the `isActive` column and BEFORE the `createdAt` column:

    ```typescript
    kind: artistKindEnum("kind").default("internal").notNull(),
    specialties: text("specialties").array().default([]).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    ```

    IMPORTANT: The `.default("internal")` ensures existing rows are backfilled to "internal" automatically during the ALTER TABLE. Do NOT use `.notNull()` without `.default()` — that would fail on a non-empty table (Research Pitfall 1).

    STEP 3 — Run the migration push:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm drizzle-kit push
    ```

    If drizzle-kit asks for confirmation (interactive prompt), type `yes` or use `--force` flag. If the push succeeds, all three columns are now on the DB with correct defaults.

    STEP 4 — Verify the schema typechecks:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && grep -q 'artistKindEnum' src/db/schema.ts && grep -q '"artist_kind"' src/db/schema.ts && grep -q "kind: artistKindEnum" src/db/schema.ts && grep -q 'specialties' src/db/schema.ts && grep -q 'is_featured' src/db/schema.ts && pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q 'export const artistKindEnum' src/db/schema.ts` exits 0
    - `grep -q '"artist_kind"' src/db/schema.ts` exits 0 (enum name in DB)
    - `grep -q 'kind: artistKindEnum("kind").default("internal").notNull()' src/db/schema.ts` exits 0
    - `grep -q "specialties: text" src/db/schema.ts` exits 0
    - `grep -q 'isFeatured: boolean' src/db/schema.ts` exits 0
    - `pnpm tsc --noEmit` exits 0
    - `pnpm drizzle-kit push` ran without error (migration applied)
  </acceptance_criteria>
  <done>artist_kind enum + 3 columns exist in schema.ts and in the live Neon DB. TeamMember TypeScript type automatically reflects the new columns via InferSelectModel.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Update admin server actions to accept kind, specialties, isFeatured</name>
  <files>src/actions/admin-content.ts</files>
  <read_first>
    - src/actions/admin-content.ts (full file — confirm TeamMemberFormData interface at line ~36, createTeamMember at line ~48, updateTeamMember at line ~72)
    - src/db/schema.ts (Task 1 output — confirm artistKindEnum is exported for use in type check)
  </read_first>
  <action>
    STEP 1 — Extend the `TeamMemberFormData` interface in `src/actions/admin-content.ts` to include the three new fields:

    ```typescript
    interface TeamMemberFormData {
      name: string
      slug?: string
      role: string
      bio: string
      photoUrl: string | null
      socialLinks: string | null
      credits: string | null
      featuredTrackUrl: string | null
      sortOrder: number
      // Phase 12 additions
      kind?: "internal" | "collaborator"
      specialties?: string[]
      isFeatured?: boolean
    }
    ```

    Mark the three new fields as optional (`?`) so that any existing callers that do not yet pass them continue to compile without changes.

    STEP 2 — In `createTeamMember`, add the new fields to the `.values({...})` object:

    ```typescript
    kind: data.kind ?? "internal",
    specialties: data.specialties ?? [],
    isFeatured: data.isFeatured ?? false,
    ```

    STEP 3 — In `updateTeamMember`, implement the isFeatured invariant BEFORE the main update. If `data.isFeatured === true`, first clear all other internal members' isFeatured flag:

    ```typescript
    if (data.isFeatured === true) {
      // Enforce single-featured invariant: clear all other internal members first
      await db
        .update(teamMembers)
        .set({ isFeatured: false, updatedAt: new Date() })
        .where(eq(teamMembers.kind, "internal"))
    }
    ```

    Then add the new fields to the existing `.set({...})` object in `updateTeamMember`:

    ```typescript
    kind: data.kind ?? "internal",
    specialties: data.specialties ?? [],
    isFeatured: data.isFeatured ?? false,
    ```

    STEP 4 — Add `revalidatePath("/artists")` to both `createTeamMember` and `updateTeamMember` so the public page cache clears after admin saves.

    STEP 5 — Verify with typecheck:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && grep -q 'kind.*internal.*collaborator' src/actions/admin-content.ts && grep -q 'specialties' src/actions/admin-content.ts && grep -q 'isFeatured' src/actions/admin-content.ts && grep -q 'revalidatePath.*artists' src/actions/admin-content.ts && pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q 'kind.*internal.*collaborator' src/actions/admin-content.ts` exits 0 (TeamMemberFormData has the kind union type)
    - `grep -q 'specialties' src/actions/admin-content.ts` exits 0
    - `grep -q 'isFeatured' src/actions/admin-content.ts` exits 0
    - `grep -q 'revalidatePath.*artists' src/actions/admin-content.ts` exits 0 (cache invalidation added)
    - `grep -q 'Enforce single-featured invariant' src/actions/admin-content.ts` exits 0 (invariant comment present)
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>createTeamMember and updateTeamMember accept kind/specialties/isFeatured. isFeatured=true triggers a pre-update clear of other internal members' isFeatured. /artists route cache is invalidated on save.</done>
</task>

</tasks>

<verification>
- `grep -q 'artistKindEnum' src/db/schema.ts` exits 0
- `grep -q 'kind.*internal.*collaborator' src/actions/admin-content.ts` exits 0
- `grep -q 'isFeatured' src/actions/admin-content.ts` exits 0
- `grep -q 'revalidatePath.*artists' src/actions/admin-content.ts` exits 0
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
</verification>

<success_criteria>
- artist_kind pgEnum with "internal"/"collaborator" values exists in schema.ts and Neon DB
- specialties text[] and isFeatured boolean columns exist on team_members table with safe defaults
- TeamMember TypeScript type (from InferSelectModel) automatically includes kind, specialties, isFeatured
- Admin server actions accept and persist all three new fields
- Single-featured invariant enforced in updateTeamMember
- pnpm tsc --noEmit passes with 0 errors
</success_criteria>

<output>
After completion, create `.planning/phases/12-artists-team/12-01-SUMMARY.md` documenting:
- Whether drizzle-kit push succeeded (and any prompts/warnings encountered)
- The exact column definitions added to teamMembers
- The isFeatured invariant pattern used in updateTeamMember
- Whether existing seed data rows were backfilled correctly (kind=internal by default)
- pnpm tsc --noEmit pass/fail
</output>
