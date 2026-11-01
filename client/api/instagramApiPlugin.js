// Vite dev-server twin of functions/api/instagram.js: GET /api/instagram
// fetches the Behold feed through the same shared module and keeps it in
// memory for 12 hours, so `npm run dev` spends Behold's allowance as sparingly
// as production does.
//
// Test-only: when INSTAGRAM_FEED_FIXTURE names a Behold-shaped JSON file (the
// e2e harness sets it), the feed comes from that file instead and Behold is
// never called. Its media URLs point at /api/instagram/fixture-media/, which
// serves plain placeholders at the requested width x height.

import { readFileSync } from "node:fs";
import { FEED_FAILED } from "../shared/errors.js";
import {
  FEED_CACHE_SECONDS,
  fetchFeed,
  trimFeed,
} from "../shared/instagramFeed.js";

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const FIXTURE_MEDIA = /^\/fixture-media\/(\d+)x(\d+)\.svg$/;

const placeholderSvg = (width, height) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#25202c"/><rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="#3a3342" stroke-width="4"/></svg>`;

export const createInstagramApiPlugin = (env) => {
  const fixturePath = env.INSTAGRAM_FEED_FIXTURE || "";
  let cached = null;

  const loadFeed = async () => {
    if (fixturePath) {
      return trimFeed(JSON.parse(readFileSync(fixturePath, "utf8")));
    }
    if (cached && cached.expires > Date.now()) return cached.feed;
    const feed = await fetchFeed(fetch);
    cached = { feed, expires: Date.now() + FEED_CACHE_SECONDS * 1000 };
    return feed;
  };

  return {
    name: "instagram-api-dev-server",
    configureServer(server) {
      server.middlewares.use("/api/instagram", async (req, res) => {
        const path = (req.url || "").split("?")[0];

        if (fixturePath && FIXTURE_MEDIA.test(path)) {
          const [, width, height] = path.match(FIXTURE_MEDIA);
          res.setHeader("Content-Type", "image/svg+xml");
          res.end(placeholderSvg(Number(width), Number(height)));
          return;
        }

        if (req.method !== "GET" || (path !== "/" && path !== "")) {
          sendJson(res, 404, { error: "Not found" });
          return;
        }

        try {
          sendJson(res, 200, await loadFeed());
        } catch (error) {
          console.error("Instagram feed error:", error);
          sendJson(res, 502, { error: FEED_FAILED });
        }
      });
    },
  };
};
