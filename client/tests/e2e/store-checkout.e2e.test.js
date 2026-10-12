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
const HARDCOVER = product("hardcover");
const CROWNFALL = product("crownfall");
if (!/Crownfall/.test(CROWNFALL.name)) {
  throw new Error("stub catalog must include a Crownfall product");
}

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
const openPage = async (viewport) => {
  context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport(viewport);

  const blockedSquareRequests = [];
  const checkoutBodies = [];
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
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
    });
  });
  expect(request.idempotencyKey).toEqual(expect.any(String));

  // The browser landed on exactly the URL Square returned.
  expect(page.url()).toBe(paymentLink.url);
  expect(blockedSquareRequests).toEqual([]);
};

describe("store checkout: Square is asked for $5.99 shipping and the browser follows the payment link", () => {
  it("desktop: Crownfall product", () =>
    checkoutFlow("desktop", [{ product: CROWNFALL, quantity: 1 }]));

  it("desktop: other product, quantity 2", () =>
    checkoutFlow("desktop", [{ product: HARDCOVER, quantity: 2 }]));

  it("desktop: both products in one cart", () =>
    checkoutFlow("desktop", [
      { product: CROWNFALL, quantity: 2 },
      { product: HARDCOVER, quantity: 1 },
    ]));

  it("mobile 390px: Crownfall product via the mobile menu cart", () =>
    checkoutFlow("mobile", [{ product: CROWNFALL, quantity: 1 }]));

  it("mobile 390px: other product via the mobile menu cart", () =>
    checkoutFlow("mobile", [{ product: HARDCOVER, quantity: 1 }]));

  it("the server built its Square client from the dummy sandbox env, never real credentials", () => {
    const clients = server.calls().filter((c) => c.type === "client");
    expect(clients.length).toBeGreaterThan(0);
    for (const client of clients) {
      expect(client.environment).toBe("https://connect.squareupsandbox.com");
      expect(client.pid).toBe(server.pid);
    }
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
