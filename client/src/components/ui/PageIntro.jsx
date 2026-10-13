import Section from "./Section";
import Eyebrow from "./Eyebrow";
import { FiligreeDivider } from "./Filigree";

/**
 * The opening block of a secondary page, centred: eyebrow, h1 and lede, closed
 * by a filigree divider under them. Keeps the site's two-tone headings:
 * `accent` is rendered after `title` in gold, e.g. title="Book" accent="Store".
 *
 * - `children`: anything extra under the lede (buttons, notes), above the
 *   divider.
 */
const PageIntro = ({
  eyebrow,
  title,
  accent,
  lede,
  className = "",
  children,
  ...rest
}) => (
  <Section
    spacing="none"
    className={`pt-12 pb-4 lg:pt-22 lg:pb-8 ${className}`}
    innerClassName="flex flex-col items-center gap-4 text-center lg:gap-5"
    {...rest}
  >
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h1 className="text-title text-cream">
      {title}
      {accent && (
        <>
          {" "}
          <span className="text-accent">{accent}</span>
        </>
      )}
    </h1>
    {lede && <p className="max-w-3xl text-lede text-muted">{lede}</p>}
    {children}
    <FiligreeDivider className="mt-2 text-accent lg:mt-3" />
  </Section>
);

export default PageIntro;
