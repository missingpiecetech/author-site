// Forces each failure the store can hit and checks two things: the screen shows
// plain words, and GlitchTip is sent the status, code and original error. The
// DSN points at a host that does not exist and its requests are caught here, so
// nothing leaves the machine.

import puppeteer from "puppeteer";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CHECKOUT_FAILED,
  CONNECTION_FAILED,
  SERVER_FAILED,
} from "../../shared/errors.js";
import { startServer } from "./support/server.js";

const FAKE_DSN = "https://publickey@glitchtip.invalid/19";
const SOURCE_SENTENCE = "A sentence written where the error happened.";
const byTestId = (id) => `[data-testid="${id}"]`;
const TECHNICAL_TEXT = /\b[345]\d\d\b|HTTP|Request failed|non-JSON|Bad Gateway/;

let server;
let browser;

beforeAll(async () => {
  server = await startServer({ env: { PUBLIC_GLITCHTIP_DSN: FAKE_DSN } });
  browser = await puppeteer.launch({ headless: true });
}, 90_000);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
});

const HTML_502 = {
  status: 502,
  contentType: "text/html",
  body: "<html>Bad Gateway</html>",
};
const SOURCE_500 = {
  status: 500,
  contentType: "application/json",
  body: JSON.stringify({ error: SOURCE_SENTENCE }),
};
const HTML_200 = {
  status: 200,
  contentType: "text/html",
  body: "<html></html>",
};

/** Opens a page whose route answers `reply`, or aborts when it is "abort". */
const openPage = async (route, reply) => {
  // Its own context: the cart persists in localStorage and would carry over.
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const reports = [];
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname === "glitchtip.invalid") {
      reports.push(request.postData() || "");
      request.respond({
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        contentType: "application/json",
        body: "{}",
      });
    } else if (url.pathname === route && reply === "abort") {
      request.abort("connectionfailed");
    } else if (url.pathname === route) {
      request.respond(reply);
    } else if (url.origin === server.baseUrl) {
      request.continue();
    } else {
      request.abort("blockedbyclient");
    }
  });
  return { page, reports };
};

const waitForReport = async (reports, pattern) => {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    const found = reports.find((report) => pattern.test(report));
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`no report matched ${pattern}: ${reports.join("\n")}`);
};

describe("store products fail to load", () => {
  it.each([
    ["a proxy answers 502 with HTML", HTML_502, SERVER_FAILED, /"status":502/],
    ["a success reply is not JSON", HTML_200, SERVER_FAILED, /"not_json"/],
    ["the network fails", "abort", CONNECTION_FAILED, /"network"/],
    ["our API writes the sentence", SOURCE_500, SOURCE_SENTENCE, /"api_error"/],
  ])("%s", async (_, reply, message, reported) => {
    const { page, reports } = await openPage("/api/square/catalog", reply);
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    const alert = await page.waitForSelector('[role="alert"]');
    const text = await alert.evaluate((node) => node.textContent);
    expect(text).toBe(message);
    expect(text).not.toMatch(TECHNICAL_TEXT);
    const report = await waitForReport(reports, reported);
    expect(report).toContain("/api/square/catalog");
    expect(report).toContain('"method":"GET"');
    await page.close();
  });
});

describe("checkout fails", () => {
  const failCheckout = async (reply) => {
    const { page, reports } = await openPage("/api/square/checkout", reply);
    await page.goto(`${server.baseUrl}/store`, { waitUntil: "load" });
    await (await page.waitForSelector(byTestId("add-to-cart"))).click();
    await page.click(byTestId("cart-toggle"));
    await page.waitForSelector(`${byTestId("cart-panel")}[data-state="open"]`);
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector).getAnimations().length === 0,
      {},
      byTestId("cart-panel"),
    );
    await page.click(byTestId("checkout-button"));
    const error = await page.waitForSelector(byTestId("checkout-error"));
    return {
      page,
      reports,
      text: await error.evaluate((node) => node.textContent),
    };
  };

  it("the sentence from the server reaches the cart unchanged", async () => {
    const { page, text, reports } = await failCheckout(SOURCE_500);
    expect(text).toBe(SOURCE_SENTENCE);
    const report = await waitForReport(reports, /"status":500/);
    expect(report).toContain('"method":"POST"');
    expect(report).toContain("answered 500");
    await page.close();
  });

  it("a reply without a checkout link shows plain words", async () => {
    const { page, text, reports } = await failCheckout({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
    expect(text).toBe(CHECKOUT_FAILED);
    await waitForReport(reports, /"checkout_url_missing"/);
    await page.close();
  });

  it("a network failure shows plain words", async () => {
    const { page, text } = await failCheckout("abort");
    expect(text).toBe(CONNECTION_FAILED);
    await page.close();
  });
});
