import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import useCart from "../hooks/useCart";

const ShoppingCart = () => {
  const { cartItems, totalItems, removeItem } = useCart();
  const [open, setOpen] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const onCheckout = () => {
    alert("Checkout clicked!");
  };

  return (
    <>
      {open && (
        <div className="fixed top-25 right-4 z-50 w-80 bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between cartItems-center"
                  >
                    <span className="text-gray-700">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 mr-2 text-xs border border-red-200 rounded px-2 py-0.5"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        X
                      </button>
                      {item.name}{" "}
                      <span className="text-xs text-gray-500">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between cartItems-center font-semibold mb-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer"
              >
                Checkout
              </button>
            </>
          )}
        </div>
      )}{" "}
      <button
        onClick={() => setOpen(!open)}
        className="relative bg-white shadow-lg rounded-full p-3 border border-gray-200 flex cartItems-center justify-center cursor-pointer"
        aria-label="Open shopping cart"
      >
        <FaShoppingCart className="text-2xl text-blue-600" />
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
            {totalItems()}
          </span>
        )}
      </button>
    </>
  );
};

export default ShoppingCart;
