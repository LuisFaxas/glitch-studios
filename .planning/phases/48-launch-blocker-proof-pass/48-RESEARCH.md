# Phase 48: Launch Blocker Proof Pass - Research

**Researched:** 2026-04-28  
**Domain:** Launch proof, transactional email, auth smoke, checkout, performance evidence  
**Confidence:** HIGH for planning-artifact gaps; MEDIUM for dashboard/device execution details until human checkpoints run

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

Phase 48 goal: Close the milestone audit's launch-blocker proof gaps across email, auth, checkout, and performance.

Gaps closed:

- EMAIL-01..08 are not phase-verified; EMAIL-08 is blocked by Resend/domain DNS setup.
- AUTH-14..22, AUTH-26, AUTH-28, AUTH-29, and AUTH-32 need production-like manual smoke and env confirmation.
- Phase 23 mobile checkout was hardened for observability but not proven fixed on the original real-device path.
- PERF-03, PERF-04, and PERF-06 lack completion evidence.

Scope:

- Complete Resend domain verification and DNS records for both brands, then smoke every required transactional email.
- Smoke auth flows on both brand hosts: Google OAuth, verify email, reset password, soft gate, grandfather migration, and admin application approve/reject/request-info.
- Run mobile checkout on real iOS Safari and desktop with a Stripe test-card purchase; fix diagnosed runtime/env issues.
- Capture public cold-nav, mobile LCP, and bundle evidence. Apply small fixes needed to meet launch thresholds.

Out of scope:

- Blog redesign, flagship review publication, public polish, SEO, production deploy hardening, and other already-planned phases 31-46.
- New auth product features beyond proving the Phase 26 launch contract.

### Claude's Discretion

No separate `## Claude's Discretion` section exists in `48-CONTEXT.md`.

### Deferred Ideas (OUT OF SCOPE)

No separate `## Deferred Ideas` section exists in `48-CONTEXT.md`; use the Out of Scope list above.
</user_constraints>

## Project Constraints

- `CLAUDE.md` says Praxis is the primary orchestration layer, but current `.planning/STATE.md` is newer and identifies Phase 48 as current focus; treat GSD Phase 48 artifacts as authoritative for this phase.
- Work involving production bugs, browser/performance, deployment, auth, cart/payment, and data must use explicit plans/checkpoints.
- Do not run heavy builds in parallel. If a production build is needed for bundle evidence, run exactly one `pnpm build` at a time.
- Preserve the ranking-filter safety rule: do not reintroduce synchronous React state updates inside native input/focus/visibility event paths on `/tech/rankings/laptops`.
- `.planning/config.json` has `workflow.nyquist_validation: false`; no Nyquist validation section is required.

## Summary

Phase 48 is proof-first. Planning should not assume Resend, Cloudflare, Vercel, Google OAuth, Stripe checkout, real iOS Safari, or production inbox access can be completed autonomously. The right plan shape is: autonomous baseline and small code/config sanity checks first, then human checkpoints for dashboards and real-device flows, then diagnosis-driven fixes, then final evidence rollup.

Existing planning artifacts show implementation progress but not launch proof. Phase 24 wired core email callbacks/templates but left DNS/domain verification open. Phase 26 shipped auth/admin queue code and a verification checklist but left Google OAuth, env vars, production smoke, and manual matrix incomplete. Phase 23 hardened checkout errors but did not prove mobile purchase on the original real iOS path. Phase 25 closed PERF-01/02/05/07 but lacks PERF-03/04/06 evidence.

**Primary recommendation:** Create four dependent proof tracks: Email/domain first, auth/admin invite second, checkout third, performance last/parallel after preview deploy, with explicit `autonomous: false` checkpoints wherever external dashboards, credentials, or real devices are required.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EMAIL-01..08 | Resend SDK, React Email templates, reset/booking/order/newsletter/contact sends, deliverability | Phase 24 code-path summaries exist; Phase 24 verification keeps DNS and real delivery open. |
| PERF-01..07 | Admin latency, cold-nav TTFB, mobile LCP, image/bundle/query audits | Phase 25 verification marks PERF-01/02/05/07 passed and PERF-03/04/06 open. |
| AUTH-14..22 | Admin applications, approve/reject/info, invite/admin notifications, social provider setup | Phase 26 summaries say code exists; Phase 26 verification leaves production/manual smoke open. |
| AUTH-26 | Email-verification soft gate | Phase 26 code shipped, but launch smoke must prove both brand hosts and allowed exceptions. |
| AUTH-28 | Grandfather migration | Phase 26 migration exists; Phase 48 must prove it ran against production/staging DB. |
| AUTH-29 | Branded forgot/reset end-to-end | Phase 26 UI exists; actual email delivery and token reset smoke depend on Resend/DNS. |
| AUTH-32 | `tsc`, lint, and both-brand auth/Google manual pass | Existing Phase 26 checklist is incomplete; Phase 48 must capture command output and human smoke evidence. |
</phase_requirements>

