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

// Shared chrome from the dark re-skin (header, footer, newsletter, tokens).
// These hold on every page regardless of how the page itself is styled.
const NAV_LABELS = ["Home", "Books", "Podcast", "About", "Store", "Contact"];
const XL = 1280; // Tailwind `xl`: full nav from here up, hamburger below

describe("header: sticky, sized by --header-h, never wraps", () => {
  for (const width of [1440, 1280, 1100, 390]) {
    it(`${width}px`, async () => {
      const viewport =
        width === 390 ? MOBILE : { width, height: DESKTOP.height };
      const { page } = await openPage(viewport);
      await page.goto(`${server.baseUrl}/books`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);

      const header = await page.evaluate(() => {
        const el = document.querySelector("header");
        const visible = (node) =>
          !!node &&
          getComputedStyle(node).display !== "none" &&
          node.getBoundingClientRect().width > 0;
        const rem = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        const headerVar =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--header-h",
            ),
          ) * rem;
        const desktopList = el.querySelector("nav ul");
        // A label that wraps renders its text on more than one line box.
        const wrapped = [...el.querySelectorAll("a, button")]
          .filter(visible)
          .filter((node) => {
            const range = document.createRange();
            range.selectNodeContents(node);
            const tops = new Set(
              [...range.getClientRects()].map((r) => Math.round(r.top)),
            );
            return tops.size > 1;
          })
          .map((node) => node.textContent.trim());
        const bar = el.getBoundingClientRect();
        const outside = [...el.querySelector("nav").children]
          .filter(visible)
          .map((node) => node.getBoundingClientRect())
          .filter(
            (r) =>
              r.left < 0 ||
              r.right > window.innerWidth ||
              r.top < bar.top ||
              r.bottom > bar.bottom,
          ).length;
        return {
          height: bar.height,
          headerVar,
          position: getComputedStyle(el).position,
          desktopLinks: visible(desktopList)
            ? [...desktopList.querySelectorAll("a")].map((a) =>
                a.textContent.trim(),
              )
            : null,
          hamburger: visible(
            document.querySelector('[data-testid="mobile-menu-toggle"]'),
          ),
          wrapped,
          outside,
        };
      });

      expect(header.height).toBe(header.headerVar);
      expect(header.height).toBe(width >= 1024 ? 96 : 68);
      expect(header.position).toBe("sticky");
      expect(header.wrapped).toEqual([]);
      expect(header.outside).toBe(0);
      if (width >= XL) {
        expect(header.desktopLinks).toEqual(NAV_LABELS);
        expect(header.hamburger).toBe(false);
      } else {
        expect(header.desktopLinks).toBeNull();
        expect(header.hamburger).toBe(true);
        await page.click(byTestId("mobile-menu-toggle"));
        await page.waitForSelector(byTestId("mobile-cart-button"), {
          visible: true,
        });
        const menu = await page.$$eval("#mobile-menu a", (links) =>
          links.map((a) => a.firstChild.textContent.trim()),
        );
        expect(menu).toEqual(NAV_LABELS);
        expect(await textOf(page, byTestId("mobile-cart-button"))).toBe(
          "Cart (0)",
        );
      }

      // Still pinned to the top after scrolling down.
      await page.evaluate(() => window.scrollTo(0, 1500));
      await page.waitForFunction(() => window.scrollY > 0);
      expect(
        await page.$eval("header", (el) => el.getBoundingClientRect().top),
      ).toBe(0);
    });
  }
});

