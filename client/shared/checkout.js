// Builds the Square payment-link request for both checkout implementations
// (functions/api/square/checkout.js and api/squareApiPlugin.js), so they cannot
// drift. The browser sends only which variations and how many; name and price
// come from the Square catalog and the return address from an allowlist.

import { CART_EMPTY, ITEM_UNAVAILABLE, QUANTITY_INVALID } from "./errors.js";

/** Most copies of one item a single checkout accepts. The cart stops here too. */
export const MAX_QUANTITY = 20;

/** Flat shipping on every order, in cents. A business decision: see CLAUDE.md. */
const SHIPPING_FEE_CENTS = 599n;

const SITE_ORIGIN = "https://michaelvadney.com";
const SUCCESS_PATH = "/checkout/success";
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?michaelvadney\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?author-site\.pages\.dev$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];

const CATALOG_TTL_MS = 60_000;
const catalogCache = new Map();

/** variationId -> { name, priceMoney } for every live, fixed-price variation. */
const loadVariations = async (client) => {
  const variations = new Map();
  const page = await client.catalog.list({ types: "ITEM" });
  for await (const item of page) {
    if (item.isDeleted || item.itemData?.isArchived) continue;
    for (const variation of item.itemData?.variations || []) {
      const priceMoney = variation.itemVariationData?.priceMoney;
      if (variation.isDeleted || priceMoney?.amount == null) continue;
      variations.set(variation.id, {
        name: item.itemData.name,
        priceMoney: {
          amount: BigInt(priceMoney.amount),
          currency: priceMoney.currency || "USD",
        },
      });
    }
  }
  return variations;
};

/** The catalog's variations, fetched at most once a minute per access token. */
const getVariations = async (client, cacheKey) => {
  const cached = catalogCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.variations;
  const variations = await loadVariations(client);
  catalogCache.set(cacheKey, {
    variations,
    expires: Date.now() + CATALOG_TTL_MS,
  });
  return variations;
};

/** Where Square sends the buyer after paying: this site, never a client-chosen URL. */
const successUrl = (origin) =>
  `${ALLOWED_ORIGINS.some((pattern) => pattern.test(origin)) ? origin : SITE_ORIGIN}${SUCCESS_PATH}`;

/**
 * Turns a checkout request body into Square's paymentLinks.create request.
 * Returns { error } with the sentence to show when the cart is refused (HTTP 400);
 * a Square failure throws.
 * @param {import("square").SquareClient} client
 * @param {{ locationId: string, cacheKey: string, origin: string, body: unknown }} input
 */
export const buildPaymentLinkRequest = async (
  client,
  { locationId, cacheKey, origin, body },
) => {
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) return { error: CART_EMPTY };

  const badQuantity = items.some(
    (item) =>
      !Number.isInteger(item?.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY,
  );
  if (badQuantity) return { error: QUANTITY_INVALID };

  const variations = await getVariations(client, cacheKey);
  const lineItems = [];
  for (const item of items) {
    const variation =
      typeof item.variationId === "string" && variations.get(item.variationId);
    if (!variation) return { error: ITEM_UNAVAILABLE };
    lineItems.push({
      catalogObjectId: item.variationId,
      quantity: String(item.quantity),
      name: variation.name,
      basePriceMoney: { ...variation.priceMoney },
    });
  }

  return {
    request: {
      idempotencyKey: `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      order: { locationId, lineItems },
      checkoutOptions: {
        redirectUrl: successUrl(origin),
        askForShippingAddress: true,
        shippingFee: {
          name: "Shipping",
          charge: { amount: SHIPPING_FEE_CENTS, currency: "USD" },
        },
      },
    },
  };
};
