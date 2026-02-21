import { SquareClient, SquareEnvironment } from "square";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const readJsonBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
};

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify(payload, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
};

const resolveSquareEnvironment = (value) => {
  if ((value || "").toLowerCase() === "production") {
    return SquareEnvironment.Production;
  }

  return SquareEnvironment.Sandbox;
};

const createSquareClient = (env) => {
  const token = env.SQUARE_ACCESS_TOKEN || env.VITE_SQUARE_ACCESS_TOKEN || "";
  const environment =
    env.SQUARE_ENVIRONMENT || env.VITE_SQUARE_ENVIRONMENT || "sandbox";

  if (!token) {
    return null;
  }

  return new SquareClient({
    token,
    environment: resolveSquareEnvironment(environment),
  });
};

const squareApiPlugin = (env) => {
  const locationId =
    env.SQUARE_LOCATION_ID || env.VITE_SQUARE_LOCATION_ID || "";
  const squareClient = createSquareClient(env);

  return {
    name: "square-api-dev-server",
    configureServer(server) {
      server.middlewares.use("/api/square", async (req, res) => {
        if (!squareClient || !locationId) {
          sendJson(res, 500, {
            error:
              "Square is not configured. Set SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, and SQUARE_ENVIRONMENT in the project root env file.",
          });
          return;
        }

        try {
          if (req.method === "GET" && req.url === "/catalog") {
            const catalogResponse = await squareClient.catalog.list({
              types: "ITEM,IMAGE",
            });
            const objects =
              catalogResponse?.response?.objects ||
              catalogResponse?.objects ||
              [];
            sendJson(res, 200, { objects });
            return;
          }

          if (req.method === "POST" && req.url === "/checkout") {
            const body = await readJsonBody(req);
            const items = Array.isArray(body.items) ? body.items : [];

            const lineItems = items.map((item) => ({
              catalogObjectId: item.variationId,
              quantity: String(item.quantity),
              name: item.title,
              basePriceMoney: {
                amount: BigInt(Math.round(Number(item.price || 0) * 100)),
                currency: "USD",
              },
            }));

            const paymentLinkResponse =
              await squareClient.checkout.paymentLinks.create({
                idempotencyKey: `checkout-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 11)}`,
                order: {
                  locationId,
                  lineItems,
                },
                checkoutOptions: {
                  redirectUrl: body.redirectUrl,
                  askForShippingAddress:
                    body.checkoutOptions?.askForShippingAddress !== false,
                  squareMarketingOptIn: true,
                },
              });

            const paymentLink =
              paymentLinkResponse?.paymentLink ||
              paymentLinkResponse?.result?.paymentLink ||
              paymentLinkResponse?.response?.paymentLink ||
              null;

            sendJson(res, 200, {
              paymentLink,
              url: paymentLink?.url || null,
            });
            return;
          }

          if (req.method === "POST" && req.url === "/customers") {
            const body = await readJsonBody(req);
            const customerResponse = await squareClient.customers.create({
              givenName: body.givenName,
              familyName: body.familyName,
              emailAddress: body.emailAddress,
            });

            const customer =
              customerResponse?.customer ||
              customerResponse?.result?.customer ||
              customerResponse?.response?.customer ||
              null;

            sendJson(res, 200, { customer });
            return;
          }

          sendJson(res, 404, { error: "Not found" });
        } catch (error) {
          sendJson(res, 500, { error: error?.message || "Square API error" });
        }
      });
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), squareApiPlugin(env)],
  };
});
