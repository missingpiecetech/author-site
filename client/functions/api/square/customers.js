import { SquareClient, SquareEnvironment } from "square";
import { CUSTOMER_FAILED, STORE_UNAVAILABLE } from "../../../shared/errors.js";
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

export async function onRequestPost(context) {
  const { env, request } = context;
  const token = env.SQUARE_ACCESS_TOKEN || "";

  if (!token) {
    reportSquareNotConfigured(request);
    return jsonResponse({ error: STORE_UNAVAILABLE }, 500);
  }

  const client = new SquareClient({
    token,
    environment: resolveEnvironment(env.SQUARE_ENVIRONMENT || "sandbox"),
  });

  try {
    const body = await request.json();
    const customerResponse = await client.customers.create({
      givenName: body.givenName,
      familyName: body.familyName,
      emailAddress: body.emailAddress,
    });

    const customer =
      customerResponse?.customer || customerResponse?.result?.customer || null;

    return jsonResponse({ customer });
  } catch (error) {
    console.error("Square customer error:", error);
    reportServerError(error, {
      request,
      status: 500,
      code: "square_customer_failed",
    });
    return jsonResponse({ error: CUSTOMER_FAILED }, 500);
  }
}
