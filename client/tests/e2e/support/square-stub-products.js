// Catalog served by the e2e Square stub. Shared with the test so expectations
// (ids, prices) come from one place. Side-effect free, unlike square-stub.mjs.
//
// Crownfall is four separate Square items. They carry the PRODUCTION item IDs
// on purpose: the store maps edition toggles to Square items by ID through
// src/data/crownfallEditions.js, so the suite proves that table matches the
// live catalog. The fifth item is not in the table and must land in the grid.

export const STUB_PRODUCTS = [
  {
    key: "crownfall-hardcover-signed",
    edition: { format: "hardcover", signing: "signed" },
    itemId: "IBKED4FB6YQ3NGV3IY6RDRRH",
    variationId: "E2E_VAR_CROWNFALL_HC_SIGNED",
    name: "Crownfall - Signed Hardcover",
    cents: 2999n,
  },
  {
    key: "crownfall-paperback-signed",
    edition: { format: "paperback", signing: "signed" },
    itemId: "OCUPPHLLZTJSGWUN25LONQ6X",
    variationId: "E2E_VAR_CROWNFALL_PB_SIGNED",
    name: "Crownfall - Signed Paperback",
    cents: 1999n,
  },
  {
    key: "crownfall-hardcover-unsigned",
    edition: { format: "hardcover", signing: "unsigned" },
    itemId: "AFZBBBIJZE7PVU7ETEVQPL2L",
    variationId: "E2E_VAR_CROWNFALL_HC_UNSIGNED",
    name: "Crownfall - Unsigned Hardcover",
    cents: 2799n,
  },
  {
    key: "crownfall-paperback-unsigned",
    edition: { format: "paperback", signing: "unsigned" },
    itemId: "DDLQYFLXRU3RZRIZWGLGY33C",
    variationId: "E2E_VAR_CROWNFALL_PB_UNSIGNED",
    name: "Crownfall - Unsigned Paperback",
    cents: 1799n,
  },
  {
    key: "print",
    itemId: "E2E_ITEM_PRINT",
    variationId: "E2E_VAR_PRINT",
    name: "E2E Stub Art Print",
    cents: 2500n,
  },
];
