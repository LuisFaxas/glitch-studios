// Test stub for the `server-only` marker package.
// In production Next.js builds, `server-only` throws when imported from a client
// bundle. In vitest (Node context) we want server modules to load for unit
// testing their pure exports — so this stub intentionally does nothing.
export {}
