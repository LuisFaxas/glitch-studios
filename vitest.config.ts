import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Stub server-only marker package so modules that use `import "server-only"`
      // can still be loaded in vitest (which runs in a Node context, not RSC).
      "server-only": path.resolve(__dirname, "./src/test/stubs/server-only.ts"),
    },
  },
  test: {
    include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
    // Playwright tests live in tests/ and are NOT run by vitest.
    exclude: ["node_modules", ".next", "tests/**"],
    environment: "node",
  },
})