## Known Evidence And Gaps

### Email

| Area | Known Evidence | Remaining Proof Gap | Confidence |
|------|----------------|---------------------|------------|
| Auth reset + verify | `24-01-SUMMARY.md` says Better Auth callbacks send via Resend templates. | Real inbox delivery, link click, reset/login, verification success. | HIGH |
| Booking modification/cancel | `24-02-SUMMARY.md` says helper and routes are wired. | Real email delivery from a booking mutation path. | HIGH |
| Booking confirmation/order receipt/newsletter/contact | Phase 24 context says templates/integrations existed before Phase 24. | Smoke each launch-required send and record Resend + inbox proof. | MEDIUM |
| Deliverability | `24-VERIFICATION.md` says both domains had zero SPF/DKIM/DMARC/MX. | Add Resend domains, exact DNS records, Resend verified status, DMARC documented. | HIGH |

### Auth

| Area | Known Evidence | Remaining Proof Gap | Confidence |
|------|----------------|---------------------|------------|
| Admin applications UI/actions | `26-10/11-SUMMARY.md` say approve/reject/request-info actions and page exist. | Manual smoke of list/detail/actions plus email delivery for invite/info. | HIGH |
| Google OAuth | `26-04-SUMMARY.md` says Better Auth social providers are env-gated. | Vercel env vars, Google authorized redirects, both-brand sign-in. | HIGH |
| Soft gate | `26-09-SUMMARY.md` says `(public)` and `admin` layouts are guarded. | Production-like smoke for unverified user behavior and exceptions. | MEDIUM |
| Grandfather migration | `26-03-SUMMARY.md` says idempotent migration/runner exists. | DB evidence that migration ran in target environment. | HIGH |
| Final auth gate | `26-VERIFICATION.md` leaves manual smoke, env vars, migration, and user sign-off unchecked. | Complete matrix or equivalent proof artifacts. | HIGH |

### Checkout

| Area | Known Evidence | Remaining Proof Gap | Confidence |
|------|----------------|---------------------|------------|
| Route hardening | `23-05-SUMMARY.md` says `/api/checkout` returns structured errors and `/checkout` surfaces messages. | Real iOS Safari and desktop test-card purchase through deployed preview/prod. | HIGH |
| Runtime diagnosis | `23-05-DIAGNOSIS.md` defines required Vercel logs/env inventory. | User/device reproduction and Stripe/Vercel evidence. | HIGH |

### Performance

| Area | Known Evidence | Remaining Proof Gap | Confidence |
|------|----------------|---------------------|------------|
| PERF-01/02 | `25-01-SUMMARY.md` measured admin nav perceived transitions under target. | Preserve as passed; rerun only if touched. | HIGH |
| PERF-05 | `25-03-SUMMARY.md` says zero native `<img>` tags in `src/`. | Preserve as passed; rerun grep/test. | HIGH |
| PERF-07 | `25-02-SUMMARY.md` says index migration exists. | Confirm applied where launch proof is collected if DB performance is cited. | MEDIUM |
| PERF-03/04/06 | `25-VERIFICATION.md` marks these `gaps_found`. | Vercel cold-nav p95, mobile LCP, bundle audit output. | HIGH |

## Human Checkpoints Vs Autonomous Checks

| Track | Autonomous | Human / Dashboard / Device Checkpoint |
|-------|------------|----------------------------------------|
| Email DNS | Run `dig`, inspect env names, prepare checklist/artifact files. | Add domains in Resend; paste exact Resend-generated DNS records into Cloudflare; click Verify; provide screenshots/status. |
| Email smoke | Trigger local/preview API/UI flows where credentials exist; collect Vercel logs. | Confirm inbox delivery and Resend dashboard events for reset/verify/booking/order/contact/newsletter. |
| Google OAuth | Verify code/env checklist and redirect URI list. | Configure Google Console, Vercel env vars, and complete both-brand OAuth sign-in. |
| Admin invite | Run DB/migration checks if `DATABASE_URL` is available; smoke UI if admin creds are available. | Use admin credentials, applicant mailbox, and Resend dashboard to prove invite/info email delivery. |
| Checkout | Run existing route-hardening Playwright tests and env checklist. | Real iOS Safari and desktop Stripe test-card purchase; Vercel logs; Stripe dashboard payment/session proof. |
| Performance | Run no-build checks and a single local production build/bundle audit if needed. | Vercel Speed Insights / production-preview RUM, Lighthouse mobile on deployed URL, screenshots/exports. |

