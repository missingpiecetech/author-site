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
import { startServer } from "./support/server.js";
import { STUB_PRODUCTS } from "./support/square-stub-products.js";

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
  CROWNFALL_EDITIONS.find(
    (p) => p.edition.format === format && p.edition.signing === signing,
  );

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
    if (
      dropItemIds &&
      url.pathname === "/api/square/catalog" &&
      request.method() === "GET"
    ) {
      const full = await (
        await fetch(`${server.baseUrl}/api/square/catalog`)
      ).json();
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
    if (
      url.pathname === "/api/square/checkout" &&
      request.method() === "POST"
    ) {
      checkoutBodies.push(JSON.parse(request.postData() || "{}"));
    }
    request.continue();
  });

  return { page, blockedSquareRequests, checkoutBodies };
};

const byTestId = (id) => `[data-testid="${id}"]`;
const storeProduct = (itemId) =>
  `${byTestId("store-product")}[data-product-id="${itemId}"]`;
const FORMAT_TOGGLE = (format) => byTestId(`edition-format-${format}`);
const SIGNING_TOGGLE = (signing) => byTestId(`edition-${signing}`);
const ALL_TOGGLES = [
  FORMAT_TOGGLE("hardcover"),
  FORMAT_TOGGLE("paperback"),
  SIGNING_TOGGLE("signed"),
  SIGNING_TOGGLE("unsigned"),
];

const pressed = (page, selector) =>
  page.$eval(selector, (el) => el.getAttribute("aria-pressed"));

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

const cartItem = (itemId) =>
  `${byTestId("cart-panel")} ${byTestId("cart-item")}[data-product-id="${itemId}"]`;

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844, isMobile: true, hasTouch: true };

const textOf = (page, selector) =>
  page.$eval(selector, (el) => el.textContent.trim());

const waitForText = (page, selector, expected) =>
  page.waitForFunction(
    (sel, want) => document.querySelector(sel)?.textContent.trim() === want,
    {},
    selector,
    expected,
  );

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

// Store -> add each product -> open cart -> set quantities -> checkout, then
// assert what the browser sent, what the server asked Square for, and where
// the browser ended up.
const checkoutFlow = async (kind, lines) => {
  const { page, blockedSquareRequests, checkoutBodies } = await openPage(
    kind === "desktop" ? DESKTOP : MOBILE,
  );
  const createsBefore = server
    .calls()
    .filter((c) => c.type === "paymentLinks.create").length;

  await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });

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

  await openCart[kind](page);
  await page.waitForSelector(`${byTestId("cart-panel")}[data-state="open"]`);
  // The panel slides in; on phones its controls start below the viewport, so
  // wait for the transition to finish before clicking anything inside it.
  await page.waitForFunction(
    (sel) => document.querySelector(sel).getAnimations().length === 0,
    {},
    byTestId("cart-panel"),
  );

  for (const { product, quantity } of lines) {
    await page.waitForSelector(cartItem(product.itemId));
    for (let q = 1; q < quantity; q += 1) {
      await page.click(
        `${cartItem(product.itemId)} ${byTestId("qty-increase")}`,
      );
    }
    await waitForText(
      page,
      `${cartItem(product.itemId)} ${byTestId("qty-value")}`,
      String(quantity),
    );
    // The cart line is the selected catalog item at its own price.
    const lineText = await textOf(page, cartItem(product.itemId));
    expect(lineText).toContain(product.name);
    expect(lineText).toContain(dollars(product.cents * BigInt(quantity)));
  }

  const subtotalCents = lines.reduce(
    (sum, { product, quantity }) => sum + product.cents * BigInt(quantity),
    0n,
  );
  expect(await textOf(page, byTestId("cart-subtotal"))).toBe(
    dollars(subtotalCents),
  );
  if (kind === "desktop") {
    const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
    expect(await textOf(page, byTestId("cart-count"))).toBe(
      String(totalQuantity),
    );
  }

  await page.click(byTestId("checkout-button"));
  await page.waitForFunction(
    (host) => window.location.hostname === host,
    { timeout: 15_000 },
    STUB_CHECKOUT_HOST,
  );

  // Browser -> server request.
  expect(checkoutBodies).toHaveLength(1);
  expect(checkoutBodies[0].items).toHaveLength(lines.length);
  lines.forEach(({ product, quantity }, i) => {
    expect(checkoutBodies[0].items[i]).toMatchObject({
      itemId: product.itemId,
      variationId: product.variationId,
      quantity,
      price: Number(product.cents) / 100,
    });
  });

  // Server -> Square request, as captured by the stub.
  const creates = server
    .calls()
    .filter((c) => c.type === "paymentLinks.create");
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
      basePriceMoney: { amount: product.cents, currency: "USD" },
    });
  });
  expect(request.idempotencyKey).toEqual(expect.any(String));

  // The browser landed on exactly the URL Square returned.
  expect(page.url()).toBe(paymentLink.url);
  expect(blockedSquareRequests).toEqual([]);
};

