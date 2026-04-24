# Phase 24: Email Delivery End-to-End — Context

**Gathered:** 2026-04-24
**Status:** Ready for planning
**Mode:** --auto (recommended defaults selected)

<domain>
## Phase Boundary

Ship the remaining email delivery pieces so every launch-blocker email flow is wired end-to-end:
- Account verification email (new)
- Password reset email (finishes 23-06 stub — body-swap only)
- Booking modification / cancellation notifications (new)
- Deliverability baseline (SPF/DKIM/DMARC documented + Resend domain verified)
- Spot-check existing flows still work (contact auto-reply, newsletter, purchase receipt, booking confirmation, booking reminder, admin contact notification)

**Explicitly NOT this phase:**
- New brand theming / redesign of existing templates (owned by Phase 26 / Phase 38 polish)
- New admin composer UX (owned by Phase 46 polish if needed)
- Custom unsubscribe page rework (already exists)
- Webhook retry / queue engineering (Resend handles retry; defer to Phase 46 if issues surface)

</domain>

<decisions>
## Implementation Decisions

### Carried forward (locked)
- **D-00 (from PROJECT.md tech stack):** Email provider is **Resend**; template engine is **React Email**. Not revisiting.
- **D-01 (from Phase 23-06):** `sendResetPassword({ user, url, token }, request) => Promise<void>` signature is LOCKED. Phase 24 replaces only the function body.
- **D-02 (EMAIL-02 req):** React Email templates required for seven flows: verification, reset, booking confirm, booking modification/cancellation, order receipt, contact auto-reply, newsletter. **Five already exist** in `src/lib/email/`: admin-contact-notification, booking-confirmation, booking-reminder, newsletter-broadcast, purchase-receipt. **Three missing:** verification, password reset, booking modification/cancellation.

### Gaps to close (what Phase 24 actually builds)
- **D-03 — New template: `password-reset.tsx`** in `src/lib/email/`. Receives `{ name, url }`. Rendered via React Email. Matches the minimalist dark aesthetic of the existing templates.
- **D-04 — New template: `account-verification.tsx`** in `src/lib/email/`. Receives `{ name, url }`. Same visual system.
- **D-05 — New template: `booking-modification.tsx`** in `src/lib/email/`. Receives `{ name, bookingId, service, oldDate, newDate | null, reason }` where `newDate: null` means cancelled (single template branches internally — avoids template sprawl).
- **D-06 — Wire `sendResetPassword` in `src/lib/auth.ts`** to use Resend + `password-reset.tsx`. Body-swap per Phase 23-06 handoff contract. No signature change.
- **D-07 — Add `emailVerification.sendVerificationEmail` callback in `src/lib/auth.ts`** following the same contract pattern (Better Auth provides the shape).
- **D-08 — Fire `booking-modification` template** from the existing booking cancel + update server actions. Integrate at the existing mutation sites; do not invent new API routes.

### Shared primitives
- **D-09 — Create `src/lib/email/_layout.tsx`** exporting a shared `<EmailLayout>` wrapper component (header logo, body slot, footer with unsubscribe + prod URL). Every new template uses this wrapper. Refactor existing 5 templates to use it in a single pass **IF the diff is trivial** — otherwise leave them and flag for Phase 38.
- **D-10 — From address per brand:** Studios emails send from `Glitch Studios <noreply@glitchstudios.io>`; Tech emails send from `GlitchTech <noreply@glitchtech.io>`. Reply-to `office@cprremodelinggroup.com` is legacy — use brand-scoped inbox `hello@glitchstudios.io` / `hello@glitchtech.io`. Concrete decision: **send all v4.0 emails from Studios brand (`noreply@glitchstudios.io`) for launch**. Brand-split is Phase 26/38.

### Deliverability (EMAIL-08)
- **D-11 — SPF/DKIM/DMARC:** Document current Resend domain verification status; add any missing DNS records. Output: a short `24-DELIVERABILITY.md` that lists Resend domain state + any DNS changes applied. Actual DNS changes happen on Cloudflare (user-driven, MCP-assisted).
- **D-12 — Do NOT roll custom DMARC reporting.** Out of scope. Document that p=none is acceptable for launch; harden later.

