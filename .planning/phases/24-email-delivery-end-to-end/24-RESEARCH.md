# Phase 24: Email Delivery End-to-End — Research

**Date:** 2026-04-24
**Mode:** Inline research (CONTEXT.md decisions are already locked; stack is pre-decided)

## Stack (locked)

- **Provider:** Resend `^6.9.4` (installed)
- **Templates:** `@react-email/components` `^1.0.10` (installed)
- **Auth hooks:** Better Auth `emailAndPassword.sendResetPassword` + `emailVerification.sendVerificationEmail`

## Existing template inventory

Five templates in `src/lib/email/`:
1. `admin-contact-notification.tsx`
2. `booking-confirmation.tsx`
3. `booking-reminder.tsx`
4. `newsletter-broadcast.tsx`
5. `purchase-receipt.tsx`

Inspection (done during phase 24 context scout): templates follow a consistent dark Glitch aesthetic, inline styles, no shared layout component. React Email `Container`, `Heading`, `Text`, `Button`, `Hr`, `Link` primitives used. Footer + unsubscribe vary per template.

## Gaps to fill (from CONTEXT.md)

| ID | Artifact | Where it's wired |
|----|----------|------------------|
| D-03 | `password-reset.tsx` | `src/lib/auth.ts` `sendResetPassword` body (replace stub) |
| D-04 | `account-verification.tsx` | `src/lib/auth.ts` `emailVerification.sendVerificationEmail` (new) |
| D-05 | `booking-modification.tsx` | `src/actions/bookings.ts` on update/cancel mutations |
| D-09 (maybe) | `_layout.tsx` shared primitive | Used by the three new templates; refactor existing five only if trivial |
| D-11 | `24-DELIVERABILITY.md` | Documentation of Resend domain + DNS records |

## Reference implementations

### `sendResetPassword` body pattern (Resend + React Email)

Per Better Auth docs + Resend Next.js integration guide:

```ts
import { Resend } from "resend"
import { PasswordResetEmail } from "@/lib/email/password-reset"

const resend = new Resend(process.env.RESEND_API_KEY)

sendResetPassword: async ({ user, url }) => {
  const { error } = await resend.emails.send({
    from: "Glitch Studios <noreply@glitchstudios.io>",
    to: user.email,
    subject: "Reset your Glitch Studios password",
    react: <PasswordResetEmail name={user.name} url={url} />,
  })
  if (error) {
    console.error("[email:reset] Resend failed:", error)
    // Do NOT throw — Better Auth runs this in background; throwing swallows the error anyway.
    // Logging surfaces the failure in Vercel logs where we can act on it.
  }
}
```

### Domain verification (Resend)

Resend requires SPF + DKIM at minimum:
- SPF TXT on root: `v=spf1 include:amazonses.com ~all` (Resend uses AWS SES infra)
- Actually Resend's recommended pattern uses `include:_spf.resend.com` — check current Resend dashboard for exact values (the dashboard generates per-domain TXT/CNAME records).
- DKIM: three CNAME records (`resend._domainkey`, `resend2._domainkey`, `resend3._domainkey`) pointing to Resend's signing keys.
- DMARC (optional for v4.0 launch): TXT `_dmarc` with `v=DMARC1; p=none; rua=mailto:admin@glitchstudios.io` — monitoring only.

Cloudflare MCP can read current DNS state; user authorizes any additions.

### React Email shared layout pattern

```tsx
// src/lib/email/_layout.tsx
export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#000", color: "#f5f5f0", fontFamily: "monospace" }}>
        <Container>
          <Section>
            {/* Header logo */}
          </Section>
          <Section>{children}</Section>
          <Section>{/* Footer */}</Section>
        </Container>
      </Body>
    </Html>
  )
}
```

## Open questions (resolved inline)

- **Should booking-modification cover both modification AND cancellation?** Yes — single template branches on `newDate === null`. Avoids template sprawl.
- **Preview-text for each template?** One short sentence per template based on subject.
- **Brand-split emails?** No — all v4.0 emails send from Studios brand per CONTEXT.md D-10. Phase 38 owns brand-split.

## Plan structure

Four wave-1 plans (all autonomous, parallel-safe except 24-04 which depends on user DNS action):

1. **24-01** — Ship `password-reset.tsx` + `account-verification.tsx` templates + body-swap both auth callbacks
2. **24-02** — Ship `booking-modification.tsx` template + wire into booking update/cancel server actions
3. **24-03** — Optional shared `_layout.tsx` extraction (gate: only if diff across 3 new templates is < 20 LoC per template)
4. **24-04** — Deliverability doc: inventory Resend domain state via MCP + document current Cloudflare DNS; flag any missing records for user action
