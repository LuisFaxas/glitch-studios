---
phase: 12-artists-team
plan: 02
type: execute
wave: 2
depends_on: [12-01]
files_modified:
  - src/components/admin/team-member-form.tsx
autonomous: true
requirements: [TEAM-01, TEAM-02]
must_haves:
  truths:
    - "Admin can set a team member's kind to 'Internal Team Member' or 'Collaborating Artist' via a select dropdown"
    - "Admin can enter comma-separated specialties that save as a string[] array"
    - "Admin can check isFeatured to set the hero member (internal only)"
    - "The isFeatured checkbox is only shown when kind=internal"
    - "Existing form fields (name, role, bio, photo, credits, social links, sort order) still work correctly"
  artifacts:
    - path: "src/components/admin/team-member-form.tsx"
      provides: "TeamMemberForm with kind select, specialties tag input, isFeatured checkbox"
      contains: "kind"
  key_links:
    - from: "src/components/admin/team-member-form.tsx"
      to: "src/actions/admin-content.ts createTeamMember/updateTeamMember"
      via: "Server Action call with { kind, specialties: splittedArray, isFeatured }"
      pattern: "specialties"
---

<objective>
Extend TeamMemberForm with three new fields matching the Plan 12-01 schema additions: a Kind select (Internal/Collaborator), a Specialties tag input (comma-separated stored as text[]), and an isFeatured checkbox (only visible when kind=internal).

Purpose: Without these form fields, admins cannot assign kind or specialties to existing or new members. The chip filter and section split on the public page require real data from the admin. Addresses TEAM-01 and TEAM-02.

Output: src/components/admin/team-member-form.tsx updated with three new fields.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/12-artists-team/12-RESEARCH.md
@.planning/phases/12-artists-team/12-01-SUMMARY.md

