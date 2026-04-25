---
phase: 26-brand-aware-auth-ui-redesign
plan: 05
status: complete
requirements: [AUTH-03, AUTH-20, AUTH-23]
completed: 2026-04-25
---

## What Was Built

Rebuilt `/login` against the AuthShell + shared auth components. Server-component shell, client form. Social row above email/password, enumeration-safe error copy, account-not-linked conflict copy.

## Tasks

1. Replaced `src/app/(auth)/login/page.tsx` with a server-component shell that calls `getAvailableSocialProviders()` server-side and renders `<LoginForm>` inside a `<Suspense>` boundary.
2. Created `src/app/(auth)/login/login-form.tsx` (`"use client"`) — `AuthFormCard heading="Welcome back"`, `SocialAuthRow` first, separator with "or continue with email", `PasswordField` for the password input, `EnumSafeFormError` for both submission errors and URL-driven conflict messages.

## Key Files

### Created
- `src/app/(auth)/login/login-form.tsx`

### Modified
- `src/app/(auth)/login/page.tsx`

## Verification

- `pnpm tsc --noEmit` exits 0.
- Login form surfaces the GENERIC_BAD_CREDS string for any sign-in failure (no enumeration leak).
- `?error=account_not_linked&attempted=google` resolves to `attemptedLabel = "Google"`.

## Notes / Deviations

- Preserved the existing role-based post-login redirect (admin → `/admin`, otherwise `/`) instead of plan's hardcoded `/dashboard` since the project has no `/dashboard` route. Documented separately in Plan 26-09's notes.
- Social auth callbackURL set to `/` for the same reason.
