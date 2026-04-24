# Phase 23-05 Diagnosis — Mobile Checkout

## Status: Hardening complete — prod root-cause verification BLOCKED on user action

The checkout route is now observable: any failure returns a structured `{ error, code }` JSON envelope, and the client surfaces the message instead of showing an infinite spinner. This unblocks diagnosis of the actual prod failure — but the prod failure reproduction itself requires a Vercel preview deploy + a real iOS Safari device, neither of which the agent can drive directly.

## What's been done (Task 1 — agent-autonomous)

### `src/app/api/checkout/route.ts`
- Wrapped the whole handler in try/catch.
- Validates request body — 400 on invalid JSON.
- 400 + `{ error: "Cart is empty" }` on empty items array.
- Env validation — names missing vars in a structured 500 response and `console.error`s `[checkout] missing env vars: [...]` so Vercel logs surface them directly.
- All Stripe SDK failures produce structured `{ error, code }` 500 responses instead of HTML 500 pages.

### `src/app/(public)/checkout/page.tsx`
- `fetchClientSecret` now checks `response.ok` and throws a readable error — Stripe's built-in UI surfaces it.
- No-clientSecret response also throws.
- Empty-cart fallback renders a Browse Beats call-to-action instead of invoking `EmbeddedCheckoutProvider` with empty items.

### Tests
`tests/23-05-checkout-route-hardening.spec.ts` — 4/4 passed on desktop:
- empty cart → 400 + cart-is-empty error
- missing items body → 400 + error envelope
- invalid JSON body → 400 + error envelope
- client /checkout page with empty cart shows Browse Beats CTA

## What's blocked (Tasks 2-4 — user action required)

Per D-11, D-19, and plan Tasks 2-4, the prod root-cause identification and real-device verification require user-driven steps that the agent cannot execute:

1. **Deploy Vercel preview** — `vercel` CLI must be invoked by the user.
2. **Reproduce on real iOS Safari** — the agent has no physical device.
3. **Pull Vercel runtime logs** — requires Vercel dashboard access.
4. **Env-var inventory in Production** — requires Vercel dashboard access.
5. **Complete test-card purchase** — requires both real mobile AND real desktop.

### Checkpoint — awaiting user

Please append findings here following this structure:

```markdown
## Reproduction
- Device:
- URL:
- Steps:

## Vercel log (latest [checkout] entry)
```
{paste log line}
```

## Env inventory (Production)
- STRIPE_SECRET_KEY: {present? prefix?}
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {present? prefix?}
- NEXT_PUBLIC_SITE_URL: {present? value?}

## Root cause:
{one sentence}

## Fix plan
{code change OR Vercel env change, one sentence}

## Fix applied
{what changed, when}

## Verification
- Mobile test purchase:
- Desktop test purchase:
```

Once the user fills this in, Task 3 (apply the targeted fix) and Task 4 (real-device verification) can proceed.
