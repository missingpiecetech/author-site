// Analytics events (docs/ANALYTICS.md) and excerpt reading depth (issue #17),
// driven in the browser against the real dev server.
//
// The real Minilytics tracker never loads here: dev mode never reads
// .env.production, so index.html carries no tracker script. Tests that check
// events install a stand-in `window.minilytics` before the app's scripts run;
// it hands every call straight to the test (so an event sent just before a
// redirect is still seen). The excerpt tests also replace `performance.now`
// with a clock the test moves forward, so minutes of reading take
// milliseconds; everything else (layout, scrolling, tab visibility, input,
// the clipboard) is the real browser.

import puppeteer from "puppeteer";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { startServer } from "./support/server.js";
import { STUB_PRODUCTS } from "./support/square-stub-products.js";
import { EXCERPTS, readableChapters } from "../../src/excerpts/index.js";
import {
  idleWindowMs,
  paragraphWords,
  readThresholdMs,
  readingMs,
  splitIntoBlocks,
} from "../../src/lib/excerptReading.js";
import { REPLAY_SETTINGS } from "../../src/lib/analytics.js";

const EXCERPT = EXCERPTS.crownfall;
const CHAPTERS = readableChapters(EXCERPT.excerpt);
const BLOCKS = CHAPTERS.map((chapter) =>
  splitIntoBlocks(paragraphWords(chapter.paragraphs)),
);
const CREDIT = "Excerpt from Crownfall by Michael Vadney, michaelvadney.com";

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844, isMobile: true, hasTouch: true };
const STUB_CHECKOUT_HOST = "checkout.square.test";
const PAPERBACK_UNSIGNED = STUB_PRODUCTS.find(
  (p) => p.key === "crownfall-paperback-unsigned",
);

const byTestId = (id) => `[data-testid="${id}"]`;

let server;
let browser;
let context;

beforeAll(async () => {
  if (CHAPTERS.length < 2) {
    throw new Error("the excerpt tests need at least two chapters of text");
  }
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
});

/**
 * A fresh context and page. With `tracker` (default) a stand-in
 * window.minilytics records every call into `events`. Requests to any other
 * host get an empty 200 (MailerLite, Amazon, ...) so nothing leaves the
 * machine; `checkoutStatus` makes /api/square/checkout fail with that status.
 */
const openPage = async (viewport, { tracker = true, checkoutStatus } = {}) => {
  context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport(viewport);
  const events = [];
  const errors = [];
  const foreignRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin === server.baseUrl) {
      if (checkoutStatus && url.pathname === "/api/square/checkout") {
        request.respond({
          status: checkoutStatus,
          contentType: "application/json",
          body: JSON.stringify({ error: "stubbed failure" }),
        });
        return;
      }
      request.continue();
      return;
    }
    if (url.hostname !== STUB_CHECKOUT_HOST) foreignRequests.push(url.href);
    request.respond({
      status: 200,
      contentType:
        request.resourceType() === "script"
          ? "application/javascript"
          : "text/html",
      body: "",
    });
  });

  if (tracker) {
    await page.exposeFunction("__recordAnalytics", (name, data) => {
      events.push({ name, data });
    });
    await page.evaluateOnNewDocument(() => {
      window.minilytics = {
        track: (name, data) => window.__recordAnalytics(name, data ?? null),
        startReplay: (settings) =>
          window.__recordAnalytics("startReplay", settings),
      };
    });
  }
  await page.evaluateOnNewDocument(() => {
    const realNow = performance.now.bind(performance);
    let offset = 0;
    performance.now = () => realNow() + offset;
    window.__advanceClock = (ms) => {
      offset += ms;
    };
  });

  const named = (name) =>
    events.filter((e) => e.name === name).map((e) => e.data);
  const waitForEvent = async (name, match = () => true) => {
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      const found = named(name).find(match);
      if (found) return found;
      await new Promise((r) => setTimeout(r, 25));
    }
    throw new Error(
      `no ${name} event; saw ${JSON.stringify(events.map((e) => e.name))}`,
    );
  };
  return { page, events, errors, foreignRequests, named, waitForEvent };
};

