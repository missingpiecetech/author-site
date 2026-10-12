// Locks the Square checkout request built by BOTH server implementations:
//   - functions/api/square/checkout.js  (Cloudflare Pages Function, production)
//   - api/squareApiPlugin.js            (Vite dev middleware)
//
// The `square` SDK is mocked, so nothing here touches the network.
//
// Deliberately NOT asserted: that the client-supplied price, title or
// redirectUrl are forwarded. Issue #4 makes the server stop trusting those, and
// these tests must keep passing when it lands. What is locked is what the
// customer is actually charged for shipping and what Square is asked to sell:
// the $5.99 flat shipping fee, the shipping-address prompt, catalogObjectId and
// quantity.
//
// If #4 makes the server look prices up in the catalog, extend the mock client
// below with that catalog method; the assertions should not need to change.

import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

const square = vi.hoisted(() => {
  const SquareEnvironment = {
    Production: "https://connect.squareup.com",
    Sandbox: "https://connect.squareupsandbox.com",
  };
  const state = { instances: [], createImpl: null };

  class SquareClient {
    constructor(options) {
      this.options = options;
      this.checkout = {
        paymentLinks: {
          create: vi.fn((request) => state.createImpl(request)),
        },
      };
      this.catalog = { list: vi.fn() };
      this.customers = { create: vi.fn() };
      state.instances.push(this);
    }
  }

  return { SquareClient, SquareEnvironment, state };
});

vi.mock("square", () => ({
  SquareClient: square.SquareClient,
  SquareEnvironment: square.SquareEnvironment,
}));

const { onRequestPost } = await import(
  "../../functions/api/square/checkout.js"
);
const { createSquareApiPlugin } = await import("../../api/squareApiPlugin.js");

const SHIPPING_FEE = {
  name: "Shipping",
  charge: { amount: 599n, currency: "USD" },
};

const ENV = {
  SQUARE_ACCESS_TOKEN: "test-token-not-real",
  SQUARE_LOCATION_ID: "LOC_TEST",
  SQUARE_ENVIRONMENT: "sandbox",
};

const ORIGIN = "http://localhost:5173";

const CART_BODY = {
  items: [
    {
      itemId: "ITEM_CROWNFALL",
      variationId: "VAR_CROWNFALL_SIGNED",
      quantity: 2,
      title: "Crownfall - Signed Hardcover",
      price: 29.99,
    },
    {
      itemId: "ITEM_BOOKMARK",
      variationId: "VAR_BOOKMARK",
      quantity: 1,
      title: "Bookmark",
      price: 4,
    },
  ],
  redirectUrl: `${ORIGIN}/checkout/success`,
};

const fakePaymentLinkResponse = (request) => ({
  paymentLink: {
    id: "PL_TEST",
    version: 1,
    orderId: "ORDER_TEST",
    url: "https://square.link/u/TESTLINK",
    // Square echoes checkoutOptions back, including BigInt money amounts; the
    // handlers must serialise those to JSON without throwing.
    checkoutOptions: request.checkoutOptions,
  },
});

// --- Adapters: drive each implementation the way its runtime does ----------

