import { SquareClient, SquareEnvironment } from "square";
import { buildPaymentLinkRequest } from "../../../shared/checkout.js";
import { CHECKOUT_FAILED, STORE_UNAVAILABLE } from "../../../shared/errors.js";
import {
  reportServerError,
  reportSquareNotConfigured,
} from "../../../shared/serverErrors.js";

const resolveEnvironment = (value) =>
  (value || "").toLowerCase() === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

const bigIntReplacer = (_, value) =>
  typeof value === "bigint" ? value.toString() : value;

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data, bigIntReplacer), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function onRequestPost(context) {
  const { env, request } = context;
  const token = env.SQUARE_ACCESS_TOKEN || "";
  const locationId = env.SQUARE_LOCATION_ID || "";

  if (!token || !locationId) {
    reportSquareNotConfigured(context);
    return jsonResponse({ error: STORE_UNAVAILABLE }, 500);
  }

  const client = new SquareClient({
    token,
    environment: resolveEnvironment(env.SQUARE_ENVIRONMENT || "sandbox"),
  });

  try {
    // A body that is not JSON is an empty cart, not a server failure.
    const body = await request.json().catch(() => ({}));
    const { error, request: paymentLinkRequest } =
      await buildPaymentLinkRequest(client, {
        locationId,
        cacheKey: token,
        origin: new URL(request.url).origin,
        body,
      });
    if (error) return jsonResponse({ error }, 400);

    const paymentLinkResponse =
      await client.checkout.paymentLinks.create(paymentLinkRequest);

    const paymentLink =
      paymentLinkResponse?.paymentLink ||
      paymentLinkResponse?.result?.paymentLink ||
      null;

    return jsonResponse({ paymentLink, url: paymentLink?.url || null });
  } catch (error) {
    console.error("Square checkout error:", error);
    reportServerError(error, {
      context,
      status: 500,
      code: "square_checkout_failed",
    });
    return jsonResponse({ error: CHECKOUT_FAILED }, 500);
  }
}
