// Dev-only shim so the Crownfall wiki ("The Codex") is reachable at /wiki/ in
// `npm run dev`, matching production. The built page lives at
// public/wiki/index.html and is served at /wiki/ by `vite preview` (directory
// index) and by Cloudflare Pages (a real asset, ahead of the _redirects SPA
// rewrite). The dev server has no directory-index step, so a request for the
// folder path /wiki/ falls through to the SPA fallback and renders React's
// 404. This middleware answers /wiki and /wiki/ with the static file instead.
// It reads the file per request, so `npm run build:wiki` shows up on refresh
// without a restart. apply: "serve" keeps it out of build and preview.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const wikiDevPlugin = () => ({
  name: "wiki-dev",
  apply: "serve",
  configureServer(server) {
    const file = join(server.config.publicDir, "wiki", "index.html");
    server.middlewares.use((req, res, next) => {
      const path = (req.url || "").split("?")[0];
      if (path !== "/wiki" && path !== "/wiki/") return next();
      readFile(file).then(
        (html) => {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        },
        // Not built yet (run `npm run build:wiki`): let the request fall
        // through rather than hiding the reason.
        () => next(),
      );
    });
  },
});