const callPagesFunction = async (env, body) => {
  const request = new Request(`${ORIGIN}/api/square/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
    body: JSON.stringify(body),
  });
  const response = await onRequestPost({ env, request });
  return { status: response.status, body: await response.json() };
};

const callDevPlugin = async (env, body) => {
  const plugin = createSquareApiPlugin(env);
  let handler;
  plugin.configureServer({
    middlewares: {
      use: (prefix, fn) => {
        expect(prefix).toBe("/api/square");
        handler = fn;
      },
    },
  });

  // connect strips the mount prefix, so the middleware sees "/checkout".
  const req = Readable.from([Buffer.from(JSON.stringify(body))]);
  req.method = "POST";
  req.url = "/checkout";
  req.headers = {
    host: "localhost:5173",
    origin: ORIGIN,
    "content-type": "application/json",
  };

  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
      },
      end(payload) {
        try {
          resolve({ status: this.statusCode, body: JSON.parse(payload) });
        } catch (error) {
          reject(error);
        }
      },
    };
    Promise.resolve(handler(req, res, reject)).catch(reject);
  });
};

const implementations = [
  ["Pages Function (production)", callPagesFunction],
  ["Vite dev middleware", callDevPlugin],
];

const createCalls = () =>
  square.state.instances.flatMap(
    (client) => client.checkout.paymentLinks.create.mock.calls,
  );

beforeEach(() => {
  square.state.instances.length = 0;
  square.state.createImpl = (request) => fakePaymentLinkResponse(request);
});

describe.each(implementations)("checkout: %s", (_name, call) => {
  it("charges a flat $5.99 shipping fee named Shipping", async () => {
    const { status } = await call(ENV, CART_BODY);
    expect(status).toBe(200);

    const calls = createCalls();
    expect(calls).toHaveLength(1);
    const [request] = calls[0];

    // toEqual distinguishes 599n from 599 and "599": Square needs a BigInt.
    expect(request.checkoutOptions.shippingFee).toEqual(SHIPPING_FEE);
    expect(typeof request.checkoutOptions.shippingFee.charge.amount).toBe(
      "bigint",
    );
  });

  it("asks Square to collect a shipping address", async () => {
    await call(ENV, CART_BODY);
    const [[request]] = createCalls();
    expect(request.checkoutOptions.askForShippingAddress).toBe(true);
  });

  it("sends one line item per cart item, keyed by variation id with a string quantity", async () => {
    await call(ENV, CART_BODY);
    const [[request]] = createCalls();

    expect(request.order.locationId).toBe("LOC_TEST");
    expect(request.order.lineItems).toHaveLength(2);
    expect(request.order.lineItems[0]).toMatchObject({
      catalogObjectId: "VAR_CROWNFALL_SIGNED",
      quantity: "2",
    });
    expect(request.order.lineItems[1]).toMatchObject({
      catalogObjectId: "VAR_BOOKMARK",
      quantity: "1",
    });
  });

  // Current behaviour, locked so a redesign does not change it by accident.
  // Issue #4 may deliberately reject items without a variationId (HTTP 400);
  // if it does, replace this test rather than weakening the others.
  it("falls back to the item id when a cart item has no variation id", async () => {
    await call(ENV, {
      items: [{ itemId: "ITEM_ONLY", quantity: 3, title: "x", price: 1 }],
      redirectUrl: `${ORIGIN}/checkout/success`,
    });
    const [[request]] = createCalls();
    expect(request.order.lineItems[0]).toMatchObject({
      catalogObjectId: "ITEM_ONLY",
      quantity: "3",
    });
  });

  it("sends a non-empty idempotency key that differs per request", async () => {
    await call(ENV, CART_BODY);
    await call(ENV, CART_BODY);
    const keys = createCalls().map(([request]) => request.idempotencyKey);
    expect(keys).toHaveLength(2);
    for (const key of keys) {
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    }
    expect(keys[0]).not.toBe(keys[1]);
  });

  it("builds the Square client from the configured token and environment", async () => {
    await call(ENV, CART_BODY);
    const [client] = square.state.instances;
    expect(client.options).toMatchObject({
      token: "test-token-not-real",
      environment: square.SquareEnvironment.Sandbox,
    });
  });

  it("returns { paymentLink, url } with BigInts serialised", async () => {
    const { status, body } = await call(ENV, CART_BODY);
    expect(status).toBe(200);
    expect(body.url).toBe("https://square.link/u/TESTLINK");
    expect(body.paymentLink).toMatchObject({
      id: "PL_TEST",
      url: "https://square.link/u/TESTLINK",
      orderId: "ORDER_TEST",
    });
    expect(body.paymentLink.checkoutOptions.shippingFee.charge.amount).toBe(
      "599",
    );
  });

  it("returns 500 without calling Square when the access token is missing", async () => {
    const { status, body } = await call(
      { ...ENV, SQUARE_ACCESS_TOKEN: "" },
      CART_BODY,
    );
    expect(status).toBe(500);
    expect(body.error).toMatch(/not configured/i);
    expect(createCalls()).toHaveLength(0);
  });

  it("returns 500 without calling Square when the location id is missing", async () => {
    const { status, body } = await call(
      { ...ENV, SQUARE_LOCATION_ID: "" },
      CART_BODY,
    );
    expect(status).toBe(500);
    expect(body.error).toMatch(/not configured/i);
    expect(createCalls()).toHaveLength(0);
  });

  it("returns 500 with the SDK's message when Square rejects the request", async () => {
    square.state.createImpl = () => {
      throw new Error("INVALID_REQUEST_ERROR: location not found");
    };
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { status, body } = await call(ENV, CART_BODY);
    consoleError.mockRestore();
    expect(status).toBe(500);
    expect(body.error).toBe("INVALID_REQUEST_ERROR: location not found");
  });
});

describe("checkout: production and dev implementations stay in sync", () => {
  const captureRequest = async (call) => {
    square.state.instances.length = 0;
    await call(ENV, CART_BODY);
    const [[request]] = createCalls();
    return request;
  };

  // Keys that differ today. squareMarketingOptIn is set only by the dev
  // middleware (reported as a bug; the dev server opts customers in to Square
  // marketing, production does not). When the implementations are brought
  // back in line, empty this list. Any NEW divergence fails this test.
  const KNOWN_CHECKOUT_OPTIONS_DRIFT = ["squareMarketingOptIn"];

  it("send the same checkoutOptions to Square", async () => {
    const prod = (await captureRequest(callPagesFunction)).checkoutOptions;
    const dev = (await captureRequest(callDevPlugin)).checkoutOptions;

    const keys = [...new Set([...Object.keys(prod), ...Object.keys(dev)])];
    const differing = keys
      .filter((key) => {
        try {
          expect(dev[key]).toEqual(prod[key]);
          return false;
        } catch {
          return true;
        }
      })
      .sort();

    expect(differing).toEqual([...KNOWN_CHECKOUT_OPTIONS_DRIFT].sort());
  });

  it("send the same order to Square", async () => {
    const prod = (await captureRequest(callPagesFunction)).order;
    const dev = (await captureRequest(callDevPlugin)).order;
    expect(dev).toEqual(prod);
  });
});
