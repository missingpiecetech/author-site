// Home's Instagram section and post viewer, against the committed Behold
// fixture (support/instagram-fixture.json). The harness points the
// /api/instagram dev middleware at that file, so nothing reaches Behold or
// Instagram; the browser also aborts and records any request to either.
//
// Selectors are data-testid only.

import { readFileSync } from "node:fs";
import puppeteer from "puppeteer";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { INSTAGRAM_FIXTURE, startServer } from "./support/server.js";

const FIXTURE = JSON.parse(readFileSync(INSTAGRAM_FIXTURE, "utf8"));
const VIDEO_INDEX = FIXTURE.posts.findIndex((p) => p.mediaType === "VIDEO");
const ALBUM_INDEX = FIXTURE.posts.findIndex(
  (p) => p.mediaType === "CAROUSEL_ALBUM",
);
// The post with the most caption lines, so two lines are certainly a clamp.
const LONG_CAPTION_INDEX = FIXTURE.posts.reduce(
  (best, post, index) =>
    post.caption.split("\n").length >
    FIXTURE.posts[best].caption.split("\n").length
      ? index
      : best,
  0,
);
if (VIDEO_INDEX < 0 || ALBUM_INDEX < 0) {
  throw new Error("Instagram fixture must include a VIDEO and an album");
}

// white-space: pre-line keeps line breaks but drops spaces at line ends.
const asRendered = (text) =>
  text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

const OFFSITE_HOST = /(^|\.)(behold\.so|behold\.pictures|cdninstagram\.com)$/i;

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844, isMobile: true, hasTouch: true };

let server;
let browser;
let context;
let offsiteRequests;

beforeAll(async () => {
  server = await startServer();
  browser = await puppeteer.launch({ headless: "new" });
});

afterAll(async () => {
  await browser?.close();
  await server?.stop();
});

afterEach(async () => {
  await context?.close();
  context = undefined;
  expect(offsiteRequests).toEqual([]);
});

const openHome = async (viewport, { feedStatus } = {}) => {
  offsiteRequests = [];
  context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport(viewport);
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (OFFSITE_HOST.test(url.hostname)) {
      offsiteRequests.push(request.url());
      request.abort("blockedbyclient");
      return;
    }
    if (feedStatus && url.pathname === "/api/instagram") {
      request.respond({
        status: feedStatus,
        contentType: "application/json",
        body: JSON.stringify({ error: "Behold feed answered HTTP 500" }),
      });
      return;
    }
    request.continue();
  });
  await page.goto(`${server.baseUrl}/`, { waitUntil: "domcontentloaded" });
  return page;
};

const tiles = async (page) => {
  await page.waitForSelector('[data-testid="instagram-tile"]');
  return page.$$('[data-testid="instagram-tile"]');
};

const openTile = async (page, index) => {
  const tile = (await tiles(page))[index];
  await tile.scrollIntoView();
  await tile.click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="instagram-viewer"]').open,
  );
  return tile;
};

const viewerIsOpen = (page) =>
  page.$eval('[data-testid="instagram-viewer"]', (dialog) => dialog.open);

