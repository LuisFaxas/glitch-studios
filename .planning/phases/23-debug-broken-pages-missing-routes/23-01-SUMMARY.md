---
phase: 23-debug-broken-pages-missing-routes
plan: 01
status: complete
completed: 2026-04-24
---

## What was built

Fixed Audit §D.1 bug 1 — admin homepage editor was unreachable from `/admin`.

### Changes

**`src/components/admin/admin-sidebar.tsx`**
- Line 86: Homepage nav entry href changed from `/admin/homepage` (404) → `/admin/settings/homepage` (actual route).
- `isActiveRoute` (lines 126-132): added exact-match special case for `/admin/settings` so Homepage's sub-route doesn't double-highlight the Site Settings row.

**`src/components/admin/quick-actions.tsx`**
- Added `Layout` to lucide-react imports.
- Extended `actions` array with Homepage tile: `{ label, href: "/admin/settings/homepage", icon: Layout, testId: "quick-action-homepage" }`.
- Added `data-testid={action.testId}` to rendered Link so the Playwright spec can locate it.

### isActiveRoute strategy

Rather than reordering or using a full "most specific wins" helper, the minimum-viable fix was:

```ts
if (href === pathname) return true
return pathname.startsWith(href + "/")
```

This eliminates the `startsWith(href)` overlap bug in general. Site Settings still needed a special case (`pathname === "/admin/settings"`) because it has sub-routes inside its own space that it should NOT activate for (Homepage, and future `/admin/settings/*` entries).

## Tests

`tests/23-01-admin-homepage-editor.spec.ts` — 3 tests, all green (desktop project):
- Sidebar href correct + click navigates without 404
- Quick Action tile exists + links to editor
- On /admin/settings/homepage only the Homepage row is active

RED commit: `239dc88`. GREEN commit: `52cedf8`.

## Files touched

- src/components/admin/admin-sidebar.tsx
- src/components/admin/quick-actions.tsx
- tests/23-01-admin-homepage-editor.spec.ts

## Deviations

None.