// Lets queued exposeFunction calls arrive.
const settle = (page) =>
  page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 100))),
  );

// Scrolls without smooth-scrolling, then waits for the scroll to be handled.
const scrollTo = (page, y, advanceMs = 0) =>
  page.evaluate(
    (top, ms) =>
      new Promise((resolve) => {
        window.scrollTo({ top, behavior: "instant" });
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            window.__advanceClock(ms);
            resolve();
          }),
        );
      }),
    y,
    advanceMs,
  );

// Page offsets of the selected chapter's paragraphs, by paragraph index.
const paragraphOffsets = (page) =>
  page.evaluate(() => {
    const panel = [
      ...document.querySelectorAll('[data-testid="excerpt-chapter"]'),
    ].find((el) => !el.hidden);
    return Object.fromEntries(
      [...panel.querySelectorAll("[data-paragraph]")].map((p) => {
        const rect = p.getBoundingClientRect();
        return [
          p.dataset.paragraph,
          { top: rect.top + window.scrollY, height: rect.height },
        ];
      }),
    );
  });

const centreOn = (offset, viewport) =>
  Math.max(0, offset.top + offset.height / 2 - viewport.height / 2);

const openExcerpt = async (viewport, options) => {
  const session = await openPage(viewport, options);
  await session.page.goto(`${server.baseUrl}${EXCERPT.path}`, {
    waitUntil: "load",
  });
  await session.page.waitForSelector("[data-paragraph]");
  return session;
};

// Small pointer moves: input, as a reader resting a hand on the mouse gives.
const nudge = async (page, step) => {
  await page.mouse.move(200 + (step % 2) * 10, 300);
};

describe("analytics: tracker start-up", () => {
  it("starts session replay once with the configured settings", async () => {
    const { page, named } = await openPage(DESKTOP);
    await page.goto(`${server.baseUrl}/`, { waitUntil: "load" });
    await settle(page);
    expect(named("startReplay")).toEqual([REPLAY_SETTINGS]);
    expect(REPLAY_SETTINGS.commitEvents).toEqual(
      expect.arrayContaining([
        "checkout_started",
        "add_to_cart",
        "excerpt_buy_click",
        "newsletter_opened",
      ]),
    );
  });
});

