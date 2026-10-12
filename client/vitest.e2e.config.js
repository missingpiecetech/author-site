import { defineConfig } from "vitest/config";

// Browser suite: starts its own vite dev server on a free port with the Square
// SDK stubbed (tests/e2e/support), then drives it with headless Puppeteer.
export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.e2e.test.js"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
