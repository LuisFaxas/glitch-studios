# Admin Application Smoke

Captured: 2026-04-28T09:27:45Z
Plan: 48-03 auth/OAuth/admin smoke

Browser artifact:
`.planning/phases/48-launch-blocker-proof-pass/artifacts/auth/artist-application-browser-result.json`

DB artifact:
`.planning/phases/48-launch-blocker-proof-pass/artifacts/auth/auth-db-proof.json`

## Status Lines For Plan Acceptance

- artist application submission | passed
- artist application DB row | passed
- artist application admin notification email | blocked: ADMIN_NOTIFICATION_EMAIL missing and no Resend event/inbox proof captured
- list | blocked: no production admin browser credentials supplied
- detail drawer | blocked: no production admin browser credentials supplied
- approve | blocked: no production admin browser credentials supplied
- approve creates user role artist or contributor | blocked: no production admin browser credentials supplied
- approve sets user emailVerified true | blocked: no production admin browser credentials supplied
- approve sets application status approved | blocked: no production admin browser credentials supplied
- reject | blocked: no production admin browser credentials supplied
- reject keeps applicant email silent | blocked: no production admin browser credentials supplied and no Resend no-event proof captured
- reject reviewer note internal-only | blocked: no production admin browser credentials supplied
- request more info | blocked: no production admin browser credentials supplied
- request more info sets status info_requested | blocked: no production admin browser credentials supplied
- applicant reply returns status pending | blocked: no applicant reply/manual triage path executed
- artist approval invite email | blocked: no production admin browser credentials and no Resend event/inbox proof captured
- request more info email | blocked: no production admin browser credentials and no Resend event/inbox proof captured
- approved applicant password setup | blocked: no approval invite email proof
- approved applicant sign in | blocked: no approved applicant password proof

## Public Application Proof

| flow | evidence | status | requirements |
| --- | --- | --- | --- |
| studios artist application submission | `screenshots/glitchstudios-io-artist-application-before-submit.png`, `screenshots/glitchstudios-io-artist-application-submitted.png` | passed | AUTH-14 |
| studios artist application DB row | `auth-db-proof.json` row `bdc7e1f5-feaa-4aac-b4b9-642a632a68db`, brand `studios`, status `pending` | passed | AUTH-14 |
| tech contributor application submission | `screenshots/glitchtech-io-artist-application-before-submit.png`, `screenshots/glitchtech-io-artist-application-submitted.png` | passed | AUTH-14 |
| tech contributor application DB row | `auth-db-proof.json` row `ceb5211b-d2af-4830-90cd-9aafa4aefb12`, brand `tech`, status `pending` | passed | AUTH-14 |

## Admin Workflow Proof

| flow | evidence | status | requirements |
| --- | --- | --- | --- |
| artist application admin notification email | `ADMIN_NOTIFICATION_EMAIL` missing in Vercel Production; no Resend event ID or inbox screenshot supplied | blocked: email delivery not proven | AUTH-18 |
| list | no production admin browser credentials supplied | blocked: cannot access `/admin/applications` | AUTH-14 |
| detail drawer | no production admin browser credentials supplied | blocked: cannot access `/admin/applications` detail sheet | AUTH-14 |
| approve | no production admin browser credentials supplied | blocked | AUTH-15 |
| approve creates user role artist or contributor | required assertion: role artist or contributor; no admin approval run | blocked | AUTH-15 |
| approve sets user emailVerified true | required assertion: emailVerified=true; no admin approval run | blocked | AUTH-15 |
| approve sets application status approved | required assertion: status='approved'; no admin approval run | blocked | AUTH-15 |
| reject | no production admin browser credentials supplied | blocked | AUTH-16 |
| reject keeps applicant email silent | required assertion: no applicant email event for reject; no Resend no-event proof captured | blocked | AUTH-16 |
| reject reviewer note internal-only | required assertion: internal-only reviewer note; no admin rejection run | blocked | AUTH-16 |
| request more info | no production admin browser credentials supplied | blocked | AUTH-17 |
| request more info sets status info_requested | required assertion: status='info_requested'; no admin request-info run | blocked | AUTH-17 |
| applicant reply returns status pending | required assertion: status='pending' after applicant reply/manual triage; not run | blocked | AUTH-17 |
| artist approval invite email | no admin approval run and no Resend event proof | blocked | AUTH-19 |
| request more info email | no admin request-info run and no Resend event proof | blocked | AUTH-17 |
| approved applicant password setup | no approval invite link available | blocked | AUTH-19 |
| approved applicant sign in | no approved applicant account/password proof | blocked | AUTH-19 |

AUTH-15 proof still needs an approved `user` row with role `artist` or
`contributor`, `emailVerified=true`, and application `status='approved'`.

AUTH-16 proof still needs no applicant email event for reject in Resend plus the
reviewer note visible only in an internal admin artifact.

AUTH-17 proof still needs application `status='info_requested'`, an
admin-composed email Resend event, and `status='pending'` after applicant
reply/manual triage return.

