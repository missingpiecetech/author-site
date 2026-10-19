const SPACING = {
  default: "py-12 lg:py-26", // 48px / 104px
  compact: "py-9 lg:py-18", // 36px / 72px
  none: "",
};

/**
 * Page section: side padding (24px mobile, 80px desktop), vertical rhythm and
 * an optional `band` background.
 *
 * - `band`: alternate `band` background (no edge lines: only the header and
 *   footer carry a hairline, and no divider marks a seam between sections).
 * - `clipX`: overflow-x-clip, for sections with horizontal entrance animations.
 * - `spacing`: "default" | "compact" | "none".
 * - `contained`: wraps children in a centred max-w-7xl column (default true).
 * - `background`: section art from `assets/backgrounds` (`{ src, srcSet,
 *   position }`), drawn decoratively behind the content and cropped to fill.
 *   It loads at the width the screen needs: lazily, or at once with
 *   `priority` (art at the top of a page).
 * - Every background gets a 20% `ground` wash over the whole art (owner, Oct
 *   2026).
 * - `fade`: also fades the art's bottom quarter to solid `ground`, so it
 *   blends into the page below. Page titles only.
 */
const Section = ({
  as = "section",
  band = false,
  clipX = false,
  spacing = "default",
  contained = true,
  className = "",
  innerClassName = "",
  background,
  priority = false,
  fade = false,
  children,
  ...rest
}) => {
  const Tag = as;
  const classes = [
    "px-6 lg:px-24 xl:px-28",
    SPACING[spacing] ?? SPACING.default,
    band && "bg-band",
    clipX && "overflow-x-clip",
    background && "relative isolate overflow-hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {background && (
        <>
          <img
            src={background.src}
            srcSet={background.srcSet}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            data-testid="section-background"
            className={`absolute inset-0 -z-10 h-full w-full object-cover ${background.position}`}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-ground/20"
          />
          {fade && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 -z-10 h-1/4 bg-linear-to-b from-transparent to-ground"
            />
          )}
        </>
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
