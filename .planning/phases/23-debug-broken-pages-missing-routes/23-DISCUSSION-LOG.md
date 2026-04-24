# Phase 23: Debug Broken Pages & Missing Routes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 23-debug-broken-pages-missing-routes
**Mode:** `--auto` (gray areas auto-resolved to recommended defaults)
**Areas discussed:** Scope boundary, Forgot/reset scope, /about link treatment, Mobile nav root-cause strategy, Verification policy, Parallelization, Admin 500/404 debug policy

---

## Note on init

`gsd-tools init phase-op 23` returned `phase_found: false` because Phase 23 has a Phases checklist entry in ROADMAP.md (line 31) but no `## Phase Details` section yet (only Phase 22 was written as v4.0 detail). Workflow proceeded with direct ROADMAP + 22-AUDIT scope read since phase intent is unambiguous and auto mode is active.

---

## Area 1: Scope boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Fix all 9 bugs as one phase | Bundle per ROADMAP/audit. Independent files, launch-blocker urgency. | ✓ |
| Split per surface (admin / auth / checkout / nav) | Finer granularity, separate phases | |
| Fix top-3 only, defer the rest to 23.x | Minimize scope creep risk | |

**Auto-selected:** Fix all 9 bugs in one phase.
**Reason:** ROADMAP explicitly bundles these as one launch-blocker phase; bugs are small and independent; splitting adds planning overhead without any benefit.

---

## Area 2: Forgot/reset page depth

| Option | Description | Selected |
|--------|-------------|----------|
| Functional route scaffold + minimal brand-compliant UI + stub server action | Phase 23 ships structure; Phase 24 wires email; Phase 26 redesigns UI | ✓ |
| Full brand-aware redesign now | Collapse Phase 26 auth-UI work into Phase 23 | |
| Dummy page that just says "coming soon" | Defer everything to a later phase | |

**Auto-selected:** Functional scaffold + minimal UI + stub action.
**Reason:** Keeps Phase 23 in launch-blocker scope while unblocking Phase 24 (Email) and leaving Phase 26 (Auth redesign) clean. Better Auth primitives are reusable — stub handoff is a config swap, not a rewrite.

---

## Area 3: `/about` dead link treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Remove the dead link | No stub page, no churn — Phase 44 builds /about properly with Glitchy | ✓ |
| Stub a minimal /about page | Fills the link target now | |
| Redirect /about → /contact or / | One-line Next config; temporary | |

**Auto-selected:** Remove the dead link.
**Reason:** Phase 44 explicitly scopes `/about` for Glitchy's introduction page. Stubbing now creates a throwaway page that Phase 44 would replace. Removing the link is the minimal, non-regretted fix.

---

## Area 4: Mobile nav double-tap fix strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Root-cause fix at shared handler, verified on 4+ surfaces | Systemic — fix once | ✓ |
| Per-surface fix (3 patches) | Narrow blast radius per PR | |
| Workaround: force-reflow on nav component mount | Cover symptom while investigating | |

**Auto-selected:** Root-cause fix at shared handler.
**Reason:** Audit confirmed 3 instances — it's a pattern, not 3 unrelated bugs. Fixing once at the shared nav layer is cheaper and prevents regression in any future nav component.

---

## Area 5: Verification policy

| Option | Description | Selected |
|--------|-------------|----------|
| Playwright reproduction + fix assertion per bug | User-preferred pattern; AI verifies visual output | ✓ |
| Manual verification only | Faster per bug, but unverifiable | |
| Unit tests where applicable, nothing else | Weakest coverage | |

**Auto-selected:** Playwright per bug (with planner-specified alternative for real-mobile Stripe).
**Reason:** User memory note explicitly prefers Playwright verification during dev. Mobile checkout is an exception — planner can specify real-device manual verification on HTTPS prod.

---

## Area 6: Execution parallelization

| Option | Description | Selected |
|--------|-------------|----------|
| Parallel waves — bugs touch independent files | Fastest throughput; executor batches | ✓ |
| Strict sequential | Lowest coordination cost, slowest | |
| One-bug-at-a-time with verify-between | Safest; slow | |

**Auto-selected:** Parallel waves with serialization on any shared file.
**Reason:** Bug surfaces are independent (admin pages, auth routes, checkout API, mobile nav component). Executor's existing wave protocol handles this; planner emits parallel-safe tasks.

---

## Area 7: Admin 500s and 404 debug policy

| Option | Description | Selected |
|--------|-------------|----------|
| Read Vercel runtime logs first, then hypothesize | Ground-truth-first; avoids guess-driven patches | ✓ |
| Reproduce locally first | Works for most bugs but may miss prod-only issues | |
| Add error-boundary UI around failing pages | Masks bug, doesn't fix | |

**Auto-selected:** Vercel logs first, local reproduction second.
**Reason:** Audit §C.4 already demonstrated that local-only testing masks prod-specific failures (6 auth bugs escaped v2.0). Prod-parity lesson applies to Phase 23.

---

## Claude's Discretion

- Exact Playwright harness structure (reuse existing if one exists)
- Route directory for forgot/reset (match existing `src/app/(auth)/login` pattern)
- Microcopy on minimal forgot/reset UI (Phase 26 rewrites)
- Specific mobile-nav hook location once research identifies root cause

## Deferred Ideas

- Admin floating cart visible on `/admin/*` → Phase 40 or polish backlog
- Admin mobile responsiveness → Phase 37
- Brand-aware auth UI → Phase 26
- Resend wiring → Phase 24
- `/about` page content (Glitchy) → Phase 44
- Missing Methodology nav link → Phase 38
- Per-surface admin overhauls → Phases 31, 32, 39
- Password-recovery runbook → DEPLOY-* or ops doc
