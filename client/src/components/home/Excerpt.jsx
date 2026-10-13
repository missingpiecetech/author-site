import Section from "../ui/Section";
import Eyebrow from "../ui/Eyebrow";
import Button from "../ui/Button";
import Prose from "../excerpt/Prose";
import { chapterTitle, excerptOpening } from "../../excerpts/index.js";

/**
 * "Read an Excerpt": the opening of Chapter 1 (whole paragraphs, about 120 to
 * 200 words; see `excerptOpening`) from a book's excerpt module, then a "Keep
 * reading" link to the excerpt page at `to`. The first paragraph opens with a
 * gold drop cap. Renders nothing while the excerpt has no text.
 */
const Excerpt = ({ excerpt, to, ...rest }) => {
  const opening = excerptOpening(excerpt);
  if (!opening) return null;
  const { chapter, paragraphs } = opening;

  return (
    <Section
      id="excerpt"
      aria-labelledby="excerpt-heading"
      className="lg:py-28"
      innerClassName="flex flex-col gap-8 lg:flex-row lg:gap-24"
      {...rest}
    >
      <div className="flex shrink-0 flex-col gap-4 lg:w-110 lg:gap-6">
        <Eyebrow>Read an Excerpt</Eyebrow>
        <h2 id="excerpt-heading" className="text-heading text-cream">
          {chapterTitle(chapter)}
        </h2>
      </div>
      <div className="flex flex-1 flex-col gap-7" data-aos="fade-up">
        {paragraphs.map((paragraph, index) => (
          <Prose
            key={index}
            text={paragraph}
            className={`text-lg leading-[1.8] lg:text-[1.375rem] ${
              index === 0
                ? "text-cream first-letter:float-left first-letter:pt-2 first-letter:pr-3.5 first-letter:font-display first-letter:text-[4.5rem] first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-accent lg:first-letter:text-[6.5rem]"
                : "text-muted"
            }`}
          />
        ))}
        <div className="h-px bg-rule" />
        {to && (
          <Button
            to={to}
            className="self-start"
            data-testid="excerpt-keep-reading"
          >
            Keep reading
          </Button>
        )}
      </div>
    </Section>
  );
};

export default Excerpt;
