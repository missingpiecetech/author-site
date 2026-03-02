import { SquareClient, SquareEnvironment } from "square";

const resolveEnvironment = (value) =>
  (value || "").toLowerCase() === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

const bigIntReplacer = (_, value) =>
  typeof value === "bigint" ? value.toString() : value;

export async function onRequestPost(context) {
  const { env, request } = context;
  const token = env.SQUARE_ACCESS_TOKEN || "";
  const locationId = env.SQUARE_LOCATION_ID || "";

  if (!token || !locationId) {
    return Response.json(
      {
        error:
          "Square is not configured. Set SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, and SQUARE_ENVIRONMENT.",
      },
      { status: 500 },
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

    return new Response(
      JSON.stringify(
        { paymentLink, url: paymentLink?.url || null },
        bigIntReplacer,
      ),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Square checkout error:", error);
    return Response.json(
      { error: error?.message || "Square API error" },
      { status: 500 },
    );
  }
}
