// End-to-end lock on the store -> cart -> checkout money path (issue #9).
//
// The real dev server runs with the `square` SDK swapped for a stub (see
// support/register-square-stub.mjs), so the dev middleware executes unchanged
// and every request it would send to Square is captured in a log the test
// reads back. The browser blocks Square hosts outright and serves a
// placeholder for the stub's checkout URL. Nothing reaches Square.
//
// Selectors are data-testid only. The store, cart and navigation are about to
// be restyled, so element types, classes and visible wording are not stable;
// the data-testid hooks are the contract the redesign must keep.

import puppeteer from "puppeteer";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ITEM_UNAVAILABLE } from "../../shared/errors.js";
import { startServer } from "./support/server.js";
import { STUB_PRODUCTS } from "./support/square-stub-products.js";
import {
  EXCERPTS,
  chapterId,
  chapterTitle,
  isSceneBreak,
  parseInline,
  plainText,
  readableChapters,
} from "../../src/excerpts/index.js";

const SHIPPING_FEE = {
  name: "Shipping",
  charge: { amount: 599n, currency: "USD" },
};

const product = (key) => STUB_PRODUCTS.find((p) => p.key === key);
const PRINT = product("print");
const CROWNFALL_EDITIONS = STUB_PRODUCTS.filter((p) => p.edition);
const CROWNFALL = product("crownfall-hardcover-signed");
if (CROWNFALL_EDITIONS.length !== 4) {
  throw new Error("stub catalog must include all four Crownfall editions");
}
const edition = (format, signing) =>
  CROWNFALL_EDITIONS.find((p) => p.edition.format === format && p.edition.signing === signing);

const SQUARE_HOST = /(^|\.)(squareup\.com|squareupsandbox\.com|square\.link)$/i;
const STUB_CHECKOUT_HOST = "checkout.square.test";

let server;
let browser;
let context;

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
});

// A fresh incognito context per test: empty localStorage, so no cart carries
// over between tests.
//
// `dropItemIds` serves the stub catalog with those Square items removed, to
// exercise a catalog that lacks some Crownfall editions without a second
// server.
const openPage = async (viewport, { dropItemIds } = {}) => {
  context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport(viewport);

  const blockedSquareRequests = [];
  const checkoutBodies = [];
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    const url = new URL(request.url());
    if (dropItemIds && url.pathname === "/api/square/catalog" && request.method() === "GET") {
      const full = await (await fetch(`${server.baseUrl}/api/square/catalog`)).json();
      request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...full,
          objects: full.objects.filter((o) => !dropItemIds.includes(o.id)),
        }),
      });
      return;
    }
    if (url.hostname === STUB_CHECKOUT_HOST) {
      request.respond({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>Stub Square checkout</title><h1>Stub Square checkout</h1>",
      });
      return;
    }
    if (SQUARE_HOST.test(url.hostname)) {
      blockedSquareRequests.push(request.url());
      request.abort("blockedbyclient");
      return;
    }
    if (url.pathname === "/api/square/checkout" && request.method() === "POST") {
      checkoutBodies.push(JSON.parse(request.postData() || "{}"));
    }
    request.continue();
  });

  return { page, blockedSquareRequests, checkoutBodies };
};

const byTestId = (id) => `[data-testid="${id}"]`;
const storeProduct = (itemId) => `${byTestId("store-product")}[data-product-id="${itemId}"]`;
const FORMAT_TOGGLE = (format) => byTestId(`edition-format-${format}`);
const SIGNING_TOGGLE = (signing) => byTestId(`edition-${signing}`);
const ALL_TOGGLES = [
  FORMAT_TOGGLE("hardcover"),
  FORMAT_TOGGLE("paperback"),
  SIGNING_TOGGLE("signed"),
  SIGNING_TOGGLE("unsigned"),
];

const pressed = (page, selector) => page.$eval(selector, (el) => el.getAttribute("aria-pressed"));

// Picks a Crownfall edition with the two toggle groups and waits for the
// listing to switch to that Square item.
const selectEdition = async (page, { format, signing }) => {
  await page.waitForSelector(FORMAT_TOGGLE(format));
  await page.click(FORMAT_TOGGLE(format));
  await page.click(SIGNING_TOGGLE(signing));
  const itemId = edition(format, signing).itemId;
  await page.waitForSelector(storeProduct(itemId));
  expect(await pressed(page, FORMAT_TOGGLE(format))).toBe("true");
  expect(await pressed(page, SIGNING_TOGGLE(signing))).toBe("true");
};

