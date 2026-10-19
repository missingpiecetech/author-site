import Button from "./ui/Button";
import { BOOKS } from "../BOOK_DATA";
import { EVENTS, track } from "../lib/analytics.js";

const CROWNFALL = BOOKS.find((book) => book.slug === "crownfall");

/**
 * The buy row: "Buy direct" (our store), "Buy on Amazon" and a Goodreads link.
 * Amazon is prominent because international readers can only buy there.
 *
 * - `retailers`: `{ amazon, goodreads }`; defaults to Crownfall's.
 * - `compact`: 48px buttons instead of 54px.
 * - `align`: "start" (default) | "center".
 * - `directLabel`: the store button's label (default "Buy direct").
 * - `placement`: where the row sits, sent with retailer_click ("home_hero",
 *   "books", "excerpt_chapter_<n>").
 * - `onRetailerClick(retailer)`: called after a click is tracked, with
 *   "direct", "amazon" or "goodreads".
 */
const RetailerLinks = ({
  placement,
  onRetailerClick,
  retailers = CROWNFALL?.retailers ?? {},
  compact = false,
  align = "start",
  directLabel = "Buy direct",
  className = "",
}) => {
  const size = compact ? "md" : "lg";
  const handleClick = (retailer) => () => {
    track(EVENTS.RETAILER_CLICK, { retailer, placement });
    onRetailerClick?.(retailer);
  };
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-4 ${centered ? "items-center" : "items-stretch sm:items-start"} ${className}`}
    >
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5 ${centered ? "w-full sm:w-auto sm:justify-center" : ""}`}
      >
        <Button to="/store" size={size} onClick={handleClick("direct")}>
          {directLabel}
        </Button>
        {retailers.amazon && (
          <Button
            href={retailers.amazon}
            variant="secondary"
            size={size}
            onClick={handleClick("amazon")}
          >
            Buy on Amazon
          </Button>
        )}
      </div>
      {retailers.goodreads && (
        <a
          href={retailers.goodreads}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick("goodreads")}
          className={`text-accent transition-colors hover:text-accent-hover ${compact ? "text-[0.9375rem]" : "text-base"} ${centered ? "" : "self-center sm:self-start"}`}
        >
          Add it on Goodreads →
        </a>
      )}
    </div>
  );
};

export default RetailerLinks;
