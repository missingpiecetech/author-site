// Catalog served by the e2e Square stub. Shared with the test so expectations
// (ids, prices) come from one place. Side-effect free, unlike square-stub.mjs.
//
// The Crownfall product is deliberate: the redesign features it in its own
// block, and the suite must cover checking it out.

export const STUB_PRODUCTS = [
  {
    key: "crownfall",
    itemId: "E2E_ITEM_CROWNFALL",
    variationId: "E2E_VAR_CROWNFALL_SIGNED",
    name: "Crownfall – Signed Hardcover",
    cents: 3499n,
  },
  {
    key: "hardcover",
    itemId: "E2E_ITEM_HARDCOVER",
    variationId: "E2E_VAR_HARDCOVER",
    name: "E2E Stub Signed Hardcover",
    cents: 2999n,
  },
];
