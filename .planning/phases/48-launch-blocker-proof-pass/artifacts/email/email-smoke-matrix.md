# Transactional Email Smoke Matrix

Captured: 2026-04-28T11:36:37Z
Plan: 48-10 single-domain email smoke

The app is configured for single-domain testing through
`Glitch Studios <noreply@glitchtech.io>`. These rows stay blocked until a real
send, Resend event/log proof, inbox proof, and link/content proof are captured.

## Proof Boundary

No row was changed to `passed` in Plan 48-10. Resend dashboard evidence and
recipient/admin inbox evidence are human-only proof surfaces that were not
available from local context. The current matrix therefore records the exact
blocked state for each launch email path instead of inventing proof.

| flow | trigger | recipient | resend_event_or_screenshot | inbox_result | content_assertions | link_result | status | requirements |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| password reset | `/forgot-password` | user inbox | blocked: no Resend event/log or screenshot available from local context | blocked: recipient inbox delivery not captured | reset email content and reset link required | blocked: reset link click, password reset, and successful login not proven | blocked: awaiting Resend dashboard and inbox proof | EMAIL-02, EMAIL-03, AUTH-29 |
| account verification | register customer flow | user inbox | blocked: no Resend event/log or screenshot available from local context | blocked: recipient inbox delivery not captured | verification email content and verification link required | blocked: verification link click and verified state not proven | blocked: awaiting Resend dashboard and inbox proof | EMAIL-02 |
| booking confirmation | booking create/confirmation flow | booking guest/customer | blocked: booking transaction inbox proof not captured | blocked | booking ID, service, date/time, deposit amount, cancellation policy | blocked: booking link not proven | blocked: awaiting booking smoke | EMAIL-04 |
| booking modification | reschedule flow | booking guest/customer | blocked: booking mutation inbox proof not captured | blocked | booking ID, old date/time, new date/time, cancellation policy | blocked: booking link not proven | blocked: awaiting booking smoke | EMAIL-04 |
| booking cancellation | cancellation flow | booking guest/customer | blocked: booking cancellation inbox proof not captured | blocked | booking ID, cancelled date/time, refund/deposit language, cancellation policy | blocked: booking link not proven | blocked: awaiting booking smoke | EMAIL-04 |
| order receipt | Stripe checkout webhook | purchaser inbox | blocked: completed payment webhook/inbox proof not captured | blocked | items, license tier per beat, total, download links | blocked: download links not proven | blocked: awaiting checkout purchase proof | EMAIL-05 |
| contact auto-reply | `/contact` submission | submitter inbox | blocked: no Resend event/log or screenshot available from local context | blocked: submitter inbox delivery not captured | auto-reply body and brand sender required | link_result: not_applicable | blocked: awaiting contact auto-reply smoke | EMAIL-02 |
| admin contact notification | `/contact` submission | admin notification inbox | blocked: no Resend event/log or screenshot available from local context | blocked: admin notification inbox delivery not captured | submitted name, email, subject, message, admin link if present | blocked: admin link not proven | blocked: awaiting admin contact notification smoke | EMAIL-07 |
| newsletter broadcast | admin newsletter compose/send | test subscriber | blocked: no Resend event/log or screenshot available from local context | blocked: subscriber inbox delivery not captured | newsletter body content and unsubscribe link | blocked: unsubscribe token not proven | blocked: awaiting newsletter broadcast smoke | EMAIL-06 |
| newsletter unsubscribe | unsubscribe token link | test subscriber | blocked: no Resend event/log or screenshot available from local context | blocked: unsubscribe confirmation or subscriber inactive state not captured | unsubscribe token and confirmation state required | blocked: subscriber inactive state not proven | blocked: awaiting newsletter unsubscribe proof | EMAIL-06 |
| artist approval invite | admin application approve flow | artist applicant | blocked: approval invite inbox proof not captured | blocked | invite copy and password setup link required | blocked: invite link not proven | blocked: awaiting admin application smoke | AUTH-18, AUTH-19 |
| request more info | admin application request-info flow | artist applicant | blocked: request-info inbox proof not captured | blocked | admin-composed request content required | blocked: reply/status return not proven | blocked: awaiting admin application smoke | AUTH-18, AUTH-19 |

## Requirement Impact

- EMAIL-08 is partially unblocked for `glitchtech.io` testing only.
- EMAIL-01 through EMAIL-07 are code-wired from Phase 24 but not launch-passed
  here because real inbox and Resend event proof are still missing.
- Contact auto-reply is tracked as EMAIL-02 template/content proof; admin contact
  notification is tracked as EMAIL-07; newsletter send/unsubscribe are tracked
  as EMAIL-06.
- AUTH-18, AUTH-19, and AUTH-29 remain blocked until the dependent auth/email
  smoke rows pass.
