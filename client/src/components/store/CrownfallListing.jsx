import { useState } from "react";
import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import ProductGallery from "./ProductGallery";
import CartControls from "./CartControls";
import { BOOKS } from "../../BOOK_DATA";
import {
  FORMATS,
  SIGNINGS,
  defaultSelection,
  editionKey,
  isOptionAvailable,
  selectOption,
} from "../../data/crownfallEditions";
import { EVENTS, track } from "../../lib/analytics.js";

const CROWNFALL = BOOKS.find((book) => book.slug === "crownfall");

const ToggleGroup = ({ label, axis, options, editions, selection, onPick }) => (
  <div className="flex flex-col gap-2.5">
    <span id={`edition-${axis}-label`} className="text-base text-muted">
      {label}
    </span>
    <div
      role="group"
      aria-labelledby={`edition-${axis}-label`}
      className="flex flex-wrap gap-3"
    >
      {options.map((option) => {
        const testId =
          axis === "format"
            ? `edition-format-${option.id}`
            : `edition-${option.id}`;
        return (
          <Button
            key={option.id}
            variant="pill"
            size="md"
            data-testid={testId}
            pressed={selection[axis] === option.id}
            disabled={!isOptionAvailable(editions, axis, option.id)}
            onClick={() => onPick(axis, option.id)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  </div>
);

/**
 * The single Crownfall listing. `editions` comes from `partitionCatalog`: one
 * catalog product (or null) per format × signing combination. The pills pick
 * the combination, and the title, price, images, description and cart controls
 * all follow the selected catalog item. Each edition is its own Square item, so
 * the stepper shows the selected edition's own cart quantity.
 */
const CrownfallListing = ({ editions, onAddToCart, onEnlarge }) => {
  const [selection, setSelection] = useState(() => defaultSelection(editions));
  const product = selection && editions[editionKey(selection)];
  if (!product) return null;

  const pick = (axis, value) => {
    const next = selectOption(editions, selection, axis, value);
    if (next === selection) return;
    setSelection(next);
    track(EVENTS.EDITION_SELECTED, {
      axis,
      format: next.format,
      signed: next.signing === "signed",
    });
  };

  const amazon = CROWNFALL?.retailers?.amazon;

  return (
    <article
      data-testid="store-product"
      data-product-id={product.id}
      className="grid items-start gap-15 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10 lg:gap-24"
    >
      <div className="mx-auto w-full max-w-sm md:max-w-none">
        <ProductGallery
          key={product.id}
          product={product}
          framed
          aspect="cover"
          loading="eager"
          fallbackImage={CROWNFALL?.cover}
          onEnlarge={onEnlarge}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        {CROWNFALL?.status && <Eyebrow>{CROWNFALL.status}</Eyebrow>}
        <h2 className="text-heading text-cream">{product.title}</h2>
        <span className="text-[1.5rem] text-cream">
          ${product.price.toFixed(2)}
        </span>

        <ToggleGroup
          label="Format"
          axis="format"
          options={FORMATS}
          editions={editions}
          selection={selection}
          onPick={pick}
        />
        <ToggleGroup
          label="Edition"
          axis="signing"
          options={SIGNINGS}
          editions={editions}
          selection={selection}
          onPick={pick}
        />

        <div className="pt-2">
          <CartControls product={product} onAdd={onAddToCart} />
        </div>

        {amazon && (
          <p className="text-base text-subtle">
            Looking for the ebook? It&rsquo;s on{" "}
            <a
              href={amazon}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track(EVENTS.RETAILER_CLICK, {
                  retailer: "amazon",
                  placement: "store_ebook",
                })
              }
              className="text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
            >
              Amazon
            </a>
            .
          </p>
        )}

        <div
          className="prose-square border-t border-rule pt-6"
          dangerouslySetInnerHTML={{
            __html: product.description || "<em>No description available.</em>",
          }}
        />
      </div>
    </article>
  );
};

export default CrownfallListing;
