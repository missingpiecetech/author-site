import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import SITE_INFO from "../SITE_INFO";
import { BOOKS } from "../BOOK_DATA";

const AMAZON = BOOKS.find((book) => book.slug === "crownfall")?.retailers
  ?.amazon;

/**
 * The prominent US-only shipping warning shown above the store's products.
 * Renders only while SITE_INFO.shipping.usOnly is true. Wording is the site's
 * existing notice, unchanged.
 */
const ShippingNotice = ({ className = "" }) => {
  if (!SITE_INFO.shipping.usOnly) return null;

  return (
    <div
      role="note"
      className={`flex items-start gap-4 border border-accent bg-well p-5 text-lede text-cream lg:p-6 ${className}`}
    >
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="mt-1.5 shrink-0 text-accent"
        aria-hidden="true"
      />
      <p>
        <strong className="font-medium">Note:</strong> Products are currently
        only available for shipping within the USA. International availability
        coming soon{" "}
        {AMAZON ? (
          <a
            href={AMAZON}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
          >
            via Amazon
          </a>
        ) : (
          "via Amazon"
        )}
        .
      </p>
    </div>
  );
};

export default ShippingNotice;
