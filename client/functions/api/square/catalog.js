import { SquareClient, SquareEnvironment } from "square";
import { CATALOG_FAILED, STORE_UNAVAILABLE } from "../../../shared/errors.js";
import {
  reportServerError,
  reportSquareNotConfigured,
} from "../../../shared/serverErrors.js";

const resolveEnvironment = (value) =>
  (value || "").toLowerCase() === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

const jsonResponse = (data, status = 200) =>
  new Response(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    { status, headers: { "Content-Type": "application/json" } },
  );

export async function onRequestGet(context) {
  const { env, request } = context;
  const token = env.SQUARE_ACCESS_TOKEN || "";
  const locationId = env.SQUARE_LOCATION_ID || "";

  if (!token || !locationId) {
    reportSquareNotConfigured(request);
    return jsonResponse({ error: STORE_UNAVAILABLE }, 500);
  }

  const client = new SquareClient({
    token,
    environment: resolveEnvironment(env.SQUARE_ENVIRONMENT || "sandbox"),
  });

  try {
    const page = await client.catalog.list({ types: "ITEM,IMAGE" });
    const objects = [];
    for await (const obj of page) {
      objects.push(obj);
    }

    return jsonResponse({ objects });
  } catch (error) {
    console.error("Square catalog error:", error);
    reportServerError(error, {
      request,
      status: 500,
      code: "square_catalog_failed",
    });
    return jsonResponse({ error: CATALOG_FAILED }, 500);
  }
}
