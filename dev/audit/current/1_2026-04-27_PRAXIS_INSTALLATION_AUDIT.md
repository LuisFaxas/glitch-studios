# Praxis Installation Audit

**Date:** 2026-04-27
**Auditor:** Codex
**Scope:** Install and verify Praxis MCP for Codex and Claude Code.

## Result

**Verdict:** PASS

Praxis was installed as a local source checkout at `/home/faxas/workspaces/tools/praxis`, built successfully, and registered for this project through Codex and Claude Code MCP configuration.

## Configuration

| Consumer | Config | Server Command | Project Target |
|---|---|---|---|
| Codex | `/home/faxas/.codex/config.toml` | `node /home/faxas/workspaces/tools/praxis/praxis-mcp/build/index.js` | `/home/faxas/workspaces/projects/personal/glitch_studios` |
| Claude Code | `.mcp.json` | `node /home/faxas/workspaces/tools/praxis/praxis-mcp/build/index.js` | `/home/faxas/workspaces/projects/personal/glitch_studios` |

## Verification

- MCP client smoke test listed 13 tools.
- `detect_project` returned `tier: full`, `mode: triangle`, providers `claude` and `codex`.
- `session_start` returned a fresh context chain and 0 pending work orders.
- Praxis lint returned exit code 0 after moving root screenshots into `dev/design/audit/screenshots/`.

## Notes

The Praxis CLI scaffold created `dev/commands/executed/`, but the bundled linter prefers `dev/commands/_executed/`. The empty legacy directory was replaced with `_executed/` before final lint.
