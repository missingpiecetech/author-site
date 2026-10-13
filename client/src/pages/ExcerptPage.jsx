import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation } from "react-router-dom";
import { BOOKS } from "../BOOK_DATA";
import Section from "../components/ui/Section";
import PageIntro from "../components/ui/PageIntro";
import Button from "../components/ui/Button";
import { FiligreeDivider } from "../components/ui/Filigree";
import RetailerLinks from "../components/RetailerLinks";
import Prose from "../components/excerpt/Prose";
import ChapterTabs from "../components/excerpt/ChapterTabs";
import useHashScroll from "../hooks/useHashScroll";
import {
  EXCERPTS,
  chapterId,
  chapterTabId,
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

/**
 * One chapter's tab panel (`hidden` unless selected): heading, text and, when
 * there is a `next` chapter, a "Next chapter" button at its foot.
 */
const Chapter = ({ chapter, isSelected, isTabbed, next, onNext }) => {
  const id = chapterId(chapter);
  return (
    <section
      id={id}
      {...(isTabbed
        ? {
            role: "tabpanel",
            "aria-labelledby": chapterTabId(chapter),
            tabIndex: 0,
          }
        : { "aria-labelledby": `${id}-heading` })}
      hidden={!isSelected}
      data-testid="excerpt-chapter"
      className="scroll-mt-4 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent lg:scroll-mt-6"
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
      {next && (
        <div className="mt-14 flex justify-center lg:mt-18">
          <Button onClick={onNext} data-testid="excerpt-next">
            Next chapter: {next.pov ?? `Chapter ${next.number}`}
          </Button>
        </div>
      )}
    </section>
  );
};

// The chapter a hash such as `#chapter-2` names, or the first.
const chapterIndexFor = (chapters, hash) =>
  Math.max(
    0,
    chapters.findIndex(
      (chapter) => `#${chapterId(chapter)}` === decodeURIComponent(hash),
    ),
  );

/**
 * The excerpt page for one book (`slug`): the chapters from its module in
 * src/excerpts/, one at a time behind chapter tabs, in a narrow reading
 * column. The URL hash names the chapter (`#chapter-2`) and follows the tabs
 * without adding history entries. After the last chapter comes the buy band.
 * Says "coming soon" while there is no text.
 */
const ExcerptPage = ({ slug = "crownfall" }) => {
  useHashScroll();
  const { hash, key } = useLocation();
  const book = BOOKS.find((b) => b.slug === slug);
  const chapters = useMemo(
    () => readableChapters(EXCERPTS[slug]?.excerpt),
    [slug],
  );
  const label = COUNT_LABELS[chapters.length] ?? "The opening chapters";
  const title = book?.title ?? "Excerpt";
  const isTabbed = chapters.length > 1;

  // Follows the router when it navigates (a hash typed into the address
  // bar); tab changes only replace the URL, which the router never sees.
  const [selection, setSelection] = useState(() => ({
    key,
    index: chapterIndexFor(chapters, hash),
  }));
  if (selection.key !== key) {
    setSelection({ key, index: chapterIndexFor(chapters, hash) });
  }
  const selected = selection.index;

  const select = (index) => {
    setSelection({ key, index });
    window.history.replaceState(
      window.history.state,
      "",
      `#${chapterId(chapters[index])}`,
    );
  };

  // Next chapter: show it, then bring its top to just under the header
  // (scroll-padding-top; smooth unless reduced motion) and focus the panel.
  const handleNext = () => {
    const next = selected + 1;
    flushSync(() => select(next));
    const panel = document.getElementById(chapterId(chapters[next]));
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ block: "start" });
  };

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
        eyebrow={
          chapters.length ? (
            <>
              Read an Excerpt ·{" "}
              <span className="whitespace-nowrap">{label}</span>
            </>
          ) : (
            "Read an Excerpt"
          )
        }
        title={title}
      />

      {chapters.length ? (
        <>
          <Section spacing="none" className="pt-6 pb-20 lg:pt-8 lg:pb-28">
            {isTabbed && (
              <ChapterTabs
                chapters={chapters}
                selected={selected}
                onSelect={select}
                className="mx-auto mb-14 max-w-3xl lg:mb-20"
              />
            )}
            <article
              data-testid="excerpt-text"
              className="mx-auto max-w-[66ch] text-[1.125rem] leading-[1.8] text-muted lg:text-[1.25rem]"
            >
              {chapters.map((chapter, index) => (
                <Chapter
                  key={chapter.number}
                  chapter={chapter}
                  isSelected={index === selected}
                  isTabbed={isTabbed}
                  next={chapters[index + 1]}
                  onNext={handleNext}
                />
              ))}
            </article>
          </Section>

          {selected === chapters.length - 1 && (
            <Section
              band
              data-testid="excerpt-end"
              innerClassName="flex flex-col items-center gap-5 text-center lg:gap-6"
            >
              <h2 className="text-heading text-cream">
                Keep reading <span className="text-accent">{title}</span>
              </h2>
              <RetailerLinks
                retailers={book?.retailers}
                align="center"
                className="mt-2 w-full"
              />
            </Section>
          )}
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
