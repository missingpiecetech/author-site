import { useCallback, useEffect, useMemo, useState } from "react";
import useCart from "../hooks/useCart";
import useSquare from "../hooks/useSquare";
import PageIntro from "../components/ui/PageIntro";
import { BACKGROUNDS } from "../assets/backgrounds/index.js";
import Section from "../components/ui/Section";
import ShippingNotice from "../components/ShippingNotice";
import CrownfallListing from "../components/store/CrownfallListing";
import ProductCard from "../components/store/ProductCard";
import Lightbox from "../components/store/Lightbox";
import { editionForItem, partitionCatalog } from "../data/crownfallEditions";
import { EVENTS, track } from "../lib/analytics.js";
import { getUserMessage } from "../lib/errors.js";

const StorePage = () => {
  const { addItem } = useCart();
  const { getProducts } = useSquare();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const fetchedProducts = await getProducts();
        if (isMounted) {
          setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(getUserMessage(fetchError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [getProducts]);

  const onAddToCart = (product) => {
    addItem({
      id: product.id,
      variationId: product.variationId,
      name: product.title,
      title: product.title,
      price: product.price,
      image: product.featureImage,
    });
    const edition = editionForItem(product.id);
    track(EVENTS.ADD_TO_CART, {
      item_id: product.id,
      format: edition?.format ?? null,
      signed: edition ? edition.signing === "signed" : null,
      quantity: 1,
    });
  };

  const closeLightbox = useCallback(() => setLightboxImage(null), []);

  const { editions, gridProducts, hasCrownfall } = useMemo(
    () => partitionCatalog(products),
    [products],
  );

  const ready = !isLoading && !error && products.length > 0;

  return (
    <>
      <PageIntro
        background={BACKGROUNDS.skyline}
        title="Book"
        accent="Store"
        lede="Explore and purchase my latest works and exclusive merchandise right here."
      />

      <Section spacing="none" className="pt-10 pb-12 lg:pt-14 lg:pb-26">
        <ShippingNotice />

        <div className="mt-12 lg:mt-20">
          {isLoading && (
            <p className="text-center text-lede text-muted">
              Loading products...
            </p>
          )}

          {!isLoading && error && (
            <p role="alert" className="text-center text-lede text-error">
              {error}
            </p>
          )}

          {!isLoading && !error && products.length === 0 && (
            <p className="text-center text-lede text-muted">
              No products are currently available.
            </p>
          )}

          {ready && hasCrownfall && (
            <CrownfallListing
              editions={editions}
              onAddToCart={onAddToCart}
              onEnlarge={setLightboxImage}
            />
          )}
        </div>
      </Section>

      {ready && gridProducts.length > 0 && (
        <Section band>
          <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {gridProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onEnlarge={setLightboxImage}
              />
            ))}
          </div>
        </Section>
      )}

      <Lightbox image={lightboxImage} onClose={closeLightbox} />
    </>
  );
};

export default StorePage;
