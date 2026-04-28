---
phase: 48-launch-blocker-proof-pass
status: draft
created: 2026-04-28
source: .planning/v4.0-MILESTONE-AUDIT.md
---

# Phase 48: Launch Blocker Proof Pass

## Goal

Close the milestone audit's launch-blocker proof gaps across email, auth, checkout, and performance.

## Gaps Closed

- EMAIL-01..08 are not phase-verified; EMAIL-08 is blocked by Resend/domain DNS setup.
- AUTH-14..22, AUTH-26, AUTH-28, AUTH-29, and AUTH-32 need production-like manual smoke and env confirmation.
- Phase 23 mobile checkout was hardened for observability but not proven fixed on the original real-device path.
- PERF-03, PERF-04, and PERF-06 lack completion evidence.

## Scope

- Complete Resend domain verification and DNS records for both brands, then smoke every required transactional email.
- Smoke auth flows on both brand hosts: Google OAuth, verify email, reset password, soft gate, grandfather migration, and admin application approve/reject/request-info.
- Run mobile checkout on real iOS Safari and desktop with a Stripe test-card purchase; fix diagnosed runtime/env issues.
- Capture public cold-nav, mobile LCP, and bundle evidence. Apply small fixes needed to meet launch thresholds.

## Out Of Scope

- Blog redesign, flagship review publication, public polish, SEO, production deploy hardening, and other already-planned phases 31-46.
- New auth product features beyond proving the Phase 26 launch contract.