describe("analytics: excerpt reading depth", () => {
  it("steady reading at 250 words a minute reads every block and completes the chapter", async () => {
    const { page, named, waitForEvent } = await openExcerpt(DESKTOP);
    await waitForEvent("excerpt_chapter_view");
    const chapter = CHAPTERS[0];
    const offsets = await paragraphOffsets(page);
    const words = paragraphWords(chapter.paragraphs);
    for (const [index, count] of words.entries()) {
      if (!count) continue;
      await scrollTo(page, centreOn(offsets[index], DESKTOP), readingMs(count));
    }
    await scrollTo(page, centreOn(offsets[words.length - 1], DESKTOP) + 40);
    await waitForEvent("excerpt_chapter_complete");

    expect(named("excerpt_chapter_view")).toEqual([{ chapter: 1 }]);
    expect(named("excerpt_block_reached")).toEqual(
      BLOCKS[0].map((block, i) => ({
        chapter: 1,
        block: i + 1,
        words: block.words,
      })),
    );
    expect(named("excerpt_block_read").map((e) => e.block)).toEqual(
      BLOCKS[0].map((_, i) => i + 1),
    );
    for (const read of named("excerpt_block_read")) {
      expect(read.chapter).toBe(1);
      expect(read.seconds).toBeGreaterThan(0);
    }
    expect(named("excerpt_chapter_complete")).toEqual([{ chapter: 1 }]);
    expect(named("excerpt_skim")).toEqual([]);
  });

  it("a fast scroll to the bottom reaches every block it passes but reads none", async () => {
    const { page, named, waitForEvent } = await openExcerpt(DESKTOP);
    await waitForEvent("excerpt_chapter_view");
    const offsets = await paragraphOffsets(page);
    const last = CHAPTERS[0].paragraphs.length - 1;
    const bottom = centreOn(offsets[last], DESKTOP);
    await page.evaluate(
      (target) =>
        new Promise((resolve) => {
          const step = () => {
            const next = Math.min(target, window.scrollY + 300);
            window.scrollTo({ top: next, behavior: "instant" });
            if (next >= target) resolve();
            else requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }),
      bottom,
    );
    await waitForEvent("excerpt_skim");

    expect(named("excerpt_block_reached").map((e) => e.block)).toEqual(
      BLOCKS[0].map((_, i) => i + 1),
    );
    expect(named("excerpt_block_read")).toEqual([]);
    expect(named("excerpt_chapter_complete")).toEqual([]);
    expect(named("excerpt_skim")).toEqual([
      { chapter: 1, from_block: 1, to_block: BLOCKS[0].length },
    ]);
  });

  it("time in a background tab adds nothing; the same time in front reads the block", async () => {
    const { page, named, waitForEvent } = await openExcerpt(DESKTOP);
    await waitForEvent("excerpt_chapter_view");
    const offsets = await paragraphOffsets(page);
    await scrollTo(page, centreOn(offsets[1], DESKTOP));

    const other = await context.newPage();
    await other.bringToFront();
    await page.waitForFunction(() => document.visibilityState === "hidden", {
      polling: 50,
    });
    // A background tab gets no real input; dispatch it, so only the hidden
    // tab, not idleness, can explain an unread block.
    for (let step = 0; step < 20; step += 1) {
      await page.evaluate(() => {
        window.__advanceClock(15_000);
        window.dispatchEvent(new PointerEvent("pointermove"));
      });
    }
    await page.bringToFront();
    await page.waitForFunction(() => document.visibilityState === "visible", {
      polling: 50,
    });
    await scrollTo(page, centreOn(offsets[1], DESKTOP) + 10);
    await settle(page);
    expect(named("excerpt_block_read")).toEqual([]);

    for (let step = 0; step < 20; step += 1) {
      await page.evaluate(() => window.__advanceClock(15_000));
      await nudge(page, step);
    }
    await waitForEvent("excerpt_block_read");
    expect(named("excerpt_block_read").map((e) => e.block)).toEqual([1]);
  });

  it("an idle reader stops building time once the idle window runs out", async () => {
    // On a phone the screen holds fewer words than block 1 needs time for:
    // a still reader is credited the idle window and no more.
    const { page, named, waitForEvent } = await openExcerpt(MOBILE);
    await waitForEvent("excerpt_chapter_view");
    const offsets = await paragraphOffsets(page);
    const block = BLOCKS[0][0];
    const target = block.first + 2;
    await scrollTo(page, centreOn(offsets[target], MOBILE));
    const visibleWords = await page.evaluate(() => {
      let total = 0;
      for (const p of document.querySelectorAll("[data-paragraph]")) {
        const rect = p.getBoundingClientRect();
        const onScreen =
          Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0);
        if (rect.height && onScreen > 0) {
          total +=
            (p.textContent.split(/\s+/).filter(Boolean).length * onScreen) /
            rect.height;
        }
      }
      return total;
    });
    expect(idleWindowMs(visibleWords)).toBeLessThan(
      readThresholdMs(block.words),
    );

    await page.evaluate(() => window.__advanceClock(30 * 60_000));
    await scrollTo(page, centreOn(offsets[target], MOBILE) + 5);
    await settle(page);
    expect(named("excerpt_block_read")).toEqual([]);

    for (let step = 0; step < 10; step += 1) {
      await page.evaluate(() => window.__advanceClock(10_000));
      await nudge(page, step);
    }
    await waitForEvent("excerpt_block_read");
    expect(named("excerpt_block_read").map((e) => e.block)).toEqual([1]);
  });

  it("copying adds the credit line to plain and rich text and sends excerpt_copy", async () => {
    const { page, waitForEvent } = await openExcerpt(DESKTOP);
    await context.overridePermissions(server.baseUrl, [
      "clipboard-read",
      "clipboard-write",
      "clipboard-sanitized-write",
    ]);
    await page.click(byTestId("excerpt-tab-2"));
    await waitForEvent("excerpt_chapter_view", (e) => e.chapter === 2);
    const block = BLOCKS[1][1];
    const index = block.first + 1;
    const selected = await page.evaluate((i) => {
      const panel = document.getElementById("chapter-2");
      const p = panel.querySelector(`[data-paragraph="${i}"]`);
      p.scrollIntoView({ block: "center", behavior: "instant" });
      const range = document.createRange();
      range.selectNodeContents(p);
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString();
    }, index);
    expect(selected.length).toBeGreaterThan(20);

    await page.keyboard.press("KeyC", { commands: ["Copy"] });
    const copied = await page.evaluate(async () => {
      const out = {};
      for (const item of await navigator.clipboard.read()) {
        for (const type of item.types) {
          out[type] = await (await item.getType(type)).text();
        }
      }
      return out;
    });
    expect(copied["text/plain"]).toBe(`${selected}\n\n${CREDIT}`);
    expect(copied["text/html"]).toContain("<cite>Crownfall</cite>");
    expect(copied["text/html"]).toContain('href="https://michaelvadney.com');
    expect(copied["text/html"]).toContain(selected.slice(0, 20));

    expect(await waitForEvent("excerpt_copy")).toEqual({
      chapter: 2,
      block: 2,
      characters: selected.length,
    });
  });

  it("next-chapter and buy clicks send their chapters and retailer", async () => {
    const { page, named, waitForEvent } = await openExcerpt(DESKTOP);
    await waitForEvent("excerpt_chapter_view");
    await page.click(byTestId("excerpt-next"));
    expect(await waitForEvent("excerpt_next_click")).toEqual({
      from: 1,
      to: 2,
    });
    await waitForEvent("excerpt_chapter_view", (e) => e.chapter === 2);

    const last = CHAPTERS.at(-1).number;
    await page.click(byTestId(`excerpt-tab-${last}`));
    await page.waitForSelector(byTestId("excerpt-end"));
    await page.click(`${byTestId("excerpt-end")} a[href*="amazon."]`);
    expect(await waitForEvent("excerpt_buy_click")).toEqual({
      chapter: last,
      retailer: "amazon",
    });
    await page.bringToFront();
    await Promise.all([
      page.waitForFunction(() => location.pathname === "/store"),
      page.click(`${byTestId("excerpt-end")} a[href="/store"]`),
    ]);
    await waitForEvent("excerpt_buy_click", (e) => e.retailer === "direct");

    expect(named("excerpt_buy_click")).toEqual([
      { chapter: last, retailer: "amazon" },
      { chapter: last, retailer: "direct" },
    ]);
    expect(named("retailer_click")).toEqual([
      { retailer: "amazon", placement: `excerpt_chapter_${last}` },
      { retailer: "direct", placement: `excerpt_chapter_${last}` },
    ]);
    expect(named("excerpt_chapter_view").map((e) => e.chapter)).toEqual(
      CHAPTERS.slice(0, 2)
        .map((c) => c.number)
        .concat(CHAPTERS.length > 2 ? [last] : []),
    );
  });
});

