import Eyebrow from "../ui/Eyebrow";
import FramedImage from "../ui/FramedImage";
import RetailerLinks from "../RetailerLinks";

/**
 * The Home hero, laid out like the mockup's book hero: framed cover beside
 * the eyebrow (BOOK_DATA `heroEyebrow`), the title as the
 * page's h1, the subtitle as the hook, the short blurb (from `sm`; the phone
 * mockup leaves it out) and the buy row.
 */
const BookHero = ({ book, className = "", ...rest }) => {
  const eyebrow = book.heroEyebrow;

  return (
    <article
      className={`flex flex-col items-center gap-15 lg:flex-row lg:gap-16 xl:gap-24 ${className}`}
      {...rest}
    >
      <FramedImage
        src={book.cover}
        alt={`${book.title} cover`}
        placeholder={book.title}
        loading="eager"
        className="w-55 shrink-0 bg-ground animate-scale-in lg:w-80 xl:w-100"
      />
      <div className="flex max-w-180 min-w-0 flex-col items-center gap-5.5 text-center lg:items-start lg:gap-7 lg:text-left">
        {/* Held tight on the stacked layout so the eyebrow reads as the title's label */}
        <div className="flex flex-col items-center gap-2 lg:items-start lg:gap-7">
          <Eyebrow className="max-lg:tracking-[0.2em]">{eyebrow}</Eyebrow>
          <h1 className="text-display text-cream">{book.title}</h1>
        </div>
        {book.subtitle && (
          <p className="font-display text-hook font-medium text-cream italic">
            {book.subtitle}
          </p>
        )}
        {book.shortBlurb && (
          <p className="hidden text-lede text-muted sm:block">
            {book.shortBlurb}
          </p>
        )}
        <RetailerLinks
          retailers={book.retailers}
          placement="home_hero"
          className="w-full pt-1.5 lg:w-auto lg:pt-2"
        />
      </div>
    </article>
  );
};

export default BookHero;