describe("footer and newsletter", () => {
  it("footer keeps the site links, adds Press Kit and Goodreads, and lists the socials", async () => {
    const { page } = await openPage(DESKTOP);
    await page.goto(`${server.baseUrl}/books`, { waitUntil: "load" });
    const footer = await page.$eval("footer", (el) => ({
      links: [...el.querySelectorAll("nav a")].map((a) => a.textContent.trim()),
      routes: [...el.querySelectorAll("nav a")].map((a) =>
        a.getAttribute("href"),
      ),
      socials: [...el.querySelectorAll("a[aria-label]")].map((a) => [
        a.getAttribute("aria-label"),
        new URL(a.href).hostname,
      ]),
    }));
    expect(footer.links).toEqual([...NAV_LABELS, "Press Kit"]);
    expect(footer.routes.slice(0, 6)).toEqual([
      "/",
      "/books",
      "/podcast",
      "/about",
      "/store",
      "/contact",
    ]);
    expect(footer.routes[6]).toMatch(/^https:\/\/drive\.google\.com\//);
    expect(footer.socials).toContainEqual(["Goodreads", "www.goodreads.com"]);
    for (const name of ["YouTube", "Instagram", "X", "Bluesky", "Threads"]) {
      expect(footer.socials.map(([label]) => label)).toContain(name);
    }
  });

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
    const join = await page.waitForSelector(
      "::-p-xpath(//header//button[normalize-space()='Join the Circle'])",
      { visible: true },
    );
    await join.click();
    const shows = await page.evaluate(() =>
      window.__mlCalls.filter((call) => call[0] === "show"),
    );
    expect(shows).toEqual([
      ["show", "oQiRIg", true],
      ["show", "oQiRIg", true],
    ]);
  });
});

describe("design tokens", () => {
  it("dark ground, self-hosted serif fonts, gold focus ring", async () => {
    const { page } = await openPage(DESKTOP);
    await page.goto(`${server.baseUrl}/books`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const tokens = await page.evaluate(() => ({
      body: getComputedStyle(document.body).backgroundColor,
      cormorant: document.fonts.check('600 20px "Cormorant Garamond"'),
      spectral: document.fonts.check('400 16px "Spectral"'),
      loaded: [...document.fonts]
        .filter((f) => f.status === "loaded")
        .map((f) => f.family.replace(/"/g, "")),
    }));
    expect(tokens.body).toBe("rgb(18, 16, 23)");
    expect(tokens.cormorant).toBe(true);
    expect(tokens.spectral).toBe(true);
    expect(tokens.loaded).toEqual(
      expect.arrayContaining(["Cormorant Garamond", "Spectral"]),
    );

    await page.keyboard.press("Tab");
    // transition-colors also animates outline-color; read it once settled.
    await page.waitForFunction(
      () =>
        document.activeElement !== document.body &&
        document.activeElement.getAnimations().length === 0,
    );
    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement);
      return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;
    });
    expect(outline).toBe("solid 2px rgb(207, 174, 107)");
  });
});

// The opacity check above proves nothing is left invisible; this one proves
// nothing actually moves. "/" still runs AOS (HomePage.jsx AOS.init has no
// `disable`) and an unprefixed animate-bounce, so it is it.fails until the
// Home page conversion gates them.
const KNOWN_MOTION_UNDER_REDUCE = new Set(["/"]);

describe("prefers-reduced-motion: nothing animates", () => {
  for (const route of ROUTES) {
    const test = KNOWN_MOTION_UNDER_REDUCE.has(route) ? it.fails : it;
    test(route, async () => {
      const { page } = await openPage(DESKTOP);
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
      const motion = await page.evaluate(() => ({
        aos: document.querySelectorAll(".aos-init").length,
        running: document
          .getAnimations()
          .filter(
            (a) => !a.effect?.target?.closest?.('[data-testid="cart-panel"]'),
          )
          .map((a) => a.animationName ?? a.transitionProperty),
      }));
      expect(motion).toEqual({ aos: 0, running: [] });
    });
  }
});

describe("motion allowed: entrance animations still run", () => {
  it("/ initialises AOS and runs keyframe animations", async () => {
    const { page } = await openPage(DESKTOP);
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "no-preference" },
    ]);
    await page.goto(`${server.baseUrl}/`, { waitUntil: "load" });
    await page.waitForSelector(".aos-init");
    const keyframes = await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.animationName !== undefined)
          .length,
    );
    expect(keyframes).toBeGreaterThan(0);
  });
});
