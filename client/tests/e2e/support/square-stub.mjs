// Stand-in for the `square` SDK, loaded into the e2e dev server in place of
// the real package by register-square-stub.mjs. It never opens a socket.
//
// Every call the dev middleware makes is appended as one JSON line to the file
// named by SQUARE_STUB_LOG, so the test process (a different process from the
// vite server) can read exactly what the server would have sent to Square.
// BigInts are written as { "$bigint": "599" } so the test can revive them and
// tell 599n apart from 599.

import { appendFileSync } from "node:fs";
import { STUB_PRODUCTS } from "./square-stub-products.js";

const LOG = process.env.SQUARE_STUB_LOG;
if (!LOG) {
  throw new Error(
    "square-stub loaded without SQUARE_STUB_LOG; refusing to run (this module is for the e2e suite only).",
  );
}

const record = (entry) => {
  appendFileSync(
    LOG,
    JSON.stringify({ pid: process.pid, ...entry }, (_, value) =>
      typeof value === "bigint" ? { $bigint: value.toString() } : value,
    ) + "\n",
  );
};

record({ type: "boot" });

const catalogObjects = STUB_PRODUCTS.map((product) => ({
  type: "ITEM",
  id: product.itemId,
  isDeleted: false,
  itemData: {
    name: product.name,
    descriptionHtml: "<p>Served by the e2e Square stub.</p>",
    imageIds: [],
    variations: [
      {
        type: "ITEM_VARIATION",
        id: product.variationId,
        itemVariationData: {
          itemId: product.itemId,
          name: "Regular",
          priceMoney: { amount: product.cents, currency: "USD" },
        },
      },
    ],
  },
}));

const asPage = (items) => ({
  data: items,
  async *[Symbol.asyncIterator]() {
    yield* items;
  },
});

let linkCounter = 0;

export const SquareEnvironment = {
  Production: "https://connect.squareup.com",
  Sandbox: "https://connect.squareupsandbox.com",
};

export class SquareClient {
  constructor(options = {}) {
    record({
      type: "client",
      environment: options.environment,
      hasToken: Boolean(options.token),
    });

    this.catalog = {
      list: async (request) => {
        record({ type: "catalog.list", request });
        return asPage(catalogObjects);
      },
    };

    this.checkout = {
      paymentLinks: {
        create: async (request) => {
          linkCounter += 1;
          const id = `E2E_LINK_${linkCounter}`;
          const paymentLink = {
            id,
            version: 1,
            orderId: `E2E_ORDER_${linkCounter}`,
            // .test is reserved (RFC 2606) and never resolves; the browser
            // side of the suite intercepts it and serves a placeholder page.
            url: `https://checkout.square.test/e2e/${id}`,
            checkoutOptions: request.checkoutOptions,
          };
          record({ type: "paymentLinks.create", request, paymentLink });
          return { paymentLink };
        },
      },
    };

    this.customers = {
      create: async (request) => {
        record({ type: "customers.create", request });
        return { customer: { id: "E2E_CUSTOMER", ...request } };
      },
    };
  }
}
