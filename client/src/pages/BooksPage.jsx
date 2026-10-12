import { BOOKS, BOOK_STATUS } from "../BOOK_DATA";
import Section from "../components/ui/Section";
import PageIntro from "../components/ui/PageIntro";
import Eyebrow from "../components/ui/Eyebrow";
import Button from "../components/ui/Button";
import FramedImage from "../components/ui/FramedImage";
import { FiligreeCorners } from "../components/ui/Filigree";
import RetailerLinks from "../components/RetailerLinks";
import BookPraise from "../components/books/BookPraise";
import useHashScroll from "../hooks/useHashScroll";

const BookCover = ({ book }) =>
  book.cover ? (
    <FramedImage src={book.cover} alt={book.title} loading="eager" />
  ) : (
    <div className="relative border border-accent p-2 shadow-cover lg:p-3.5">
      <div
        role="img"
        aria-label={book.title}
        className="flex aspect-[2/3] items-center justify-center border border-edge bg-surface text-8xl text-accent"
      >
        {book.icon}
      </div>
      <FiligreeCorners size="lg" />
    </div>
  );

const BooksPage = () => {
  useHashScroll();

  return (
    <div className="min-h-screen bg-ground">
      {/* Hero Section */}
      <PageIntro
        title="Books &"
        accent="Works"
        lede="Nobledark fantasy where the worlds are dark and the characters are hopeful."
      />

      {/* Books Section */}
      {BOOKS.map((book, index) => {
        const mirrored = index % 2 === 1;
        return (
          <Section
            key={book.id}
            id={book.slug}
            band={mirrored}
            ruled={!mirrored && index > 0}
          >
            <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-24">
              <div
                className={`mx-auto w-full max-w-xs min-w-0 sm:max-w-sm lg:col-span-2 lg:max-w-none ${mirrored ? "lg:order-2" : ""}`}
              >
                <BookCover book={book} />
              </div>

              {/* Book Details */}
              <div
                className={`flex min-w-0 flex-col gap-7 lg:col-span-3 ${mirrored ? "lg:order-1" : ""}`}
              >
                <div className="flex flex-col gap-4">
                  <Eyebrow>{book.status}</Eyebrow>
                  <h2 className="text-heading text-cream">{book.title}</h2>
                  <p className="font-display text-hook italic font-medium text-cream">
                    {book.subtitle}
                  </p>
                </div>

                {/* Genres */}
                {book.genres && (
                  <ul className="flex flex-wrap gap-2.5">
                    {book.genres.map((genre) => (
                      <li
                        key={genre}
                        className="border border-edge px-3.5 py-1.5 text-base text-muted"
                      >
                        {genre}
                      </li>
                    ))}
                  </ul>
                )}

                {book.blurb && (
                  <p className="text-lede text-muted">{book.blurb}</p>
                )}

                {/* Quote */}
                {book.praise?.length > 0 && <BookPraise praise={book.praise} />}

                {book.status === BOOK_STATUS.COMING_SOON && (
                  <dl className="grid border-y border-rule sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5 py-5 sm:pr-6">
                      <dt className="text-eyebrow uppercase tracking-eyebrow text-accent">
                        Release Date
                      </dt>
                      <dd className="text-lede text-cream">{book.release}</dd>
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-rule py-5 sm:border-t-0 sm:border-l sm:pl-6">
                      <dt className="text-eyebrow uppercase tracking-eyebrow text-accent">
                        Availability
                      </dt>
                      <dd className="text-lede text-cream">Pre-order Soon</dd>
                    </div>
                  </dl>
                )}

                {/* Action Buttons */}
                {book.status === BOOK_STATUS.RELEASED && (
                  <div className="pt-2">
                    <RetailerLinks retailers={book.retailers ?? {}} />
                  </div>
                )}
                {book.status === BOOK_STATUS.PRE_ORDER && (
                  <div className="pt-2">
                    <Button to="/store">Pre-order Now</Button>
                  </div>
                )}
              </div>
            </div>
          </Section>
        );
      })}
    </div>
  );
};

export default BooksPage;
