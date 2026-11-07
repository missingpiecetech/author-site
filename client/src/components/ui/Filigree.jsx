/*
 * Gold filigree: corner ornaments for frames and a centred divider for
 * section breaks. The artwork comes from a style module in `./filigree/`:
 * the site style by default, or the one named by the `filigree` prop (see
 * `./filigree/index.js` and design/filigree-samples/README.md). Colour comes from
 * `currentColor`, so `text-accent` (the default) or any text colour tints it.
 * All of it is decorative: aria-hidden and pointer-events-none.
 */
import { useState } from "react";
import { SITE_FILIGREE, getFiligree } from "./filigree/index.js";
import { CORNER_SIZE as BASE_CORNER_SIZE, UNIT } from "./filigree/scale.js";

// Each corner's position: offset from the padding edge by half the border,
// plus the part of the box outside the frame line (the sample's
// `--bw / -2 - --cs * --k`), and the flip that points its arms along the
// frame's edges. Artwork is drawn `size` px per 100 units (the style's
// CORNER_SIZE), whatever the frame's size, so only frame a box at least
// FRAME_MIN_SPAN × CORNER_SIZE tall and wide; on a smaller one the arms meet.
// A viewBox that starts past 0 (Rose in Bloom's) trims the empty edge of the
// box; the frame corner stays at FRAME_INSET × 100 units.
const positions = (size, viewBox, { FRAME_BORDER_WIDTH, FRAME_INSET }) => {
  const [x] = viewBox.split(" ").map(Number);
  const offset = `${FRAME_BORDER_WIDTH / -2 - (FRAME_INSET * 100 - x) * (size / 100)}px`;
  return [
    { top: offset, left: offset },
    { top: offset, right: offset, transform: "scaleX(-1)" },
    { bottom: offset, left: offset, transform: "scaleY(-1)" },
    { bottom: offset, right: offset, transform: "scale(-1)" },
  ];
};

// For a style with several corner pieces: one piece per corner, each mirrored
// across the diagonal (its arms swapped) half the time.
const pickCorners = () =>
  [0, 1, 2, 3].map(() => ({
    index: Math.random(),
    mirror: Math.random() < 0.5,
  }));

// One corner piece: path strings, "E:" marking an even-odd fill.
const Piece = ({ paths }) =>
  paths.map((d, i) =>
    d.startsWith("E:") ? (
      <path key={i} fillRule="evenodd" d={d.slice(2)} fill="currentColor" />
    ) : (
      <path key={i} d={d} fill="currentColor" />
    ),
  );

/**
 * Four corner ornaments over the parent's border box. The parent must be
 * `relative` and carry the frame line of the same style: its `FRAME_BORDER`
 * (from `./filigree/index.js` for the site style, or
 * `getFiligree(name).FRAME_BORDER`) plus a colour, e.g.
 * `${FRAME_BORDER} border-accent`; the ornament sits on the corners and the
 * plain line runs between them.
 *
 * Corners are always the style's CORNER_SIZE px (or scale.js's). A style
 * with CORNER_PIECES (the site's Rose in Bloom) gets a random piece and a
 * random diagonal mirror at each corner, chosen once when the frame mounts. Use them only on
 * single framed elements, never on repeating cards.
 *
 * - `filigree`: a style name from FILIGREE_STYLES, e.g. "artDeco"; defaults
 *   to the site style.
 */
export const FiligreeCorners = ({ filigree, className = "text-accent" }) => {
  const style = getFiligree(filigree);
  const { CORNER_VIEWBOX, CORNER_PIECES, CornerArt } = style;
  const size = style.CORNER_SIZE ?? BASE_CORNER_SIZE;
  const [, , width] = CORNER_VIEWBOX.split(" ").map(Number);
  const box = (width * size) / 100;
  const [picks] = useState(pickCorners);
  return (
    <span
      aria-hidden="true"
      className="contents"
      data-filigree="corners"
      data-filigree-style={filigree ?? SITE_FILIGREE}
    >
      {positions(size, CORNER_VIEWBOX, style).map((position, i) => {
        const { index, mirror } = picks[i];
        const piece = CORNER_PIECES?.[Math.floor(index * CORNER_PIECES.length)];
        return (
          <svg
            key={i}
            viewBox={CORNER_VIEWBOX}
            focusable="false"
            style={{ ...position, width: box, height: box }}
            className={`pointer-events-none absolute overflow-visible ${className}`}
          >
            {!piece ? (
              <CornerArt />
            ) : mirror ? (
              <g transform="matrix(0 1 1 0 0 0)">
                <Piece paths={piece} />
              </g>
            ) : (
              <Piece paths={piece} />
            )}
          </svg>
        );
      })}
    </span>
  );
};

/**
 * Ornamental section break: a centred ornament, with rules either side when
 * the style has them (Art Deco does; the bramble ornament, which the site's
 * Rose in Bloom also uses, stands alone). A style without DIVIDER_ART is
 * drawn at the bramble scale (UNIT px per viewBox unit, scale.js), so its
 * thorns and stems match the bramble corners' exactly.
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
      data-filigree-style={filigree ?? SITE_FILIGREE}
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