const cartItem = (itemId) => `${byTestId("cart-panel")} ${byTestId("cart-item")}[data-product-id="${itemId}"]`;

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844, isMobile: true, hasTouch: true };

const textOf = (page, selector) => page.$eval(selector, (el) => el.textContent.trim());

const waitForText = (page, selector, expected) =>
  page.waitForFunction((sel, want) => document.querySelector(sel)?.textContent.trim() === want, {}, selector, expected);

// The header cart toggle is hidden below md; phones reach the cart through
// the mobile menu.
const openCart = {
  desktop: async (page) => {
    await page.click(byTestId("cart-toggle"));
  },
  mobile: async (page) => {
    await page.click(byTestId("mobile-menu-toggle"));
    const button = await page.waitForSelector(byTestId("mobile-cart-button"), {
      visible: true,
    });
    await button.click();
  },
};

const dollars = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;

const paymentLinkCreates = () => server.calls().filter((c) => c.type === "paymentLinks.create");

// On /store, adds each product to the cart from its card.
const addFromStore = async (page, lines) => {
  for (const { product } of lines) {
    // Crownfall editions share one listing: pick the edition with its toggles
    // first. The listing then carries the selected item's id.
    if (product.edition) await selectEdition(page, product.edition);
    // The stub catalog renders: proves the page talks to our server + stub.
    const card = await page.waitForSelector(storeProduct(product.itemId));
    // Catalog data (not UI copy): the card shows the product's Square name.
    expect(await card.evaluate((el) => el.textContent)).toContain(product.name);
    const addToCart = await card.waitForSelector(byTestId("add-to-cart"));
    await addToCart.click();
    await card.waitForSelector(byTestId("qty-value"));
  }

  // Cart persisted to localStorage under the documented key.
  await page.waitForFunction(
    (count) => {
      const raw = localStorage.getItem("author-site-cart");
      return raw && JSON.parse(raw).state.cartItems.length === count;
    },
    {},
    lines.length,
  );
};

const openCartPanel = async (page, kind) => {
  await openCart[kind](page);
  await page.waitForSelector(`${byTestId("cart-panel")}[data-state="open"]`);
  // The panel slides in; on phones its controls start below the viewport, so
  // wait for the transition to finish before clicking anything inside it.
  await page.waitForFunction(
    (sel) => document.querySelector(sel).getAnimations().length === 0,
    {},
    byTestId("cart-panel"),
  );
};

// In the open cart, raises each line from 1 to its quantity.
const setQuantities = async (page, lines) => {
  for (const { product, quantity } of lines) {
    await page.waitForSelector(cartItem(product.itemId));
    for (let q = 1; q < quantity; q += 1) {
      await page.click(`${cartItem(product.itemId)} ${byTestId("qty-increase")}`);
    }
  }
};

// The open cart holds exactly these lines, quantities, prices and subtotal.
const expectCart = async (page, kind, lines) => {
  for (const { product, quantity } of lines) {
    await waitForText(page, `${cartItem(product.itemId)} ${byTestId("qty-value")}`, String(quantity));
    // The cart line is the selected catalog item at its own price.
    const lineText = await textOf(page, cartItem(product.itemId));
    expect(lineText).toContain(product.name);
    expect(lineText).toContain(dollars(product.cents * BigInt(quantity)));
  }
  expect(
    await page.$$eval(`${byTestId("cart-panel")} ${byTestId("cart-item")}`, (els) =>
      els.map((el) => el.dataset.productId),
    ),
  ).toEqual(lines.map(({ product }) => product.itemId));

  const subtotalCents = lines.reduce((sum, { product, quantity }) => sum + product.cents * BigInt(quantity), 0n);
  expect(await textOf(page, byTestId("cart-subtotal"))).toBe(dollars(subtotalCents));
  if (kind === "desktop") {
    const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
    expect(await textOf(page, byTestId("cart-count"))).toBe(String(totalQuantity));
  }
};

