// The Instagram feed path: the shared trim module and the Pages Function's
// edge cache. Behold is never reached: fetch is mocked, and the Cache API is a
// Map-backed stand-in for caches.default.

import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BEHOLD_FEED_URL,
  FEED_CACHE_SECONDS,
  fetchFeed,
  trimFeed,
} from "../../shared/instagramFeed.js";
import { onRequestGet } from "../../functions/api/instagram.js";

const FIXTURE = JSON.parse(
  readFileSync(
    new URL("../e2e/support/instagram-fixture.json", import.meta.url),
    "utf8",
  ),
);

const jsonReply = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("trimFeed", () => {
  const trimmed = trimFeed(FIXTURE);

  it("keeps every post, in order, with only the fields the site draws", () => {
    expect(trimmed.username).toBe(FIXTURE.username);
    expect(trimmed.posts.map((p) => p.id)).toEqual(
      FIXTURE.posts.map((p) => p.id),
    );
    for (const post of trimmed.posts) {
      const keys = Object.keys(post).sort();
      const expected = [
        "caption",
        "id",
        "mediaType",
        "mediaUrl",
        "permalink",
        "prunedCaption",
        "sizes",
        "timestamp",
      ];
      if (post.mediaType === "CAROUSEL_ALBUM") expected.push("children");
      expect(keys).toEqual(expected.sort());
    }
    expect(Object.keys(trimmed)).toEqual(["username", "posts"]);
  });

  it("keeps Behold's small, medium and large sizes exactly", () => {
    FIXTURE.posts.forEach((raw, index) => {
      const { sizes } = trimmed.posts[index];
      expect(Object.keys(sizes)).toEqual(["small", "medium", "large"]);
      for (const name of ["small", "medium", "large"]) {
        expect(sizes[name]).toEqual({
          mediaUrl: raw.sizes[name].mediaUrl,
          width: raw.sizes[name].width,
          height: raw.sizes[name].height,
        });
      }
    });
  });

  it("keeps the full caption, the video file and every album child", () => {
    const video = FIXTURE.posts.find((p) => p.mediaType === "VIDEO");
    const album = FIXTURE.posts.find((p) => p.mediaType === "CAROUSEL_ALBUM");
    const trimmedVideo = trimmed.posts.find((p) => p.id === video.id);
    const trimmedAlbum = trimmed.posts.find((p) => p.id === album.id);
    expect(trimmedVideo.caption).toBe(video.caption);
    expect(trimmedVideo.mediaUrl).toBe(video.mediaUrl);
    expect(trimmedAlbum.children.map((c) => c.id)).toEqual(
      album.children.map((c) => c.id),
    );
    expect(Object.keys(trimmedAlbum.children[0]).sort()).toEqual([
      "id",
      "mediaType",
      "mediaUrl",
      "sizes",
    ]);
  });

  it("skips a post Behold has not sized yet", () => {
    const [first, second] = FIXTURE.posts;
    const unsized = { ...second, sizes: undefined };
    const result = trimFeed({ ...FIXTURE, posts: [first, unsized] });
    expect(result.posts.map((p) => p.id)).toEqual([first.id]);
  });

  it("rejects a response that is not a Behold feed", () => {
    expect(() => trimFeed({ error: "nope" })).toThrow(/username or posts/);
    expect(() => trimFeed(null)).toThrow(/username or posts/);
  });
});

describe("fetchFeed", () => {
  it("requests the Behold feed URL and returns the trimmed feed", async () => {
    const fetchImpl = vi.fn(async () => jsonReply(FIXTURE));
    const feed = await fetchFeed(fetchImpl);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toBe(BEHOLD_FEED_URL);
    expect(feed).toEqual(trimFeed(FIXTURE));
  });

  it("names the cause when Behold fails", async () => {
    await expect(fetchFeed(async () => jsonReply({}, 503))).rejects.toThrow(
      "Behold feed answered HTTP 503",
    );
    await expect(
      fetchFeed(async () => {
        throw new Error("getaddrinfo ENOTFOUND");
      }),
    ).rejects.toThrow("Behold feed request failed: getaddrinfo ENOTFOUND");
    await expect(
      fetchFeed(async () => new Response("<html>", { status: 200 })),
    ).rejects.toThrow("Behold feed returned invalid JSON");
  });
});

describe("GET /api/instagram (Pages Function)", () => {
  let store;
  let fetchMock;
  let pending;

  const call = async (path = "/api/instagram") => {
    const response = await onRequestGet({
      request: new Request(`https://michaelvadney.com${path}`),
      waitUntil: (promise) => pending.push(promise),
    });
    await Promise.all(pending);
    return response;
  };

  beforeEach(() => {
    store = new Map();
    pending = [];
    vi.stubGlobal("caches", {
      default: {
        match: vi.fn(async (request) => store.get(request.url)?.clone()),
        put: vi.fn(async (request, response) => {
          store.set(request.url, response);
        }),
      },
    });
    fetchMock = vi.fn(async () => jsonReply(FIXTURE));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches Behold once, then serves the edge cache for 12 hours", async () => {
    const first = await call();
    expect(first.status).toBe(200);
    expect(first.headers.get("Cache-Control")).toBe(
      `public, max-age=${FEED_CACHE_SECONDS}`,
    );
    expect(FEED_CACHE_SECONDS).toBe(12 * 3600);
    expect(await first.json()).toEqual(trimFeed(FIXTURE));

    const second = await call("/api/instagram?bust=1");
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual(trimFeed(FIXTURE));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect([...store.keys()]).toEqual([
      "https://michaelvadney.com/api/instagram",
    ]);
  });

  it("answers 502 naming the cause when Behold fails, and caches nothing", async () => {
    fetchMock.mockImplementation(async () => jsonReply({}, 500));
    const response = await call();
    expect(response.status).toBe(502);
    expect((await response.json()).error).toMatch(
      /Instagram feed.*Behold feed answered HTTP 500/,
    );
    expect(store.size).toBe(0);

    fetchMock.mockImplementation(async () => jsonReply(FIXTURE));
    expect((await call()).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