describe.each([
  ["desktop", DESKTOP],
  ["390px", PHONE],
])("Instagram on Home (%s)", (_, viewport) => {
  it("shows one tile per post at Behold's own size", async () => {
    const page = await openHome(viewport);
    const sizes = await Promise.all(
      (await tiles(page)).map((tile) =>
        tile.$eval("img", (img) => ({
          width: Number(img.getAttribute("width")),
          height: Number(img.getAttribute("height")),
          src: img.getAttribute("src"),
        })),
      ),
    );
    expect(sizes).toEqual(
      FIXTURE.posts.map((post) => ({
        width: post.sizes.medium.width,
        height: post.sizes.medium.height,
        src: post.sizes.medium.mediaUrl,
      })),
    );
  });

  it("plays a video post and links it to Instagram", async () => {
    const page = await openHome(viewport);
    await openTile(page, VIDEO_INDEX);
    const post = FIXTURE.posts[VIDEO_INDEX];
    const video = await page.$eval('[data-testid="instagram-video"]', (el) => ({
      src: el.getAttribute("src"),
      poster: el.getAttribute("poster"),
      controls: el.controls,
    }));
    expect(video).toEqual({
      src: post.mediaUrl,
      poster: post.sizes.large.mediaUrl,
      controls: true,
    });
    const link = await page.$eval('[data-testid="instagram-link"]', (a) => ({
      href: a.getAttribute("href"),
      target: a.getAttribute("target"),
    }));
    expect(link).toEqual({ href: post.permalink, target: "_blank" });
  });

  it("shows every photo of an album with a count", async () => {
    const page = await openHome(viewport);
    await openTile(page, ALBUM_INDEX);
    const total = FIXTURE.posts[ALBUM_INDEX].children.length;
    const slides = await page.$$('[data-testid="instagram-album-slide"]');
    expect(slides).toHaveLength(total);
    const count = () =>
      page.$eval('[data-testid="instagram-album-count"]', (el) =>
        el.textContent.replace(/\s+/g, " ").trim(),
      );
    expect(await count()).toBe(`1 / ${total}`);
    await page.click('[data-testid="instagram-album-next"]');
    await page.waitForFunction(
      (expected) =>
        document
          .querySelector('[data-testid="instagram-album-count"]')
          .textContent.replace(/\s+/g, " ")
          .trim() === expected,
      {},
      `2 / ${total}`,
    );
  });

  it("closes on Escape and returns focus to the tile", async () => {
    const page = await openHome(viewport);
    const tile = await openTile(page, ALBUM_INDEX);
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="instagram-viewer"]').open,
    );
    expect(await tile.evaluate((el) => el === document.activeElement)).toBe(
      true,
    );
  });

  it("closes from the close button", async () => {
    const page = await openHome(viewport);
    const tile = await openTile(page, 0);
    await page.click('[data-testid="instagram-close"]');
    expect(await viewerIsOpen(page)).toBe(false);
    expect(await tile.evaluate((el) => el === document.activeElement)).toBe(
      true,
    );
  });

  it("renders nothing when the feed fails", async () => {
    const page = await openHome(viewport, { feedStatus: 502 });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 });
    expect(await page.$('[data-testid="instagram-feed"]')).toBeNull();
    expect(
      await page.evaluate(() => document.body.innerText.includes("Behold")),
    ).toBe(false);
  });
});

describe("caption", () => {
  const post = FIXTURE.posts[LONG_CAPTION_INDEX];

  it("shows the full caption beside the post on desktop", async () => {
    const page = await openHome(DESKTOP);
    await openTile(page, LONG_CAPTION_INDEX);
    const text = await page.$eval(
      '[data-testid="instagram-caption"]',
      (el) => el.innerText,
    );
    expect(asRendered(text)).toBe(asRendered(post.caption));
  });

  it("starts at two lines on a phone and expands in place on tap", async () => {
    const page = await openHome(PHONE);
    await openTile(page, LONG_CAPTION_INDEX);
    const measure = () =>
      page.$eval('[data-testid="instagram-caption"]', (el) => ({
        expanded: el.getAttribute("aria-expanded"),
        height: el.getBoundingClientRect().height,
        lineHeight: parseFloat(getComputedStyle(el).lineHeight),
        scrollHeight: el.scrollHeight,
        text: el.innerText,
        maxHeight: window.innerHeight * 0.6,
      }));

    const collapsed = await measure();
    expect(collapsed.expanded).toBe("false");
    expect(collapsed.height).toBeGreaterThan(collapsed.lineHeight * 1.5);
    expect(collapsed.height).toBeLessThan(collapsed.lineHeight * 2.5);
    expect(collapsed.scrollHeight).toBeGreaterThan(collapsed.height + 1);

    await page.tap('[data-testid="instagram-caption"]');
    const expanded = await measure();
    expect(expanded.expanded).toBe("true");
    expect(asRendered(expanded.text)).toBe(asRendered(post.caption));
    expect(expanded.height).toBeGreaterThan(collapsed.height);
    expect(expanded.height).toBeLessThanOrEqual(expanded.maxHeight + 1);

    await page.tap('[data-testid="instagram-caption"]');
    const again = await measure();
    expect(again.expanded).toBe("false");
    expect(again.height).toBe(collapsed.height);
  });
});