// Clicks Checkout in the open cart, then asserts what the browser sent, what
// the server asked Square for, and where the browser ended up.
const checkoutAndExpect = async ({ page, blockedSquareRequests, checkoutBodies }, lines) => {
  const createsBefore = paymentLinkCreates().length;
  const bodiesBefore = checkoutBodies.length;

  await page.click(byTestId("checkout-button"));
  await page.waitForFunction((host) => window.location.hostname === host, { timeout: 15_000 }, STUB_CHECKOUT_HOST);

  // Browser -> server request: only what to buy; price, name and the return
  // address are the server's to decide.
  expect(checkoutBodies.slice(bodiesBefore)).toEqual([
    {
      items: lines.map(({ product, quantity }) => ({
        variationId: product.variationId,
        quantity,
      })),
    },
  ]);

  // Server -> Square request, as captured by the stub.
  const creates = paymentLinkCreates();
  expect(creates).toHaveLength(createsBefore + 1);
  const { request, paymentLink } = creates.at(-1);

  expect(request.checkoutOptions.shippingFee).toEqual(SHIPPING_FEE);
  expect(request.checkoutOptions.askForShippingAddress).toBe(true);
  expect(request.order.locationId).toBe("E2E_LOCATION");
  expect(request.order.lineItems).toHaveLength(lines.length);
  lines.forEach(({ product, quantity }, i) => {
    expect(request.order.lineItems[i]).toMatchObject({
      catalogObjectId: product.variationId,
      quantity: String(quantity),
      name: product.name,
      basePriceMoney: { amount: product.cents, currency: "USD" },
    });
  });
  expect(request.checkoutOptions.redirectUrl).toBe(`${server.baseUrl}/checkout/success`);
  expect(request.idempotencyKey).toEqual(expect.any(String));

  // The browser landed on exactly the URL Square returned.
  expect(page.url()).toBe(paymentLink.url);
  expect(blockedSquareRequests).toEqual([]);
};

// Store -> add each product -> open cart -> set quantities -> checkout.
const checkoutFlow = async (kind, lines) => {
  const opened = await openPage(kind === "desktop" ? DESKTOP : MOBILE);
  const { page } = opened;
  await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
  await addFromStore(page, lines);
  await openCartPanel(page, kind);
  await setQuantities(page, lines);
  await expectCart(page, kind, lines);
  await checkoutAndExpect(opened, lines);
};

describe("store checkout: Square is asked for $5.99 shipping and the browser follows the payment link", () => {
  for (const cf of CROWNFALL_EDITIONS) {
    it(`desktop: Crownfall ${cf.edition.format}, ${cf.edition.signing}`, () =>
      checkoutFlow("desktop", [{ product: cf, quantity: 1 }]));
  }

  it("desktop: grid product, quantity 2", () => checkoutFlow("desktop", [{ product: PRINT, quantity: 2 }]));

  it("desktop: two Crownfall editions and a grid product in one cart", () =>
    checkoutFlow("desktop", [
      { product: edition("paperback", "unsigned"), quantity: 2 },
      { product: CROWNFALL, quantity: 1 },
      { product: PRINT, quantity: 1 },
    ]));

  it("mobile 390px: grid product via the mobile menu cart", () =>
    checkoutFlow("mobile", [{ product: PRINT, quantity: 1 }]));

  it("the cart stops at 20 of one item", async () => {
    const { page } = await openPage(DESKTOP);
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    const card = await page.waitForSelector(storeProduct(PRINT.itemId));
    await (await card.waitForSelector(byTestId("add-to-cart"))).click();
    const increase = await card.waitForSelector(byTestId("qty-increase"));
    for (let q = 1; q < 25; q += 1) {
      await increase.evaluate((button) => button.click());
    }
    await waitForText(page, `${storeProduct(PRINT.itemId)} ${byTestId("qty-value")}`, "20");
    expect(await increase.evaluate((button) => button.disabled)).toBe(true);
  });

  it("the server built its Square client from the dummy sandbox env, never real credentials", () => {
    const clients = server.calls().filter((c) => c.type === "client");
    expect(clients.length).toBeGreaterThan(0);
    for (const client of clients) {
      expect(client.environment).toBe("https://connect.squareupsandbox.com");
      expect(client.pid).toBe(server.pid);
    }
  });
});

