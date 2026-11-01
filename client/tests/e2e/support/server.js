// Starts the real `vite` dev server on a free port with the `square` package
// swapped for the local stub, and tears it down again.
//
// Safety: the child gets dummy Square credentials, every SQUARE_* variable
// inherited from the shell is dropped, and the SDK itself is replaced, so no
// request can reach Square even if a .env.local with real credentials sits in
// the checkout this runs from.
//
// Instagram: INSTAGRAM_FEED_FIXTURE points the /api/instagram dev middleware
// at the committed instagram-fixture.json, so the suite never calls Behold
// (whose free plan counts every request) and serves placeholder media locally.

import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CLIENT_ROOT = resolve(here, "../../..");
const VITE_BIN = join(CLIENT_ROOT, "node_modules/vite/bin/vite.js");
const REGISTER = join(here, "register-square-stub.mjs");
const CONFIG = resolve(here, "../vite.e2e.config.js");
export const INSTAGRAM_FIXTURE = join(here, "instagram-fixture.json");

export const DUMMY_SQUARE_ENV = {
  SQUARE_ACCESS_TOKEN: "e2e-dummy-token-not-a-credential",
  SQUARE_LOCATION_ID: "E2E_LOCATION",
  SQUARE_ENVIRONMENT: "sandbox",
};

const portIsFreeByLsof = (port) => {
  try {
    execFileSync("lsof", ["-nP", `-iTCP:${port}`], { stdio: "pipe" });
    return false; // lsof exits 0 when something holds the port
  } catch (error) {
    if (error.status === 1) return true; // nothing found
    throw error;
  }
};

const askOsForPort = () =>
  new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.unref();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolvePort(port));
    });
  });

export const findFreePort = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const port = await askOsForPort();
    if (portIsFreeByLsof(port)) return port;
  }
  throw new Error("Could not find a port that lsof confirms is free.");
};

export const readStubLog = (logPath) => {
  if (!existsSync(logPath)) return [];
  return readFileSync(logPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) =>
      JSON.parse(line, (_, value) =>
        value && typeof value === "object" && "$bigint" in value
          ? BigInt(value.$bigint)
          : value,
      ),
    );
};

const waitForHttp = async (url, child, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`vite exited early with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`vite did not answer at ${url} within ${timeoutMs}ms`);
};

export const startServer = async ({ env: extraEnv = {} } = {}) => {
  const scratch = mkdtempSync(join(tmpdir(), "author-site-e2e-"));
  const logPath = join(scratch, "square-calls.jsonl");
  const port = await findFreePort();

  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !/SQUARE/i.test(key)),
  );
  Object.assign(env, DUMMY_SQUARE_ENV, {
    SQUARE_STUB_LOG: logPath,
    INSTAGRAM_FEED_FIXTURE: INSTAGRAM_FIXTURE,
    E2E_VITE_CACHE_DIR: join(scratch, "vite-cache"),
    BROWSER: "none",
    ...extraEnv,
  });

  const output = [];
  const child = spawn(
    process.execPath,
    [
      "--import",
      REGISTER,
      VITE_BIN,
      "--config",
      CONFIG,
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    { cwd: CLIENT_ROOT, env, stdio: ["ignore", "pipe", "pipe"] },
  );
  child.stdout.on("data", (chunk) => output.push(chunk.toString()));
  child.stderr.on("data", (chunk) => output.push(chunk.toString()));

  const baseUrl = `http://127.0.0.1:${port}`;
  const stop = async () => {
    if (child.exitCode === null) {
      const exited = new Promise((r) => child.once("exit", r));
      process.kill(child.pid, "SIGTERM");
      await exited;
    }
    rmSync(scratch, { recursive: true, force: true });
    if (!portIsFreeByLsof(port)) {
      throw new Error(`port ${port} still held after stopping vite`);
    }
  };

  try {
    await waitForHttp(`${baseUrl}/`, child, 60_000);

    // Prove the thing answering on this port is the server we just started,
    // running the stub rather than the real SDK.
    const boot = readStubLog(logPath).find((entry) => entry.type === "boot");
    if (!boot || boot.pid !== child.pid) {
      throw new Error(
        `Square stub not loaded in vite pid ${child.pid} (boot record: ${JSON.stringify(boot)})`,
      );
    }
  } catch (error) {
    await stop().catch(() => {});
    error.message += `\n--- vite output ---\n${output.join("")}`;
    throw error;
  }

  return {
    port,
    baseUrl,
    pid: child.pid,
    logPath,
    calls: () => readStubLog(logPath),
    output: () => output.join(""),
    stop,
  };
};
