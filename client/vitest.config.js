import { defineConfig } from "vitest/config";

// Unit tests. Kept separate from vite.config.js on purpose: that config builds
// the Square dev middleware from whatever .env files sit in the cwd, and the
// unit suite must never construct a Square client from real credentials.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js"],
    environment: "node",
  },
});
