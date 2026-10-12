import { defineConfig } from "vite";
import baseConfig from "../../vite.config.js";

// The real vite.config.js (including the Square dev middleware), with only the
// dependency cache moved into the suite's scratch directory so an e2e run never
// shares node_modules/.vite with a developer's `npm run dev` in the same
// checkout.
export default defineConfig((configEnv) => ({
  ...baseConfig(configEnv),
  cacheDir: process.env.E2E_VITE_CACHE_DIR,
}));
