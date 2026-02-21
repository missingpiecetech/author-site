import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createSquareApiPlugin } from "./server/squareApiPlugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), createSquareApiPlugin(env)],
  };
});
