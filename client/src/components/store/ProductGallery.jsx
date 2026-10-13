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

// Previous/next appear on hover or keyboard focus where the device can hover
// (Tailwind's group-hover only applies there); touch screens without hover
// always show them.
const ARROW = `${CONTROL} top-1/2 -translate-y-1/2 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100`;

// Alpha above which a pixel counts as part of the picture, and the size of
// the copy scanned for it.
const ALPHA_MIN = 16;
const SCAN_SIZE = 256;

/**
 * The opaque part of an image with transparent margins (a book mockup on a
 * wide transparent canvas), as fractions of its size plus its aspect ratio;
 * null when nothing around the picture is transparent, or the image cannot be
 * read (no CORS).
 */
const opaqueCrop = (img) => {
  const scale = Math.min(
    1,
    SCAN_SIZE / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(img, 0, 0, width, height);
  let data;
  try {
    ({ data } = context.getImageData(0, 0, width, height));
  } catch {
    return null;
  }
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_MIN) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < 0) return null;
  if (left === 0 && top === 0 && right === width - 1 && bottom === height - 1) {
    return null;
  }
  const crop = {
    left: left / width,
    top: top / height,
    width: (right + 1 - left) / width,
    height: (bottom + 1 - top) / height,
  };
  crop.ratio =
    (crop.width * img.naturalWidth) / (crop.height * img.naturalHeight);
  return crop;
};

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
 * - `aspect`: "cover" (2:3) | "photo" (4:3). Images are contained, not cropped,
 *   except that transparent margins are trimmed so the picture itself fills
 *   the pane (the store's book mockups sit on wide transparent canvases).
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
  // Per image URL: its opaque crop (or null), and whether it refused CORS.
  const [crops, setCrops] = useState({});
  const [noCors, setNoCors] = useState({});

  const shown = images.length > 0 ? images : [fallbackImage].filter(Boolean);
  const activeImage = shown[index] || null;
  const hasMultipleImages = shown.length > 1;

  const step = (delta) => {
    setIsLoading(true);
    setIndex((current) => (current + delta + shown.length) % shown.length);
  };

  const crop = activeImage ? crops[activeImage] : null;

  const done = () => setIsLoading(false);

  const handleLoad = (event) => {
    if (!(activeImage in crops)) {
      const found = opaqueCrop(event.currentTarget);
      setCrops((current) => ({ ...current, [activeImage]: found }));
    }
    done();
  };

  // Reading pixels needs CORS; an image host without it gets a plain retry.
  const handleError = () => {
    if (!noCors[activeImage]) {
      setNoCors((current) => ({ ...current, [activeImage]: true }));
      return;
    }
    done();
  };

  return (
    <div
      className={
        framed
          ? `relative ${FRAME_BORDER} border-accent p-3 shadow-cover lg:p-4.5`
          : "border border-edge"
      }
    >
      <div
        className={`group relative overflow-hidden bg-surface [container-type:size] ${ASPECTS[aspect] ?? ASPECTS.photo}`}
      >
        {activeImage ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* The crop box: the opaque part's aspect, contained in the pane. */}
            <div
              className="relative h-full w-full overflow-hidden"
              style={
                crop
                  ? {
                      width: `min(100cqw, 100cqh * ${crop.ratio})`,
                      height: "auto",
                      aspectRatio: crop.ratio,
                    }
                  : undefined
              }
            >
              <img
                key={`${activeImage}${noCors[activeImage] ? " plain" : ""}`}
                src={activeImage}
                alt={product.title}
                loading={loading}
                crossOrigin={noCors[activeImage] ? undefined : "anonymous"}
                className={
                  crop
                    ? "absolute max-w-none"
                    : "block h-full w-full object-contain"
                }
                style={
                  crop
                    ? {
                        width: `${100 / crop.width}%`,
                        height: `${100 / crop.height}%`,
                        left: `${(-100 * crop.left) / crop.width}%`,
                        top: `${(-100 * crop.top) / crop.height}%`,
                      }
                    : undefined
                }
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          </div>
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
              className={`${ARROW} left-3`}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              type="button"
              aria-label={`Next image for ${product.title}`}
              onClick={() => step(1)}
              className={`${ARROW} right-3`}
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
      {framed && <FiligreeCorners />}
    </div>
  );
};

export default ProductGallery;
