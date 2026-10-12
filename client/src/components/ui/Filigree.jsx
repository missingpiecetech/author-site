/*
 * Gold filigree: corner ornaments for frames and a centred divider for
 * section breaks. The artwork comes from the active style module, chosen in
 * `./filigree/index.js` (see design/filigree-samples/README.md). Colour comes from
 * `currentColor`, so `text-accent` (the default) or any text colour tints it.
 * All of it is decorative: aria-hidden and pointer-events-none.
 */
import {
  CORNER_VIEWBOX,
  CornerArt,
  DIVIDER_ART,
  DIVIDER_VIEWBOX,
  DividerArt,
  FRAME_BORDER_WIDTH,
  FRAME_INSET,
  Rule,
} from "./filigree/index.js";

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

// Offset from the padding edge: half the border, plus the part of the box
// outside the frame line (the sample's `--bw / -2 - --cs * --k`).
const OFFSET = `calc(${FRAME_BORDER_WIDTH / -2}px - var(--cs) * ${FRAME_INSET})`;

const POSITIONS = [
  { top: OFFSET, left: OFFSET },
  { top: OFFSET, right: OFFSET, transform: "scaleX(-1)" },
  { bottom: OFFSET, left: OFFSET, transform: "scaleY(-1)" },
  { bottom: OFFSET, right: OFFSET, transform: "scale(-1)" },
];

/**
 * Four corner ornaments over the parent's border box. The parent must be
 * `relative` and carry the frame line: `FRAME_BORDER` from `./filigree/index.js`
 * (2px for Thorned Bramble) plus a colour, e.g. `${FRAME_BORDER} border-accent`; the ornament sits on
 * the corners and the plain line runs between them.
 *
 * - `size`: "lg" (framed covers and photos) | "md" (panels) | "sm" (tiles) |
 *   "xs" (icon boxes).
 */
export const FiligreeCorners = ({ size = "md", className = "text-accent" }) => (
  <span
    aria-hidden="true"
    className={`contents ${SIZES[size] ?? SIZES.md}`}
    data-filigree="corners"
  >
    {POSITIONS.map((position, i) => (
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

/**
 * Ornamental section break: rules either side of a centred ornament. Fills
 * the width it is given (cap it with `max-w-*`).
 *
 * - `lines`: false for the ornament alone.
 */
export const FiligreeDivider = ({
  lines = true,
  className = "text-accent",
}) => (
  <div
    aria-hidden="true"
    data-filigree="divider"
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
