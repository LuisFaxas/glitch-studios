---
phase: 23-debug-broken-pages-missing-routes
plan: 06
status: complete
completed: 2026-04-24
---

## What was built

Closed Audit §C.3 — `/forgot-password` and `/reset-password` routes shipped with brand-compliant minimal UI matching the existing login/register density.

### Changes

**`src/lib/auth.ts`** — added `sendResetPassword` stub inside `emailAndPassword` config block:

```ts
// Phase 23 stub — Phase 24 (Email Delivery End-to-End) replaces this body with
// a Resend call. CONTRACT (LOCKED for Phase 24 handoff): signature is
//   sendResetPassword({ user, url, token }, request) => Promise<void>
sendResetPassword: async ({ user, url }) => {
  console.log(
    `[Phase 23 stub] Password reset requested for ${user.email}. Reset URL: ${url}`,
  )
},
```

No `resetPasswordTokenExpiresIn` override — Better Auth defaults to 3600s (1h), correct per research.

**`src/app/(auth)/forgot-password/page.tsx`** (new) — email form with zod validation, calls `authClient.requestPasswordReset({ email, redirectTo })`. Post-submit the form is replaced by a confirmation panel ("Check your email for a reset link") with a "Send another link" retry button. Includes a "Back to sign in" CTA.

**`src/app/(auth)/reset-password/page.tsx`** (new) — wrapped in `<Suspense>` (required by Next 16 for `useSearchParams`). Branches on `token`:
- No token → "Invalid or Expired Link" heading + "Request a new link" → `/forgot-password`
- Token present → new password + confirm password form with zod refinement for match, calls `authClient.resetPassword({ newPassword, token })`, then `router.push("/login")` on success.

### Phase 24 contract (verbatim — do not change)

```ts
sendResetPassword: async (
  data: { user: User; url: string; token: string },
  request?: Request
) => Promise<void>
```

Phase 24 body replacement (expected):
```ts
await resend.emails.send({
  from, to: user.email, subject,
  react: <ResetPasswordEmail url={url} name={user.name} />,
})
```

### Tests

`tests/23-06-forgot-reset-password.spec.ts` — 5/5 passed (desktop):
- `/forgot-password` renders form
- `/forgot-password` submit shows confirmation panel
- `/reset-password` no-token → "Invalid or Expired Link" + CTA
- `/reset-password?token=...` → new/confirm password form + update button
- `/forgot-password` is middleware-whitelisted (not redirected)

### Deviations

**Plan said `authClient.forgetPassword`.** Better Auth 1.5.6 exposes the client method as `requestPasswordReset` (matches the `/request-password-reset` endpoint in `node_modules/better-auth/dist/api/routes/password.mjs`). Used the correct actual method name. Server-side `sendResetPassword` contract is identical to what the plan described.
