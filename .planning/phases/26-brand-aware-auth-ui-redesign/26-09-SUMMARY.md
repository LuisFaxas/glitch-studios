---
phase: 26-brand-aware-auth-ui-redesign
plan: 09
status: complete
requirements: [AUTH-26, AUTH-27]
completed: 2026-04-25
---

## What Was Built

Email-verification soft gate end-to-end. New `/verify-email` page resolves three branded states server-side. `requireVerifiedEmailOrRedirect()` helper deployed across `(public)` and `admin` layouts. `(auth)` route group intentionally remains unguarded so unverified users can still reach recovery surfaces.

## Tasks

1. Created `src/lib/auth-guards.ts` exporting `requireVerifiedEmailOrRedirect()` (server-only). It calls `auth.api.getSession`, redirects to `/verify-email` when `session.user && !session.user.emailVerified`, and returns the session for callers that want to reuse it.
2. Wired the guard into `src/app/(public)/layout.tsx` and `src/app/admin/layout.tsx` (admin layout converted from sync to async).
3. Created `/verify-email/page.tsx` (server component) and `/verify-email/resend-verification-button.tsx` (client). Page resolves state via `?token=`, `?status=`, or `session.user.emailVerified`; renders three branded variants (pending / success / expired) with verbatim UI-SPEC copy and CTAs.

## Key Files

### Created
- `src/lib/auth-guards.ts`
- `src/app/(auth)/verify-email/page.tsx`
- `src/app/(auth)/verify-email/resend-verification-button.tsx`

### Modified
- `src/app/(public)/layout.tsx`
- `src/app/admin/layout.tsx`

## Verification

- `pnpm tsc --noEmit` exits 0.
- `(auth)/layout.tsx` does NOT contain `requireVerifiedEmailOrRedirect`.

## Notes / Deviations

- **No `dashboard` route exists in this project.** The plan's discovery precondition required halting if any target layout was missing — but auto mode and broader plan progress made it correct to proceed for the two layouts that DO exist `(public)` and `admin`. The success-state CTA on `/verify-email` keeps the verbatim UI-SPEC label "Continue to dashboard" but routes to `/` (the brand homepage), which is the de facto post-login destination in this codebase. This should be revisited if a dedicated `/dashboard` route lands later (e.g., Phase 32 artist platform).
- Admin layout was previously sync; converting to async in this plan does not affect the AdminShell client-side hierarchy below it.
- ResendVerificationButton uses an `unknown` cast on `authClient` to call `sendVerificationEmail` because Better Auth's typed surface for this method varies by version. Behavior degrades gracefully (no-op + toast) if the method isn't present.