describe("store checkout: Square is asked for $5.99 shipping and the browser follows the payment link", () => {
  for (const cf of CROWNFALL_EDITIONS) {
    it(`desktop: Crownfall ${cf.edition.format}, ${cf.edition.signing}`, () =>
      checkoutFlow("desktop", [{ product: cf, quantity: 1 }]));
  }

  it("desktop: grid product, quantity 2", () =>
    checkoutFlow("desktop", [{ product: PRINT, quantity: 2 }]));

  it("desktop: two Crownfall editions and a grid product in one cart", () =>
    checkoutFlow("desktop", [
      { product: edition("paperback", "unsigned"), quantity: 2 },
      { product: CROWNFALL, quantity: 1 },
      { product: PRINT, quantity: 1 },
    ]));

  for (const cf of CROWNFALL_EDITIONS) {
    it(`mobile 390px: Crownfall ${cf.edition.format}, ${cf.edition.signing} via the mobile menu cart`, () =>
      checkoutFlow("mobile", [{ product: cf, quantity: 1 }]));
  }

  it("mobile 390px: grid product via the mobile menu cart", () =>
    checkoutFlow("mobile", [{ product: PRINT, quantity: 1 }]));

  it("the server built its Square client from the dummy sandbox env, never real credentials", () => {
    const clients = server.calls().filter((c) => c.type === "client");
    expect(clients.length).toBeGreaterThan(0);
    for (const client of clients) {
      expect(client.environment).toBe("https://connect.squareupsandbox.com");
      expect(client.pid).toBe(server.pid);
    }
  });
});

// Which Crownfall item the listing shows, given whatever the catalog holds.
const listingId = (page) =>
  page.$eval(
    `${byTestId("store-product")}:has(${FORMAT_TOGGLE("hardcover")})`,
    (el) => el.dataset.productId,
  );

const disabledToggles = (page) =>
  page.$$eval(ALL_TOGGLES.join(","), (els) =>
    els.filter((el) => el.disabled).map((el) => el.dataset.testid),
  );

describe("Crownfall edition toggles map to Square items by id", () => {
  it("full catalog: one listing defaulting to signed hardcover, the other item in the grid", async () => {
    const { page } = await openPage(DESKTOP);
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await page.waitForSelector(FORMAT_TOGGLE("hardcover"));

    expect(await listingId(page)).toBe(CROWNFALL.itemId);
    const ids = await page.$$eval(byTestId("store-product"), (els) =>
      els.map((el) => el.dataset.productId),
    );
    expect(ids).toEqual([CROWNFALL.itemId, PRINT.itemId]);
    expect(await disabledToggles(page)).toEqual([]);

    // Toggles are labelled groups of pressed/unpressed pills.
    const groups = await page.$$eval('[role="group"]', (els) =>
      els.map((el) => ({
        label: document.getElementById(el.getAttribute("aria-labelledby"))
          ?.textContent,
        pills: [...el.querySelectorAll("[aria-pressed]")].length,
      })),
    );
    expect(groups).toEqual([
      { label: "Format", pills: 2 },
      { label: "Edition", pills: 2 },
    ]);

    // The ebook line links Amazon in a new tab.
    const ebook = await page.$eval(
      `${storeProduct(CROWNFALL.itemId)} a[href*="amazon.com"]`,
      (a) => ({ target: a.target, rel: a.rel, text: a.textContent }),
    );
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
      dropItemIds: [
        edition("hardcover", "unsigned").itemId,
        edition("paperback", "unsigned").itemId,
      ],
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
    await page.waitForSelector(
      storeProduct(edition("hardcover", "unsigned").itemId),
    );
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
    expect(
      await page.$$eval(byTestId("store-product"), (els) => els.length),
    ).toBe(1);
  });
});

// Issue #7: on the live site / and /contact scroll sideways at 390px. Those
// routes are marked it.fails so the suite stays green while #7 is open, and
// flips red (forcing the marker's removal) the moment #7 is fixed.
const KNOWN_HORIZONTAL_SCROLL = new Set(["/", "/contact"]);

const ROUTES = [
  "/",
  "/books",
  "/podcast",
  "/about",
  "/store",
  "/contact",
  "/checkout/success",
];

describe("no horizontal scroll at 390px", () => {
  for (const route of ROUTES) {
    const test = KNOWN_HORIZONTAL_SCROLL.has(route) ? it.fails : it;
    test(route, async () => {
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
        await page.emulateMediaFeatures([
          { name: "prefers-reduced-motion", value: "reduce" },
        ]);
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
              const hasContent =
                el.textContent.trim() ||
                el.tagName === "IMG" ||
                el.querySelector("img");
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