## Recommended Plan Decomposition

### 48-01: Baseline Evidence Inventory And Artifact Scaffold

**Autonomous:** yes.  
**Depends on:** none.  
**Purpose:** Create `artifacts/` directories, rerun artifact-only checks, and record the current state before human dashboards change.

Collect:

- `artifacts/baseline/vercel-env-ls.txt` from `vercel env ls`
- `artifacts/email/dns-before.txt` from the `dig` command below
- `artifacts/baseline/phase-carry-forward.md` summarizing Phase 23/24/25/26/47 gaps
- `artifacts/baseline/tsc-before.txt` from `pnpm tsc --noEmit`
- `artifacts/baseline/lint-before.txt` from `pnpm lint` or scoped lint notes if project-wide lint has pre-existing noise

### 48-02: Resend Domains And Transactional Email Proof

**Autonomous:** false.  
**Depends on:** 48-01.  
**Purpose:** Close EMAIL-08 first because auth reset/verify and invite proof depend on deliverability.

Human checkpoint:

- Add `glitchstudios.io` and `glitchtech.io` in Resend.
- Copy exact Resend dashboard DNS values into Cloudflare. Do not use guessed/stale values.
- Add/document DMARC (`p=none` acceptable for launch baseline).
- Capture Resend verified screenshots for both domains.

Then smoke:

- Password reset email and link.
- Verification email and link.
- Booking confirmation/modification/cancellation email where feasible.
- Order receipt from Stripe webhook purchase.
- Contact submission/admin notification.
- Newsletter compose/send and unsubscribe token.

### 48-03: Auth And Admin Application Launch Smoke

**Autonomous:** partially; production OAuth/manual smoke is human.  
**Depends on:** 48-02 for email-dependent flows.  
**Purpose:** Close AUTH-14..22, AUTH-26, AUTH-28, AUTH-29, AUTH-32.

Required checkpoints:

- Vercel env confirms `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_NOTIFICATION_EMAIL`, `RESEND_API_KEY`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`.
- Google OAuth Console has exact redirect URIs for both brands.
- `pnpm db:migrate:phase26` has run against the target DB or SQL evidence proves the meta row exists.
- Manual smoke: both brand hosts x auth surfaces x Google sign-in.
- Admin application list/detail approve/reject/request-info; invite email; applicant sets password and signs in.

### 48-04: Mobile Checkout Purchase Proof

**Autonomous:** false for core proof; autonomous checks can prepare diagnostics.  
**Depends on:** 48-01 and deployed preview/prod URL.  
**Purpose:** Close the Phase 23 mobile checkout carry-forward.

Required checkpoint:

- Real iOS Safari purchase and desktop purchase using Stripe test card.
- Capture user-facing result, Vercel `[checkout]` logs, Stripe test payment/session, and app order/receipt evidence.
- If failure occurs, apply only diagnosis-driven code/env fixes, then rerun the same proof path.

### 48-05: PERF-03/04/06 Evidence And Small Fixes

**Autonomous:** partially.  
**Depends on:** deployed preview/prod URL; can run after 48-01 and in parallel with manual email/auth waits.  
**Purpose:** Capture public cold-nav p95, mobile LCP, and bundle audit. Apply small threshold fixes only.

Required evidence:

- Vercel Speed Insights / metrics for p95 route performance.
- Lighthouse mobile output for `/` and `/tech` with LCP under 2.5s.
- Bundle output showing no non-route-critical client bundle over 200 KB gzipped, or documented rationale/fix.

### 48-06: Final Rollup And Requirement State

**Autonomous:** yes after checkpoints complete.  
**Depends on:** 48-02 through 48-05.  
**Purpose:** Produce `48-VERIFICATION.md`, update requirement checkboxes only where proof exists, and avoid false-green rows for unavailable dashboard/device proof.

## Exact Proof Artifacts, Commands, Env Vars

### Artifact Paths

Use these paths so final verification can grep them:

```text
.planning/phases/48-launch-blocker-proof-pass/artifacts/baseline/
.planning/phases/48-launch-blocker-proof-pass/artifacts/email/
.planning/phases/48-launch-blocker-proof-pass/artifacts/auth/
.planning/phases/48-launch-blocker-proof-pass/artifacts/checkout/
.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/
```

### DNS And Resend

```bash
for DOMAIN in glitchstudios.io glitchtech.io; do
  echo "=== $DOMAIN ==="
  dig +short TXT "$DOMAIN" | grep -i spf || true
  dig +short CNAME "resend._domainkey.$DOMAIN" || true
  dig +short CNAME "resend2._domainkey.$DOMAIN" || true
  dig +short CNAME "resend3._domainkey.$DOMAIN" || true
  dig +short TXT "_dmarc.$DOMAIN" || true
