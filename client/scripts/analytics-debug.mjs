// Drives a production build with the REAL Minilytics tracker in debug mode and
// prints what it sends and how the analytics host answers.
//
//   node scripts/analytics-debug.mjs
//
// - Builds with client/.env.production into a scratch directory, adds
//   data-debug="true" to the tracker tag of that scratch build only, and
//   serves it with `vite preview` on a free port. Refuses to run where a
//   .env.local or .env.production.local exists, since the build would read it
//   (it may hold production Square keys): run it from a fresh worktree.
// - Square is never reached: the browser answers /api/square/* with the e2e
//   stub catalog and a fake payment link, and aborts any Square host.
// - The tracker refuses automated browsers, so Chrome runs with
//   AutomationControlled off (navigator.webdriver is false).
// - Real requests go to the analytics host. Until "Accept events from
//   localhost" is on in the dashboard, track.php answers 403; with it on,
//   these visits are recorded as real traffic from 127.0.0.1.
//
// Flow: Home -> Keep reading (route change) -> scroll the excerpt -> copy ->
// next chapter -> Join the Circle (MailerLite's popup) -> reload -> Store
// (route change) -> edition -> add to cart -> wait for a replay chunk ->
// cart -> checkout.

import { spawn } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { build } from "vite";
import { findFreePort } from "../tests/e2e/support/server.js";
import { STUB_PRODUCTS } from "../tests/e2e/support/square-stub-products.js";

const CLIENT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VITE_BIN = join(CLIENT, "node_modules/vite/bin/vite.js");
const LOCAL_ENV_FILES = [".env.local", ".env.production.local"];
const scratch = mkdtempSync(join(tmpdir(), "author-site-analytics-"));
const outDir = join(scratch, "dist");
const STUB_CHECKOUT = "https://checkout.square.test/pay/analytics-debug";
const HIDDEN_KEYS = new Set([
  "tracking_mode",
  "path",
  "title",
  "hostname",
  "referrer",
  "language",
  "screen",
]);

const catalog = {
  objects: STUB_PRODUCTS.map((p) => ({
    type: "ITEM",
    id: p.itemId,
    isDeleted: false,
    itemData: {
      name: p.name,
      descriptionHtml: "<p>Stub product.</p>",
      imageIds: [],
      variations: [
        {
          type: "ITEM_VARIATION",
          id: p.variationId,
          itemVariationData: {
            itemId: p.itemId,
            name: "Regular",
            priceMoney: { amount: String(p.cents), currency: "USD" },
          },
        },
      ],
    },
  })),
};