// Issue #41: the cart is persisted to localStorage so a visitor who reloads, or
// comes back later, still has it. These reload the page and read the cart back.
describe("the cart survives a page reload", () => {
  const LINES = [
    { product: edition("paperback", "signed"), quantity: 1 },
    { product: PRINT, quantity: 2 },
  ];

  // Fills the cart on /store through the UI and closes the panel again.
  const fillCart = async (page, kind) => {
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await addFromStore(page, LINES);
    await openCartPanel(page, kind);
    await setQuantities(page, LINES);
    await expectCart(page, kind, LINES);
  };

  for (const kind of ["desktop", "mobile"]) {
    it(`${kind}: reload on /store restores the lines, quantities and subtotal, and checkout sends them to Square`, async () => {
      const opened = await openPage(kind === "desktop" ? DESKTOP : MOBILE);
      const { page } = opened;
      await fillCart(page, kind);

      await page.reload({ waitUntil: "load" });

      // The panel's open state is not stored: the visitor reopens the cart.
      await page.waitForSelector(`${byTestId("cart-panel")}[data-state="closed"]`);
      await openCartPanel(page, kind);
      await expectCart(page, kind, LINES);
      await checkoutAndExpect(opened, LINES);
    });
  }

  it("the cart is site-wide: a fresh load of /books shows the same count and lines", async () => {
    const { page } = await openPage(DESKTOP);
    await fillCart(page, "desktop");

    await page.goto(`${server.baseUrl}/books`, { waitUntil: "load" });

    await waitForText(page, byTestId("cart-count"), "3");
    await openCartPanel(page, "desktop");
    await expectCart(page, "desktop", LINES);
  });

  // The catalog changed between visits: the stored cart still holds an item
  // Square no longer sells. This is the one case that edits localStorage,
  // because no UI path can add an item the catalog does not have.
  it("a stored item Square no longer sells is refused at checkout with a sentence, and checkout works once it is removed", async () => {
    const RETIRED_ID = "E2E_ITEM_RETIRED";
    const kept = [{ product: PRINT, quantity: 1 }];
    const opened = await openPage(DESKTOP);
    const { page, checkoutBodies } = opened;
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await addFromStore(page, kept);
    await page.evaluate((retiredId) => {
      const stored = JSON.parse(localStorage.getItem("author-site-cart"));
      stored.state.cartItems.push({
        ...stored.state.cartItems[0],
        id: retiredId,
        variationId: "E2E_VAR_RETIRED",
        name: "E2E Retired Item",
      });
      localStorage.setItem("author-site-cart", JSON.stringify(stored));
    }, RETIRED_ID);

    await page.reload({ waitUntil: "load" });
    await waitForText(page, byTestId("cart-count"), "2");
    await openCartPanel(page, "desktop");
    await page.waitForSelector(cartItem(RETIRED_ID));

    const createsBefore = paymentLinkCreates().length;
    await page.click(byTestId("checkout-button"));
    await waitForText(page, byTestId("checkout-error"), ITEM_UNAVAILABLE);
    expect(checkoutBodies).toHaveLength(1);
    expect(paymentLinkCreates()).toHaveLength(createsBefore);
    expect(new URL(page.url()).pathname).toBe("/store");

    // The sentence tells the visitor to remove the item; doing so unblocks checkout.
    await page.click(`${cartItem(RETIRED_ID)} ${byTestId("qty-decrease")}`);
    await page.waitForSelector(cartItem(RETIRED_ID), { hidden: true });
    await expectCart(page, "desktop", kept);
    await checkoutAndExpect(opened, kept);
  });
});

// Which Crownfall item the listing shows, given whatever the catalog holds.
const listingId = (page) =>
  page.$eval(`${byTestId("store-product")}:has(${FORMAT_TOGGLE("hardcover")})`, (el) => el.dataset.productId);

const disabledToggles = (page) =>
  page.$$eval(ALL_TOGGLES.join(","), (els) => els.filter((el) => el.disabled).map((el) => el.dataset.testid));

