# Auth Command Output

Captured: 2026-04-28T09:31:00Z
Plan: 48-03 auth/OAuth/admin smoke

No auth code changes were made in this plan. Commands were run to capture the
required AUTH-32 launch evidence.

## pnpm tsc --noEmit

Command:

```bash
pnpm tsc --noEmit --pretty false
```

exit status: 1

Output summary:

```text
tests/forensics-overlay-leak.spec.ts(37,17): error TS2339: Property 'offsetParent' does not exist on type 'Element'.
```

Assessment: blocked by the same pre-existing test typing issue observed during
checkout proof. This is not introduced by Phase 48-03.

## pnpm lint

Command:

```bash
pnpm lint
```

exit status: 1

Output summary:

```text
src/components/tech/category-tile.tsx: react-hooks/static-components
src/components/tiles/studios-cross-link-tile.tsx: react-hooks/set-state-in-effect
src/components/tiles/tech-cross-link-tile.tsx: react-hooks/set-state-in-effect
src/components/ui/dither.jsx: react-hooks/refs
tests/09-services-booking-mobile-audit.spec.ts: @typescript-eslint/no-explicit-any
tests/mobile-audit.spec.ts: @typescript-eslint/no-explicit-any
125 problems (53 errors, 72 warnings)
```

Assessment: blocked by existing repo-wide lint debt outside the auth smoke
artifacts. No Phase 48-03 code changes were made.

