import { FiligreeDivider } from "./Filigree";

const SPACING = {
  default: "py-12 lg:py-26", // 48px / 104px
  compact: "py-9 lg:py-18", // 36px / 72px
  none: "",
};

/**
 * Page section: side padding (24px mobile, 80px desktop), vertical rhythm and
 * an optional `band` background.
 *
 * - `band`: alternate `band` background with 1px rules top and bottom.
 * - `ruled`: a filigree divider on the top edge (for plain sections that
 *   follow another).
 * - `divider`: "top" | "bottom" — put the filigree divider on that edge
 *   (`ruled` is `divider="top"`).
 * - `clipX`: overflow-x-clip, for sections with horizontal entrance animations.
 * - `spacing`: "default" | "compact" | "none".
 * - `contained`: wraps children in a centred max-w-7xl column (default true).
 */
const Section = ({
  as = "section",
  band = false,
  ruled = false,
  divider,
  clipX = false,
  spacing = "default",
  contained = true,
  className = "",
  innerClassName = "",
  children,
  ...rest
}) => {
  const Tag = as;
  const edge = divider ?? (ruled && !band ? "top" : undefined);
  const classes = [
    "px-6 lg:px-20",
    SPACING[spacing] ?? SPACING.default,
    band && "bg-band border-y border-rule",
    edge && "relative",
    clipX && "overflow-x-clip",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {edge && (
        <div
          className={`pointer-events-none absolute inset-x-6 z-1 lg:inset-x-20 ${edge === "bottom" ? "bottom-0 translate-y-1/2" : "top-0 -translate-y-1/2"}`}
        >
          <FiligreeDivider className="mx-auto max-w-7xl text-accent" />
        </div>
      )}
      {contained ? (
        <div className={`mx-auto max-w-7xl ${innerClassName}`}>{children}</div>
      ) : (
        children
      )}
    </Tag>
  );
};

export default Section;
