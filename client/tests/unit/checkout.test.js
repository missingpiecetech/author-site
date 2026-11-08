// Locks the Square checkout request built by BOTH server implementations:
//   - functions/api/square/checkout.js  (Cloudflare Pages Function, production)
//   - api/squareApiPlugin.js            (Vite dev middleware)
//
// The `square` SDK is mocked, so nothing here touches the network.
//
// What is locked: what the customer is charged (catalog prices, never the
// client's; the $5.99 flat shipping fee), the shipping-address prompt, where
// Square sends the buyer afterwards, and which carts are refused with HTTP 400.
// The mock client's catalog.list serves CATALOG below.

import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CART_EMPTY,
  CHECKOUT_FAILED,
  ITEM_UNAVAILABLE,
  QUANTITY_INVALID,
  STORE_UNAVAILABLE,
} from "../../shared/errors.js";

const square = vi.hoisted(() => {
  const SquareEnvironment = {
    Production: "https://connect.squareup.com",
    Sandbox: "https://connect.squareupsandbox.com",
  };
  const state = { instances: [], createImpl: null, catalog: [] };

  class SquareClient {
    constructor(options) {
      this.options = options;
      this.checkout = {
        paymentLinks: {
          create: vi.fn((request) => state.createImpl(request)),
        },
      };
      this.catalog = {
        list: vi.fn(async () => ({
          async *[Symbol.asyncIterator]() {
            yield* state.catalog;
          },
        })),
      };
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

const BASE_ENV = {
  SQUARE_LOCATION_ID: "LOC_TEST",
  SQUARE_ENVIRONMENT: "sandbox",
};

const ORIGIN = "http://localhost:5173";

const catalogItem = (id, name, variationId, cents, extra = {}) => ({
  type: "ITEM",
  id,
  isDeleted: false,
  ...extra,
  itemData: {
    name,
    variations: [
      {
        type: "ITEM_VARIATION",
        id: variationId,
        itemVariationData: {
          itemId: id,
          priceMoney: { amount: BigInt(cents), currency: "USD" },
        },
      },
    ],
  },
});

const CATALOG = [
  catalogItem(
    "ITEM_CROWNFALL",
    "Crownfall - Signed Hardcover",
    "VAR_CROWNFALL_SIGNED",
    2999,
  ),
  catalogItem("ITEM_BOOKMARK", "Bookmark", "VAR_BOOKMARK", 400),
  catalogItem("ITEM_GONE", "Retired print", "VAR_GONE", 1500, {
    isDeleted: true,
  }),
];

// Each test gets its own access token, so the catalog cache never carries over.
let tokenCounter = 0;

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

const callPagesFunction = async (env, body, origin = ORIGIN) => {
  const request = new Request(`${origin}/api/square/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  const response = await onRequestPost({
    env,
    request,
    waitUntil: () => {},
  });
  return { status: response.status, body: await response.json() };
};

const callDevPlugin = async (env, body, origin = ORIGIN) => {
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
  const req = Readable.from([
    Buffer.from(typeof body === "string" ? body : JSON.stringify(body)),
  ]);
  req.method = "POST";
  req.url = "/checkout";
  req.headers = {
    host: new URL(origin).host,
    origin,
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

let ENV;

beforeEach(() => {
  square.state.instances.length = 0;
  square.state.createImpl = (request) => fakePaymentLinkResponse(request);
  square.state.catalog = CATALOG;
  tokenCounter += 1;
  ENV = { ...BASE_ENV, SQUARE_ACCESS_TOKEN: `test-token-${tokenCounter}` };
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

  it("charges catalog prices and names, ignoring the price and title the browser sent", async () => {
    await call(ENV, {
      items: [
        {
          itemId: "ITEM_CROWNFALL",
          variationId: "VAR_CROWNFALL_SIGNED",
          quantity: 1,
          title: "Free book",
          price: 0.01,
        },
      ],
    });
    const [[request]] = createCalls();
    expect(request.order.lineItems).toEqual([
      {
        catalogObjectId: "VAR_CROWNFALL_SIGNED",
        quantity: "1",
        name: "Crownfall - Signed Hardcover",
        basePriceMoney: { amount: 2999n, currency: "USD" },
      },
    ]);
  });

  it("sends the buyer back to the site that started checkout, never to a URL the browser chose", async () => {
    await call(ENV, {
      ...CART_BODY,
      redirectUrl: "https://attacker.example/phish",
    });
    const [[request]] = createCalls();
    expect(request.checkoutOptions.redirectUrl).toBe(
      `${ORIGIN}/checkout/success`,
    );
  });

  it("ignores a non-numeric price, since price is never read", async () => {
    const { status } = await call(ENV, {
      items: [{ variationId: "VAR_BOOKMARK", quantity: 1, price: "abc" }],
    });
    expect(status).toBe(200);
  });

  it("sends the buyer to michaelvadney.com when checkout starts on a site not on the allowlist", async () => {
    await call(ENV, CART_BODY, "http://evil.example");
    const [[request]] = createCalls();
    expect(request.checkoutOptions.redirectUrl).toBe(
      "https://michaelvadney.com/checkout/success",
    );
  });

  it("caches the catalog: two checkouts within a minute list it once", async () => {
    await call(ENV, CART_BODY);
    await call(ENV, CART_BODY);
    const listCalls = square.state.instances.flatMap(
      (client) => client.catalog.list.mock.calls,
    );
    expect(listCalls).toHaveLength(1);
  });

  const refused = [
    ["an empty item list", { items: [] }, CART_EMPTY],
    ["no item list", {}, CART_EMPTY],
    ["a body that is not JSON", "{not json", CART_EMPTY],
    [
      "an unknown variation",
      { items: [{ variationId: "VAR_NOPE", quantity: 1 }] },
      ITEM_UNAVAILABLE,
    ],
    [
      "a deleted catalog item",
      { items: [{ variationId: "VAR_GONE", quantity: 1 }] },
      ITEM_UNAVAILABLE,
    ],
    [
      "an item without a variation id",
      { items: [{ itemId: "ITEM_BOOKMARK", quantity: 1 }] },
      ITEM_UNAVAILABLE,
    ],
    [
      "quantity 0",
      { items: [{ variationId: "VAR_BOOKMARK", quantity: 0 }] },
      QUANTITY_INVALID,
    ],
    [
      "quantity 21",
      { items: [{ variationId: "VAR_BOOKMARK", quantity: 21 }] },
      QUANTITY_INVALID,
    ],
    [
      "a fractional quantity",
      { items: [{ variationId: "VAR_BOOKMARK", quantity: 1.5 }] },
      QUANTITY_INVALID,
    ],
    [
      "a quantity sent as text",
      { items: [{ variationId: "VAR_BOOKMARK", quantity: "2" }] },
      QUANTITY_INVALID,
    ],
  ];

  it.each(refused)(
    "answers %s with 400 and a plain sentence, without creating a link",
    async (_label, body, sentence) => {
      const { status, body: reply } = await call(ENV, body);
      expect(status).toBe(400);
      expect(reply.error).toBe(sentence);
      expect(createCalls()).toHaveLength(0);
    },
  );

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
      token: ENV.SQUARE_ACCESS_TOKEN,
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
    expect(body.error).toBe(STORE_UNAVAILABLE);
    expect(createCalls()).toHaveLength(0);
  });

  it("returns 500 without calling Square when the location id is missing", async () => {
    const { status, body } = await call(
      { ...ENV, SQUARE_LOCATION_ID: "" },
      CART_BODY,
    );
    expect(status).toBe(500);
    expect(body.error).toBe(STORE_UNAVAILABLE);
    expect(createCalls()).toHaveLength(0);
  });

  it("returns 500 in plain words, with none of Square's text, when Square rejects the request", async () => {
    square.state.createImpl = () => {
      throw new Error("INVALID_REQUEST_ERROR: location not found");
    };
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { status, body } = await call(ENV, CART_BODY);
    consoleError.mockRestore();
    expect(status).toBe(500);
    expect(body.error).toBe(CHECKOUT_FAILED);
  });
});

describe("checkout: production and dev implementations stay in sync", () => {
  const captureRequest = async (call) => {
    square.state.instances.length = 0;
    await call(ENV, CART_BODY);
    const [[request]] = createCalls();
    return request;
  };

  // Both build their request with shared/checkout.js; any divergence fails.
  const KNOWN_CHECKOUT_OPTIONS_DRIFT = [];

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
