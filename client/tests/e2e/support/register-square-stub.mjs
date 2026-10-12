// Preloaded into the e2e vite server with `node --import`. Redirects every
// import of the `square` package to the local stub, so the unmodified dev
// middleware (api/squareApiPlugin.js) runs exactly as in `npm run dev` but
// cannot reach Square. Requires Node >= 22.15 (module.registerHooks).
//
// Matching is on the resolved URL, not the specifier: Vite bundles the config
// (and the plugin it imports) and rewrites external imports to absolute file
// URLs, so the bare "square" specifier never reaches this hook.

import { registerHooks } from "node:module";

const STUB_URL = new URL("./square-stub.mjs", import.meta.url).href;
const SQUARE_PACKAGE = /\/node_modules\/square\//;

registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    if (SQUARE_PACKAGE.test(resolved.url)) {
      return { url: STUB_URL, shortCircuit: true };
    }
    return resolved;
  },
});