describe("analytics: store and checkout", () => {
  it("edition, add to cart, quantity, cart open and checkout fire after each succeeds", async () => {
    const { page, named, waitForEvent } = await openPage(DESKTOP);
    const createsBefore = server
      .calls()
      .filter((c) => c.type === "paymentLinks.create").length;
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await page.waitForSelector(byTestId("edition-format-paperback"));
    await page.click(byTestId("edition-format-paperback"));
    await page.click(byTestId("edition-unsigned"));
    const listing = `${byTestId("store-product")}[data-product-id="${PAPERBACK_UNSIGNED.itemId}"]`;
    await page.waitForSelector(listing);
    await page.click(`${listing} ${byTestId("add-to-cart")}`);
    await page.waitForSelector(`${listing} ${byTestId("qty-value")}`);
    await page.click(`${listing} ${byTestId("qty-increase")}`);
    await page.click(byTestId("cart-toggle"));
    await page.waitForSelector(`${byTestId("cart-panel")}[data-state="open"]`);
    await page.waitForFunction(
      (sel) => document.querySelector(sel).getAnimations().length === 0,
      {},
      byTestId("cart-panel"),
    );
    await page.click(byTestId("checkout-button"));
    await page.waitForFunction(
      (host) => location.hostname === host,
      { timeout: 15_000 },
      STUB_CHECKOUT_HOST,
    );
    await waitForEvent("checkout_started");

    expect(named("edition_selected")).toEqual([
      { axis: "format", format: "paperback", signed: true },
      { axis: "signing", format: "paperback", signed: false },
    ]);
    expect(named("add_to_cart")).toEqual([
      {
        item_id: PAPERBACK_UNSIGNED.itemId,
        format: "paperback",
        signed: false,
        quantity: 1,
      },
    ]);
    expect(named("cart_quantity_changed")).toEqual([
      { item_id: PAPERBACK_UNSIGNED.itemId, quantity: 2, placement: "store" },
    ]);
    expect(named("cart_opened")).toEqual([
      { placement: "header", item_count: 2 },
    ]);
    expect(named("checkout_started")).toEqual([
      { item_count: 2, subtotal_cents: Number(PAPERBACK_UNSIGNED.cents) * 2 },
    ]);
    expect(named("checkout_error")).toEqual([]);
    // The payment link existed before the event was sent.
    expect(
      server.calls().filter((c) => c.type === "paymentLinks.create"),
    ).toHaveLength(createsBefore + 1);
  });

  it("a failed checkout sends checkout_error and never checkout_started", async () => {
    const { page, named, waitForEvent } = await openPage(DESKTOP, {
      checkoutStatus: 500,
    });
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    const add = await page.waitForSelector(byTestId("add-to-cart"));
    await add.click();
    await page.click(byTestId("cart-toggle"));
    await page.waitForSelector(`${byTestId("cart-panel")}[data-state="open"]`);
    await page.waitForFunction(
      (sel) => document.querySelector(sel).getAnimations().length === 0,
      {},
      byTestId("cart-panel"),
    );
    await page.click(byTestId("checkout-button"));
    await page.waitForSelector(byTestId("checkout-error"));
    expect(await waitForEvent("checkout_error")).toEqual({ reason: "server" });
    await settle(page);
    expect(named("checkout_started")).toEqual([]);
  });
});

