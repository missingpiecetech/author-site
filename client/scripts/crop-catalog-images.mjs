// Crops the store's book-mockup images to the book itself, so the gallery's
// 2:3 pane shows the book rather than a wide transparent canvas. Square's
// mockups also carry a soft drop shadow along the right and bottom edges,
// which reads as a grey band on the site's near-black background; it is
// removed here rather than in the browser.
//
// Usage (from client/):
//   node scripts/crop-catalog-images.mjs [options]
//
// Options:
//   --out <dir>              where crops are written for review
//                            (default /Users/jenn/.workboard-scratch/author-site-14/crops)
//   --match <regex>          which production items to process (default "crownfall")
//   --production-env <file>  env file holding VITE_SQUARE_ACCESS_TOKEN and
//                            VITE_SQUARE_ENVIRONMENT=production (default client/.env.local)
//   --upload-sandbox         upload the crops to the Square sandbox and point the
//                            mirrored sandbox items (sandbox-catalog-map.json) at them;
//                            needs SQUARE_SANDBOX_ACCESS_TOKEN
//   --upload-production      not implemented: production writes need the owner's approval
//
// Production is only read (catalog list and image downloads). Images without
// transparency are left untouched and keep their mirrored sandbox copy.
//
// How a mockup is cropped:
//   1. The book is the set of near-opaque pixels (alpha >= BOOK_ALPHA). The
//      crop is that set's bounding box plus PADDING px of transparency.
//   2. Pixels within EDGE_WIDTH px of the book are its anti-aliased edge. Where
//      shadow lies behind an edge pixel (the pixel two steps further out is a
//      shadow pixel), the shadow is un-composited from it: the remaining alpha
//      is the book's own coverage, so the edge stays smooth instead of being
//      clipped into stair steps or keeping a grey fringe. Edge pixels with
//      nothing behind them (top and left) are kept as they are.
//   3. Everything further out (the shadow itself) becomes fully transparent.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const VERSION = "2025-01-23";
const MAP_PATH = new URL("./sandbox-catalog-map.json", import.meta.url);
const DARK_BACKGROUND = "#121017";

const BOOK_ALPHA = 240;
const EDGE_WIDTH = 2;
const SHADOW_ALPHA = 24;
const PADDING = 4;

const parseArgs = (argv) => {
  const options = {
    out: "/Users/jenn/.workboard-scratch/author-site-14/crops",
    match: "crownfall",
    productionEnv: new URL("../.env.local", import.meta.url).pathname,
    isUploadSandbox: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out") options.out = argv[++i];
    else if (arg === "--match") options.match = argv[++i];
    else if (arg === "--production-env") options.productionEnv = argv[++i];
    else if (arg === "--upload-sandbox") options.isUploadSandbox = true;
    else if (arg === "--upload-production") {
      throw new Error(
        "--upload-production is not implemented: writing to the production Square catalog needs the owner's approval",
      );
    } else throw new Error(`Unknown option ${arg}`);
  }
  return options;
};

