import { Link } from "react-router-dom";
import Eyebrow from "../ui/Eyebrow";
import FramedImage from "../ui/FramedImage";
import RetailerLinks from "../RetailerLinks";

/**
 * A released book in the mockup's book-hero layout: framed cover beside the
 * status eyebrow, title, subtitle as the hook, short blurb, genres, the buy
 * row and a "Learn more" link to the book's section on /books.
 */
const BookHero = ({ book, className = "", ...rest }) => (
  <article
    className={`grid items-center gap-8 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-24 ${className}`}
    {...rest}
  >
    <FramedImage
      src={book.cover}
      alt={`${book.title} cover`}
      placeholder={book.title}
      className="mx-auto w-55 lg:w-full"
    />
    <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:gap-7 lg:text-left">
      <Eyebrow>{book.status}</Eyebrow>
      <h3 className="text-display text-cream">{book.title}</h3>
      {book.subtitle && (
        <p className="font-display text-hook font-medium text-cream italic">
          {book.subtitle}
        </p>
      )}
      {book.shortBlurb && (
        <p className="max-w-3xl text-lede text-muted">{book.shortBlurb}</p>
      )}
      {book.genres && (
        <ul className="flex flex-wrap justify-center gap-2.5 lg:justify-start">
          {book.genres.map((genre) => (
            <li
              key={genre}
              className="border border-edge px-3 py-1 text-[0.9375rem] text-muted"
            >
              {genre}
            </li>
          ))}
        </ul>
      )}
      <RetailerLinks
        retailers={book.retailers}
        className="w-full pt-2 lg:w-auto"
      />
      <Link
        to={book.link}
        className="text-accent transition-colors hover:text-accent-hover"
      >
        Learn more →
      </Link>
    </div>
  </article>
);

export default BookHero;
