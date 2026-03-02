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

export async function onRequestGet(context) {
  const { env } = context;
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
    const page = await client.catalog.list({ types: "ITEM,IMAGE" });
    const objects = [];
    for await (const obj of page) {
      objects.push(obj);
    }

    return jsonResponse({ objects });
  } catch (error) {
    console.error("Square catalog error:", error);
    return jsonResponse(
      { error: error?.message || "Square API error" },
      500,
    );
  }
}
