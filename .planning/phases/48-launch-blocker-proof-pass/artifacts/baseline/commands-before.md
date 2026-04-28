# Phase 48 Baseline Command Inventory

Captured before any Phase 48 dashboard, DNS, OAuth, checkout, or performance proof changes.

## `pnpm tsc --noEmit`

- exit status: 2
- stdout summary:
  - `tests/forensics-overlay-leak.spec.ts(37,17): error TS2339: Property 'offsetParent' does not exist on type 'Element'.`
- note: Per `48-01-PLAN.md`, this baseline failure is recorded only. No code was fixed in this plan.

## `pnpm lint`

- exit status: 1
- stdout summary:
  - ESLint reported `127 problems (53 errors, 74 warnings)`.
  - Representative errors include existing `@typescript-eslint/no-explicit-any` findings in admin/client and booking files, React compiler lint findings in component files, and `tests/mobile-audit.spec.ts` / `tests/09-services-booking-mobile-audit.spec.ts` `no-explicit-any` findings.
  - `0 errors and 4 warnings potentially fixable with the --fix option.`
- note: Per `48-01-PLAN.md`, this project-wide lint failure is recorded only. No code was fixed in this plan.

## `vercel env ls`

- exit status: 0
- stdout summary:
  - Vercel CLI authenticated as `luisfaxas`.
  - Project resolved as `luis-faxas-projects/glitch_studios`.
  - Encrypted Preview env rows were present for `R2_PUBLIC_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `CRON_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `ADMIN_EMAIL`.
  - Encrypted Production env rows were present for `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `R2_BUCKET_NAME`, `R2_SECRET_ACCESS_KEY`, `R2_ACCESS_KEY_ID`, `R2_ACCOUNT_ID`, `R2_PUBLIC_URL`, `ADMIN_EMAIL`, `CRON_SECRET`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `BETTER_AUTH_SECRET`, and `DATABASE_URL`.
  - No secret values were displayed; Vercel reported all values as `Encrypted`.

