import ProductGallery from "./ProductGallery";
import CartControls from "./CartControls";

/** One product in the store grid: carousel, name and price, description, cart controls. */
const ProductCard = ({ product, onAddToCart, onEnlarge }) => (
  <article
    data-testid="store-product"
    data-product-id={product.id}
    className="flex min-w-0 flex-col gap-4"
  >
    <ProductGallery product={product} onEnlarge={onEnlarge} />
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="min-w-0 text-[1.5625rem] leading-tight text-cream">
        {product.title}
      </h2>
      <span className="shrink-0 text-lg text-muted">
        ${product.price.toFixed(2)}
      </span>
    </div>
    <div
      className="prose-square flex-1 text-base"
      dangerouslySetInnerHTML={{
        __html: product.description || "<em>No description available.</em>",
      }}
    />
    <CartControls
      product={product}
      onAdd={onAddToCart}
      variant="secondary"
      size="md"
      block
    />
  </article>
);

export default ProductCard;
