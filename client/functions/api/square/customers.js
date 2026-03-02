import { SquareClient, SquareEnvironment } from "square";

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
    return jsonResponse(
      {
        error:
          "Square is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_ENVIRONMENT.",
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
    const customerResponse = await client.customers.create({
      givenName: body.givenName,
      familyName: body.familyName,
      emailAddress: body.emailAddress,
    });

    const customer =
      customerResponse?.customer ||
      customerResponse?.result?.customer ||
      null;

    return jsonResponse({ customer });
  } catch (error) {
    console.error("Square customer error:", error);
    return jsonResponse(
      { error: error?.message || "Square API error" },
      500,
    );
  }
}
