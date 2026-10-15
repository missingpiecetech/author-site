// Design check for the dark re-skin: drives every route in a real browser
// against the e2e harness (Square stubbed, free port, never .env.local) and
// reports, per route at 1440 and 390:
//   - horizontal scroll after 2.5s of live animation;
//   - filigree ornaments whose painted parts overlap text in the same section;
//   - filigree corners that run into each other or onto their frame's content;
//   - filigree drawn at another scale than the corners' (UNIT px per artwork
//     unit, within 5%): every corner, and every divider without its own size;
//   - content left at opacity 0 with prefers-reduced-motion;
//   - progress bars whose fill does not match aria-valuenow;
//   - an excerpt reading column wider than 72ch of its own font;
//   - text over section background art (`Section background`) below WCAG
//     contrast (4.5:1, or 3:1 for large text), measured against the brightest
//     pixel of the art under each line as cropped, after the scrim and any
//     panel fill between the art and the text;
// plus the Home scroll cue's geometry at 1440/1280/1024/768/390, and, with
// `--shots <dir>`, element screenshots for review (see SHOTS).
//
//   node scripts/design-check.mjs [--shots <dir>]
//
// Exits non-zero if any check fails.

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer";
import { startServer } from "../tests/e2e/support/server.js";
import { UNIT } from "../src/components/ui/filigree/scale.js";

const ROUTES = [
  "/",
  "/books",
  "/podcast",
  "/about",
  "/store",
  "/contact",
  "/checkout/success",
  // One excerpt chapter shows at a time (tabs): check each.
  "/books/crownfall/excerpt",
  "/books/crownfall/excerpt#chapter-2",
  "/books/crownfall/excerpt#chapter-3",
];
// The longest line the excerpt's reading column may hold, in ch of its font.
const MAX_MEASURE_CH = 72;
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844, isMobile: true, hasTouch: true };

// Element screenshots for review (`--shots <dir>`): the top of each element,
// full viewport width, at most `maxHeight` CSS px tall; with `until`, down to
// the bottom of that element instead (plus `pad`).
const SHOTS = [
  { name: "home-hero-1440", route: "/", selector: "#crownfall" },
  { name: "home-hero-390", route: "/", selector: "#crownfall", mobile: true },
  {
    name: "home-big-quote-1440",
    route: "/",
    selector: "#crownfall + section",
    pad: 40,
  },
  {
    name: "home-writing-desk-1440",
    route: "/",
    selector: "#writing-desk",
    pad: 24,
  },
  {
    name: "home-writing-desk-390",
    route: "/",
    selector: "#writing-desk",
    mobile: true,
  },
  {
    name: "store-notice-1440",
    route: "/store",
    selector: '[role="note"]',
    pad: 40,
    maxHeight: 260,
    scale: 2,
  },
  {
    name: "home-divider-1440",
    route: "/",
    selector: "section > div > [data-filigree=divider]",
    pad: 40,
    maxHeight: 140,
    scale: 2,
  },
  {
    name: "about-stats-1440",
    route: "/about",
    selector: "section:has(> div > dl)",
  },
  {
    name: "contact-intro-1440",
    route: "/contact",
    selector: "section:has(h1)",
    pad: 24,
  },
  {
    name: "books-intro-1440",
    route: "/books",
    selector: "section:has(h1)",
    pad: 24,
  },
  {
    name: "about-pull-quote-1440",
    route: "/about",
    selector: "figure",
    pad: 30,
  },
  // `optional`: skipped (not failed) when the selector matches nothing, for
  // content that only exists once its data is filled in (the excerpt text).
  {
    name: "excerpt-chapter-heading-1440",
    route: "/books/crownfall/excerpt",
    selector: "#chapter-1",
    pad: 40,
    maxHeight: 520,
    optional: true,
  },
  {
    name: "excerpt-reading-390",
    route: "/books/crownfall/excerpt",
    selector: '[data-testid="excerpt-text"]',
    mobile: true,
    maxHeight: 760,
    optional: true,
  },
  {
    name: "excerpt-intro-tabs-1440",
    route: "/books/crownfall/excerpt",
    selector: "section:has(h1)",
    until: '[role="tablist"]',
    pad: 32,
    optional: true,
  },
  {
    name: "excerpt-intro-tabs-390",
    route: "/books/crownfall/excerpt",
    selector: "section:has(h1)",
    until: '[role="tablist"]',
    pad: 24,
    mobile: true,
    optional: true,
  },
  {
    name: "excerpt-next-1440",
    route: "/books/crownfall/excerpt",
    selector: '#chapter-1 [data-testid="excerpt-next"]',
    pad: 120,
    optional: true,
  },
  {
    name: "excerpt-end-1440",
    route: "/books/crownfall/excerpt#chapter-3",
    selector: '[data-testid="excerpt-end"]',
    pad: 60,
    optional: true,
  },
  {
    name: "books-arcanist-1440",
    route: "/books",
    selector: "#project-arcanist",
    maxHeight: 760,
  },
];

