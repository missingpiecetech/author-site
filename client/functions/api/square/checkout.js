import { SquareClient, SquareEnvironment } from "square";

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
    return jsonResponse(
      {
        error:
          "Square is not configured. Set SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, and SQUARE_ENVIRONMENT.",
      },
      500,
    );
  }

  const client = new SquareClient({
    token,
    environment: resolveEnvironment(env.SQUARE_ENVIRONMENT || "sandbox"),
  });

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];

    const lineItems = items.map((item) => ({
      catalogObjectId: item.variationId || item.itemId,
      quantity: String(item.quantity),
      name: item.title,
      basePriceMoney: {
        amount: BigInt(Math.round(Number(item.price || 0) * 100)),
        currency: "USD",
      },
    }));

    const paymentLinkResponse = await client.checkout.paymentLinks.create({
      idempotencyKey: `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      order: { locationId, lineItems },
      checkoutOptions: {
        redirectUrl: body.redirectUrl,
        askForShippingAddress:
          body.checkoutOptions?.askForShippingAddress !== false,
      },
    });

    const paymentLink =
      paymentLinkResponse?.paymentLink ||
      paymentLinkResponse?.result?.paymentLink ||
      null;

    return jsonResponse({ paymentLink, url: paymentLink?.url || null });
  } catch (error) {
    console.error("Square checkout error:", error);
    return jsonResponse(
      { error: error?.message || "Square API error" },
      500,
    );
  }
}
