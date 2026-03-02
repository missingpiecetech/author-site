import { useState } from "react";
import { createPortal } from "react-dom";
import { FaShoppingCart } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useSquare from "../hooks/useSquare";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

const ShoppingCart = () => {
  const { cartItems, totalItems, removeItem, updateQuantity, isCartOpen: open, setCartOpen: setOpen } = useCart();
  const { createCheckoutLink } = useSquare();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const onCheckout = async () => {
    if (!cartItems.length || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const checkoutUrl = await createCheckoutLink(cartItems);
      window.location.href = checkoutUrl;
    } catch (error) {
      setCheckoutError(error.message || "Unable to start checkout.");
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {createPortal(
        <>
          {/* Backdrop overlay — closes cart on tap */}
          {open && (
            <div
              className="fixed inset-0 z-40 bg-black/20 md:bg-transparent"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Cart panel — full-screen on mobile, dropdown on desktop */}
          <div
            className={`fixed z-50 bg-white transition-all duration-150 ease-out
              inset-0 flex flex-col
              md:inset-auto md:top-25 md:right-4 md:w-96 md:max-w-[calc(100vw-2rem)] md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 md:origin-top-right ${
              open
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-full md:-translate-y-1 md:scale-[0.985] pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-xl"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-gray-900 text-sm font-semibold leading-5 truncate">
                              {item.name}
                            </p>
                            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors h-6 w-6"
                                aria-label={`Remove ${item.name} from cart`}
                              >
                                {item.quantity === 1 ? (
                                  <span className="flex items-center justify-center w-full h-full">
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      className="text-gray-600"
                                      size="xs"
                                    />
                                  </span>
                                ) : (
                                  "−"
                                )}
                              </button>

                              <span className="w-6 text-center font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors h-6 w-6 font-bold"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center font-semibold text-gray-900">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>Tax/Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  {checkoutError && (
                    <p className="text-sm text-red-600 mb-3">{checkoutError}</p>
                  )}
                  <button
                    onClick={onCheckout}
                    disabled={isCheckingOut}
                    className="w-full mt-4 bg-secondary text-white py-2.5 rounded-full hover:bg-secondary-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                  >
                    {isCheckingOut ? "Redirecting..." : "Checkout"}
                  </button>
                </>
              )}
            </div>
          </div>
        </>,
        document.body,
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`hidden md:flex relative rounded-full p-3.5 border transition-all duration-150 cursor-pointer items-center justify-center shadow-lg ${
          open
            ? "bg-secondary text-white border-secondary"
            : "bg-white text-secondary border-secondary/30 hover:border-secondary/60"
        }`}
        aria-label="Open shopping cart"
      >
        <FaShoppingCart className="text-2xl" />
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-secondary-dark text-white text-xs font-bold rounded-full px-2 py-0.5 border border-white">
            {totalItems()}
          </span>
        )}
      </button>
    </>
  );
};

export default ShoppingCart;