describe("analytics: no tracker configured", () => {
  it("sends nothing and raises no errors through reading, copying, the store and checkout", async () => {
    const { page, errors, foreignRequests } = await openExcerpt(DESKTOP, {
      tracker: false,
    });
    await context.overridePermissions(server.baseUrl, [
      "clipboard-read",
      "clipboard-write",
      "clipboard-sanitized-write",
    ]);
    expect(
      await page.$$eval("script[src]", (scripts) =>
        scripts
          .map((s) => s.src)
          .filter((src) => /minilytics|replay/.test(src)),
      ),
    ).toEqual([]);
    expect(await page.evaluate(() => typeof window.minilytics)).toBe(
      "undefined",
    );

    const offsets = await paragraphOffsets(page);
    for (const index of [0, 5, 10]) {
      await scrollTo(page, centreOn(offsets[index], DESKTOP), 60_000);
    }
    await page.evaluate(() => {
      const p = document.querySelector('[data-paragraph="3"]');
      const range = document.createRange();
      range.selectNodeContents(p);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
    });
    await page.keyboard.press("KeyC", { commands: ["Copy"] });
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      CREDIT,
    );
    await page.click(byTestId("excerpt-next"));
    await page.click("#subscribe-button");

    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    const add = await page.waitForSelector(byTestId("add-to-cart"));
    await add.click();
    await page.click(byTestId("cart-toggle"));
    await page.waitForSelector(`${byTestId("cart-panel")}[data-state="open"]`);
    await page.waitForFunction(
      (sel) => document.querySelector(sel).getAnimations().length === 0,
      {},
      byTestId("cart-panel"),
    );
    await page.click(byTestId("checkout-button"));
    await page.waitForFunction(
      (host) => location.hostname === host,
      { timeout: 15_000 },
      STUB_CHECKOUT_HOST,
    );

    expect(errors).toEqual([]);
    expect(
      foreignRequests.filter((url) => /minilytics|analytics/.test(url)),
    ).toEqual([]);
  });
});