const shotsArg = process.argv.indexOf("--shots");
const shotsDir = shotsArg > -1 ? process.argv[shotsArg + 1] : null;
// --shots-only skips the checks (for iterating on the ornament artwork).
const checks = !process.argv.includes("--shots-only");

const failures = [];
const fail = (message) => {
  failures.push(message);
  console.log(`  FAIL ${message}`);
};

const scrollThrough = (page) =>
  page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });

// Painted parts of every ornament (each path/circle/polygon, not the SVG's
// box, which is mostly empty) against every text line in the same section.
const ornamentTextOverlaps = (page) =>
  page.evaluate(() => {
    const rectsOverlap = (a, b) =>
      a.left < b.right - 0.5 &&
      b.left < a.right - 0.5 &&
      a.top < b.bottom - 0.5 &&
      b.top < a.bottom - 0.5;
    const textRects = (root) => {
      const rects = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        if (node.parentElement.closest("[data-filigree], svg")) continue;
        const style = getComputedStyle(node.parentElement);
        if (style.visibility === "hidden" || style.display === "none") continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          if (r.width > 0 && r.height > 0) {
            rects.push({ r, text: node.textContent.trim().slice(0, 30) });
          }
        }
      }
      return rects;
    };
    const hits = [];
    let parts = 0;
    for (const ornament of document.querySelectorAll("[data-filigree]")) {
      const scope =
        ornament.closest("section, footer, header, [role=note]") ??
        document.body;
      const texts = textRects(scope);
      for (const shape of ornament.querySelectorAll("path, circle, polygon")) {
        const box = shape.getBoundingClientRect();
        if (!box.width && !box.height) continue;
        parts += 1;
        for (const { r, text } of texts) {
          if (rectsOverlap(box, r)) {
            hits.push(`${ornament.dataset.filigree} × "${text}"`);
          }
        }
      }
    }
    return { parts, hits: [...new Set(hits)] };
  });

// Each set of filigree corners: no corner's painted parts touch another
// corner's (arms along a short edge meeting), and none touch the frame's
// in-flow content (the framed image, a panel's text blocks).
const cornerCollisions = (page) =>
  page.evaluate(() => {
    const overlap = (a, b) =>
      a.left < b.right - 0.5 &&
      b.left < a.right - 0.5 &&
      a.top < b.bottom - 0.5 &&
      b.top < a.bottom - 0.5;
    const hits = [];
    for (const set of document.querySelectorAll('[data-filigree="corners"]')) {
      const frame = set.parentElement;
      const corners = [...set.querySelectorAll("svg")].map((svg) =>
        [...svg.querySelectorAll("path, circle, polygon")].map((shape) =>
          shape.getBoundingClientRect(),
        ),
      );
      const content = [...frame.children]
        .filter((child) => child !== set && child.tagName !== "svg")
        .filter((child) => getComputedStyle(child).position !== "absolute")
        .map((child) => child.getBoundingClientRect());
      const box = frame.getBoundingClientRect();
      const name = `${frame.tagName.toLowerCase()} ${Math.round(box.width)}×${Math.round(box.height)}`;
      corners.forEach((parts, i) => {
        for (const part of parts) {
          if (
            corners
              .slice(i + 1)
              .some((other) => other.some((o) => overlap(part, o)))
          ) {
            hits.push(`corners meet on ${name}`);
          }
          if (content.some((r) => overlap(part, r))) {
            hits.push(`corner over content of ${name}`);
          }
        }
      });
    }
    return [...new Set(hits)];
  });

