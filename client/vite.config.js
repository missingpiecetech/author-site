import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createSquareApiPlugin } from "./api/squareApiPlugin";
import { minilyticsPlugin } from "./vite/minilyticsPlugin.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // PUBLIC_* is the house prefix for build-time values that are safe to ship
    // (client/.env.production); VITE_* stays exposed as before.
    envPrefix: ["VITE_", "PUBLIC_"],
    plugins: [react(), createSquareApiPlugin(env), minilyticsPlugin(env)],
  };
});
