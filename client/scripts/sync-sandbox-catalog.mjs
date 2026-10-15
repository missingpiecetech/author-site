// Mirrors the production Square catalog items (name, description, price,
// images) into the Square sandbox, so branch previews running on sandbox keys
// show the same store. Production is only read, never written.
//
// Usage (from client/):
//   SQUARE_SANDBOX_ACCESS_TOKEN=... node scripts/sync-sandbox-catalog.mjs
// Production credentials are read from .env.local (VITE_SQUARE_ACCESS_TOKEN).
//
// Production → sandbox item IDs are recorded in sandbox-catalog-map.json, so
// re-running updates the same sandbox items instead of creating duplicates.
// Copy any new sandbox IDs into src/data/crownfallEditions.js.

import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const VERSION = "2025-01-23";
const MAP_PATH = new URL("./sandbox-catalog-map.json", import.meta.url);

const readEnvLocal = async () => {
  const text = await readFile(
    new URL("../.env.local", import.meta.url),
    "utf8",
  );
  return Object.fromEntries(
    text
      .split("\n")
      .map((line) => line.match(/^([A-Z_]+)=(.*)$/))
      .filter(Boolean)
      .map(([, k, v]) => [k, v.trim()]),
  );
};

const api =
  (base, token) =>
  async (path, init = {}) => {
    const res = await fetch(`${base}/v2${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Square-Version": VERSION,
        ...(init.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`${path}: ${JSON.stringify(json.errors)}`);
    return json;
  };

const listAll = async (call, types) => {
  const objects = [];
  let cursor;
  do {
    const q = new URLSearchParams({ types, ...(cursor ? { cursor } : {}) });
    const page = await call(`/catalog/list?${q}`);
    objects.push(...(page.objects || []));
    cursor = page.cursor;
  } while (cursor);
  return objects;
};

const main = async () => {
  const env = await readEnvLocal();
  if ((env.VITE_SQUARE_ENVIRONMENT || "").toLowerCase() !== "production") {
    throw new Error(".env.local does not hold production credentials");
  }
  const sandboxToken = process.env.SQUARE_SANDBOX_ACCESS_TOKEN;
  if (!sandboxToken) throw new Error("Set SQUARE_SANDBOX_ACCESS_TOKEN");

  const prod = api(
    "https://connect.squareup.com",
    env.VITE_SQUARE_ACCESS_TOKEN,
  );
  const sbx = api("https://connect.squareupsandbox.com", sandboxToken);

  const map = JSON.parse(await readFile(MAP_PATH, "utf8"));
  map.items ??= {};
  map.images ??= {};

  const prodObjects = await listAll(prod, "ITEM,IMAGE");
  const prodImages = new Map(
    prodObjects.filter((o) => o.type === "IMAGE").map((o) => [o.id, o]),
  );

  for (const item of prodObjects.filter((o) => o.type === "ITEM")) {
    const d = item.item_data;
    const price = d.variations[0].item_variation_data.price_money;
    let sandboxId = map.items[item.id];

    if (sandboxId) {
      const { object } = await sbx(`/catalog/object/${sandboxId}`);
      object.item_data.name = d.name;
      object.item_data.description_html = d.description_html;
      object.item_data.variations[0].item_variation_data.price_money = price;
      await sbx("/catalog/object", {
        method: "POST",
        body: JSON.stringify({ idempotency_key: randomUUID(), object }),
      });
      console.log(`updated ${d.name} → ${sandboxId}`);
    } else {
      const res = await sbx("/catalog/object", {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: randomUUID(),
          object: {
            type: "ITEM",
            id: "#item",
            present_at_all_locations: true,
            item_data: {
              name: d.name,
              description_html: d.description_html,
              product_type: d.product_type,
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#variation",
                  present_at_all_locations: true,
                  item_variation_data: {
                    item_id: "#item",
                    name: d.variations[0].item_variation_data.name,
                    pricing_type: "FIXED_PRICING",
                    price_money: price,
                  },
                },
              ],
            },
          },
        }),
      });
      sandboxId = res.catalog_object.id;
      map.items[item.id] = sandboxId;
      console.log(`created ${d.name} → ${sandboxId}`);
    }

    // Images: upload each production image once per sandbox item, then set
    // the item's image order to match production.
    const imageIds = [];
    for (const [i, prodImageId] of (d.image_ids || []).entries()) {
      const key = `${item.id}:${prodImageId}`;
      if (!map.images[key]) {
        const url = prodImages.get(prodImageId)?.image_data?.url;
        if (!url) continue;
        const blob = await (await fetch(url)).blob();
        const form = new FormData();
        form.append(
          "request",
          JSON.stringify({
            idempotency_key: randomUUID(),
            object_id: sandboxId,
            is_primary: i === 0,
            image: {
              type: "IMAGE",
              id: "#image",
              image_data: { name: d.name },
            },
          }),
        );
        form.append("image_file", blob, url.split("/").pop());
        const res = await sbx("/catalog/images", {
          method: "POST",
          body: form,
        });
        map.images[key] = res.image.id;
      }
      imageIds.push(map.images[key]);
    }
    const { object } = await sbx(`/catalog/object/${sandboxId}`);
    object.item_data.image_ids = imageIds;
    await sbx("/catalog/object", {
      method: "POST",
      body: JSON.stringify({ idempotency_key: randomUUID(), object }),
    });

    await writeFile(MAP_PATH, JSON.stringify(map, null, 2) + "\n");
  }

  console.log(JSON.stringify(map.items, null, 2));
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
