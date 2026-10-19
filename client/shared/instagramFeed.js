// Michael's Instagram posts, from his Behold JSON feed. Shared by the
// Cloudflare Pages Function (functions/api/instagram.js) and its Vite
// dev-server twin (api/instagramApiPlugin.js) so the two cannot drift.
//
// Behold's free plan counts every request to the feed URL toward 1,200 views a
// month (6 posts, refreshed daily), so browsers never fetch it directly: both
// servers fetch it here and cache the result for FEED_CACHE_SECONDS.

export const BEHOLD_FEED_URL = "https://feeds.behold.so/ZFyK3XHe1WgVNbaf3m47";
export const FEED_CACHE_SECONDS = 60 * 60;

const SIZE_NAMES = ["small", "medium", "large"];

const trimSizes = (sizes) =>
  Object.fromEntries(
    SIZE_NAMES.map((name) => {
      const { mediaUrl, width, height } = sizes[name];
      return [name, { mediaUrl, width, height }];
    }),
  );

// Behold adds `sizes` once it has processed a post's images; a post without
// all three can't be drawn at its own shape, so it waits for the next fetch.
const hasSizes = (item) =>
  SIZE_NAMES.every((name) => item.sizes?.[name]?.mediaUrl);

const trimMedia = (item) => ({
  id: item.id,
  mediaType: item.mediaType,
  mediaUrl: item.mediaUrl,
  sizes: trimSizes(item.sizes),
});

const trimPost = (post) => ({
  ...trimMedia(post),
  caption: post.caption ?? "",
  prunedCaption: post.prunedCaption ?? "",
  permalink: post.permalink,
  timestamp: post.timestamp,
  ...(post.mediaType === "CAROUSEL_ALBUM"
    ? { children: (post.children ?? []).filter(hasSizes).map(trimMedia) }
    : {}),
});

/** Keeps only the fields the site draws: username and each post's media, sizes and text. */
export const trimFeed = (feed) => {
  if (typeof feed?.username !== "string" || !Array.isArray(feed.posts)) {
    throw new Error("Behold feed has no username or posts list");
  }
  return {
    username: feed.username,
    posts: feed.posts.filter(hasSizes).map(trimPost),
  };
};

/** Fetches the Behold feed and trims it. Throws an Error naming the cause on failure. */
export const fetchFeed = async (fetchImpl = fetch) => {
  let response;
  try {
    response = await fetchImpl(BEHOLD_FEED_URL, {
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new Error(`Behold feed request failed: ${error.message}`);
  }
  if (!response.ok) {
    throw new Error(`Behold feed answered HTTP ${response.status}`);
  }
  let feed;
  try {
    feed = await response.json();
  } catch {
    throw new Error("Behold feed returned invalid JSON");
  }
  return trimFeed(feed);
};
