import { useEffect, useState } from "react";
import useCart from "../hooks/useCart";
import useSquare from "../hooks/useSquare";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchPlus,
  faChevronRight,
  faChevronLeft,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

const StorePage = () => {
  const { cartItems, addItem, updateQuantity, setCartOpen } = useCart();
  const { getProducts } = useSquare();
  const [products, setProducts] = useState([]);
  const [activeImageByProduct, setActiveImageByProduct] = useState({});
  const [imageLoadingByProduct, setImageLoadingByProduct] = useState({});
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

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item.id === productId);
    return cartItem?.quantity || 0;
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
        <div className="pt-24 relative py-8 bg-white overflow-visible">
          <div className="absolute inset-0 overflow-visible">
            <div className="absolute top-32 left-13 w-24 h-24 bg-secondary/10 rounded-full"></div>
            <div className="absolute top-41 right-22 w-32 h-32 bg-secondary/5 rounded-full"></div>
            <div className="absolute top-5 left-1/4 w-28 h-28 bg-secondary/8 rounded-full"></div>
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
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 group relative flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative group overflow-hidden ">
                        {activeImage ? (
                          <img
                            src={activeImage}
                            alt={product.title}
                            className="w-full h-full object-contain"
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
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-gray-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Next image for ${product.title}`}
                              onClick={() =>
                                goToNextImage(product.id, productImages.length)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-gray-600  hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setLightboxImage(activeImage)}
                          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all text-gray-600 bg-white/90 rounded-full h-8 w-8 flex items-center justify-center hover:bg-white cursor-pointer"
                          aria-label="Enlarge image"
                        >
                          <FontAwesomeIcon
                            icon={faSearchPlus}
                            className="text-sm"
                          />
                        </button>
                      </div>
                      <div className="p-6 text-left flex flex-col flex-1">
                        <div className="flex-1">
                          <div>
                            <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-medium tracking-wide uppercase mb-2">
                              Preorder
                            </span>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                              {product.title}
                            </h2>
                            <p
                              className="text-gray-600 text-sm mb-4 min-h-10"
                              dangerouslySetInnerHTML={{
                                __html: product.description
                                  ? product.description
                                  : "<em>No description available.</em>",
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {getCartQuantity(product.id) > 0 ? (
                            <div className="flex items-center gap-2 py-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    getCartQuantity(product.id) - 1,
                                  )
                                }
                                className="w-8 h-8 rounded-full bg-white text-secondary border border-secondary/25 hover:border-secondary/50 font-bold transition-colors"
                                aria-label={`Decrease quantity of ${product.title}`}
                              >
                                −
                              </button>
                              <span className="w-6 text-center font-semibold text-secondary-dark">
                                {getCartQuantity(product.id)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    getCartQuantity(product.id) + 1,
                                  )
                                }
                                className="w-8 h-8 rounded-full bg-secondary text-white hover:bg-secondary-dark font-bold transition-colors"
                                aria-label={`Increase quantity of ${product.title}`}
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => setCartOpen(true)}
                                className="ml-1 w-8 h-8 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors flex items-center justify-center"
                                aria-label="Go to cart"
                                title="Go to Cart"
                              >
                                <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onAddToCart(product)}
                              className="inline-block bg-secondary text-white px-4 py-2 rounded-full font-semibold hover:bg-secondary-dark transition-colors"
                            >
                              Add to Cart
                            </button>
                          )}
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

      {lightboxImage && (
        <div
          className="fixed inset-0  bg-black/50 flex items-center justify-center z-50"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </>
  );
};

export default StorePage;
