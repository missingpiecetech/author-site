/*
 * Gold filigree: corner ornaments for frames and a centred divider for
 * section breaks. The artwork comes from a style module in `./filigree/`:
 * the site style by default, or the one named by the `filigree` prop (see
 * `./filigree/index.js` and design/filigree-samples/README.md). Colour comes from
 * `currentColor`, so `text-accent` (the default) or any text colour tints it.
 * All of it is decorative: aria-hidden and pointer-events-none.
 */
import { getFiligree } from "./filigree/index.js";

/*
 * Corner sizes (`--cs`, the corner box's side). A fifth of the box sits
 * outside the frame line, so keep that much room around a framed box, and
 * keep the box at least FRAME_MIN_SPAN corner sizes tall and wide.
 *   lg (framed covers, photos): 76px, 112px from lg, 152px from xl
 *   md (panels):                52px, 64px from lg
 *   sm (tiles):                 40px, 48px from lg
 *   xs (48px icon boxes):       30px
 */
const SIZES = {
  lg: "[--cs:76px] lg:[--cs:112px] xl:[--cs:152px]",
  md: "[--cs:52px] lg:[--cs:64px]",
  sm: "[--cs:40px] lg:[--cs:48px]",
  xs: "[--cs:30px]",
};

// Each corner's position: offset from the padding edge by half the border,
// plus the part of the box outside the frame line (the sample's
// `--bw / -2 - --cs * --k`).
const positions = ({ FRAME_BORDER_WIDTH, FRAME_INSET }) => {
  const offset = `calc(${FRAME_BORDER_WIDTH / -2}px - var(--cs) * ${FRAME_INSET})`;
  return [
    { top: offset, left: offset },
    { top: offset, right: offset, transform: "scaleX(-1)" },
    { bottom: offset, left: offset, transform: "scaleY(-1)" },
    { bottom: offset, right: offset, transform: "scale(-1)" },
  ];
};

/**
 * Four corner ornaments over the parent's border box. The parent must be
 * `relative` and carry the frame line of the same style: its `FRAME_BORDER`
 * (from `./filigree/index.js` for the site style, or
 * `getFiligree(name).FRAME_BORDER`) plus a colour, e.g.
 * `${FRAME_BORDER} border-accent`; the ornament sits on the corners and the
 * plain line runs between them.
 *
 * - `size`: "lg" (framed covers and photos) | "md" (panels) | "sm" (tiles) |
 *   "xs" (icon boxes).
 * - `filigree`: a style name from FILIGREE_STYLES, e.g. "artDeco"; defaults
 *   to the site style.
 */
export const FiligreeCorners = ({
  size = "md",
  filigree,
  className = "text-accent",
}) => {
  const style = getFiligree(filigree);
  const { CORNER_VIEWBOX, CornerArt } = style;
  return (
    <span
      aria-hidden="true"
      className={`contents ${SIZES[size] ?? SIZES.md}`}
      data-filigree="corners"
      data-filigree-style={filigree}
    >
      {positions(style).map((position, i) => (
        <svg
          key={i}
          viewBox={CORNER_VIEWBOX}
          focusable="false"
          style={{ ...position, width: "var(--cs)", height: "var(--cs)" }}
          className={`pointer-events-none absolute overflow-visible ${className}`}
        >
          <CornerArt />
        </svg>
      ))}
    </span>
  );
};

/**
 * Ornamental section break: rules either side of a centred ornament. Fills
 * the width it is given (cap it with `max-w-*`).
 *
 * - `lines`: false for the ornament alone.
 * - `filigree`: a style name from FILIGREE_STYLES; defaults to the site style.
 */
export const FiligreeDivider = ({
  lines = true,
  filigree,
  className = "text-accent",
}) => {
  const { DIVIDER_ART, DIVIDER_VIEWBOX, DividerArt, Rule } =
    getFiligree(filigree);
  return (
    <div
      aria-hidden="true"
      data-filigree="divider"
      data-filigree-style={filigree}
      className={`pointer-events-none flex items-center ${lines ? "w-full" : "justify-center"} ${className}`}
    >
      {lines && <Rule side="left" />}
      <svg
        viewBox={DIVIDER_VIEWBOX}
        focusable="false"
        className={`shrink-0 overflow-visible ${DIVIDER_ART}`}
      >
        <DividerArt />
      </svg>
      {lines && <Rule side="right" />}
    </div>
  );
};
