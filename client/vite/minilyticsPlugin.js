// Adds the Minilytics tracker and its session replay extension to index.html
// when PUBLIC_MINILYTICS_HOST, PUBLIC_MINILYTICS_SITE_ID and
// PUBLIC_MINILYTICS_SITE_KEY are all set (client/.env.production; dev and the
// test suites never load it), and nothing otherwise. Both scripts are
// deferred and go first in <head>, ahead of the app's module script, so they
// run first and window.minilytics exists when the app starts
// (src/lib/analytics.js).
//
// No data-hash-routing: the site uses BrowserRouter paths, and the tracker
// counts a page view on every history.pushState / replaceState / popstate
// whose path or query changed.

/** @param {Record<string, string | undefined>} env */
export const minilyticsTags = (env) => {
  const host = env.PUBLIC_MINILYTICS_HOST?.trim().replace(/\/+$/, "");
  const siteId = env.PUBLIC_MINILYTICS_SITE_ID?.trim();
  const siteKey = env.PUBLIC_MINILYTICS_SITE_KEY?.trim();
  if (!host || !siteId || !siteKey) return [];
  return [
    {
      tag: "script",
      attrs: {
        defer: true,
        src: `${host}/minilytics.js`,
        "data-site-id": siteId,
        "data-site-key": siteKey,
        "data-privacy-mode": "strict",
      },
      injectTo: "head-prepend",
    },
    {
      tag: "script",
      attrs: { defer: true, src: `${host}/replay/ext.js` },
      injectTo: "head-prepend",
    },
  ];
};

/** @param {Record<string, string | undefined>} env */
export const minilyticsPlugin = (env) => ({
  name: "minilytics",
  transformIndexHtml: () => minilyticsTags(env),
});