<interfaces>
From src/actions/admin-content.ts (after Plan 12-01):
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
  kind?: "internal" | "collaborator"
  specialties?: string[]
  isFeatured?: boolean
}
```

Style constants from existing TeamMemberForm:
```typescript
const inputClass = "w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans px-3 py-2 outline-none focus:border-[#f5f5f0]"
const labelClass = "block font-mono text-[11px] uppercase tracking-wider text-[#888888] mb-1"
const errorClass = "text-[#ff4444] font-sans text-[11px] mt-1"
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add kind select, specialties input, isFeatured checkbox to TeamMemberForm</name>
  <files>src/components/admin/team-member-form.tsx</files>
  <read_first>
    - src/components/admin/team-member-form.tsx (full file — know existing state, handleSubmit, formData construction, and JSX layout)
    - src/actions/admin-content.ts (confirm TeamMemberFormData has kind/specialties/isFeatured from Plan 12-01)
  </read_first>
  <action>
    Make these targeted changes to src/components/admin/team-member-form.tsx:

    CHANGE 1 — Update the TeamMemberData interface (prop type) to include the three new optional fields:

    Add after `sortOrder: number | null`:
    ```typescript
    kind?: "internal" | "collaborator"
    specialties?: string[]
    isFeatured?: boolean
    ```

    CHANGE 2 — Add three new state variables after the existing sortOrder state:

    ```typescript
    const [kind, setKind] = useState<"internal" | "collaborator">(member?.kind ?? "internal")
    const [specialties, setSpecialties] = useState(
      (member?.specialties ?? []).join(", ")
    )
    const [isFeatured, setIsFeatured] = useState(member?.isFeatured ?? false)
    ```

    CHANGE 3 — In handleSubmit, parse specialties into an array BEFORE building formData. Add this before the `const formData = {...}` line (Research Pitfall 7 — must split on comma, trim, and filter):

    ```typescript
    const specialtiesArray = specialties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    ```

    Then extend the existing `formData` object with the three new fields:

    ```typescript
    kind,
    specialties: specialtiesArray,
    isFeatured: kind === "internal" ? isFeatured : false,
    ```

    CHANGE 4 — Add the three new form field blocks to the JSX. Insert them between the existing "Display Order" block and the "Submit" button block:

    Kind select:
    ```tsx
    <div>
      <label className={labelClass}>Member Type</label>
      <select
        value={kind}
        onChange={(e) => {
          setKind(e.target.value as "internal" | "collaborator")
          if (e.target.value !== "internal") setIsFeatured(false)
        }}
        className={inputClass}
      >
        <option value="internal">Internal Team Member</option>
        <option value="collaborator">Collaborating Artist</option>
      </select>
    </div>
    ```

    Specialties input:
    ```tsx
    <div>
      <label className={labelClass}>Specialties</label>
      <input
        type="text"
        value={specialties}
        onChange={(e) => setSpecialties(e.target.value)}
        placeholder="Trap, Mixing, Video Editing (comma-separated)"
        className={inputClass}
      />
      <p className="text-[#555555] font-sans text-[11px] mt-1">
        Enter tags separated by commas. These appear as filter chips on the Artists page.
      </p>
    </div>
    ```

    isFeatured checkbox (only shown when kind === "internal"):
    ```tsx
    {kind === "internal" && (
      <div>
        <label className={labelClass}>Featured (hero banner)</label>
        <div className="flex items-center gap-3 mt-1">
          <input
            type="checkbox"
            id="isFeatured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 accent-[#f5f5f0]"
          />
          <label
            htmlFor="isFeatured"
            className="font-sans text-[13px] text-[#888888] cursor-pointer"
          >
            Show this member as the hero on the Artists page
          </label>
        </div>
        <p className="text-[#555555] font-sans text-[11px] mt-1">
          Only one internal member can be featured at a time. Setting this will unfeature others automatically.
        </p>
      </div>
    )}
    ```

    CHANGE 5 — Run typecheck to confirm no regressions:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; grep -q 'Internal Team Member' src/components/admin/team-member-form.tsx &amp;&amp; grep -q 'Specialties' src/components/admin/team-member-form.tsx &amp;&amp; grep -q 'isFeatured' src/components/admin/team-member-form.tsx &amp;&amp; grep -q 'comma-separated' src/components/admin/team-member-form.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep "Internal Team Member" src/components/admin/team-member-form.tsx exits 0 (kind select option)
    - grep "Specialties" src/components/admin/team-member-form.tsx exits 0 (field label)
    - grep "isFeatured" src/components/admin/team-member-form.tsx exits 0 (checkbox state + JSX)
    - grep "comma-separated" src/components/admin/team-member-form.tsx exits 0 (helper text)
    - grep "split.*,.*map.*trim.*filter" src/components/admin/team-member-form.tsx exits 0 (specialties parse logic)
    - isFeatured checkbox block is wrapped in {kind === "internal" && ...} conditional
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>TeamMemberForm has kind select, specialties tag input, and isFeatured checkbox. Specialties are parsed from comma-separated string to string[] before submit. isFeatured only visible for internal members. Form compiles cleanly.</done>
</task>

</tasks>

<verification>
- grep "Internal Team Member" src/components/admin/team-member-form.tsx exits 0
- grep "Specialties" src/components/admin/team-member-form.tsx exits 0
- grep "isFeatured" src/components/admin/team-member-form.tsx exits 0
- pnpm tsc --noEmit exits 0
- pnpm lint exits 0
</verification>

<success_criteria>
- Admin can navigate to /admin/team/new or /admin/team/{id}/edit and see Kind select, Specialties input, isFeatured checkbox
- Specialties field shows comma-separated help text and correctly parses to string[] on submit
- isFeatured checkbox only visible when Kind = "Internal Team Member"
- All existing fields continue to work
- pnpm tsc --noEmit passes
</success_criteria>

<output>
After completion, create .planning/phases/12-artists-team/12-02-SUMMARY.md documenting:
- The three new form fields added and their default values
- The specialties parse logic (split/trim/filter) location in handleSubmit
- Whether pnpm tsc --noEmit passed
- Any edge cases discovered (e.g. how existing members with kind=undefined render in the select)
</output>
