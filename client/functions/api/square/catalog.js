import { SquareClient, SquareEnvironment } from "square";

const resolveEnvironment = (value) =>
  (value || "").toLowerCase() === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

export async function onRequestGet(context) {
  const { env } = context;
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
    const objects = [];
    for await (const obj of client.catalog.list({ types: "ITEM,IMAGE" })) {
      objects.push(obj);
    }

    return Response.json({ objects });
  } catch (error) {
    console.error("Square catalog error:", error);
    return Response.json(
      { error: error?.message || "Square API error" },
      { status: 500 },
    );
  }
}
