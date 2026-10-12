import Section from "./Section";
import Eyebrow from "./Eyebrow";

/**
 * The opening block of a secondary page: eyebrow, h1 and lede, closed by a
 * 1px rule. Keeps the site's two-tone headings: `accent` is rendered after
 * `title` in gold, e.g. title="About" accent="Michael".
 *
 * - `align`: "left" (default) | "center".
 * - `children`: anything extra under the lede (buttons, notes).
 */
const PageIntro = ({
  eyebrow,
  title,
  accent,
  lede,
  align = "left",
  className = "",
  children,
  ...rest
}) => {
  const centered = align === "center";
  return (
    <Section
      spacing="none"
      className={`border-b border-rule pt-12 pb-10 lg:pt-22 lg:pb-18 ${className}`}
      innerClassName={`flex flex-col gap-4 lg:gap-5 ${centered ? "items-center text-center" : ""}`}
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
      {lede && (
        <p
          className={`text-lede text-muted ${centered ? "max-w-3xl" : "max-w-4xl"}`}
        >
          {lede}
        </p>
      )}
      {children}
    </Section>
  );
};

export default PageIntro;