// Every ornament's px per viewBox unit, against the corners' UNIT. Dividers
// of a style with its own divider size (Art Deco) are left out.
const SCALE_TOLERANCE = 0.05;
const ornamentScales = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("[data-filigree]")].flatMap((ornament) => {
      // Not rendered (an excerpt chapter behind another tab; each tab is
      // checked on its own #chapter-N route): no size to measure.
      if (!ornament.checkVisibility()) return [];
      const svg = ornament.querySelector("svg");
      const style = ornament.dataset.filigreeStyle ?? "bramble";
      if (ornament.dataset.filigree === "divider" && style !== "bramble") {
        return [];
      }
      const unit =
        svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      return [{ kind: ornament.dataset.filigree, style, unit }];
    }),
  );

const invisibleUnderReducedMotion = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((el) => !el.closest('[data-testid="cart-panel"]'))
      .filter((el) => {
        const style = getComputedStyle(el);
        if (style.opacity !== "0" || style.display === "none") return false;
        const box = el.getBoundingClientRect();
        const hasContent =
          el.textContent.trim() ||
          el.tagName === "IMG" ||
          el.querySelector("img");
        return box.width > 1 && box.height > 1 && hasContent;
      })
      .map((el) => `${el.tagName} ${el.textContent.trim().slice(0, 40)}`),
  );

// Every progress bar's fill matches its aria-valuenow (within 1px).
const progressBarMismatches = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[role="progressbar"]')].flatMap((bar) => {
      const now = Number(bar.getAttribute("aria-valuenow"));
      const fill = bar.firstElementChild;
      const expected = (bar.clientWidth * now) / 100;
      const actual = fill ? fill.getBoundingClientRect().width : 0;
      return Math.abs(actual - expected) > 1 ||
        bar.getAttribute("aria-valuemin") !== "0" ||
        bar.getAttribute("aria-valuemax") !== "100"
        ? [`progressbar ${now}%: fill ${actual}px, expected ${expected}px`]
        : [];
    }),
  );

// The excerpt column's width in ch of its own font (the width of "0").
const readingMeasure = (page) =>
  page.evaluate(() => {
    const column = document.querySelector('[data-testid="excerpt-text"]');
    if (!column) return null;
    const probe = document.createElement("span");
    probe.textContent = "0".repeat(100);
    probe.style.cssText =
      "position:absolute;visibility:hidden;white-space:nowrap";
    column.append(probe);
    const ch = probe.getBoundingClientRect().width / 100;
    probe.remove();
    const width = column.getBoundingClientRect().width;
    return { width: Math.round(width), ch: Math.round((width / ch) * 10) / 10 };
  });

const textOnArtContrast = (page) =>
  page.evaluate(async () => {
    const rgba = (css) => {
      const [r, g, b, a = 1] = css.match(/[\d.]+/g).map(Number);
      return { r, g, b, a };
    };
    const over = (top, base) => ({
      r: top.r * top.a + base.r * (1 - top.a),
      g: top.g * top.a + base.g * (1 - top.a),
      b: top.b * top.a + base.b * (1 - top.a),
      a: 1,
    });
    const luminance = ({ r, g, b }) => {
      const lin = (c) => {
        const v = c / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    };
    const ratio = (x, y) => {
      const [hi, lo] = [luminance(x), luminance(y)].sort((a, b) => b - a);
      return (hi + 0.05) / (lo + 0.05);
    };
    const results = [];
    for (const img of document.querySelectorAll(
      '[data-testid="section-background"]',
    )) {
      if (!img.complete) await img.decode();
      const section = img.parentElement;
      const scrim = rgba(
        getComputedStyle(img.nextElementSibling).backgroundColor,
      );
      const box = img.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(box.width);
      canvas.height = Math.round(box.height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const scale = Math.max(
        box.width / img.naturalWidth,
        box.height / img.naturalHeight,
      );
      const [px, py] = getComputedStyle(img)
        .objectPosition.split(" ")
        .map((v) => parseFloat(v) / 100);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (box.width - dw) * px, (box.height - dh) * py, dw, dh);
      const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const el = node.parentElement;
        if (!node.textContent.trim() || el.closest(".sr-only")) continue;
        const style = getComputedStyle(el);
        const size = parseFloat(style.fontSize);
        const isLarge =
          size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
        // Fills between the art and this text, outermost first.
        const fills = [];
        for (let a = el; a && a !== section; a = a.parentElement) {
          const fill = rgba(getComputedStyle(a).backgroundColor);
          if (fill.a > 0) fills.unshift(fill);
        }
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          const x = Math.max(0, Math.floor(r.left - box.left));
          const y = Math.max(0, Math.floor(r.top - box.top));
          const w = Math.min(canvas.width - x, Math.ceil(r.width));
          const h = Math.min(canvas.height - y, Math.ceil(r.height));
          if (w <= 0 || h <= 0) continue;
          const data = ctx.getImageData(x, y, w, h).data;
          let brightest = { r: 0, g: 0, b: 0, a: 1 };
          let max = -1;
          for (let i = 0; i < data.length; i += 4) {
            const p = { r: data[i], g: data[i + 1], b: data[i + 2], a: 1 };
            const l = luminance(p);
            if (l > max) [max, brightest] = [l, p];
          }
          const behind = fills.reduce(
            (base, fill) => over(fill, base),
            over(scrim, brightest),
          );
          results.push({
            text: node.textContent.trim().slice(0, 30),
            ratio: ratio(rgba(style.color), behind),
            min: isLarge ? 3 : 4.5,
          });
        }
      }
    }
    return results;
  });

