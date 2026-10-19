// GET /api/instagram: Michael's Instagram posts from Behold, trimmed to the
// fields the site draws. Cached at the edge (Cache API) for an hour so visitors
// never spend Behold's monthly request allowance; see shared/instagramFeed.js.
// The dev-server twin is api/instagramApiPlugin.js.

import { FEED_CACHE_SECONDS, fetchFeed } from "../../shared/instagramFeed.js";

const jsonResponse = (data, status, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

export async function onRequestGet(context) {
  const cache = caches.default;
  // Keyed on the path alone, so a query string cannot bypass the cache.
  const url = new URL(context.request.url);
  const cacheKey = new Request(`${url.origin}${url.pathname}`);

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let feed;
  try {
    feed = await fetchFeed(fetch);
  } catch (error) {
    return jsonResponse(
      { error: `Could not load the Instagram feed: ${error.message}` },
      502,
      { "Cache-Control": "no-store" },
    );
  }

  const response = jsonResponse(feed, 200, {
    "Cache-Control": `public, max-age=${FEED_CACHE_SECONDS}`,
  });
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
