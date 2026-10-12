import Section from "../ui/Section";
import Eyebrow from "../ui/Eyebrow";
import Button from "../ui/Button";

/**
 * "Read an Excerpt": the opening of a book from its BOOK_DATA `excerpt`
 * (`chapter`, `paragraphs`, an optional `note` and an optional `link` for the
 * "Keep reading full chapter" button). The first paragraph opens with a gold
 * drop cap. Renders nothing until `paragraphs` has text.
 */
const Excerpt = ({ excerpt, ...rest }) => {
  const paragraphs = (excerpt?.paragraphs ?? []).filter((p) => p?.trim());
  if (!paragraphs.length) return null;
  const { chapter, note, link } = excerpt;

  return (
    <Section
      id="excerpt"
      aria-labelledby="excerpt-heading"
      className="border-b border-rule lg:py-28"
      innerClassName="flex flex-col gap-8 lg:flex-row lg:gap-24"
      {...rest}
    >
      <div className="flex shrink-0 flex-col gap-4 lg:w-110 lg:gap-6">
        <Eyebrow>Read an Excerpt</Eyebrow>
        <h2 id="excerpt-heading" className="text-heading text-cream">
          {chapter}
        </h2>
        {note && <p className="text-lede text-muted">{note}</p>}
        {link && (
          <Button href={link} className="mt-2 self-start">
            Keep reading full chapter
          </Button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-7" data-aos="fade-up">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`text-lg leading-[1.8] lg:text-[1.375rem] ${
              index === 0
                ? "text-cream first-letter:float-left first-letter:pt-2 first-letter:pr-3.5 first-letter:font-display first-letter:text-[4.5rem] first-letter:leading-[0.8] first-letter:font-semibold first-letter:text-accent lg:first-letter:text-[6.5rem]"
                : "text-muted"
            }`}
          >
            {paragraph}
          </p>
        ))}
        <div className="h-px bg-rule" />
        {chapter && (
          <p className="font-display text-[1.375rem] text-subtle italic">
            Continued in {chapter}…
          </p>
        )}
      </div>
    </Section>
  );
};

export default Excerpt;