describe("Crownfall edition toggles map to Square items by id", () => {
  it("full catalog: one listing defaulting to signed hardcover, the other item in the grid", async () => {
    const { page } = await openPage(DESKTOP);
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await page.waitForSelector(FORMAT_TOGGLE("hardcover"));

    expect(await listingId(page)).toBe(CROWNFALL.itemId);
    const ids = await page.$$eval(byTestId("store-product"), (els) => els.map((el) => el.dataset.productId));
    expect(ids).toEqual([CROWNFALL.itemId, PRINT.itemId]);
    expect(await disabledToggles(page)).toEqual([]);

    // Toggles are labelled groups of pressed/unpressed pills.
    const groups = await page.$$eval('[role="group"]', (els) =>
      els.map((el) => ({
        label: document.getElementById(el.getAttribute("aria-labelledby"))?.textContent,
        pills: [...el.querySelectorAll("[aria-pressed]")].length,
      })),
    );
    expect(groups).toEqual([
      { label: "Format", pills: 2 },
      { label: "Edition", pills: 2 },
    ]);

    // The ebook line links Amazon in a new tab.
    const ebook = await page.$eval(`${storeProduct(CROWNFALL.itemId)} a[href*="amazon.com"]`, (a) => ({
      target: a.target,
      rel: a.rel,
      text: a.textContent,
    }));
    expect(ebook).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
      text: "Amazon",
    });

    // Title and price follow the selection.
    for (const cf of CROWNFALL_EDITIONS) {
      await selectEdition(page, cf.edition);
      const text = await textOf(page, storeProduct(cf.itemId));
      expect(text).toContain(cf.name);
      expect(text).toContain(dollars(cf.cents));
    }
  });

  it("an edition missing from both pairings has its toggle disabled", async () => {
    const { page } = await openPage(DESKTOP, {
      dropItemIds: [edition("hardcover", "unsigned").itemId, edition("paperback", "unsigned").itemId],
    });
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await page.waitForSelector(FORMAT_TOGGLE("hardcover"));

    expect(await disabledToggles(page)).toEqual(["edition-unsigned"]);
    expect(await pressed(page, SIGNING_TOGGLE("unsigned"))).toBe("false");
    await page.click(SIGNING_TOGGLE("unsigned"));
    expect(await listingId(page)).toBe(CROWNFALL.itemId);
  });

  it("a single missing combination is never selected: the other toggle flips", async () => {
    const missing = edition("paperback", "unsigned");
    const { page } = await openPage(DESKTOP, { dropItemIds: [missing.itemId] });
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await page.waitForSelector(FORMAT_TOGGLE("hardcover"));
    expect(await disabledToggles(page)).toEqual([]);

    // Hardcover unsigned -> Paperback: paperback unsigned is missing, so the
    // edition flips to signed.
    await selectEdition(page, { format: "hardcover", signing: "unsigned" });
    await page.click(FORMAT_TOGGLE("paperback"));
    const paperbackSigned = edition("paperback", "signed");
    await page.waitForSelector(storeProduct(paperbackSigned.itemId));
    expect(await pressed(page, SIGNING_TOGGLE("signed"))).toBe("true");

    // Paperback signed -> Unsigned: the format flips to hardcover.
    await page.click(SIGNING_TOGGLE("unsigned"));
    await page.waitForSelector(storeProduct(edition("hardcover", "unsigned").itemId));
    expect(await pressed(page, FORMAT_TOGGLE("hardcover"))).toBe("true");
    expect(await page.$(storeProduct(missing.itemId))).toBeNull();
  });

  it("without signed hardcover, the listing defaults to the first available edition", async () => {
    const { page } = await openPage(DESKTOP, {
      dropItemIds: [CROWNFALL.itemId],
    });
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await page.waitForSelector(FORMAT_TOGGLE("hardcover"));
    expect(await listingId(page)).toBe(edition("paperback", "signed").itemId);
  });

  it("with no mapped Crownfall item there is no listing and everything is in the grid", async () => {
    const { page } = await openPage(DESKTOP, {
      dropItemIds: CROWNFALL_EDITIONS.map((cf) => cf.itemId),
    });
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await page.waitForSelector(storeProduct(PRINT.itemId));
    expect(await page.$$(ALL_TOGGLES.join(","))).toEqual([]);
    expect(await page.$$eval(byTestId("store-product"), (els) => els.length)).toBe(1);
  });
});

const ROUTES = [
  "/",
  "/books",
  "/podcast",
  "/about",
  "/store",
  "/contact",
  "/checkout/success",
  EXCERPTS.crownfall.path,
];

