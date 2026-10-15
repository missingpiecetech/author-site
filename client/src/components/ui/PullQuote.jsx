/**
 * Large italic quote with an uppercase attribution under it. Place it inside
 * `<Section band>` for the quote band; separate several quotes with a
 * `FiligreeDivider` between them.
 *
 * - `quote`: the quote text, without quotation marks (they are added).
 * - `name`, `credit`: attribution, rendered "Name · Credit".
 */
const PullQuote = ({ quote, name, credit, className = "" }) => (
  <figure
    className={`mx-auto flex max-w-4xl flex-col items-center gap-3 text-center lg:gap-4.5 ${className}`}
  >
    <blockquote className="font-display text-quote italic font-medium text-cream">
      <p>&ldquo;{quote}&rdquo;</p>
    </blockquote>
    {(name || credit) && (
      <figcaption className="text-eyebrow uppercase tracking-[0.18em] text-subtle">
        {[name, credit].filter(Boolean).join(" · ")}
      </figcaption>
    )}
  </figure>
);

export default PullQuote;
