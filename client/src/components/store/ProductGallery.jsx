import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchPlus,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FiligreeCorners } from "../ui/Filigree";
import { FRAME_BORDER } from "../ui/filigree/index.js";

const ASPECTS = {
  cover: "aspect-[2/3]",
  photo: "aspect-[4/3]",
};

const CONTROL =
  "absolute flex h-10 w-10 items-center justify-center rounded-btn border border-outline bg-ground/85 text-cream transition-colors hover:border-accent hover:text-accent-hover cursor-pointer";

/** The product's feature image first, then the rest, without duplicates. */
const productImages = (product) => [
  ...new Set([product.featureImage, ...(product.images || [])].filter(Boolean)),
];

/**
 * Image carousel for one store product: previous/next when it has several
 * images, an enlarge button that hands the current image to `onEnlarge`, and a
 * spinner while a newly selected image loads. Key it by product id so the
 * carousel starts over when the product changes.
 *
 * - `framed`: the gold frame with inset and cover shadow (featured listing);
 *   otherwise a plain `edge` border (grid cards).
 * - `aspect`: "cover" (2:3) | "photo" (4:3). Images are contained, not cropped.
 * - `fallbackImage`: shown when the product has no images of its own.
 */
const ProductGallery = ({
  product,
  framed = false,
  aspect = "photo",
  fallbackImage = null,
  loading = "lazy",
  onEnlarge,
}) => {
  const images = productImages(product);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const shown = images.length > 0 ? images : [fallbackImage].filter(Boolean);
  const activeImage = shown[index] || null;
  const hasMultipleImages = shown.length > 1;

  const step = (delta) => {
    setIsLoading(true);
    setIndex((current) => (current + delta + shown.length) % shown.length);
  };

  const done = () => setIsLoading(false);

  return (
    <div
      className={
        framed
          ? `relative ${FRAME_BORDER} border-accent p-3 shadow-cover lg:p-4.5`
          : "border border-edge"
      }
    >
      <div
        className={`relative overflow-hidden bg-surface ${ASPECTS[aspect] ?? ASPECTS.photo}`}
      >
        {activeImage ? (
          <img
            src={activeImage}
            alt={product.title}
            loading={loading}
            className="block h-full w-full object-contain"
            onLoad={done}
            onError={done}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-base text-subtle">
            No image
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ground/60">
            <div className="h-8 w-8 rounded-full border-2 border-accent/40 border-t-accent motion-safe:animate-spin" />
          </div>
        )}

        {hasMultipleImages && (
          <>
            <button
              type="button"
              aria-label={`Previous image for ${product.title}`}
              onClick={() => step(-1)}
              className={`${CONTROL} left-3 top-1/2 -translate-y-1/2`}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              type="button"
              aria-label={`Next image for ${product.title}`}
              onClick={() => step(1)}
              className={`${CONTROL} right-3 top-1/2 -translate-y-1/2`}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        )}

        {activeImage && (
          <button
            type="button"
            onClick={() => onEnlarge?.(activeImage)}
            className={`${CONTROL} bottom-3 right-3`}
            aria-label="Enlarge image"
          >
            <FontAwesomeIcon icon={faSearchPlus} className="text-sm" />
          </button>
        )}
      </div>
      {framed && <FiligreeCorners size="lg" />}
    </div>
  );
};

export default ProductGallery;
