// Design check for the dark re-skin: drives every route in a real browser
// against the e2e harness (Square stubbed, free port, never .env.local) and
// reports, per route at 1440 and 390:
//   - horizontal scroll after 2.5s of live animation;
//   - filigree ornaments whose painted parts overlap text in the same section;
//   - content left at opacity 0 with prefers-reduced-motion;
// plus the Home scroll cue's geometry at 1440/1280/1024/768/390, and, with
// `--shots <dir>`, small element screenshots of the filigree for review.
//
//   node scripts/design-check.mjs [--shots <dir>]
//
// Exits non-zero if any check fails.

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer";
import { startServer } from "../tests/e2e/support/server.js";

const ROUTES = [
  "/",
  "/books",
  "/podcast",
  "/about",
  "/store",
  "/contact",
  "/checkout/success",
];
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844, isMobile: true, hasTouch: true };

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
        const invisible = await invisibleUnderReducedMotion(still.page);
        for (const item of invisible) fail(`${label}: opacity 0 → ${item}`);
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
      const shoot = async (viewport, route, name, locate, pad = 24) => {
        const { context, page } = await open(
          { ...viewport, deviceScaleFactor: 2 },
          true,
        );
        await page.goto(`${server.baseUrl}${route}`, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        await scrollThrough(page);
        const handle = await page.evaluateHandle(locate);
        // Top of the element well below the sticky header.
        await handle.evaluate((el) => {
          el.scrollIntoView({ block: "start" });
          window.scrollBy(0, -200);
        });
        await new Promise((r) => setTimeout(r, 400));
        // Clip is in document coordinates; the element box is in viewport ones.
        const box = await handle.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return {
            x: r.left + window.scrollX,
            y: r.top + window.scrollY,
            width: r.width,
            height: r.height,
          };
        });
        const clip = {
          x: Math.max(0, box.x - pad),
          y: Math.max(0, box.y - pad),
          width: Math.min(viewport.width, box.width + pad * 2),
          height: Math.min(box.height + pad * 2, 420),
        };
        await page.screenshot({ path: join(shotsDir, `${name}.png`), clip });
        console.log(`  shot ${name}.png`);
        await context.close();
      };
      console.log("screenshots");
      await shoot(
        DESKTOP,
        "/",
        "home-book-cover-frame-1440",
        () =>
          document.querySelector("#crownfall [data-filigree]").parentElement,
      );
      await shoot(
        DESKTOP,
        "/store",
        "store-listing-and-notice-1440",
        () => document.querySelector('[role="note"]').closest("section"),
        0,
      );
      await shoot(
        DESKTOP,
        "/about",
        "about-pull-quote-1440",
        () => document.querySelector("figure blockquote").closest("section"),
        0,
      );
      await shoot(
        DESKTOP,
        "/",
        "section-divider-1440",
        () =>
          [...document.querySelectorAll("section")].find((s) =>
            s.querySelector(':scope > div > [data-filigree="divider"]'),
          ).firstElementChild,
        48,
      );
      const { context, page } = await open(
        { ...MOBILE, deviceScaleFactor: 2 },
        true,
      );
      await page.goto(`${server.baseUrl}/`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(shotsDir, "home-390.png") });
      console.log("  shot home-390.png");
      await context.close();
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