### Claude's Discretion
- Exact template copy (subject lines, greeting tone) — match existing Glitch tone from `booking-confirmation.tsx` and `purchase-receipt.tsx`.
- Whether to extract `<EmailButton>` / `<EmailFooter>` primitives or inline them. Start inline; extract only if duplication crosses 3 call sites.
- Preview-text (email client peek text) wording — one short sentence per template.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 23 handoff
- `.planning/phases/23-debug-broken-pages-missing-routes/23-06-SUMMARY.md` — `sendResetPassword` contract verbatim; signature is locked.
- `src/lib/auth.ts:34-50` — exact stub to body-swap (lines and contract comment already in place).

### Existing email templates (reuse visual system)
- `src/lib/email/booking-confirmation.tsx` — canonical "dark Glitch" template structure.
- `src/lib/email/purchase-receipt.tsx` — order/receipt structure.
- `src/lib/email/newsletter-broadcast.tsx` — footer/unsubscribe pattern.
- `src/lib/email/admin-contact-notification.tsx` — admin-facing email pattern.
- `src/lib/email/booking-reminder.tsx` — scheduled-send pattern (reuse the cron shape for anything new).

### Existing Resend integrations
- `src/actions/contact.ts` — public-facing form → auto-reply + admin notification.
- `src/actions/admin-inbox.ts` — admin reply flow.
- `src/actions/admin-newsletter.ts` — broadcast send.
- `src/app/api/webhooks/stripe/route.ts` — purchase receipt trigger.
- `src/app/api/cron/booking-reminders/route.ts` — scheduled reminder.

### Requirements
- `.planning/REQUIREMENTS.md` §Email Delivery (EMAIL-01..08).

### Better Auth
- `node_modules/better-auth/dist/api/routes/password.mjs` — authoritative `sendResetPassword` call signature. Do NOT deviate.
- Better Auth `emailVerification.sendVerificationEmail` option (same file) — authoritative verification hook signature.

### External (Resend / React Email)
- https://resend.com/docs/send-with-nextjs — Server Action integration pattern.
- https://react.email/docs/introduction — template authoring.
- `package.json`: `@react-email/components ^1.0.10`, `resend ^6.9.4` (already installed).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Five email templates** already written in React Email — copy their structure verbatim for the three new ones.
- **Resend client** already initialized (grep `from 'resend'` in `src/actions/*.ts`) — import the singleton, don't re-instantiate.
- **Unsubscribe URL generator** in `src/actions/newsletter.ts` (`generateUnsubscribeUrl`) — reuse for any template with unsubscribe.
- **Better Auth email-verification plugin hook** is standard (just add the callback).

### Established Patterns
- Templates are `.tsx` files that default-export a React component taking strongly-typed props. Server Actions render them via `resend.emails.send({ ..., react: <Template {...props} /> })`.
- Footer + unsubscribe live inside each template today (no shared layout). D-09 may extract this if diff stays small.

### Integration Points
- `src/lib/auth.ts` — both new auth email callbacks (reset, verify) attach here.
- `src/actions/bookings.ts` (or wherever the mutation lives) — booking-modification template fires here.
- Stripe webhook and cron routes already wire email correctly — do NOT touch them.

</code_context>

<specifics>
## Specific Ideas

- **Visual consistency over innovation.** Three new templates must be visually indistinguishable from the existing five. No new typography, no new color palette, no new layout primitives.
- **Preview in dev:** React Email's dev server (`pnpm dlx react-email dev`) can preview templates in-browser. Add a `pnpm email:preview` script if not already present.
- **Deliverability is config, not code.** Most of EMAIL-08 is Cloudflare DNS + Resend dashboard — agent uses MCPs, user pastes final verification status.

</specifics>

<deferred>
## Deferred Ideas

- **Brand-split email theming** (Studios vs GlitchTech visual variants) → Phase 38 (GlitchTech editorial polish) owns this.
- **Shared `<EmailLayout>` extraction across all 8 templates with refactor** — do only if trivial in this phase; otherwise Phase 38.
- **Transactional email analytics dashboard** — Phase 46 (deploy hardening) or separate analytics phase.
- **DMARC `p=reject` enforcement** — Phase 46 deploy hardening; p=none acceptable for launch.
- **Email localization** — not in v4.0 scope.

### Reviewed Todos (not folded)
None.

</deferred>

---

*Phase: 24-email-delivery-end-to-end*
*Context gathered: 2026-04-24 (auto mode — recommended defaults selected)*