const lines = [];
const started = Date.now();
const note = (text) =>
  lines.push(
    `${((Date.now() - started) / 1000).toFixed(1).padStart(5)}s ${text}`,
  );
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let preview;
let browser;
try {
  const local = LOCAL_ENV_FILES.filter((name) =>
    existsSync(join(CLIENT, name)),
  );
  if (local.length) {
    throw new Error(
      `Refusing to build: ${local.join(", ")} would be read (it may hold production Square keys). Run this from a checkout without it, such as a fresh worktree.`,
    );
  }
  for (const key of Object.keys(process.env))
    if (/SQUARE|MINILYTICS/i.test(key)) delete process.env[key];
  process.chdir(CLIENT);
  await build({ logLevel: "warn", build: { outDir, emptyOutDir: true } });
  const html = readFileSync(join(outDir, "index.html"), "utf8");
  const host = html.match(/src="([^"]+)\/minilytics\.js"/)?.[1];
  if (!host)
    throw new Error(
      "The build has no Minilytics tag: check client/.env.production.",
    );
  writeFileSync(
    join(outDir, "index.html"),
    html.replace(
      'data-privacy-mode="strict"',
      'data-privacy-mode="strict" data-debug="true"',
    ),
  );
  const analyticsHost = new URL(host).hostname;

  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  preview = spawn(
    process.execPath,
    [
      VITE_BIN,
      "preview",
      "--config",
      join(CLIENT, "vite.config.js"),
      "--outDir",
      outDir,
      "--port",
      String(port),
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    { cwd: CLIENT, stdio: "ignore" },
  );
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {
      // not listening yet
    }
    if (Date.now() > deadline)
      throw new Error(`vite preview did not answer on ${base}`);
    await wait(200);
  }

  browser = await puppeteer.launch({
    headless: "new",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on("console", (m) => {
    if (m.text().includes("[Minilytics]"))
      note(`console.${m.type()} ${m.text().slice(0, 200)}`);
  });
  page.on("pageerror", (error) => note(`PAGE ERROR ${error.message}`));
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin === base && url.pathname === "/api/square/catalog") {
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(catalog),
      });
    }
    if (url.origin === base && url.pathname.startsWith("/api/square/")) {
      return request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: STUB_CHECKOUT }),
      });
    }
    if (url.hostname === "checkout.square.test") {
      return request.respond({
        status: 200,
        contentType: "text/html",
        body: "<title>Stub checkout</title>",
      });
    }
    if (
      /(^|\.)(squareup\.com|squareupsandbox\.com|square\.link)$/i.test(
        url.hostname,
      )
    )
      return request.abort();
    if (
      url.hostname === analyticsHost &&
      request.method() === "POST" &&
      url.pathname.endsWith("/track.php")
    ) {
      const body = JSON.parse(request.postData());
      const props = Object.fromEntries(
        Object.entries(body.data).filter(([key]) => !HIDDEN_KEYS.has(key)),
      );
      note(`send ${body.name} ${body.data.path} ${JSON.stringify(props)}`);
    }
    return request.continue();
  });
  page.on("response", async (response) => {
    const url = new URL(response.url());
    if (
      url.hostname !== analyticsHost ||
      response.request().method() !== "POST"
    )
      return;
    const text =
      response.status() >= 400
        ? ` ${(await response.text().catch(() => "")).slice(0, 160)}`
        : "";
    note(`  ${url.pathname} -> ${response.status()}${text}`);
  });

  await page.goto(`${base}/`, { waitUntil: "load" });
  await wait(1500);
  note(
    `-- tracker loaded: ${await page.evaluate(() => typeof window.minilytics?.startReplay === "function")}`,
  );
  note("-- Keep reading");
  await page.click('[data-testid="excerpt-keep-reading"]');
  await page.waitForSelector("[data-paragraph]");
  for (let y = 300; y <= 3000; y += 300) {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      y,
    );
    await wait(40);
  }
  await wait(1500);
  note("-- copy a paragraph");
  await page.evaluate(() => {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('[data-paragraph="20"]'));
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  });
  await page.keyboard.press("KeyC", { commands: ["Copy"] });
  await wait(500);
  note("-- Next chapter");
  await page.click('[data-testid="excerpt-next"]');
  await wait(1000);
  note("-- Join the Circle (MailerLite's popup), then reload Home");
  await page.click(
    "::-p-xpath(//header//button[normalize-space()='Join the Circle'])",
  );
  await wait(2000);
  await page.reload({ waitUntil: "load" });
  note("-- Store");
  await page.click('header a[href="/store"]');
  await page.waitForSelector('[data-testid="add-to-cart"]');
  await page.click('[data-testid="edition-format-paperback"]');
  await page.click('[data-testid="add-to-cart"]');
  await wait(12_000);
  note("-- cart and checkout");
  await page.click('[data-testid="cart-toggle"]');
  await wait(500);
  await page.click('[data-testid="checkout-button"]');
  await page.waitForFunction(
    () => location.hostname === "checkout.square.test",
    { timeout: 15_000 },
  );
  note(`-- landed on ${page.url()}`);
} finally {
  await browser?.close();
  if (preview && preview.exitCode === null) {
    const exited = new Promise((r) => preview.once("exit", r));
    preview.kill("SIGTERM");
    await exited;
  }
  rmSync(scratch, { recursive: true, force: true });
  console.log(lines.join("\n"));
}
