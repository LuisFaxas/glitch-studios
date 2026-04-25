---
phase: 26-brand-aware-auth-ui-redesign
plan: 06
status: complete
requirements: [AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10, AUTH-20, AUTH-24]
completed: 2026-04-25
---

## What Was Built

Customer-side of the split registration flow. `/register` is a brand-aware role selector. `/register/customer` is a 3-step nuqs-driven wizard that defers DB writes until step 3, pre-checks email uniqueness on the step 1→2 boundary, and routes to `/verify-email` on success.

## Tasks

1. Rewrote `/register/page.tsx` as a server component that resolves brand and renders two CTA tiles (customer + artist/contributor) inside `<AuthFormCard>`.
2. Added `src/actions/auth-customer-register.ts` exporting `checkEmailUniqueness({ email })` — zod-validated, lowercased, returns `{ taken: boolean }` only.
3. Added `/register/customer/page.tsx` (server shell with `<Suspense>`) and `customer-wizard.tsx` (`"use client"`) — `useQueryState` for `?step`, `useEffect` falls back to step 1 when identity state is missing, step 1 has SocialAuthRow + email check + PasswordField (no confirm), step 2 has a single newsletter checkbox, step 3 is the atomic `signUp.email()` create with required T&Cs checkbox. On success: toast + `router.push("/verify-email")`.

## Key Files

### Created
- `src/actions/auth-customer-register.ts`
- `src/app/(auth)/register/customer/page.tsx`
- `src/app/(auth)/register/customer/customer-wizard.tsx`

### Modified
- `src/app/(auth)/register/page.tsx`

## Verification

- `pnpm tsc --noEmit` exits 0.
- Wizard never renders `confirmPassword`; `grep -q "confirmPassword" customer-wizard.tsx` returns nothing.
- Step 1 → 2 transition only fires when `checkEmailUniqueness` returns `{ taken: false }`.

## Notes / Deviations

- The newsletter preference is captured in client state (step 2) but is NOT persisted to `user.newsletterOptIn` in this plan — Better Auth's `signUp.email` does not have additionalFields wired for `newsletterOptIn` in this iteration. The DB column from Plan 26-03 exists; a follow-up can extend signUp via `betterAuth({ user: { additionalFields: { newsletterOptIn: ... } } })` or a post-signup `authClient.updateUser` call. Documented as residual work, not a blocker for AUTH-07.
- Password length pre-validation matches UI-SPEC: minimum 8 characters with the verbatim weak-password copy.
