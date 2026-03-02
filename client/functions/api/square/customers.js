import { SquareClient, SquareEnvironment } from "square";

const resolveEnvironment = (value) =>
  (value || "").toLowerCase() === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

export async function onRequestPost(context) {
  const { env, request } = context;
  const token = env.SQUARE_ACCESS_TOKEN || "";

  if (!token) {
    return Response.json(
      {
        error:
          "Square is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_ENVIRONMENT.",
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
    const customerResponse = await client.customers.create({
      givenName: body.givenName,
      familyName: body.familyName,
      emailAddress: body.emailAddress,
    });

    const customer =
      customerResponse?.customer ||
      customerResponse?.result?.customer ||
      null;

    return Response.json({ customer });
  } catch (error) {
    console.error("Square customer error:", error);
    return Response.json(
      { error: error?.message || "Square API error" },
      { status: 500 },
    );
  }
}
