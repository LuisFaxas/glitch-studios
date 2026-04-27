# Checkpoint

Progress milestones and completed phases.

## Milestones

| # | Milestone | Date | Status |
|---|-----------|------|--------|
| 1 | Dev folder scaffolded via praxis-mcp init | 2026-04-27 | Done |
| 2 | Praxis MCP installed and verified for Codex/Claude Code Triangle workflow | 2026-04-27 | Done |
| 3 | Praxis workflow polish implemented and local MCP source hardened | 2026-04-27 | Done |
| 4 | Phase 29.3 audit-pass: dev-server visual clean on /tech/rankings/laptops desktop+mobile (4/4 Playwright tests, zero console errors); filter re-enabled in working tree; prod build broken separately | 2026-04-27 | In Progress |
| 5 | CORRECTION: Phase 29.3 is BLOCKED, not audit-pass — Plan 05 user verification on macOS Safari failed 2026-04-27 03:15Z, chip click still freezes. Linux-headless Playwright cannot reproduce. Active debug session continues. | 2026-04-27 | Blocked |
| 6 | Phase 29.3 root cause identified (commit 6af8177): native pointer/style feedback loop on synchronous React state inside native input events. Plan 06 stabilization/verification artifacts written; deploy + real macOS retest remaining. | 2026-04-27 | In Progress |
| 7 | Phase 29.3 COMPLETE — filter UI ships visible on /tech/rankings/laptops; real macOS Safari + Firefox passed all 9 verification steps at 2026-04-27T17:00Z; native-event feedback-loop fix family holds (6af8177 + 12214c7 + ba1e747 + c9d8c60 + 3cf5991) | 2026-04-27 | Done |

## Current Phase

**Phase:** 29.2 — Site-Wide Hero Rollout + Methodology Editorial Upgrade (next, ready to execute)
**Description:** 10 plans drafted, 0 executed, CONTEXT.md + UI-SPEC.md present. Plan 01 (TechHero size variants) is wave 1 / autonomous / no dependencies. Sequential execution per the phase wave structure with Playwright verification per plan.
