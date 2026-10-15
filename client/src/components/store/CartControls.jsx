import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import useCart from "../../hooks/useCart";
import Button from "../ui/Button";

const STEP =
  "flex h-11 w-11 items-center justify-center rounded-btn border text-lg transition-colors cursor-pointer";

/**
 * "Add to cart" until the product is in the cart, then a quantity stepper
 * bound to that product's cart line plus a shortcut to the cart. The stepper
 * always reads the cart, so it shows whatever quantity this exact product has.
 *
 * - `onAdd`: called with `product`; the page builds the cart payload.
 * - `variant` / `size` / `block`: passed to the add button.
 */
const CartControls = ({
  product,
  onAdd,
  variant = "primary",
  size = "lg",
  block = false,
}) => {
  const { cartItems, updateQuantity, setCartOpen } = useCart();
  const quantity =
    cartItems.find((item) => item.id === product.id)?.quantity || 0;

  if (quantity === 0) {
    return (
      <Button
        data-testid="add-to-cart"
        variant={variant}
        size={size}
        block={block}
        onClick={() => onAdd(product)}
      >
        Add to cart
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        data-testid="qty-decrease"
        onClick={() => updateQuantity(product.id, quantity - 1)}
        className={`${STEP} border-outline text-cream hover:border-accent hover:text-accent-hover`}
        aria-label={`Decrease quantity of ${product.title}`}
      >
        −
      </button>
      <span
        data-testid="qty-value"
        className="w-8 text-center text-lg font-medium text-cream"
      >
        {quantity}
      </span>
      <button
        type="button"
        data-testid="qty-increase"
        onClick={() => updateQuantity(product.id, quantity + 1)}
        className={`${STEP} border-accent bg-accent text-ground hover:border-accent-hover hover:bg-accent-hover`}
        aria-label={`Increase quantity of ${product.title}`}
      >
        +
      </button>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={`${STEP} ml-1 border-outline text-accent hover:border-accent hover:text-accent-hover`}
        aria-label="Go to cart"
        title="Go to cart"
      >
        <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
      </button>
    </div>
  );
};

export default CartControls;
