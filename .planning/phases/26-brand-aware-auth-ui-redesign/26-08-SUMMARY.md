---
phase: 26-brand-aware-auth-ui-redesign
plan: 08
status: complete
requirements: [AUTH-29]
completed: 2026-04-25
---

## What Was Built

Branded forgot-password and reset-password surfaces, both wrapped in `AuthFormCard` with verbatim UI-SPEC copy, the enumeration-safe success pattern on `/forgot-password`, and the expired-token Alert state on `/reset-password`.

## Tasks

1. Rewrote `/forgot-password/page.tsx`: `AuthFormCard` heading "Forgot your password?", subhead "Enter the email...", on submit always renders the success Alert "If we recognize that email, a reset link is on its way. Check your inbox." regardless of API outcome.
2. Rewrote `/reset-password/page.tsx`: `AuthFormCard` heading "Set a new password", subhead, dual `<PasswordField>` inputs with show/hide, client-side `newPassword === confirmPassword` check, expired Alert + "Send a new link" CTA shown when token missing OR API returns error, success path toasts and redirects to `/login`.

## Key Files

### Modified
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`

## Verification

- `pnpm tsc --noEmit` exits 0.

## Notes / Deviations

- `Button` component in this project uses `@base-ui/react/button` and does not accept `asChild`. The "Send a new link" CTA is a `<Link>` styled with the same height/padding/colors as a Button to keep visual parity.
- Reset path keeps the dual confirm-password field (UI-SPEC says register drops it but keeps it on reset for self-verification at recovery).