const readEnvFile = async (file) => {
  const text = await readFile(file, "utf8");
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
  async (apiPath, init = {}) => {
    const res = await fetch(`${base}/v2${apiPath}`, {
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
    if (!res.ok) throw new Error(`${apiPath}: ${JSON.stringify(json.errors)}`);
    return json;
  };

const listAll = async (get, types) => {
  const objects = [];
  let cursor;
  do {
    const q = new URLSearchParams({ types, ...(cursor ? { cursor } : {}) });
    const page = await get(`/catalog/list?${q}`);
    objects.push(...(page.objects || []));
    cursor = page.cursor;
  } while (cursor);
  return objects;
};

/**
 * Crops an RGBA mockup to the book and strips its drop shadow.
 * @param {Buffer} data raw RGBA pixels
 * @param {number} width
 * @param {number} height
 * @returns {{ data: Buffer, left: number, top: number, width: number, height: number } | null}
 *   null when the image has no near-opaque pixels
 */
const cropToBook = (data, width, height) => {
  const alphaAt = (x, y) => data[(y * width + x) * 4 + 3];

  // Distance (Chebyshev, up to EDGE_WIDTH) from each pixel to the book, and
  // the book pixel it was reached from, by breadth-first search.
  const distance = new Uint8Array(width * height).fill(255);
  const sourceX = new Int32Array(width * height);
  const sourceY = new Int32Array(width * height);
  let frontier = [];
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (alphaAt(x, y) < BOOK_ALPHA) continue;
      const i = y * width + x;
      distance[i] = 0;
      sourceX[i] = x;
      sourceY[i] = y;
      frontier.push(i);
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return null;
  for (let step = 1; step <= EDGE_WIDTH; step++) {
    const next = [];
    for (const i of frontier) {
      const x = i % width;
      const y = (i - x) / width;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const n = ny * width + nx;
          if (distance[n] !== 255) continue;
          distance[n] = step;
          sourceX[n] = sourceX[i];
          sourceY[n] = sourceY[i];
          next.push(n);
        }
      }
    }
    frontier = next;
  }

  left = Math.max(0, left - PADDING);
  top = Math.max(0, top - PADDING);
  right = Math.min(width - 1, right + PADDING);
  bottom = Math.min(height - 1, bottom + PADDING);
  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const out = Buffer.alloc(cropWidth * cropHeight * 4);

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const i = y * width + x;
      const o = ((y - top) * cropWidth + (x - left)) * 4;
      const d = distance[i];
      if (d === 255) continue; // shadow or empty canvas: fully transparent
      const pixel = data.subarray(i * 4, i * 4 + 4);
      if (d === 0) {
        pixel.copy(out, o);
        continue;
      }

      // An edge pixel. Look two steps further out, away from the book.
      const sx = x + 2 * Math.sign(x - sourceX[i]);
      const sy = y + 2 * Math.sign(y - sourceY[i]);
      const isInside = sx >= 0 && sy >= 0 && sx < width && sy < height;
      const shadowAlpha = isInside ? alphaAt(sx, sy) : 0;
      if (shadowAlpha < SHADOW_ALPHA || shadowAlpha >= BOOK_ALPHA) {
        pixel.copy(out, o);
        continue;
      }

      // Observed = book (coverage c) over shadow, so
      // alpha = c + (1 - c) * shadowAlpha, and the shadow's premultiplied
      // color is subtracted from the observed premultiplied color.
      const shadow = data.subarray(
        (sy * width + sx) * 4,
        (sy * width + sx) * 4 + 3,
      );
      const observedAlpha = pixel[3] / 255;
      const behind = shadowAlpha / 255;
      const coverage = (observedAlpha - behind) / (1 - behind);
      if (coverage <= 0.02) continue;
      const kept = Math.min(1, coverage);
      for (let c = 0; c < 3; c++) {
        const premultiplied =
          observedAlpha * pixel[c] - (1 - kept) * behind * shadow[c];
        out[o + c] = Math.max(
          0,
          Math.min(255, Math.round(premultiplied / kept)),
        );
      }
      out[o + 3] = Math.round(kept * 255);
    }
  }
  return { data: out, left, top, width: cropWidth, height: cropHeight };
};

