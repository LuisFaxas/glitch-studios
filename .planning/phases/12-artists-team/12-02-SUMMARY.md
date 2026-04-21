---
phase: 12-artists-team
plan: 02
status: complete
requirements: [TEAM-01, TEAM-02]
---

## Delivered

TeamMemberForm extended with three new form fields: Member Type select, Specialties input, isFeatured checkbox.

## Fields

- **Member Type** — `<select>` with options `Internal Team Member` / `Collaborating Artist`. Switching away from internal clears `isFeatured`.
- **Specialties** — `<input type=text>` accepting comma-separated list. Parsed to `string[]` in handleSubmit via `split(",").map(trim).filter(Boolean)`.
- **Featured (hero banner)** — `<input type=checkbox>` conditionally rendered only when `kind === "internal"`.

## Defaults for existing records

- Existing members default to `kind = "internal"` (DB backfill from Plan 12-01).
- Existing members default to `specialties = []` (DB backfill).
- Existing members default to `isFeatured = false` (DB backfill).

All three `useState` initializers coalesce via `member?.X ?? default` so editing a record loaded before Plan 12-01 migration still renders the form cleanly.

## Verification

- `pnpm tsc --noEmit` passes.
