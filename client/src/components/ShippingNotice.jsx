import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import SITE_INFO from "../SITE_INFO";
import { BOOKS } from "../BOOK_DATA";
import { FiligreeCorners } from "./ui/Filigree";
import { FRAME_BORDER } from "./ui/filigree/index.js";

const AMAZON = BOOKS.find((book) => book.slug === "crownfall")?.retailers
  ?.amazon;

/**
 * The prominent US-only shipping warning shown above the store's products.
 * Renders only while SITE_INFO.shipping.usOnly is true; "Amazon" links to
 * Crownfall's Amazon listing.
 */
const ShippingNotice = ({ className = "" }) => {
  if (!SITE_INFO.shipping.usOnly) return null;

  return (
    <div
      role="note"
      className={`relative flex min-h-46 items-center gap-4 ${FRAME_BORDER} border-accent bg-well p-5 text-lede text-cream lg:p-6 ${className}`}
    >
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="shrink-0 text-accent"
        aria-hidden="true"
      />
      <p>
        <strong className="font-medium">Note:</strong> Products are currently
        only available for shipping within the USA. Available globally on{" "}
        {AMAZON ? (
          <a
            href={AMAZON}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
          >
            Amazon
          </a>
        ) : (
          "Amazon"
        )}
        .
      </p>
      <FiligreeCorners />
    </div>
  );
};

export default ShippingNotice;
