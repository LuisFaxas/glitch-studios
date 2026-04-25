---
phase: 26-brand-aware-auth-ui-redesign
plan: 04
status: complete
requirements: [AUTH-21, AUTH-22, AUTH-23, AUTH-25]
completed: 2026-04-24
---

## What Was Built

Better Auth wired for social login — Google, GitHub, and Meta (Facebook provider key) — gated by env-var presence. Server helper enumerates available providers; OAuth brand SVGs hand-coded and threaded through the SocialAuthRow component.

## Tasks

1. Extended `src/lib/auth.ts` with a `socialProviders` builder that conditionally adds entries when both `*_CLIENT_ID` and `*_CLIENT_SECRET` are present. Added `account.accountLinking.enabled: false` to the betterAuth config.
2. Created `src/lib/auth-providers.ts` (`server-only`) exporting `getAvailableSocialProviders()`. Documented all 6 OAuth env vars + `ADMIN_NOTIFICATION_EMAIL` in `.env.example`.
3. Appended `GoogleIcon`, `MetaIcon`, `GitHubIcon` to `social-icons.tsx`. Updated `SocialAuthRow` to look up the icon via a `PROVIDER_ICON` map and render `<Icon size={20} />` before the label.

## Key Files

### Created
- `src/lib/auth-providers.ts`

### Modified
- `src/lib/auth.ts`
- `src/components/icons/social-icons.tsx`
- `src/components/auth/social-auth-row.tsx`
- `.env.example`

## Verification

- `pnpm tsc --noEmit` exits 0.
- `getAvailableSocialProviders()` is implemented with `server-only` import.
- Better Auth `socialProviders.facebook` is mapped from `META_*` env vars (documented in code comment).

## Notes / Deviations

- Used a simplified single-color Meta brand mark (filled "f" glyph in #0081FB) instead of the multi-path "infinity loop" from the plan example, which had path coordinate issues. The mark is recognizable as Meta/Facebook and renders cleanly at 20px. Keeps lint clean.
- GitHub icon uses `fill="currentColor"` so it inherits white in our dark UI; Google + Meta use brand colors per their guidelines.
