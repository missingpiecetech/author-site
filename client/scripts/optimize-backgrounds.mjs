// Turns Michael's full-size section background art (PNGs of up to 8365px and
// 15MB) into the WebP files the site ships: one 2560px-wide copy for large
// and retina screens and one 1280px-wide copy for phones, in
// src/assets/backgrounds/. The sources stay out of the repo.
//
// Usage (from client/):
//   node scripts/optimize-backgrounds.mjs <source-dir> <name> [<name> ...]
//
// Each <name> reads <source-dir>/<name>_background.png and writes
// <name>-2560.webp and <name>-1280.webp. Sources narrower than a width are
// not enlarged.

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const WIDTHS = [2560, 1280];
const QUALITY = 72;
const OUT_DIR = new URL("../src/assets/backgrounds/", import.meta.url).pathname;

const [sourceDir, ...names] = process.argv.slice(2);
if (!sourceDir || names.length === 0) {
  console.error(
    "Usage: node scripts/optimize-backgrounds.mjs <source-dir> <name> [<name> ...]",
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const name of names) {
  const source = join(sourceDir, `${name}_background.png`);
  for (const width of WIDTHS) {
    const out = join(OUT_DIR, `${name}-${width}.webp`);
    const { size } = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);
    console.log(`${out}  ${(size / 1024).toFixed(0)} KB`);
  }
}
