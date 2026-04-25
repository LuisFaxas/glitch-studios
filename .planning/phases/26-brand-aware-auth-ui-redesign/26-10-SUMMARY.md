---
phase: 26-brand-aware-auth-ui-redesign
plan: 10
status: complete
requirements: [AUTH-15, AUTH-16, AUTH-17, AUTH-19]
completed: 2026-04-25
---

## What Was Built

Backend layer of the admin artist-applications review queue: email template, dual-handler edit to `sendResetPassword` in `src/lib/auth.ts`, and three server actions (approve / reject / requestMoreInfo). Plan 26-11 builds the admin UI on top of these contracts.

## Tasks

1. Created `src/lib/email/artist-approval-invite.tsx` (React Email template) with brand-aware copy and a "Set your password" CTA. Mirrors the typography of `password-reset.tsx`.
2. Updated `src/lib/auth.ts` `sendResetPassword`: branches on `url.includes("invite=1")` to send the new template, reads `&brand=tech` from the URL to drive copy. Plan 04's social provider config preserved.
3. Created `src/actions/admin-artist-applications.ts` with `approveArtistApplication`, `rejectArtistApplication`, `requestMoreInfoOnApplication` — all gated by `requireAdmin()` (owner/admin role). Approve runs in a `db.transaction` and triggers `auth.api.requestPasswordReset` with the invite marker. All actions call `revalidatePath("/admin/applications")`.

## Key Files

### Created
- `src/lib/email/artist-approval-invite.tsx`
- `src/actions/admin-artist-applications.ts`

### Modified
- `src/lib/auth.ts`

## Verification

- `pnpm tsc --noEmit` exits 0.
- `auth.ts` retains both Plan 04 social config AND new dual-handler.
- Approve action uses `db.transaction` for atomic user-create + app-update.

## Notes / Deviations

- New user `id` is generated via `crypto.randomUUID()` to match Better Auth's `user.id: text` schema (project doesn't expose Better Auth's internal UUID generator at this layer).
- Reject action stores `reviewerNote` as internal-only and never emails the applicant.
- `requestMoreInfo` accepts admin-composed `emailSubject` + `emailBody` from the UI; Plan 11's detail-sheet drawer is expected to provide form fields for these.