done
```

Collect:

- `email/dns-before.txt` and `email/dns-after.txt`
- Resend dashboard screenshots showing both domains verified
- Cloudflare DNS screenshots or exported record list
- Resend event screenshots/log IDs for each smoke email

Relevant env vars:

- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_NOTIFICATION_EMAIL`
- `NEXT_PUBLIC_SITE_URL`
- `BETTER_AUTH_URL`

### Auth/OAuth

Commands:

```bash
pnpm tsc --noEmit
pnpm lint
pnpm db:migrate:phase26
```

Production/staging SQL evidence:

```sql
SELECT * FROM phase26_migration_meta WHERE key = 'grandfather_email_verified';
SELECT COUNT(*) FROM "user" WHERE "emailVerified" IS NOT TRUE;
SELECT to_regclass('public.artist_applications');
```

Google redirect URIs to verify exactly:

```text
https://glitchstudios.io/api/auth/callback/google
https://www.glitchstudios.io/api/auth/callback/google
https://glitchtech.io/api/auth/callback/google
https://www.glitchtech.io/api/auth/callback/google
```

Optional local redirect if used:

```text
http://localhost:3004/api/auth/callback/google
```

Relevant env vars:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `META_CLIENT_ID`
- `META_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `ADMIN_NOTIFICATION_EMAIL`
- `RESEND_API_KEY`

Collect:

- `auth/vercel-env-oauth.txt` with encrypted presence only, no secret values
- `auth/google-console-redirects.png`
- `auth/studios-google-smoke.md`
- `auth/tech-google-smoke.md`
- `auth/admin-applications-smoke.md`
- `auth/grandfather-migration-sql.txt`
- `auth/tsc.txt` and `auth/lint.txt`

### Checkout

Autonomous prep:

```bash
pnpm exec playwright test tests/23-05-checkout-route-hardening.spec.ts --project=desktop
```

Human smoke:

- Use Stripe test card `4242 4242 4242 4242`, future expiry, any 3-digit CVC.
- Run once on real iOS Safari on the original failing path.
- Run once on desktop.

Relevant env vars:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Collect:

- `checkout/route-hardening-playwright.txt`
- `checkout/ios-safari-purchase.md`
- `checkout/desktop-purchase.md`
- `checkout/vercel-checkout-logs.txt` filtered for `[checkout]`
- Stripe dashboard screenshots/session IDs in test mode
- Order/receipt evidence if webhook creates app records

### Performance

Commands:

```bash
pnpm exec playwright test tests/25-03-image-pipeline.spec.ts --project=desktop
pnpm build
```

If Lighthouse is installed or run via `npx`:

```bash
npx lighthouse https://glitchstudios.io/ \
  --preset=perf \
  --form-factor=mobile \
  --output=json \
  --output-path=.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/lighthouse-home-mobile.json

npx lighthouse https://glitchtech.io/ \
  --preset=perf \
  --form-factor=mobile \
  --output=json \
  --output-path=.planning/phases/48-launch-blocker-proof-pass/artifacts/perf/lighthouse-tech-mobile.json
