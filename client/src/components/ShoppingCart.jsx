import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import useCart from "../hooks/useCart";
import useSquare from "../hooks/useSquare";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const ShoppingCart = () => {
  const { cartItems, totalItems, removeItem, updateQuantity } = useCart();
  const { createCheckoutLink } = useSquare();
  const [open, setOpen] = useState(false);
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
      <div
        className={`fixed top-25 right-4 z-50 w-[22rem] sm:w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-2xl origin-top-right transition-all duration-150 ease-out ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-1 scale-[0.985] pointer-events-none"
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Shopping Cart</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white  flex-shrink-0">
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
                        {item.quantity === 1 ? (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-gray-600"
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            −
                          </button>
                        )}
                        <span className="w-6 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
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
            <div className="flex justify-between items-center font-semibold mb-4 text-gray-900">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {checkoutError && (
              <p className="text-sm text-red-600 mb-3">{checkoutError}</p>
            )}
            <button
              onClick={onCheckout}
              disabled={isCheckingOut}
              className="w-full bg-secondary text-white py-2.5 rounded-full hover:bg-secondary-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
            >
              {isCheckingOut ? "Redirecting..." : "Checkout"}
            </button>
          </>
        )}
      </div>
      <button
        onClick={() => setOpen(!open)}
        className={`relative rounded-full p-3.5 border transition-all duration-150 cursor-pointer flex items-center justify-center shadow-lg ${
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
