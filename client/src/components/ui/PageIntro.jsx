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
 * - `background`: section art behind the title (see `Section` for its wash and
 *   fade); the block gets more room below the divider so the fade does not
 *   start under it.
 */
const PageIntro = ({
  eyebrow,
  title,
  accent,
  lede,
  className = "",
  background,
  children,
  ...rest
}) => (
  <Section
    spacing="none"
    className={`pt-12 lg:pt-22 ${background ? "pb-16 lg:pb-24" : "pb-4 lg:pb-8"} ${className}`}
    background={background}
    priority
    fade
    innerClassName={`flex flex-col items-center gap-2 text-center lg:gap-2.5`}
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