```

Collect:

- `perf/vercel-speed-insights-home.png`
- `perf/vercel-speed-insights-tech.png`
- `perf/lighthouse-home-mobile.json`
- `perf/lighthouse-tech-mobile.json`
- `perf/build-output.txt`
- `perf/bundle-audit.md`

Thresholds:

- PERF-03: public route cold-nav p95 TTFB < 1.5s on Vercel.
- PERF-04: mobile LCP on `/` and `/tech` < 2.5s.
- PERF-06: no client-only bundle > 200 KB gzipped unless route-critical and documented.

## Environment Availability

| Dependency | Required By | Available | Version / Status | Fallback |
|------------|-------------|-----------|------------------|----------|
| Node | all local commands | yes | v24.12.0 | none |
| pnpm | package/test scripts | yes | 10.19.0 | npm only for ad hoc `npm view` |
| Vercel CLI | env/deploy/log evidence | yes | 50.32.5, authenticated during research | Vercel dashboard screenshots |
| `dig` | DNS proof | yes | DiG 9.18.39 | Cloudflare DNS dashboard |
| Chrome | Lighthouse/Playwright | yes | Chrome 146 / Chrome for Testing 145 | Vercel Speed Insights |
| Lighthouse CLI | LCP lab run | no global binary found | use `npx lighthouse` | Chrome DevTools Lighthouse UI |
| Stripe CLI | optional Stripe diagnostics | yes | 1.38.3 | Stripe dashboard |
| `psql` | SQL evidence | not found | use app migration runner / Neon dashboard | Neon SQL editor |
| Real iOS Safari | checkout proof | no | human checkpoint | none |

## Common Pitfalls

### False-Greening Dashboard Work

**What goes wrong:** A plan marks EMAIL/AUTH/CHECKOUT passed after code checks only.  
**Avoid:** Make Resend, Cloudflare, Google, Vercel, Stripe dashboard, and real-device rows explicit `autonomous: false` checkpoints.

### DNS Values Guessed Instead Of Dashboard-Generated

**What goes wrong:** SPF/DKIM records use stale examples and Resend verification fails.  
**Avoid:** Use exact values generated per domain in Resend.

### OAuth Redirect Mismatch

**What goes wrong:** Google sign-in fails because scheme, host, case, or slash differs.  
**Avoid:** Compare Google Console authorized redirect URIs byte-for-byte against Better Auth callback URLs.

### Email Provider Success Is Not Inbox Proof

**What goes wrong:** API returns 200 while deliverability is still broken.  
**Avoid:** Require Resend event and real inbox screenshot/log for each launch-required email.

### Local Performance Numbers Treated As Launch Evidence

**What goes wrong:** Dev/Turbopack timings are used for Vercel requirements.  
**Avoid:** PERF-03 and PERF-04 need deployed preview/prod evidence; local tests only catch regressions.

### Heavy Build Contention

**What goes wrong:** Parallel agents run `pnpm build` and exhaust CodeBox resources.  
**Avoid:** One bundle/build plan owns the build; other plans consume its artifact.

## External Sources

Primary/current docs supplied by orchestrator:

- Resend domain verification: https://resend.com/docs/dashboard/domains/introduction
- Resend domain troubleshooting: https://resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying
- Resend DMARC: https://resend.com/docs/dashboard/domains/dmarc
- Google OAuth web app redirects: https://developers.google.com/identity/protocols/oauth2/web-server
- Better Auth Google provider: https://www.better-auth.com/docs/authentication/google
- Better Auth options: https://better-auth.com/docs/reference/options
- Stripe test cards: https://docs.stripe.com/testing
- Vercel Speed Insights: https://vercel.com/docs/speed-insights
- Vercel Speed Insights metrics: https://vercel.com/docs/speed-insights/metrics
- Chrome Lighthouse LCP: https://developer.chrome.com/docs/lighthouse/performance/lighthouse-largest-contentful-paint

## Open Questions For Planning

1. Which deployed URL is the proof target for Phase 48: latest Vercel preview, production `glitchstudios.io`/`glitchtech.io`, or both?
2. Who will perform the Resend/Cloudflare/Google/Vercel dashboard steps, and how should screenshots be handed back?
3. Which inboxes can receive proof emails for reset, verification, artist invite, newsletter, order receipt, and contact/admin notifications?
4. Is the real iOS Safari device available during execution, and is it the original failing path from Phase 23?
5. Should small code fixes found during smoke be folded into Phase 48 immediately, or should failures produce follow-up gap plans?

## Metadata

**Confidence breakdown:**

- Known planning gaps: HIGH - derived from Phase 23/24/25/26/47 verification artifacts and milestone audit.
- Human checkpoint boundaries: HIGH - external dashboards/devices are explicitly required by the phase description and prior summaries.
- Exact runtime success criteria: MEDIUM - depends on current dashboard state, target deployment, and user-controlled credentials.

**Research date:** 2026-04-28  
**Valid until:** 2026-05-05 for dashboard/env state; 2026-05-28 for plan structure
