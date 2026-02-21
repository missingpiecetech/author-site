import { useCallback, useRef } from "react";

const DEFAULT_API_BASE_URL = "/api/square";
const DEFAULT_SUCCESS_PATH = "/checkout/success";

const toError = async (response) => {
  let message = `Request failed (${response.status})`;

  try {
    const data = await response.json();
    message = data?.error || data?.message || message;
  } catch {
    message = response.statusText || message;
  }

  return new Error(message);
};

const mapCatalogProducts = (catalog = []) => {
  const imageById = new Map(
    catalog
      .filter((obj) => obj.type === "IMAGE")
      .map((image) => [image.id, image.imageData?.url || null]),
  );

  return catalog
    .filter(
      (item) =>
        item.type === "ITEM" &&
        item.itemData?.isArchived !== true &&
        item.isDeleted !== true &&
        item.itemData?.ecom_visibility !== "HIDDEN" &&
        item.itemData?.ecom_visibility !== "UNINDEXED",
    )
    .map((item) => {
      const itemData = item.itemData || {};
      const firstVariation = itemData.variations?.[0];
      const variationId = firstVariation?.id || null;
      const priceInCents =
        firstVariation?.itemVariationData?.priceMoney?.amount ?? 0;
      const imageUrls = (itemData.imageIds || [])
        .map((imageId) => imageById.get(imageId))
        .filter(Boolean);
      const [featureImage, ...images] = imageUrls;

      return {
        id: item.id,
        title: itemData.name || "Unnamed Product",
        description: itemData.descriptionHtml || "",
        featureImage: featureImage || null,
        images,
        price: Number(priceInCents) / 100,
        variationId,
      };
    });
};

const useSquare = (options = {}) => {
  const {
    apiBaseUrl = DEFAULT_API_BASE_URL,
    successPath = DEFAULT_SUCCESS_PATH,
  } = options;
  const productsRef = useRef([]);

  const request = useCallback(
    async (path, init = {}) => {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
        ...init,
      });

      if (!response.ok) {
        throw await toError(response);
      }

      if (response.status === 204) {
        return null;
      }

      const responseContentType = response.headers.get("content-type") || "";
      if (!responseContentType.includes("application/json")) {
        throw new Error(
          "Square API returned a non-JSON response. Verify your local Square API route is running.",
        );
      }

      return response.json();
    },
    [apiBaseUrl],
  );

  const getProducts = useCallback(async () => {
    if (productsRef.current.length > 0) {
      return productsRef.current;
    }

    const productData = await request("/catalog");

    const catalog = productData?.objects || [];
    productsRef.current = mapCatalogProducts(catalog);
    return productsRef.current;
  }, [request]);

  const getProductById = useCallback(
    async (productId) => {
      const allProducts = await getProducts();
      const product = allProducts.find((item) => item.id === productId) || null;

      const relatedProducts = allProducts
        .filter((item) => item.id !== productId)
        .slice(0, 3);

      return { product, relatedProducts };
    },
    [getProducts],
  );

  const createCheckoutLink = useCallback(
    async (items, checkoutOptions = {}) => {
      const pickup = Boolean(checkoutOptions.pickup);
      const redirectUrl =
        checkoutOptions.redirectUrl ||
        `${window.location.origin}${successPath}`;

      const payload = {
        items: items.map((item) => ({
          itemId: item.id,
          variationId: item.variationId,
          quantity: item.quantity,
          title: item.title || item.name,
          price: item.price,
        })),
        redirectUrl,
        checkoutOptions: {
          askForShippingAddress: !pickup,
        },
      };

      const data = await request("/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const checkoutUrl =
        data?.url || data?.checkoutUrl || data?.paymentLink?.url;
      if (!checkoutUrl) {
        throw new Error("Failed to create checkout link.");
      }

      return checkoutUrl;
    },
    [request, successPath],
  );

  const createPickupOrder = useCallback(
    async (items) => createCheckoutLink(items, { pickup: true }),
    [createCheckoutLink],
  );

  const createCustomer = useCallback(
    async (firstName, lastName, email) => {
      const data = await request("/customers", {
        method: "POST",
        body: JSON.stringify({
          givenName: firstName,
          familyName: lastName,
          emailAddress: email,
        }),
      });

      return {
        success: true,
        customerId: data?.customer?.id || null,
        customer: data?.customer || null,
      };
    },
    [request],
  );

  return {
    getProducts,
    getProductById,
    createCheckoutLink,
    createPickupOrder,
    createCustomer,
  };
};

export default useSquare;
