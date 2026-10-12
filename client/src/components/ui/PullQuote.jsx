import { FiligreeDivider } from "./Filigree";

/**
 * Large italic quote with an uppercase attribution. Place it inside
 * `<Section band>` for the quote band.
 *
 * - `quote`: the quote text, without quotation marks (they are added).
 * - `name`, `credit`: attribution, rendered "Name · Credit", under a filigree
 *   flourish.
 */
const PullQuote = ({ quote, name, credit, className = "" }) => (
  <figure
    className={`mx-auto flex max-w-4xl flex-col items-center gap-3 text-center lg:gap-4.5 ${className}`}
  >
    <blockquote className="font-display text-quote italic font-medium text-cream">
      <p>&ldquo;{quote}&rdquo;</p>
    </blockquote>
    <FiligreeDivider className="max-w-xs text-accent" />
    {(name || credit) && (
      <figcaption className="text-eyebrow uppercase tracking-[0.18em] text-subtle">
        {[name, credit].filter(Boolean).join(" · ")}
      </figcaption>
    )}
  </figure>
);

export default PullQuote;
