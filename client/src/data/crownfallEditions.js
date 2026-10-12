// Crownfall is sold as four separate Square catalog items (signed/unsigned ×
// hardcover/paperback). The Store shows them as one listing with two toggle
// groups, and maps the selection to a Square item by ID through this fixed
// table. Never match by product name: a rename in Square must not move the
// book into the grid or swap an edition.
//
// Each combination lists its production and its sandbox item ID (branch
// previews run against sandbox; see scripts/sandbox-catalog-map.json). Add a
// new ID to the right combination if the item is ever recreated in Square.

export const FORMATS = [
  { id: "hardcover", label: "Hardcover" },
  { id: "paperback", label: "Paperback" },
];

export const SIGNINGS = [
  { id: "signed", label: "Signed" },
  { id: "unsigned", label: "Unsigned" },
];

export const CROWNFALL_EDITIONS = [
  {
    format: "hardcover",
    signing: "signed",
    itemIds: {
      production: "IBKED4FB6YQ3NGV3IY6RDRRH",
      sandbox: "AIVR46GHZASLUYXI6UU32MS5",
    },
  },
  {
    format: "paperback",
    signing: "signed",
    itemIds: {
      production: "OCUPPHLLZTJSGWUN25LONQ6X",
      sandbox: "LW5IC2IBBXFF4NUDN4AJF5Z4",
    },
  },
  {
    format: "hardcover",
    signing: "unsigned",
    itemIds: {
      production: "AFZBBBIJZE7PVU7ETEVQPL2L",
      sandbox: "Y5WWMZ7XZXPHWFQJLPYIEDET",
    },
  },
  {
    format: "paperback",
    signing: "unsigned",
    itemIds: {
      production: "DDLQYFLXRU3RZRIZWGLGY33C",
      sandbox: "7XQHWLKNJC4BGDMZEIIUCGVJ",
    },
  },
];

export const DEFAULT_SELECTION = { format: "hardcover", signing: "signed" };

export const editionKey = ({ format, signing }) => `${format}-${signing}`;

const editionForItemId = new Map(
  CROWNFALL_EDITIONS.flatMap((edition) =>
    Object.values(edition.itemIds).map((id) => [id, edition]),
  ),
);

/**
 * Splits mapped catalog products into the Crownfall listing and the grid.
 *
 * Returns `{ editions, gridProducts, hasCrownfall }`, where `editions` maps
 * every combination key ("hardcover-signed", ...) to its catalog product, or
 * null when none of its IDs is in the catalog. Products not in the table keep
 * their catalog order in `gridProducts`. If two catalog items match one
 * combination (production and sandbox side by side), the first wins and the
 * other goes to the grid so nothing silently disappears.
 */
export const partitionCatalog = (products = []) => {
  const editions = Object.fromEntries(
    CROWNFALL_EDITIONS.map((edition) => [editionKey(edition), null]),
  );
  const gridProducts = [];

  for (const product of products) {
    const edition = editionForItemId.get(product?.id);
    const key = edition && editionKey(edition);
    if (key && editions[key] === null) {
      editions[key] = product;
    } else {
      gridProducts.push(product);
    }
  }

  const hasCrownfall = Object.values(editions).some(Boolean);
  return { editions, gridProducts, hasCrownfall };
};

const isAvailable = (editions, selection) =>
  Boolean(editions[editionKey(selection)]);

/** Hardcover + signed when it exists, else the first available combination. */
export const defaultSelection = (editions) => {
  if (isAvailable(editions, DEFAULT_SELECTION)) return DEFAULT_SELECTION;
  const first = CROWNFALL_EDITIONS.find((edition) =>
    isAvailable(editions, edition),
  );
  return first ? { format: first.format, signing: first.signing } : null;
};

/** Whether any available combination has `value` on `axis`. */
export const isOptionAvailable = (editions, axis, value) =>
  CROWNFALL_EDITIONS.some(
    (edition) => edition[axis] === value && isAvailable(editions, edition),
  );

/**
 * The selection after the visitor picks `value` on `axis` ("format" or
 * "signing"). Keeps the other axis when that combination exists; otherwise
 * switches the other axis to one that does. Returns `current` unchanged if
 * `value` has no available combination at all (its pill is disabled).
 */
export const selectOption = (editions, current, axis, value) => {
  const wanted = { ...current, [axis]: value };
  if (isAvailable(editions, wanted)) return wanted;
  const fallback = CROWNFALL_EDITIONS.find(
    (edition) => edition[axis] === value && isAvailable(editions, edition),
  );
  return fallback
    ? { format: fallback.format, signing: fallback.signing }
    : current;
};
