# Source of Truth

Canonical reference for project decisions, standards, and facts.

## Workspace Rules

1. This workspace is **non-destructive** -- local copies only.
2. Every new project gets a fresh `dev/` folder.
3. No files at workspace root -- all output goes into project folders.
4. AI writes to `draft/` only. Admin promotes to `published/`.
5. Items move to `_executed/` only when complete.
6. File naming: `{number}_{YYYY-MM-DD}_{DESCRIPTION}.{ext}` -- Number 0 = READMEs.
7. Admin runs commands -- AI writes to `dev/commands/active/`.
8. Context docs updated every session end.

## Praxis Operating Profile

Praxis is installed at full tier, but Glitch Studios uses it in a lean, risk-gated way. The folders stay in place; the workflow decides when each one matters.

### Active Now

- `dev/source_of_truth.md`, `dev/context_capsule.md`, and `dev/checkpoint.md` are the required session context chain.
- `dev/work-orders/wo_claude/` and `dev/work-orders/wo_codex/` are active only when a task needs cross-agent handoff or review.
- `dev/audit/current/` is active for production bug investigations, completion reviews, and architecture drift checks.
- `dev/planning/master-plan/draft/` is active for plans that need review before execution.
- `dev/design/audit/screenshots/` is active for visual and browser-forensics captures.

### Reserved Until Needed

- `dev/research/`, `dev/reports/`, `dev/design/language/`, `dev/design/resources/`, `dev/archive/`, and `dev/private/` remain part of the full Praxis structure but are not required for ordinary coding sessions.

### Work Order Gate

Create a Praxis work order for production bugs, browser/performance issues, deploy-impacting work, auth/cart/payment/data changes, multi-file refactors, new public UI flows, and any Codex/Claude handoff.

Skip the work order for typos, tiny content edits, low-risk CSS polish, local investigation commands, and explicitly scoped one-line fixes. Meaningful no-WO work should still be noted in `dev/context_capsule.md` at session end.

## Project-Specific

### Tech Stack

- Next.js 16.2.x App Router with React 19
- Tailwind CSS 4.x
- TanStack Table v8 for tech rankings tables
- Better Auth for session/auth state
- Drizzle ORM with Neon Postgres
- Vercel preview/production deployments
- pnpm is the project package manager

### Project Decisions

| # | Decision | Date | Rationale |
|---|----------|------|-----------|
| 1 | Praxis is the primary multi-agent orchestration layer for this project. | 2026-04-27 | The project has become complex enough that prompts alone are too fragile. Praxis provides persistent context, work orders, audits, and Codex/Claude coordination. |
| 2 | Triangle mode is configured with Codex as manager/reviewer and Claude Code as implementer. | 2026-04-27 | Codex will create/review work orders and audits; Claude Code will implement approved work. This keeps planning/review separate from execution. |
| 3 | macOS Safari/Firefox ranking filter interactions must defer React state updates out of native input/focus/visibility events. | 2026-04-27 | The production freeze was a browser native-event/state-update feedback loop, not normal data-size performance. Future filter/dropdown/slider/sheet changes must preserve the deferred-update pattern. |
| 4 | Praxis work orders are risk-gated, not mandatory for every small edit. | 2026-04-27 | The goal is fewer agent mistakes on complex work, not extra ceremony. Small safe fixes can proceed directly; risky or cross-agent work gets a work order and review loop. |