const uploadSandboxImage = async (sbx, png, name) => {
  const form = new FormData();
  form.append(
    "request",
    JSON.stringify({
      idempotency_key: randomUUID(),
      image: { type: "IMAGE", id: "#image", image_data: { name } },
    }),
  );
  form.append(
    "image_file",
    new Blob([png], { type: "image/png" }),
    `${name}.png`,
  );
  const res = await sbx("/catalog/images", { method: "POST", body: form });
  return res.image.id;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const env = await readEnvFile(options.productionEnv);
  if ((env.VITE_SQUARE_ENVIRONMENT || "").toLowerCase() !== "production") {
    throw new Error(
      `${options.productionEnv} does not hold production credentials`,
    );
  }
  if (!env.VITE_SQUARE_ACCESS_TOKEN) {
    throw new Error(`${options.productionEnv} has no VITE_SQUARE_ACCESS_TOKEN`);
  }
  const sandboxToken = process.env.SQUARE_SANDBOX_ACCESS_TOKEN;
  if (options.isUploadSandbox && !sandboxToken) {
    throw new Error("--upload-sandbox needs SQUARE_SANDBOX_ACCESS_TOKEN");
  }

  // Production: GET only.
  const prodGet = api(
    "https://connect.squareup.com",
    env.VITE_SQUARE_ACCESS_TOKEN,
  );
  const objects = await listAll(prodGet, "ITEM,IMAGE");
  const images = new Map(
    objects.filter((o) => o.type === "IMAGE").map((o) => [o.id, o]),
  );
  const pattern = new RegExp(options.match, "i");
  const items = objects.filter(
    (o) => o.type === "ITEM" && pattern.test(o.item_data.name),
  );
  if (!items.length)
    throw new Error(`No production items match /${options.match}/i`);

  await mkdir(options.out, { recursive: true });

  // Cropped PNGs by production image id; signed and unsigned editions share
  // images, so each is processed once.
  const crops = new Map();
  for (const imageId of new Set(
    items.flatMap((item) => item.item_data.image_ids || []),
  )) {
    const url = images.get(imageId)?.image_data?.url;
    if (!url) throw new Error(`Production image ${imageId} has no URL`);
    const source = Buffer.from(await (await fetch(url)).arrayBuffer());
    const users = items
      .filter((item) => item.item_data.image_ids.includes(imageId))
      .map((item) => item.item_data.name)
      .join(", ");
    const { data, info } = await sharp(source)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let isTransparent = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        isTransparent = true;
        break;
      }
    }
    if (!isTransparent) {
      console.log(
        `${imageId} (${users}): opaque ${info.width}x${info.height}, left as is`,
      );
      continue;
    }

    const crop = cropToBook(data, info.width, info.height);
    if (!crop) {
      console.log(`${imageId} (${users}): no opaque book found, left as is`);
      continue;
    }
    const png = await sharp(crop.data, {
      raw: { width: crop.width, height: crop.height, channels: 4 },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    const base = path.join(options.out, imageId);
    await writeFile(`${base}.png`, png);
    await sharp(png)
      .flatten({ background: DARK_BACKGROUND })
      .toFile(`${base}-on-dark.png`);
    crops.set(imageId, png);
    console.log(
      `${imageId} (${users}): ${info.width}x${info.height} → ${crop.width}x${crop.height} at (${crop.left}, ${crop.top}), ${base}.png`,
    );
  }

  if (!options.isUploadSandbox) return;

  const sbx = api("https://connect.squareupsandbox.com", sandboxToken);
  const map = JSON.parse(await readFile(MAP_PATH, "utf8"));
  map.crops ??= {};

  // Upload each crop once (again only when its pixels change).
  for (const [imageId, png] of crops) {
    const sha256 = createHash("sha256").update(png).digest("hex");
    if (map.crops[imageId]?.sha256 === sha256) continue;
    const sandboxImageId = await uploadSandboxImage(
      sbx,
      png,
      `crop-${imageId}`,
    );
    map.crops[imageId] = { sandboxImageId, sha256 };
    console.log(`uploaded crop of ${imageId} → sandbox ${sandboxImageId}`);
  }

  for (const item of items) {
    const sandboxItemId = map.items[item.id];
    if (!sandboxItemId) {
      throw new Error(
        `${item.item_data.name} has no sandbox mirror; run sync-sandbox-catalog.mjs first`,
      );
    }
    // Same order as production, cropped images swapped in. The mirror map
    // records the crop too, so the sync script keeps it on later runs.
    const imageIds = item.item_data.image_ids.map((imageId) => {
      const key = `${item.id}:${imageId}`;
      if (map.crops[imageId])
        map.images[key] = map.crops[imageId].sandboxImageId;
      if (!map.images[key])
        throw new Error(`No sandbox image mirrored for ${key}`);
      return map.images[key];
    });
    const { object } = await sbx(`/catalog/object/${sandboxItemId}`);
    object.item_data.image_ids = imageIds;
    await sbx("/catalog/object", {
      method: "POST",
      body: JSON.stringify({ idempotency_key: randomUUID(), object }),
    });
    console.log(
      `${item.item_data.name} → sandbox ${sandboxItemId}: ${imageIds.join(", ")}`,
    );
  }
  await writeFile(MAP_PATH, JSON.stringify(map, null, 2) + "\n");
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
