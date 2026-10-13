import { useEffect } from "react";
import { BOOKS } from "../BOOK_DATA";
import Section from "../components/ui/Section";
import PageIntro from "../components/ui/PageIntro";
import Eyebrow from "../components/ui/Eyebrow";
import Button from "../components/ui/Button";
import { FiligreeDivider } from "../components/ui/Filigree";
import RetailerLinks from "../components/RetailerLinks";
import Prose from "../components/excerpt/Prose";
import useHashScroll from "../hooks/useHashScroll";
import {
  EXCERPTS,
  chapterId,
  chapterTitle,
  isSceneBreak,
  readableChapters,
} from "../excerpts/index.js";
import SITE_INFO from "../SITE_INFO";

const COUNT_LABELS = {
  1: "The first chapter",
  2: "The first two chapters",
  3: "The first three chapters",
};

// The opening paragraph of a chapter: a gold Cormorant drop cap three lines
// deep. Later paragraphs are indented, book-style, with no gap between them.
const DROP_CAP =
  "first-letter:float-left first-letter:pt-[0.12em] first-letter:pr-[0.12em] first-letter:font-display first-letter:text-[4.15em] first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-accent";

/** A scene break (`***` or `#` in the text): the centred ornament. */
const SceneBreak = () => (
  <div role="separator" className="my-9 text-accent lg:my-11">
    <FiligreeDivider />
  </div>
);

/**
 * A chapter opener: "Chapter 1: Kyndel" centred in Cormorant, with the
 * bramble ornament underneath.
 */
const ChapterHeading = ({ chapter }) => {
  const id = chapterId(chapter);
  return (
    <header className="mb-10 flex flex-col items-center gap-4 text-center lg:mb-14 lg:gap-5">
      <h2 id={`${id}-heading`} className="text-hook text-cream">
        {chapterTitle(chapter)}
      </h2>
      <FiligreeDivider />
    </header>
  );
};

const Chapter = ({ chapter }) => {
  const id = chapterId(chapter);
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      data-testid="excerpt-chapter"
      className="scroll-mt-4 not-first:mt-20 lg:scroll-mt-6 lg:not-first:mt-28"
    >
      <ChapterHeading chapter={chapter} />
      <div className="[&>p+p]:indent-[1.5em]">
        {chapter.paragraphs.map((paragraph, index) =>
          isSceneBreak(paragraph) ? (
            <SceneBreak key={index} />
          ) : (
            <Prose
              key={index}
              text={paragraph}
              className={index === 0 ? DROP_CAP : ""}
            />
          ),
        )}
      </div>
    </section>
  );
};

/**
 * The excerpt page for one book (`slug`): the chapters from its module in
 * src/excerpts/, in a narrow reading column, with a chapter list at the top
 * and the buy row at the end. Says "coming soon" while there is no text.
 */
const ExcerptPage = ({ slug = "crownfall" }) => {
  useHashScroll();
  const book = BOOKS.find((b) => b.slug === slug);
  const chapters = readableChapters(EXCERPTS[slug]?.excerpt);
  const label = COUNT_LABELS[chapters.length] ?? "The opening chapters";
  const title = book?.title ?? "Excerpt";

  useEffect(() => {
    const previous = document.title;
    document.title = `${title}: ${chapters.length ? label.toLowerCase() : "excerpt"} - ${SITE_INFO.name}`;
    return () => {
      document.title = previous;
    };
  }, [title, label, chapters.length]);

  return (
    <div className="bg-ground">
      <PageIntro
        eyebrow="Read an Excerpt"
        title={title}
        lede={chapters.length ? label : undefined}
      >
        {chapters.length > 1 && (
          <nav aria-label="Chapters" data-testid="excerpt-chapter-nav">
            <ol className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
              {chapters.map((chapter) => (
                <li key={chapter.number}>
                  <a
                    href={`#${chapterId(chapter)}`}
                    className="text-accent transition-colors hover:text-accent-hover"
                  >
                    {chapterTitle(chapter)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </PageIntro>

      {chapters.length ? (
        <>
          <Section spacing="none" className="pt-16 pb-20 lg:pt-24 lg:pb-28">
            <article
              data-testid="excerpt-text"
              className="mx-auto max-w-[66ch] text-[1.125rem] leading-[1.8] text-muted lg:text-[1.25rem]"
            >
              {chapters.map((chapter) => (
                <Chapter key={chapter.number} chapter={chapter} />
              ))}
            </article>
          </Section>

          <Section innerClassName="flex flex-col items-center gap-5 text-center lg:gap-6">
            <Eyebrow>End of the excerpt</Eyebrow>
            <h2 className="text-heading text-cream">
              Keep reading <span className="text-accent">{title}</span>
            </h2>
            <RetailerLinks
              retailers={book?.retailers}
              align="center"
              className="mt-2 w-full"
            />
          </Section>
        </>
      ) : (
        <Section innerClassName="flex flex-col items-center gap-8 text-center">
          <p className="text-lede text-muted" data-testid="excerpt-coming-soon">
            The excerpt is coming soon.
          </p>
          <Button to="/books">Back to Books</Button>
        </Section>
      )}
    </div>
  );
};

export default ExcerptPage;
