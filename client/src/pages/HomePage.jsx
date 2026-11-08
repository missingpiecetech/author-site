import { Fragment, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BOOKS } from "../BOOK_DATA";
import authorAdjacentLogo from "../assets/logo_no_text.png";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import FramedImage from "../components/ui/FramedImage";
import PullQuote from "../components/ui/PullQuote";
import { FiligreeDivider } from "../components/ui/Filigree";
import BookHero from "../components/home/BookHero";
import Excerpt from "../components/home/Excerpt";
import WritingDesk from "../components/WritingDesk";
import InstagramFeed from "../components/instagram/InstagramFeed";
import { EXCERPTS, hasExcerptText } from "../excerpts/index.js";
import useHashScroll from "../hooks/useHashScroll";
import { EVENTS, track } from "../lib/analytics.js";
import { BACKGROUNDS } from "../assets/backgrounds/index.js";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FEATURED = BOOKS.find((book) => book.slug === "crownfall");
const EXCERPT = EXCERPTS[FEATURED?.slug];
const HAS_EXCERPT = hasExcerptText(EXCERPT?.excerpt);

const HomePage = () => {
  useHashScroll();

  useEffect(() => {
    AOS.init({ once: true, duration: 800, disable: prefersReducedMotion });
  }, []);

  return (
    <div className="bg-ground">
      {/* Book hero: Crownfall, as in the mockup */}
      <Section
        id={FEATURED?.slug}
        clipX
        spacing="none"
        className="flex min-h-[calc(100svh-var(--header-h))] flex-col pt-10 pb-6 lg:pt-16 lg:pb-8"
        innerClassName="flex w-full flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col justify-center">
          {FEATURED && <BookHero book={FEATURED} />}
        </div>
        {/* Scroll indicator: in flow at the foot of the hero, so it can never sit on the buttons */}
        <div
          aria-hidden="true"
          data-testid="scroll-cue"
          className="mx-auto mt-12 shrink-0 motion-safe:animate-bounce lg:mt-16"
        >
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-accent/30">
            <div className="mt-2 h-3 w-1 rounded-full bg-accent/60" />
          </div>
        </div>
      </Section>

      {/* Praise: the existing quote band, in the mockup's big-quote style,
          a divider between each pair of quotes, over the gold-cracks art */}
      {FEATURED?.praise?.length > 0 && (
        <Section
          band
          background={BACKGROUNDS.cracks}
          spacing="none"
          className="py-9 lg:py-16"
          innerClassName="flex flex-col gap-4 lg:gap-8"
        >
          {FEATURED.praise.map((praise, index) => (
            <Fragment key={praise.name}>
              {index > 0 && <FiligreeDivider />}
              <div data-aos="fade-up">
                <PullQuote
                  quote={praise.text}
                  name={praise.name}
                  credit={praise.credit}
                  className="max-w-5xl"
                />
              </div>
            </Fragment>
          ))}
        </Section>
      )}

      {/* Read an excerpt: the opening of src/excerpts/crownfall.js, hidden
          until it has text */}
      {EXCERPT && <Excerpt excerpt={EXCERPT.excerpt} to={EXCERPT.path} />}

      {/* From the writing desk: WRITING_DESK.js. A band after the excerpt, as
          in the mockup; plain when it would sit against the quote band. */}
      <WritingDesk band={HAS_EXCERPT} />

      {/* Instagram: Michael's latest posts, via /api/instagram (Behold) */}
      <InstagramFeed />

      {/* Author Adjacent podcast */}
      <Section>
        <div className="grid items-center gap-15 lg:grid-cols-2 lg:gap-24">
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
                onClick={() =>
                  track(EVENTS.PODCAST_LINK_CLICK, {
                    platform: "youtube",
                    placement: "home",
                  })
                }
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