// Issue #7: every route must fit a 390px phone, measured with animations live.
describe("no horizontal scroll at 390px", () => {
  for (const route of ROUTES) {
    it(route, async () => {
      const { page } = await openPage(MOBILE);
      await page.goto(`${server.baseUrl}${route}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      // Let entrance animations (AOS, 800ms on the home page) settle.
      await new Promise((r) => setTimeout(r, 1200));

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(clientWidth).toBe(390);
      expect(scrollWidth).toBe(clientWidth);
    });
  }
});

// Entrance animations start at opacity: 0. For visitors who ask for reduced
// motion they must not run at all, so nothing may be left invisible after
// scrolling the whole page (catches AOS and keyframe classes alike).
describe("prefers-reduced-motion leaves no content invisible", () => {
  for (const route of ROUTES) {
    it(route, async () => {
      for (const viewport of [DESKTOP, MOBILE]) {
        const { page } = await openPage(viewport);
        await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
        await page.goto(`${server.baseUrl}${route}`, { waitUntil: "load" });
        await page.evaluate(async () => {
          const step = window.innerHeight / 2;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 30));
          }
        });
        await new Promise((r) => setTimeout(r, 300));

        const invisible = await page.evaluate(() =>
          [...document.querySelectorAll("body *")]
            .filter((el) => !el.closest('[data-testid="cart-panel"]'))
            .filter((el) => {
              const style = getComputedStyle(el);
              if (style.opacity !== "0" || style.display === "none") {
                return false;
              }
              const box = el.getBoundingClientRect();
              const hasContent = el.textContent.trim() || el.tagName === "IMG" || el.querySelector("img");
              return box.width > 1 && box.height > 1 && hasContent;
            })
            .map((el) => `${el.tagName} ${el.textContent.trim().slice(0, 40)}`),
        );
        expect(invisible, `${viewport.width}px`).toEqual([]);
        await context.close();
        context = undefined;
      }
    });
  }
});

describe("newsletter", () => {
  it("Subscribe and Join the Circle open the MailerLite form", async () => {
    const { page } = await openPage(DESKTOP);
    // Record ml() calls instead of letting the MailerLite script handle them.
    await page.evaluateOnNewDocument(() => {
      window.__mlCalls = [];
      Object.defineProperty(window, "ml", {
        configurable: true,
        get:
          () =>
          (...args) =>
            window.__mlCalls.push(args),
        set: () => {},
      });
    });
    await page.goto(`${server.baseUrl}/books`, { waitUntil: "load" });
    expect(await textOf(page, "#newsletter-heading")).toMatch(
      /^(Join the Journey|Never Miss a Release|Receive Updates)$/,
    );
    await page.click("#subscribe-button");
    const join = await page.waitForSelector("::-p-xpath(//header//button[normalize-space()='Join the Circle'])", {
      visible: true,
    });
    await join.click();
    const shows = await page.evaluate(() => window.__mlCalls.filter((call) => call[0] === "show"));
    expect(shows).toEqual([
      ["show", "oQiRIg", true],
      ["show", "oQiRIg", true],
    ]);
  });
});

// The opacity check above proves nothing is left invisible; this one proves
// nothing actually moves.
describe("prefers-reduced-motion: nothing animates", () => {
  for (const route of ROUTES) {
    it(route, async () => {
      const { page } = await openPage(DESKTOP);
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      await page.goto(`${server.baseUrl}${route}`, { waitUntil: "load" });
      await page.evaluate(async () => {
        const step = window.innerHeight / 2;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 30));
        }
      });
      const motion = await page.evaluate(() => ({
        aos: document.querySelectorAll(".aos-init").length,
        running: document
          .getAnimations()
          .filter((a) => !a.effect?.target?.closest?.('[data-testid="cart-panel"]'))
          .map((a) => a.animationName ?? a.transitionProperty),
      }));
      expect(motion).toEqual({ aos: 0, running: [] });
    });
  }
});

// The excerpt text is pasted into src/excerpts/crownfall.js later, so these
// follow the data: with text, three chapter openers and Home's opening; while
// it is empty, the route's coming-soon state and no Home section.
describe("Crownfall excerpt", () => {
  const { path, excerpt } = EXCERPTS.crownfall;
  const chapters = readableChapters(excerpt);

  it(`${path} renders ${chapters.length ? "its chapters" : "the coming-soon state"}`, async () => {
    const { page } = await openPage(MOBILE);
    await page.goto(`${server.baseUrl}${path}`, { waitUntil: "load" });
    await page.waitForSelector("h1");
    expect(await page.$eval("h1", (el) => el.textContent)).toBe("Crownfall");

    if (chapters.length) {
      const rendered = await page.$$eval(byTestId("excerpt-chapter"), (els) =>
        els.map((el) => ({
          id: el.id,
          heading: el.querySelector("h2").textContent,
        })),
      );
      expect(rendered).toEqual(chapters.map((c) => ({ id: chapterId(c), heading: chapterTitle(c) })));
      expect(await page.$(byTestId("excerpt-coming-soon"))).toBeNull();
    } else {
      await page.waitForSelector(byTestId("excerpt-coming-soon"));
      const back = await page.$eval(
        byTestId("excerpt-coming-soon"),
        (el) => el.closest("section").querySelector("a")?.pathname,
      );
      expect(back).toBe("/books");
      expect(await page.$(byTestId("excerpt-chapter"))).toBeNull();
    }
  });

  // One chapter shows at a time, so this walks the tabs and reads the
  // visible panel each time.
  it.runIf(chapters.length > 0)("every paragraph is set as written, with *italics* as <em>", async () => {
    const { page } = await openPage(MOBILE);
    await page.goto(`${server.baseUrl}${path}`, { waitUntil: "load" });
    await page.waitForSelector(byTestId("excerpt-chapter"));
    const rendered = [];
    for (const chapter of chapters) {
      if (chapters.length > 1) {
        await page.click(byTestId(`excerpt-tab-${chapter.number}`));
      }
      rendered.push(
        await page.$$eval(byTestId("excerpt-chapter"), (els) => {
          const shown = els.filter((el) => el.checkVisibility());
          if (shown.length !== 1) return { shown: shown.map((el) => el.id) };
          const [panel] = shown;
          return {
            id: panel.id,
            paragraphs: [...panel.querySelectorAll("p")].map((p) => p.textContent),
            italics: [...panel.querySelectorAll("p em")].map((em) => em.textContent),
            hasMarkup: /[*\\]/.test(panel.textContent),
          };
        }),
      );
    }
    expect(rendered).toEqual(
      chapters.map((c) => {
        const prose = c.paragraphs.filter((p) => !isSceneBreak(p));
        return {
          id: chapterId(c),
          hasMarkup: false,
          paragraphs: prose.map(plainText),
          italics: prose.flatMap((p) =>
            parseInline(p)
              .filter((segment) => segment.italic)
              .map((segment) => segment.text),
          ),
        };
      }),
    );
  });

  it.runIf(chapters.length > 1)(
    "chapter tabs follow clicks, arrow keys and the next-chapter button, every chapter end offers the book, and the hash follows them",
    async () => {
      const { page } = await openPage(MOBILE);
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      await page.goto(`${server.baseUrl}${path}`, { waitUntil: "load" });
      await page.waitForSelector(byTestId("excerpt-chapter"));
      const historyLength = await page.evaluate(() => history.length);
      const current = () =>
        page.evaluate(() => {
          const panel = [...document.querySelectorAll('[data-testid="excerpt-chapter"]')].find((el) =>
            el.checkVisibility(),
          );
          const selected = [...document.querySelectorAll('[role="tab"]')].filter(
            (tab) => tab.getAttribute("aria-selected") === "true",
          );
          return {
            hash: location.hash,
            panel: panel.id,
            tab: selected.map((tab) => tab.getAttribute("aria-controls")),
            focusable: [...document.querySelectorAll('[role="tab"]')]
              .filter((tab) => tab.tabIndex === 0)
              .map((tab) => tab.getAttribute("aria-controls")),
            headingTop: panel.querySelector("h2").getBoundingClientRect().top,
            headerBottom: document.querySelector("header").getBoundingClientRect().bottom,
            hasEnd: !!document.querySelector('[data-testid="excerpt-end"]'),
          };
        });
      const expectChapter = (state, index) => {
        const id = chapterId(chapters[index]);
        expect(state).toMatchObject({
          panel: id,
          tab: [id],
          focusable: [id],
          hasEnd: index === chapters.length - 1,
        });
      };

      const first = await current();
      expectChapter(first, 0);
      expect(first.hash).toBe("");

      await page.click(byTestId(`excerpt-tab-${chapters[1].number}`));
      let state = await current();
      expectChapter(state, 1);
      expect(state.hash).toBe(`#${chapterId(chapters[1])}`);

      await page.keyboard.press("ArrowLeft");
      expectChapter(await current(), 0);
      await page.keyboard.press("End");
      expectChapter(await current(), chapters.length - 1);
      await page.keyboard.press("ArrowRight");
      expectChapter(await current(), 0);
      expect(await page.evaluate(() => document.activeElement.getAttribute("aria-controls"))).toBe(
        chapterId(chapters[0]),
      );

      for (let index = 1; index < chapters.length; index += 1) {
        const end = await page.evaluate(() => {
          const panel = document.querySelector('[data-testid="excerpt-chapter"]:not([hidden])');
          const next = panel.querySelector('[data-testid="excerpt-next"]');
          return {
            label: [...next.childNodes]
              .filter((node) => !node.classList?.contains("sr-only"))
              .map((node) => node.textContent)
              .join(""),
            buy: panel.querySelector('[data-testid="excerpt-buy"]').pathname,
          };
        });
        expect(end).toEqual({
          label: chapterTitle(chapters[index]),
          buy: "/store",
        });
        expect(await page.$(`aria/Next: ${chapterTitle(chapters[index])}[role="button"]`)).not.toBeNull();
        await page.click(`[data-testid="excerpt-chapter"]:not([hidden]) ${byTestId("excerpt-next")}`);
        state = await current();
        expectChapter(state, index);
        expect(state.hash).toBe(`#${chapterId(chapters[index])}`);
        expect(state.headingTop).toBeGreaterThanOrEqual(state.headerBottom);
        expect(state.headingTop).toBeLessThan(state.headerBottom + 120);
      }
      expect(await page.$(`[data-testid="excerpt-chapter"]:not([hidden]) ${byTestId("excerpt-next")}`)).toBeNull();
      expect(await page.$(`[data-testid="excerpt-chapter"]:not([hidden]) ${byTestId("excerpt-buy")}`)).toBeNull();
      expect(await page.$eval(`${byTestId("excerpt-end")} a[href="/store"]`, (a) => a.pathname)).toBe("/store");
      expect(await page.evaluate(() => history.length)).toBe(historyLength);
    },
  );

  it.runIf(chapters.length > 1)("a chapter hash opens that chapter below the sticky header", async () => {
    for (const chapter of chapters) {
      const { page } = await openPage(MOBILE);
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      const target = chapterId(chapter);
      await page.goto(`${server.baseUrl}${path}#${target}`, {
        waitUntil: "load",
      });
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 300));
      const { top, headerBottom, isShown, isSelected } = await page.evaluate(
        (id, tab) => {
          const panel = document.getElementById(id);
          return {
            top: panel.querySelector("h2").getBoundingClientRect().top,
            headerBottom: document.querySelector("header").getBoundingClientRect().bottom,
            isShown: panel.checkVisibility(),
            isSelected: document.querySelector(`[data-testid="${tab}"]`).getAttribute("aria-selected") === "true",
          };
        },
        target,
        `excerpt-tab-${chapter.number}`,
      );
      expect({ target, isShown, isSelected }).toEqual({
        target,
        isShown: true,
        isSelected: true,
      });
      expect(top).toBeGreaterThanOrEqual(headerBottom);
      expect(top).toBeLessThan(headerBottom + 120);
      await context.close();
      context = undefined;
    }
  });

  it(`Home ${chapters.length ? "shows the opening and links to the excerpt" : "hides Read an Excerpt"}`, async () => {
    const { page } = await openPage(DESKTOP);
    await page.goto(`${server.baseUrl}/`, { waitUntil: "load" });
    await page.waitForSelector("h1");
    const link = await page.$(byTestId("excerpt-keep-reading"));
    if (chapters.length) {
      expect(await page.$eval("#excerpt-heading", (el) => el.textContent)).toBe(chapterTitle(chapters[0]));
      await Promise.all([page.waitForFunction((p) => location.pathname === p, {}, path), link.click()]);
      await page.waitForSelector(byTestId("excerpt-chapter"));
      expect(
        await page.$$eval(byTestId("excerpt-chapter"), (els) =>
          els.filter((el) => el.checkVisibility()).map((el) => el.id),
        ),
      ).toEqual([chapterId(chapters[0])]);
    } else {
      expect(link).toBeNull();
      expect(await page.$("#excerpt")).toBeNull();
    }
  });
});
