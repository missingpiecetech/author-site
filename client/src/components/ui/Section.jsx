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
 * - `ruled`: a 1px rule on top (for plain sections that follow another).
 * - `clipX`: overflow-x-clip, for sections with horizontal entrance animations.
 * - `spacing`: "default" | "compact" | "none".
 * - `contained`: wraps children in a centred max-w-7xl column (default true).
 */
const Section = ({
  as = "section",
  band = false,
  ruled = false,
  clipX = false,
  spacing = "default",
  contained = true,
  className = "",
  innerClassName = "",
  children,
  ...rest
}) => {
  const Tag = as;
  const classes = [
    "px-6 lg:px-20",
    SPACING[spacing] ?? SPACING.default,
    band && "bg-band border-y border-rule",
    ruled && !band && "border-t border-rule",
    clipX && "overflow-x-clip",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {contained ? (
        <div className={`mx-auto max-w-7xl ${innerClassName}`}>{children}</div>
      ) : (
        children
      )}
    </Tag>
  );
};

export default Section;