const scrollCueGeometry = (page) =>
  page.evaluate(() => {
    const cue = document.querySelector('[data-testid="scroll-cue"]');
    const section = cue.closest("section");
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top + window.scrollY),
        bottom: Math.round(r.bottom + window.scrollY),
        left: Math.round(r.left),
        right: Math.round(r.right),
      };
    };
    return {
      cue: box(cue),
      section: box(section),
      next: box(section.nextElementSibling),
      buttons: [...section.querySelectorAll("a, button")].map(box),
      width: document.documentElement.clientWidth,
    };
  });

const main = async () => {
  const server = await startServer();
  console.log(`harness on ${server.baseUrl} (vite pid ${server.pid})`);
  const browser = await puppeteer.launch({ headless: "new" });
  const open = async (viewport, reduced = false) => {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport(viewport);
    if (reduced) {
      await page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "reduce" },
      ]);
    }
    return { context, page };
  };

  try {
    for (const route of checks ? ROUTES : []) {
      for (const viewport of [DESKTOP, MOBILE]) {
        const label = `${route} @${viewport.width}`;
        console.log(label);

        const live = await open(viewport);
        await live.page.goto(`${server.baseUrl}${route}`, {
          waitUntil: "load",
        });
        await new Promise((r) => setTimeout(r, 2500));
        const widths = await live.page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        if (widths.scroll !== widths.client) {
          fail(
            `${label}: horizontal scroll ${widths.scroll} > ${widths.client}`,
          );
        }
        await live.context.close();

        // Overlap is measured in the settled layout (no entrance transforms).
        const still = await open(viewport, true);
        await still.page.goto(`${server.baseUrl}${route}`, {
          waitUntil: "load",
        });
        await still.page.evaluate(() => document.fonts.ready);
        await scrollThrough(still.page);
        await new Promise((r) => setTimeout(r, 300));
        const overlaps = await ornamentTextOverlaps(still.page);
        console.log(`  ornament parts checked: ${overlaps.parts}`);
        for (const hit of overlaps.hits) fail(`${label}: ${hit}`);
        const collisions = await cornerCollisions(still.page);
        for (const hit of collisions) fail(`${label}: ${hit}`);
        const scales = await ornamentScales(still.page);
        console.log(
          `  ornament scale: ${[...new Set(scales.map((s) => s.unit.toFixed(3)))].join(", ") || "none"} px/unit (target ${UNIT})`,
        );
        for (const { kind, style, unit } of scales) {
          if (Math.abs(unit / UNIT - 1) > SCALE_TOLERANCE) {
            fail(
              `${label}: ${style} ${kind} at ${unit.toFixed(3)} px/unit, not ${UNIT}`,
            );
          }
        }
        const invisible = await invisibleUnderReducedMotion(still.page);
        for (const item of invisible) fail(`${label}: opacity 0 → ${item}`);
        const bars = await progressBarMismatches(still.page);
        for (const bar of bars) fail(`${label}: ${bar}`);
        const measure = await readingMeasure(still.page);
        if (measure) {
          console.log(`  reading column: ${measure.width}px, ${measure.ch}ch`);
          if (measure.ch > MAX_MEASURE_CH) {
            fail(
              `${label}: reading column ${measure.ch}ch > ${MAX_MEASURE_CH}ch`,
            );
          }
        }
        const contrasts = await textOnArtContrast(still.page);
        if (contrasts.length) {
          const worst = contrasts.reduce((a, b) =>
            a.ratio / a.min < b.ratio / b.min ? a : b,
          );
          console.log(
            `  text on art: ${contrasts.length} lines, worst ${worst.ratio.toFixed(2)}:1 ("${worst.text}", needs ${worst.min}:1)`,
          );
        }
        for (const { text, ratio, min } of contrasts) {
          if (ratio < min) {
            fail(
              `${label}: "${text}" on art at ${ratio.toFixed(2)}:1 < ${min}:1`,
            );
          }
        }
        await still.context.close();
      }
    }

    console.log("scroll cue");
    for (const viewport of !checks
      ? []
      : [
          DESKTOP,
          { width: 1280, height: 800 },
          { width: 1024, height: 768 },
          { width: 768, height: 1024 },
          MOBILE,
        ]) {
      const { context, page } = await open(viewport, true);
      await page.goto(`${server.baseUrl}/`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const { cue, section, next, buttons, width } =
        await scrollCueGeometry(page);
      const gaps = buttons.map((b) =>
        cue.left >= b.right || cue.right <= b.left
          ? Infinity
          : Math.max(cue.top - b.bottom, b.top - cue.bottom),
      );
      const minGap = Math.min(...gaps);
      const centre = (cue.left + cue.right) / 2 - width / 2;
      console.log(
        `  ${viewport.width}: cue ${cue.top}–${cue.bottom}, section ends ${section.bottom}, next starts ${next.top}, nearest button gap ${minGap}px, off-centre ${centre}px`,
      );
      if (minGap < 16)
        fail(`scroll cue @${viewport.width}: ${minGap}px from a button`);
      if (cue.top < section.top || cue.bottom > section.bottom) {
        fail(`scroll cue @${viewport.width}: outside its section`);
      }
      if (cue.bottom > next.top)
        fail(`scroll cue @${viewport.width}: overlaps next section`);
      if (Math.abs(centre) >= 1)
        fail(`scroll cue @${viewport.width}: not centred`);
      await context.close();
    }

    if (shotsDir) {
      mkdirSync(shotsDir, { recursive: true });
      console.log("screenshots");
      for (const shot of SHOTS) {
        const viewport = shot.mobile ? MOBILE : DESKTOP;
        const scale = shot.scale ?? (shot.mobile ? 2 : 1);
        const { context, page } = await open(
          { ...viewport, deviceScaleFactor: scale },
          true,
        );
        await page.goto(`${server.baseUrl}${shot.route}`, {
          waitUntil: "load",
        });
        await page.evaluate(() => document.fonts.ready);
        await scrollThrough(page);
        const handle = await page.$(shot.selector);
        if (!handle && shot.optional) {
          console.log(`  shot ${shot.name}: skipped, nothing matches`);
          await context.close();
          continue;
        }
        if (!handle) {
          fail(`shot ${shot.name}: nothing matches ${shot.selector}`);
          await context.close();
          continue;
        }
        // Clip in document coordinates: the top of the element, full width.
        const top = await handle.evaluate(
          (el) => el.getBoundingClientRect().top + window.scrollY,
        );
        const height = await handle.evaluate(
          (el, until) =>
            (until
              ? document.querySelector(until).getBoundingClientRect().bottom
              : el.getBoundingClientRect().bottom) -
            el.getBoundingClientRect().top,
          shot.until,
        );
        const pad = shot.pad ?? 0;
        await page.screenshot({
          path: join(shotsDir, `${shot.name}.png`),
          clip: {
            x: 0,
            y: Math.max(0, top - pad),
            width: viewport.width,
            height: Math.min(height + pad * 2, shot.maxHeight ?? 900),
          },
          captureBeyondViewport: true,
        });
        console.log(`  shot ${shot.name}.png`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await server.stop();
  }

  console.log(
    failures.length ? `\n${failures.length} failure(s)` : "\nall checks passed",
  );
  process.exit(failures.length ? 1 : 0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
