import { useState } from "react";
import { createPortal } from "react-dom";
import useCart from "../hooks/useCart";
import useSquare from "../hooks/useSquare";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "./ui/Button";
import { EVENTS, track } from "../lib/analytics.js";
import { getUserMessage } from "../lib/errors.js";

// Shopping-bag outline from the mockup header.
export const CartIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    className={className}
  >
    <path d="M5 7h14l-1.5 12h-11z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);

const ShoppingCart = () => {
  const {
    cartItems,
    totalItems,
    updateQuantity,
    isCartOpen: open,
    setCartOpen: setOpen,
  } = useCart();
  const { createCheckoutLink } = useSquare();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const changeQuantity = (item, quantity) => {
    updateQuantity(item.id, quantity);
    track(EVENTS.CART_QUANTITY_CHANGED, {
      item_id: item.id,
      quantity: Math.max(quantity, 0),
      placement: "cart",
    });
  };

  const toggleCart = () => {
    setOpen(!open);
    if (!open) {
      track(EVENTS.CART_OPENED, {
        placement: "header",
        item_count: totalItems(),
      });
    }
  };

  const onCheckout = async () => {
    if (!cartItems.length || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const checkoutUrl = await createCheckoutLink(cartItems);
      track(EVENTS.CHECKOUT_STARTED, {
        item_count: totalItems(),
        subtotal_cents: cartItems.reduce(
          (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
          0,
        ),
      });
      window.location.href = checkoutUrl;
    } catch (error) {
      track(EVENTS.CHECKOUT_ERROR, {
        reason: error.cause instanceof TypeError ? "network" : "server",
      });
      setCheckoutError(getUserMessage(error));
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
              className="fixed inset-0 z-40 bg-black/60 md:bg-transparent"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Cart panel — full-screen on mobile, dropdown on desktop */}
          <div
            data-testid="cart-panel"
            data-state={open ? "open" : "closed"}
            className={`fixed z-50 bg-well text-cream transition-all duration-150 ease-out motion-reduce:transition-none
              inset-0 flex flex-col
              md:inset-auto md:top-[var(--header-h)] md:right-0 md:w-96 md:max-w-full md:max-h-[calc(100dvh-var(--header-h))] md:border-l md:border-b md:border-rule md:shadow-cover md:origin-top-right ${
                open
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-y-full md:-translate-y-1 md:scale-[0.985] pointer-events-none"
              }`}
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-3xl text-cream">Shopping cart</h2>
              <button
                type="button"
                data-testid="cart-close"
                onClick={() => setOpen(false)}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-btn border border-outline text-cream hover:border-accent transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <p className="text-muted">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="mb-5 border-t border-rule">
                    {cartItems.map((item) => (
                      <li
                        key={item.id}
                        data-testid="cart-item"
                        data-product-id={item.id}
                        className="flex items-start gap-4 border-b border-rule py-4"
                      >
                        <div className="w-14 h-14 overflow-hidden border border-edge bg-surface flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-subtle">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-display text-lg font-semibold leading-6 text-cream truncate">
                              {item.name}
                            </p>
                            <span className="text-base text-muted whitespace-nowrap">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-3 text-sm text-muted">
                            <div className="flex items-center gap-2">
                              <button
                                data-testid="qty-decrease"
                                onClick={() =>
                                  changeQuantity(item, item.quantity - 1)
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-btn border border-outline text-cream transition-colors hover:border-accent"
                                aria-label={`Remove ${item.name} from cart`}
                              >
                                {item.quantity === 1 ? (
                                  <span className="flex items-center justify-center w-full h-full">
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      className="text-subtle"
                                      size="xs"
                                    />
                                  </span>
                                ) : (
                                  "−"
                                )}
                              </button>

                              <span
                                data-testid="qty-value"
                                className="w-6 text-center text-cream"
                              >
                                {item.quantity}
                              </span>
                              <button
                                data-testid="qty-increase"
                                onClick={() =>
                                  changeQuantity(item, item.quantity + 1)
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-btn border border-outline text-cream transition-colors hover:border-accent"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center text-lg text-cream">
                    <span>Subtotal:</span>
                    <span data-testid="cart-subtotal">${total.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex justify-between items-center text-subtle text-sm">
                    <span>Tax/Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  {checkoutError && (
                    <p
                      data-testid="checkout-error"
                      className="mt-3 text-sm text-error"
                    >
                      {checkoutError}
                    </p>
                  )}
                  <Button
                    data-testid="checkout-button"
                    onClick={onCheckout}
                    disabled={isCheckingOut}
                    block
                    className="mt-6"
                  >
                    {isCheckingOut ? "Redirecting..." : "Checkout"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </>,
        document.body,
      )}
      <button
        data-testid="cart-toggle"
        onClick={toggleCart}
        className={`hidden md:inline-flex relative h-11 w-11 rounded-btn border transition-colors duration-150 cursor-pointer items-center justify-center ${
          open
            ? "bg-accent text-ground border-accent"
            : "bg-transparent text-cream border-outline hover:border-accent"
        }`}
        aria-label="Open shopping cart"
      >
        <CartIcon className="h-5 w-5" />
        {cartItems.length > 0 && (
          <span
            data-testid="cart-count"
            className="absolute -top-2 -right-2 min-w-5 rounded-full border border-ground bg-accent px-1.5 py-0.5 text-center text-xs leading-none font-medium text-ground"
          >
            {totalItems()}
          </span>
        )}
      </button>
    </>
  );
};

export default ShoppingCart;
