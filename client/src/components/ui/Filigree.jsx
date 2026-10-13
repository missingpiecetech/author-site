/*
 * Gold filigree: corner ornaments for frames and a centred divider for
 * section breaks. The artwork comes from a style module in `./filigree/`:
 * the site style by default, or the one named by the `filigree` prop (see
 * `./filigree/index.js` and design/filigree-samples/README.md). Colour comes from
 * `currentColor`, so `text-accent` (the default) or any text colour tints it.
 * All of it is decorative: aria-hidden and pointer-events-none.
 */
import { getFiligree } from "./filigree/index.js";
import { CORNER_SIZE, UNIT } from "./filigree/scale.js";

// Each corner's position: offset from the padding edge by half the border,
// plus the part of the box outside the frame line (the sample's
// `--bw / -2 - --cs * --k`). Every corner is CORNER_SIZE px, whatever the
// frame's size, so only frame a box at least FRAME_MIN_SPAN × CORNER_SIZE tall
// and wide; on a smaller one the arms meet.
const positions = ({ FRAME_BORDER_WIDTH, FRAME_INSET }) => {
  const offset = `${FRAME_BORDER_WIDTH / -2 - CORNER_SIZE * FRAME_INSET}px`;
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
 * Corners are always CORNER_SIZE px (./filigree/scale.js). Use them only on
 * single framed elements, never on repeating cards.
 *
 * - `filigree`: a style name from FILIGREE_STYLES, e.g. "artDeco"; defaults
 *   to the site style.
 */
export const FiligreeCorners = ({ filigree, className = "text-accent" }) => {
  const style = getFiligree(filigree);
  const { CORNER_VIEWBOX, CornerArt } = style;
  return (
    <span
      aria-hidden="true"
      className="contents"
      data-filigree="corners"
      data-filigree-style={filigree}
    >
      {positions(style).map((position, i) => (
        <svg
          key={i}
          viewBox={CORNER_VIEWBOX}
          focusable="false"
          style={{ ...position, width: CORNER_SIZE, height: CORNER_SIZE }}
          className={`pointer-events-none absolute overflow-visible ${className}`}
        >
          <CornerArt />
        </svg>
      ))}
    </span>
  );
};

/**
 * Ornamental section break: a centred ornament, with rules either side when
 * the style has them (Art Deco does; the bramble ornament stands alone). A
 * style without DIVIDER_ART is drawn at the corners' scale (UNIT px per
 * viewBox unit), so its thorns and stems match the corners' exactly.
 *
 * - `filigree`: a style name from FILIGREE_STYLES; defaults to the site style.
 */
export const FiligreeDivider = ({ filigree, className = "text-accent" }) => {
  const { DIVIDER_ART, DIVIDER_VIEWBOX, DividerArt, Rule } =
    getFiligree(filigree);
  const hasRules = Boolean(Rule);
  const [, , width, height] = DIVIDER_VIEWBOX.split(" ").map(Number);
  const size = DIVIDER_ART
    ? undefined
    : { width: width * UNIT, height: height * UNIT };
  return (
    <div
      aria-hidden="true"
      data-filigree="divider"
      data-filigree-style={filigree}
      className={`pointer-events-none flex items-center ${hasRules ? "w-full" : "justify-center"} ${className}`}
    >
      {hasRules && <Rule side="left" />}
      <svg
        viewBox={DIVIDER_VIEWBOX}
        focusable="false"
        style={size}
        className={`shrink-0 overflow-visible ${DIVIDER_ART ?? ""}`}
      >
        <DividerArt />
      </svg>
      {hasRules && <Rule side="right" />}
    </div>
  );
};
