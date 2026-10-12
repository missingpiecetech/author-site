import { useState } from "react";

/**
 * One early-praise line for a book, picked at random once per mount (the page
 * has always shown a single random quote). Inline, left-ruled in gold, so it
 * keeps its place between the blurb and the buy row.
 */
const BookPraise = ({ praise }) => {
  const [quote] = useState(
    () => praise[Math.floor(Math.random() * praise.length)],
  );
  if (!quote) return null;

  return (
    <figure className="flex flex-col gap-3 border-l border-accent pl-6 lg:pl-8">
      <blockquote className="font-display text-hook italic font-medium text-cream">
        <p>&ldquo;{quote.text}&rdquo;</p>
      </blockquote>
      <figcaption className="text-eyebrow uppercase tracking-[0.18em] text-subtle">
        {[quote.name, quote.credit].filter(Boolean).join(" · ")}
      </figcaption>
    </figure>
  );
};

export default BookPraise;
