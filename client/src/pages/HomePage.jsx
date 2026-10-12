import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BOOKS } from "../BOOK_DATA";
import authorPic from "../assets/author-pic-square-close.jpeg";
import authorAdjacentLogo from "../assets/logo_no_text.png";
import crownfallBookTour from "../assets/crownfall-book-tour.jpeg";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import FramedImage from "../components/ui/FramedImage";
import PullQuote from "../components/ui/PullQuote";
import { RuleList, RuleRow } from "../components/ui/RuleList";
import FloatingCircles from "../components/home/FloatingCircles";
import BookHero from "../components/home/BookHero";
import useHashScroll from "../hooks/useHashScroll";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FEATURED = BOOKS.find((book) => book.slug === "crownfall");
const IN_PROGRESS = BOOKS.filter((book) => book !== FEATURED);

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  useHashScroll();

  useEffect(() => {
    AOS.init({ once: true, duration: 800, disable: prefersReducedMotion });
    // The "Latest Works" parallax is motion; skip it entirely when reduced.
    if (prefersReducedMotion()) return undefined;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-ground">
      {/* Author hero with floating circles */}
      <Section
        clipX
        className="relative flex min-h-[calc(100svh-var(--header-h))] items-center"
        innerClassName="relative w-full"
      >
        <FloatingCircles />
        <div className="relative flex flex-col items-center gap-12 md:flex-row md:justify-around md:gap-16">
          {/* Author image */}
          <div className="relative shrink-0">
            <div
              aria-hidden="true"
              className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-accent/10"
            />
            <div
              aria-hidden="true"
              className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-accent/8"
            />
            <FramedImage
              src={authorPic}
              alt="Michael Vadney"
              aspect="square"
              loading="eager"
              className="relative w-64 bg-ground sm:w-80"
            />
          </div>
          {/* Author text */}
          <div
            className="flex flex-1 flex-col items-center gap-3 text-center"
            data-aos="fade-left"
          >
            <h1 className="text-title text-cream">
              <span className="block animate-slide-in-left">
                Michael Vadney
              </span>
            </h1>
            <p className="animate-fade-in-up font-display text-hook font-medium text-muted italic delay-300">
              Author & Podcaster
            </p>
            {/* CTA buttons */}
            <div className="mt-6 flex w-full animate-fade-in-up flex-col justify-center gap-3.5 delay-700 sm:w-auto sm:flex-row">
              <Button to="/books">Explore my books</Button>
              <Button to="/podcast" variant="secondary">
                Watch the podcast
              </Button>
            </div>
          </div>
        </div>
        {/* Scroll indicator, hidden on mobile */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 motion-safe:animate-bounce md:block"
        >
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-accent/30">
            <div className="mt-2 h-3 w-1 rounded-full bg-accent/60" />
          </div>
        </div>
      </Section>

      {/* Book tour */}
      <Section clipX ruled>
        <FramedImage
          src={crownfallBookTour}
          alt="Crownfall Book Tour"
          aspect="square"
          className="mx-auto max-w-2xl animate-slide-in-right"
        />
      </Section>

      {/* Latest works: the released book in the book-hero layout */}
      <Section clipX ruled>
        <div
          className="mb-12 animate-fade-in-up text-center lg:mb-20"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <h2 className="mb-5 text-heading text-cream">
            Latest <span className="text-accent">Works</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lede text-muted">
            Worlds where hope and heroism endure amid darkness, sacrifice, and
            moral complexity.
          </p>
        </div>
        {FEATURED && (
          <BookHero
            id={FEATURED.slug}
            book={FEATURED}
            className="animate-slide-in-left"
          />
        )}
      </Section>

      {/* Praise */}
      {FEATURED?.praise?.length > 0 && (
        <Section band innerClassName="flex flex-col gap-12 lg:gap-16">
          {FEATURED.praise.map((praise) => (
            <div key={praise.name} data-aos="fade-up">
              <PullQuote
                quote={praise.text}
                name={praise.name}
                credit={praise.credit}
              />
            </div>
          ))}
        </Section>
      )}

      {/* Writing desk: books in progress, title and status only */}
      {IN_PROGRESS.length > 0 && (
        <Section spacing="compact">
          <RuleList data-aos="fade-up">
            {IN_PROGRESS.map((book) => (
              <RuleRow key={book.slug} id={book.slug} to={book.link} arrow>
                <span className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="font-display text-[1.625rem] leading-tight font-semibold lg:text-[1.875rem]">
                    {book.title}
                  </span>
                  <span className="text-base text-muted lg:text-[1.0625rem]">
                    {book.status}
                  </span>
                </span>
              </RuleRow>
            ))}
          </RuleList>
        </Section>
      )}

      {/* Author Adjacent podcast */}
      <Section ruled>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="flex animate-fade-in-up flex-col gap-6 text-center lg:text-left">
            <h2 className="text-heading text-cream">
              Author <span className="text-accent">Adjacent</span>
            </h2>
            <p className="text-lede text-cream">
              Join the honest conversation about the writing journey from
              hobbyist writer to professional author.
            </p>
            <p className="text-lede text-muted">
              Every episode dives deep into the challenges, victories, and
              everything in between on the path to becoming a published author.
              Real talk, practical advice, and community support.
            </p>
            <div className="mt-2 flex flex-col justify-center gap-3.5 sm:flex-row lg:justify-start">
              <Button to="/podcast">Learn more</Button>
              <Button
                href="https://youtube.com/@AuthorAdjacent"
                variant="secondary"
              >
                Watch on YouTube
              </Button>
            </div>
          </div>
          <FramedImage
            src={authorAdjacentLogo}
            alt="Author Adjacent Podcast Cover"
            aspect="square"
            className="mx-auto w-full max-w-md animate-scale-in"
            imgClassName="bg-cream p-8"
          />
        </div>
      </Section>
    </div>
  );
};

export default HomePage;
