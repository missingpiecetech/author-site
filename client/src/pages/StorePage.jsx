import { useEffect, useState } from "react";
import useCart from "../hooks/useCart";
import useSquare from "../hooks/useSquare";

const StorePage = () => {
  const { addItem } = useCart();
  const { getProducts } = useSquare();
  const [products, setProducts] = useState([]);
  const [activeImageByProduct, setActiveImageByProduct] = useState({});
  const [imageLoadingByProduct, setImageLoadingByProduct] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError(fetchError.message || "Unable to load store products.");
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
  };

  const getProductImages = (product) => {
    const allImages = [product.featureImage, ...(product.images || [])].filter(
      Boolean,
    );
    return [...new Set(allImages)];
  };

  const goToPreviousImage = (productId, imageCount) => {
    setImageLoadingByProduct((current) => ({
      ...current,
      [productId]: true,
    }));

    setActiveImageByProduct((current) => {
      const previousIndex = current[productId] || 0;
      const nextIndex = (previousIndex - 1 + imageCount) % imageCount;
      return {
        ...current,
        [productId]: nextIndex,
      };
    });
  };

  const goToNextImage = (productId, imageCount) => {
    setImageLoadingByProduct((current) => ({
      ...current,
      [productId]: true,
    }));

    setActiveImageByProduct((current) => {
      const previousIndex = current[productId] || 0;
      const nextIndex = (previousIndex + 1) % imageCount;
      return {
        ...current,
        [productId]: nextIndex,
      };
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="mt-24 relative py-32 bg-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-22 left-13 w-24 h-24 bg-secondary/10 rounded-full"></div>
            <div className="absolute top-41 right-22 w-32 h-32 bg-secondary/5 rounded-full"></div>
            <div className="absolute bottom-28 left-1/4 w-28 h-28 bg-secondary/8 rounded-full"></div>
          </div>
          <div className="relative w-full text-center">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-tight mb-6">
              Book <span className="text-secondary">Store</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore and purchase my latest works and exclusive merchandise
              right here.
            </p>
          </div>
        </div>

        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {isLoading && (
              <p className="text-center text-gray-600">Loading products...</p>
            )}

            {!isLoading && error && (
              <p className="text-center text-red-600">{error}</p>
            )}

            {!isLoading && !error && products.length === 0 && (
              <p className="text-center text-gray-600">
                No products are currently available.
              </p>
            )}

            {!isLoading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const productImages = getProductImages(product);
                  const activeImageIndex =
                    activeImageByProduct[product.id] || 0;
                  const activeImage = productImages[activeImageIndex] || null;
                  const hasMultipleImages = productImages.length > 1;
                  const isImageLoading =
                    imageLoadingByProduct[product.id] === true;

                  return (
                    <article
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        {activeImage ? (
                          <img
                            src={activeImage}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onLoad={() =>
                              setImageLoadingByProduct((current) => ({
                                ...current,
                                [product.id]: false,
                              }))
                            }
                            onError={() =>
                              setImageLoadingByProduct((current) => ({
                                ...current,
                                [product.id]: false,
                              }))
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}

                        {isImageLoading && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-secondary/40 border-t-secondary rounded-full animate-spin"></div>
                          </div>
                        )}

                        {hasMultipleImages && (
                          <>
                            <button
                              type="button"
                              aria-label={`Previous image for ${product.title}`}
                              onClick={() =>
                                goToPreviousImage(
                                  product.id,
                                  productImages.length,
                                )
                              }
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-gray-900 border border-gray-200 hover:bg-white transition-colors"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              aria-label={`Next image for ${product.title}`}
                              onClick={() =>
                                goToNextImage(product.id, productImages.length)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-gray-900 border border-gray-200 hover:bg-white transition-colors"
                            >
                              →
                            </button>
                          </>
                        )}
                      </div>
                      <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {product.title}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 min-h-10">
                          {product.shortDescription ||
                            "No description available."}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddToCart(product)}
                            className="inline-block bg-secondary text-white px-4 py-2 rounded-full font-semibold hover:bg-secondary-dark transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StorePage;
